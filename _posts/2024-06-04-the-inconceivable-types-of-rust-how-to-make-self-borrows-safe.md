---
layout: post
title: 'The Inconceivable Types of Rust: How to Make Self-Borrows Safe'
date: 2024-06-06 21:47 -0700
---

One of the first things any Rust programmer learns is that you can't pass an object and a reference to that object around at the same time. It's impossible to do, even indirectly. This limitation has been the subject of countless questions on Stack Overflow and posts on Reddit and the Rust forums and anywhere else where Rust programmers might ask for help. It's so well-known that most people treat it like an axiom, not just a limitation of Rust *as it currently exists*, but an inherent limitation of borrow checking *in general*.

However, that's not the case. In fact, with the right perspective, the way to support it is obvious. In this post, I'll walk through the steps and show how self-borrows and much more could be supported in a hypothetical alternate or future version of Rust.

### But first, some obligatory disclaimers

To be clear, when I say something can't be done in Rust, what I mean is that it can't be done *in a safe, zero-cost way*. As an army of internet commenters are no doubt rushing to observe, any limitation of a static type system can be bypassed by using unsafety or runtime checks instead (e.g. "lol, just wrap everything in `Arc<Mutex<T>>`" or "lol, just build your own memory management on top of `Vec` indices"). And the fact that a less safe or efficient workaround exists *is* of great interest to people who just need to solve a problem quickly. But from a language design perspective, the pertinent fact is that Rust's type system has gaps which make certain common tasks impossible to do *in a way that lets Rust be Rust*, and not just a glorified C or Javascript.

Lastly, this post will discuss changes purely from a type checking perspective without regard to how hard they'd actually be to implement. In a major real-world language like Rust, *any* change, no matter how trivial, has a huge cost in terms of ecosystem, documentation, tooling, backwards compatibility, etc. But I'm a language design hobbyist, not a Rust compiler engineer, so language design is the part I'll speak about.

So how do you type-check self borrows? The trick is actually to adopt an even more ambitious goal, *safe async functions*.

## A brief history of Rust

Rust 1.0 shipped with no support whatsoever for non-movable types. The fact that any value of any type could be arbitrarily memcpy'd around and still work was a core assumption of the language.

However, it didn't take long before people realized that non-movable types are actually very useful. In particular, async functions nearly always produce non-movable future types, so you can't have async Rust without support in some fashion for non-movable types.

Sadly, it was too late to do things properly (i.e. a `Move` auto-trait), but they were able to at least hack in partial support via the [`Pin`](https://doc.rust-lang.org/std/pin/struct.Pin.html) type, added in Rust 1.33.0.

### ...but not for thee

Now if you're like me, you might have thought, "Pin is added, which means support for self-borrows. Great, now I can refactor and simplify all my code!" Unfortunately, that's not what actually happened.

`Pin` made it possible for Rust code to *work with* and *pass around* non-movable types, but there was still no way to actually *create* them. That is a bit of dark magic that the compiler jealously hordes for itself. Whenever you write an async function, the compiler will magically generate a secret non-movable type, and `Pin` makes it possible to work with these types, but there is still no way to actually create self-referential types yourself (again, in safe, zero-cost code).

However, **what if it didn't have to be this way?** Personally, I think async functions (and closures) should be desugared into 100% safe Rust code that the user *could* have written themselves if they wanted to. Not because users would necessary actually want to do that very often, but because having a desugared version of every magic feature is useful didactically and for low-level libraries, and because it forces Rust to be *honest about its type system* instead of papering over the cracks with compiler magic.

Since async functions have self-borrows, supporting them conveniently also implies support for self-borrows more generally. Now the only question is how to actually support safe async functions.

The rest of this post is divided into two parts. In part 1, I will cover the changes needed from a high level type system perspective, while in part 2, I'll cover the remaining low level details.

# Part 1: The value level

In order to make async functions possible in (safe) Rust, we first have to figure out why they *aren't* possible already. Most people would answer "async functions have self-borrows, and it is impossible to support self-borrows in the borrow checker", but that is the wrong way to look at things. The *actual* answer is that **it is impossible to name the types of local variables**.

To see why this is, consider how you would go about desugaring an async function. Suppose we have a simple async function `foo` that adds some numbers and calls another async function like this:

```rust
fn sub() -> Pin<Box<dyn Future<Output=()>>> {todo!()}

async fn foo() -> u32 {
    let x = 12345;
    let f = sub();
    f.await;
    
    let y = x * 2;
    let f2 = sub();
    f2.await;
    
    x + y
}
```

How would we desugar `foo` by hand? We need to create a custom Future type `Foo` with a state machine representing the possible states of the original `foo` function. Specifically, we need a state machine with one state per `await` point in the function, plus a begin and end state. And the contents of each state are just the local variables that are live at that point in the function.

Therefore, our custom state machine type would look like this:

```rust
enum Foo {
    Initial,
    Await1{x: u32, f: Pin<Box<dyn Future<Output=()>>>},
    Await2{x: u32, y: u32, f2: Pin<Box<dyn Future<Output=()>>>},
    Final,
}
```

In order to create this type, we "just" have to list every local variable that is live at an await point, along with the types of all those local variables. Therefore, supporting async functions in safe Rust is just a matter of making it consistently possible to name the types of every variable. So why is this impossible to do right now? The first obstacle is **unnameable types**.


## Unnameable types

<img src="/img/20240606_padme_rust.jpg">

Rust made the interesting design decision to *require* explicit type annotations on every function boundary and every custom type, and yet also make it *impossible* to write explicit types in many cases. This was already a problem in Rust 1.0 with closures, but got much worse a few years later with the introduction of async Rust and impl Trait.

Basically, some types (closures, async functions, impl Trait) *exist* in Rust's type system but do not have a *name* and hence are impossible to *talk about* in your code. You can still pass those values around and interact with them as long as you never have to explicitly name their type, but as soon as you hit a function boundary or want to store them inside a struct or enum, whoops, it's time to add generics or pointlessly `Box` everything up.

Even in the example code above, this is already a problem. I had to go out of my way to make `sub` return a boxed `dyn Future` in order to have a nameable type for the sake of example, but any realistic code would instead be working with unnameable futures everywhere.


Fortunately, this is also a very easy problem to solve - **just give every type a name**. Efforts to do this already have been indefinitely stalled over concerns about stabilizing the order of generic type parameters, but that's a trivial concern compared to the much more invasive changes we'll get into later.

### Named lifetimes

There's actually another kind of unnameable type as well - function local lifetimes. Unlike closures and futures, these can never cross a function boundary without being replaced by generic parameters, so they don't cause problems for *existing* code, but they're still types that can't be named, and if we're going to support async functions in Rust, we need a way to name them.

Any syntax actually added to Rust would obviously have to get bikeshedded to death and assessed for education and tooling and so on, but as I'm just a person writing a blog post, I'm under no such constraints, so for the sake of example, I'll propose the following syntax:


```rust
let mut v = Vec::new();
life 'a, 'b;

let r = &'a mut v;
// do stuff with r
end 'a;

let r2 = &'b mut v;
// do stuff with r2
end 'b;
```

In this proposal, you first declare a *lifetime token* via `life 'a`. This token represents a lifetime that lasts as long as the token exists. Next, when borrowing a reference, you can optionally specify an explicit lifetime, e.g. `&'a mut v`. Finally, you can *end* a lifetime via `end 'a`, which consumes the token.

This syntax is more verbose than the current syntax, but I don't expect users to actually use named lifetime syntax that often. I see it like `drop`. You *can* write all your `drop`s explicitly if you want to, but most of the time people let the compiler insert them implicitly instead. Likewise under my proposal, people will usually still use the current syntax and let the compiler implicitly insert anonymous lifetimes, but they can also write named lifetimes explicitly if they want to.


### Static checking

Under my named lifetimes proposal, *all checking is still done purely at compile time*, just like the existing borrow checker. The lifetime tokens only exist at compile time and there is no runtime impact.

In order to do all type checking statically, we have to enforce certain invariants. Specifically, *types can only refer to lifetimes in the current scope*. Any type that escapes outside of the scope of the lifetime token it refers to becomes invalid. Likewise, consuming a lifetime token invalidates all types that refer to that lifetime.

## Inconceivable types

As it turns out, unnameable types aren't the only barrier to naming the types of variables in Rust. Unnameable types are types that still exist in Rust's formal type system, but don't have names. However, Rust's formal type system is only a subset of its de-facto type system because in addition to Rust's official type checker, the compiler also incorporates *shadow type checkers* which do type-checking like things but are not formally part of the type checker.


There are types that are part of Rust's de-facto type system which don't even exist in Rust's formal type system in the first place, let alone have names. I call these types **inconceivable types** because from the perspective of a Rust compiler engineer, they aren't types and don't even exist in the first place.

Therefore, in order to support async functions, we'll also need to add all the missing inconceivable types into Rust's formal type system.

### Partial moves

What are these shadow type checkers? Consider the following Rust code:


```rust
use std::mem::drop;

#[derive(Default)]
struct MyStrings {
    x: String,
    y: String,
}

async fn foo() {
    let ms = MyStrings::default();
    
    drop(ms.x);
    drop(ms.y);
}
```

At first glance, this code shouldn't compile. After all, `ms` is used twice, right? `ms` should already be moved when it is referenced the first time in `ms.x`, which would make `ms.y` a compile error. However, the Rust compiler actually allows this!

The reason is because Rust has a secret shadow type checker which allows you to partially move and partially borrow values as long as they stay within a function. The fact that this is limited to within a function makes it harder to spot since it never forces the user to write the function-boundary-mandatory type annotations that would be impossible since these types don't actually exist in Rust's formal type system.

However, they are still a problem for async functions because we need to be able to specify the types of *local* variables as well. Consider the following code:

```rust
async fn foo() {
    let ms = MyStrings::default();
    
    drop(ms.x);
    // What is ms's type here?!?!
    sub().await;
    drop(ms.y);
}
```

What is the type of `ms` at the await point? The formal type system would answer "oh, the type is `MyStrings`, that doesn't change." However, its *de-facto* type clearly does change. After all, you can't access the `x` field on it like you could for any true value of type `MyStrings`. The true type is now something else entirely, an inconceivable type.

Therefore, the next step is to add the inconceivable types for partial borrows and partial moves to Rust's formal type system, so that they can be referenced in type annotations. For this, I propose the syntax `Foo{bar, baz}`, to list the fields explicitly. E.g. `MyStrings{y}` means a value with the *memory layout* of `MyStrings`, but where only field `y` remains (with the `x` part being arbitrary uninitialized data). This can be extended to partial borrows as well, e.g. `&mut Foo{bar, baz}`.


However, that's not all. There's still one more shadow type checker to deal with, and it's a really big one. As it turns out, the borrow checker is *also* a shadow type checker.

### Borrowed types

Consider the following code:


```rust
async fn foo() {
    let mut s = "Hello, world".to_string();
    let r = &mut s;
    // What is the type of s here???
    sub().await;
    
    r.push('!');
    println!("{}", s);
}
```

What is the type of `s` at the await point? Again, the formal type system says "it's `String` the whole time, that doesn't change", but again that's a lie. The de-facto type of `s` can't be `String`, because it doesn't support the operations of a value of type `String`. In fact, it doesn't support *any* operations, because any attempt to access `s` at that point will result in a compile error.

Therefore, the type of `s` must be temporarily changing to some other, inconceivable type. Specifically, the types of *borrowed values* are inconceivable types.

For this, I propose the syntax `!'a mut String`, but to understand why, we'll first have to go into a brief digression on the theoretical basis for borrow checking.

## Why borrow checking?

There's a common misconception, even in the Rust community, that borrow checking is just a memory management strategy, just a quirk of languages in the C++ niche and not something you need in a language with garbage collection. In fact however, borrow checking is the inevitable consequence of [protecting against aliasing bugs](https://blog.polybdenum.com/2023/03/05/fixing-the-next-10-000-aliasing-bugs.html), regardless of which memory management strategy a language uses.

### Affine types

In a traditional language, if you have a value of type `T`, you can make any number of copies of that value that all still have type T, just by reading it:

```
let foo: T = ...;
let bar: T = foo;
// foo and bar have type T
```

However, this doesn't work if you want to reason about aliasing. In particular, if you have a type for *exclusively referenced* objects (written `xcl` in this section for the sake of example), it is not sound to allow copying like this, because then you'll have two references to the same object, both of which think they are the only one.

Therefore, exclusive references must be *affine types*, meaning that they can only be used once.

### Splitting

However, being able to use each value only once makes it impossible to write all but the most trivial programs. In order to do anything useful, you need to be able to *split* a type so you can use values more than once.

A type can be thought of as a set of permissions to access the associated value, and thus it is safe to copy a value as long as the *permissions* aren't copied. Instead, the child values need to have a *disjoint* set of permissions.

For example, suppose we have an exclusive reference to an object with fields of type `T` and `U`.

```
let a = {foo: _, bar: _};
// a has the type xcl {foo: T, bar: U};

let b = a as {foo: T};
// b has type xcl {foo: T}
// a has type xcl {bar: U}
```

We can create a second reference to the object by *splitting* the permissions - after the split `a` *only* has the ability to read the field `bar` while `b` *only* has the ability to read field foo. Since they can only read disjoint parts of the object, it is still sound to have two exclusive references to the same object. (Note: this is pseudocode in a high level language for the sake of example - Rust doesn't actually work this way due to other, low level considerations).

For traditional types (or `Copy` types in Rust parlance), you have the splitting rule `T => T + T`. In other words, given a value of `T`, you can split it into two values that both still have type `T`. For affine types, that splitting rule doesn't exist, but there are still other splitting rules that are sound. For example, you can split by fields as we just saw: `xcl {foo: T, bar: U} => (xcl {foo: T}) + (xcl {bar: U})`.

### Temporal splitting

The previous splitting rule is *spacial* - you can split access over disjoint fields of an object. However, spatial splitting alone doesn't get you very far. In order to write practical code, you need another splitting rule. Besides splitting access by *space*, you can also split access by *time*.

Specifically, you can create a second copy of the reference as long as one copy can only be accessed *before* a given time, and the other copy can only be accessed *after* a given time. Since the access is split into disjoint periods of time, this is still sound.

```rust
life 'a;
let v = vec![42];
// v has exclusive access to the object

let r = &'a mut v;
// r has exclusive access to the object before time a
// v has exclusive access to the object *after* time a
```

This is the essence of borrow checking. It's not some arcane, low level memory management strategy, but just a natural, essential method of statically reasoning about *aliasing* in your code.

### Negative lifetime bounds

Borrow checking involves two kinds of types - references that are valid *before* a given time, and references that are valid *after* a given time. The first kind is already part of Rust's formal type system, the ordinary references you know and love. A value of type `&'a mut T` has exclusive access *before* time `a`, and no access after time `a`.

However, Rust's formal type system has no notion of the second kind of type, of references that are valid *after* a given time. This is the inconceivable type we need to add.

Since these are the opposite of normal lifetimes, it makes sense to use the "not" symbol `!`, e.g. `!'a`, which I call a *negative lifetime bound*. A bound of `'a` means the type is only valid *until* `a`, while a bound of `!'a` means it is only valid *after* `a` instead.

## Bound lifetimes

We can now express the types of all local variables, even the types that don't currently exist in Rust, but there's still one more problem. Recall that the example of named lifetimes looked like this:

```rust
let mut v = Vec::new();
life 'a, 'b;

let r = &'a mut v;
// do stuff with r
end 'a;

let r2 = &'b mut v;
// do stuff with r2
end 'b;
```

The problem is that the lifetime tokens (`'a` and `'b`) are *themselves* part of the function's local state, and thus *also* have to be stored inside the state machine enum. Therefore, we need a way to store lifetime tokens inside of objects.

My proposed syntax introduces a new expression, `bind 'a in x`, which *moves* the lifetime token 'a into the value x. And likewise, we have new destructuring pattern syntax, `let bind 'a in x = y;`, to do the reverse. Lastly, this also adds a new type, `bind 'a in T`, representing a type `T` with bound lifetime token `'a`.

Note that lifetime tokens and lifetimes only exist at compile time and have no runtime representation. `bind 'a in v` and the like are noops that exist purely for the sake of static type checking, and `bind 'a in T` has the same runtime representation as `T`.

### Moving lifetime tokens

With the `end 'a` syntax, the lifetime token `'a` is consumed in place, which means that we know precisely when it ends. All types in scope with a positive (`'a`) bound become invalid, while all types in scope with a negative bound (`!'a`) have the negative bound removed (returning it to the original, unborrowed type).

However, when we *move* a lifetime token into a value, types referring to that lifetime which were in the old scope but not the new scope have to be treated differently. In this case, the lifetime token is no longer in scope *without* being ended, and so we have to pessimistically invalidate both positive *and* negative bounds. Types that reference the lifetime which are still within the new scope (i.e. the value that the lifetime token was bound to) are unaffected.

## Examples

This can be pretty confusing, so let's look at some examples to show how the new lifetime system works.


First, suppose you try to return a reference to a local variable:

```rust
life 'a;
let mut s = Box::new("Hello".to_string());
// s has type Box<String>
let r = &'a mut *s;
// r has type &'a mut String
// s has type Box<!'a mut String>
return r; // error: r is invalid
```

This naturally results in a compile error because `r` has the type `&'a mut String`, but the lifetime token `'a` is *local* to the function. Therefore, when r is returned, it is no longer within the scope where `'a` exists and hence is invalid.

Now suppose we try binding `'a` to `r` before returning it:

```rust
life 'a;
let mut s = Box::new("Hello".to_string());
// s has type Box<String>
let r = &'a mut *s;
// r has type &'a mut String
// s has type Box<!'a mut String>
let ret = bind 'a in r;
// ret has type (bind 'a in &'a mut String)
// s has type invalid
return ret; // error: s is invalid
```

This time, `ret` contains its own lifetime token, and so is not invalidated when returning. However, moving the lifetime token `'a` into `ret` invalidates `s`. Returning causes `s` to be implicitly dropped, but it can't be dropped because it is invalid, resulting in a compile error.

Finally, let's try binding `'a` to a tuple of both `r` *and* `s` and returning that:

```rust
life 'a;
let mut s = Box::new("Hello".to_string());
// s has type Box<String>
let r = &'a mut *s;
// r has type &'a mut String
// s has type Box<!'a mut String>
let ret = bind 'a in (s, r);
// ret has type (bind 'a in (Box<!'a mut String>, &'a mut String))
return ret; // ok
```

This time, everything works. We've just returned a string *along with a borrowed reference to that string* in a 100% safe and zero-cost manner!

### Destructuring

Now that we've successfully returned a self-borrowed object, let's look at how you would *use* an object with self-borrows.

```rust
fn foo(v: bind 'a in (Box<!'a mut String>, &'a mut String)) {
    // v has type (bind 'a in (Box<!'a mut String>, &'a mut String))

    let bind 'b in (s, r) = v;
    // 'b is a lifetime token
    // s has type Box<!'b mut String>
    // r has type &'b mut String

    r.push_str(" world!");
    end 'b;
    // s has type Box<String>
    // r is invalid

    println!("{}", s);
}

```

## External lifetimes

So far, we've only looked at *owned* lifetime tokens. However, in some cases, you instead have a *reference* to an unknown lifetime token that exists elsewhere. There are two cases where this can happen:

**Generic lifetime parameters**

When a generic function is called, the generic lifetime parameters represent *some* lifetime which is owned by some caller of the function. These lifetimes are guaranteed to last at least as long as the function call, but could last longer.


**Destructured *references* to bound lifetimes**

In the previous example, we destructured an *owned value* that contained a lifetime token, resulting in the token being moved into the current scope.

If you destructure a *reference* to a value with a lifetime token, you instead get a reference to a lifetime token, rather than the token itself. These lifetimes are guaranteed to last at least as long as the destructured reference, but could last longer.



When you have a reference to an external lifetime, you can't *end* or *move* the lifetime, since you don't own the corresponding token. However, as long as the lifetime reference exists, you still can interact with types that refer to that lifetime.

Here's an example of mutating a value with a bound lifetime via a mutable reference:


```rust
fn foo<'call>(v: &'call mut (bind 'a in (!'a String, &'a str))) {
    // 'call is an external lifetime
    // v has type &'call mut (bind 'a in (!'a String, &'a str))

    let bind 'b in (s, r) = v;
    // 'b is an external lifetime
    // s has type &'call mut (!'b String)
    // r has type &'call mut (&'b str)

    let (r1, r2) = r.split_at(32);
    // r1 and r2 have type (&'b str)

    // can assign back to r since they both have type &'b str
    *r = r2;
}
```

Lastly, we also need to add a type to represent bound *lifetime references* in a type. However, the recursion stops there because a reference to a reference to a lifetime is equivalent to just a reference to a lifetime, since they don't actually have any state or runtime representation and can't be mutated.


# Part 2: The bytes level

If we were writing a high-level language, we'd already be done, but for Rust, we still have the low-level details to worry about.

There are two ways to consider a type system. The first is *what* your code does, in an abstract machine, with no concerns about how it is actually implemented. I call this "the value level".

The second level is *how* your code does it, in terms of low level implementation details like how values are stored in memory, which I call "the bytes level". In a high level language, this might not even be exposed to users, but as Rust is a systems language, it gives programmers control over low level details like this.

To keep things simple, Rust has a single type system which implicitly encodes both levels in a single type. Unfortunately, this means that the desired combination is sometimes simply not represented in Rust's type system.

In particular, Rust conflates ownership of *values* with ownership of *the memory where those values are stored*. This isn't just a problem for a *new* feature like async functions. It causes problems even in ordinary real-world Rust coding. In particular, it means that `Drop` has the wrong type signature because the correct type signature simply doesn't exist in Rust.

## Drop

When I say "`Drop` has the wrong type signature", some people might be thinking, "oh, you mean it should have wrapped `self` in `Pin`, right?". But that's just a minor inconvenience to people who are writing unsafe code anyway, and `Pin` itself only dates back to Rust 1.33.0. The problem I'm talking about is much worse. **`Drop` was broken, even in Rust 1.0**.

For example, last year, I had a struct containing a Tokio oneshot channel, and I wanted to send on that channel when the container was dropped. No problem, I figured, this is exactly the kind of thing Rust is good at. Should be easy, right?

...right??


```rust
struct Foo {
    channel: tokio::sync::oneshot::Sender<()>,
}
impl Drop for Foo {
    fn drop(&mut self) {
        // error[E0507]: cannot move out of `self.channel` which is behind a mutable reference
        self.channel.send(());
    }
}
```

As it turns out, this seemingly simple task is *impossible* to do in Rust. (And yes, as always, you can throw away static checking and just use `unsafe` or wrap your type in an unnecessary `Option` or whatever. I'm talking about *safe* *zero-cost* Rust here.)

The reason why this seemingly simple code pattern is impossible is right there in the error message. `Drop` takes `self` *by mutable reference*. In Rust, mutable references have the *invariant* that the type is unchanged. You can't move fields out of a mutable reference (unless you replace them with another value of the same type).

The whole point of a destructor is to destruct your type. The value is disassembled and the type goes away. You start with `T` and end with *nothing*. However, `Drop` takes `&mut T` instead, which has the postcondition that everything is unchanged and your `T` is still sitting there, good as always. Somehow, Rust ended up with a destructor api *that can't actually destruct anything*.


So how did Rust make such an obvious mistake? The problem is that the Rust designers painted themselves into a corner in a misguided attempt to minimize the number of types in the formal type system.

### Owned references

Currently, Rust has three kinds of types: `T`, `&mut T`, and `&T`. If you plot their ownership and representation, you get this:

| Type | Owned? | Representation |
|------|--------|----------------|
| T | yes | inline |
| &mut T| no | pointer |
| &T| no | pointer |

Notice something missing? There is no possible type with "yes, pointer" (or "no, inline" for that matter, but that doesn't matter much). Rust conflates *ownership* with *representation*. (More specifically, there is no way to own a *value* without owning the underlying memory - `Box<T>` is technically an owned pointer, but the pointer can only point to its own, owned memory, not memory that is managed elsewhere.)

In Rust, there is no way to transfer ownership of a value without *moving* the value. This was a major problem when Rust added async and decided that it needed to deal with non-movable types after all. Since the assumption of movability is built into the language in such a core way, there was no way to add non-movable types other than just saying "ok, everything related to them is unsafe, but here's `Pin` so you can at least partially hide the unsafety from your users, have fun".

`Drop` can't take `self` as a mutable reference because mutable references can't be destructed, as discussed above. But it *also* can't take `self` by *value*, because that makes it impossible to drop non-movable types. (There are also minor considerations around recursion, presumably the reason `Drop` didn't take values even *before* Rust added non-movable types.)

The solution to this dilemma is that the *correct* type for `Drop` to take is a type that currently doesn't exist - an *owned reference*, which I'll write `&own T`.

`&own T` is similar to `&mut T`, except that it *owns* the referenced value. This means that it has no post-conditions like `&mut T` does, and you can freely move fields out of the reference, and it will implicitly drop anything remaining when it goes out of scope. However, unlike `Box<T>`, `&own T` does not own the *memory*, meaning you can take an `&own T` reference to values on the stack when you need to drop them, and even recursively take `&own T` references to fields.

### Owned reference example

So what would a *correct* version of `Drop` look like? Let's look at an example.

First, let's start with a simple struct with some fields and methods:

```rust
struct MyStrings {
    x: String,
    y: String,
}
impl MyStrings {
    fn some_method(&self) {
        println!("{} {}", self.x, self.y);
    }
}
```

We can implement `Drop` like this. `self` starts out as an owned reference to the full type, meaning we can call methods on it like normal. Once we move fields out of it, the type of `self` changes to the corresponding partial type (recall that Rust already supports partially moved types as an inconceivable type).

```rust
impl Drop for MyStrings {
    fn drop(&own self) {
        // self has type &own MyStrings
     
        // we can call methods within drop()
        self.some_method();
     
        // now let's move a field
        let _ = self.x;
        // self now has type &own MyStrings{y}
     
        // we're too lazy to drop the other field, but it will be dropped implicitly
        // drop(self.y)
    }
}
```

When an owned reference goes out of scope, all remaining fields are dropped implicitly, not just inside a `drop` method, but anywhere an `&own T` exists. This is important a) for avoiding leaks while unwinding when an exception is thrown and b) because people will often not explicitly drop everything in a `drop` impl.

### Initialization

`Drop` isn't the only place where non-movable types cause a problem. Rust's entire design is centered around the assumption that you can move anything. You move values to transfer ownership, you move values to change types, you move values to initialize objects, etc. Therefore, making Rust usable for non-movable types requires more changes.

Fortunately, we *already* have to support partially moved types *anyway*, and that also conveniently covers the initialization case as well as the destruction case. Initialization is basically the same process as dropping, just in reverse:


```rust
let mut new = MyStrings{};
// new has type MyStrings{}, a partially moved value
// this has the *memory layout* of MyStrings, but with no fields initialized

new.x = "Hello".to_string();
// new has type MyStrings{x}

new.y = "World".to_string();
// new has type MyStrings{x,y}, which is the same as a fully initialized MyStrings
```

## Safe transmute

However, there's still one problem - in-place transmutes between different *base* types.

Recall that our future state machine enum looks something like this:


```rust
enum MyFuture {
    Initial(State0),
    Await1(State1),
    Await2(State2),
    Final,
}
```

Our previous examples with drop and initialization changed the *actual* type (i.e. with different fields initialized or not), but the *base* type (which controls memory layout and method resolution) was the same. However, here, each enum variant has a *different* base type.

Currently in Rust, you always have to move values when converting between different base types. E.g. even just wrapping a value in a newtype (or unwrapping it) requires moving the value. However, the "move and reconstruct" paradigm won't work here because our enum variants may contain *non-movable* types. Therefore, we need a way to convert between the different state types *in-place*.

Therefore, we need to add three things to Rust:

* A way to specify that different types have the same memory layout
* A way to specify that certain fields have the same location within the type for different types
* The type system understands this and allows safe transmutes between them.
* Allow updating enums in a way that is aware of this.

### Example

Suppose we have an async function like this:

```rust
async fn foo(mut s: String) {
    let r = &mut s;
    sub().await;
    
    let z = if true {r.as_bytes()} else {"hello".as_bytes()};
    sub().await;
    
    println!("{:?}", z);
    sub().await;
    
    println!("{}", s)
}
```

The corresponding future enum states are as follows, where `SubFut` is the name of the anonymous future type returned by the `sub()` function.


```rust
struct State0 {s: String}
struct State1<'a> {s: !'a mut String, r: &'a mut String}
struct State2<'a> {s: !'a mut String, z: &'a [u8]}
struct State3 {s: String}

enum MyFuture {
    Initial(State0),
    Await1(bind 'a in State1<'a>, SubFut),
    Await2(bind 'a in State2<'a>, SubFut),
    Await3(State3, SubFut),
    Final,
}
```

The problem comes when we need to implement the state transitions (within the `poll` method). Since `State1` and `State2` contain a non-movable field (`s`), they have to be converted *in-place*.

I'm not sure what the best way to do this is, but I'm assuming we have some sort of annotation which allows us to mark that these types all use the same memory layout, and that `s` is located in the same place in each type, allowing us to safely transmute between them.


The basic transition process for say, state 1 to state 2, is to start with an owned reference to `State1`. Then we remove the `r` field and use it to compute `z`, as per the code between the two await points. This leaves the pointer with type `State1{s}`. Then we can safely transmute this to `State2{s}`, since `s` is guaranteed to be in the same place in both types. Finally, we add the `z` field back, to get a full `State2`.

## Safe enum updates

There's still the question of how the compiler knows that enums are being updated in a safe manner.

### &mut to &own

The first question is how to temporarily violate the type invariants during the update. `poll` takes a *mutable* reference to `self`, but in Rust, `&mut T` is required to preserve the type invariants of `T` at all times (well, there are some minor exceptions, but those are built into the compiler, not something users have direct access to).

You're not allowed to move out of a mutable reference, because if this were allowed, and an exception were thrown and then caught, someone could access the reference again even though the pointee is now invalid. Therefore, we need to somehow get an owned reference to the enum variant instead.

However, there's one workaround. You can't temporarily move out of a `&mut T` because that would violate the invariant of `T`, but you *can* move out of a `&mut Option<T>`. Basically, we've widened the type invariant of the pointee to now include an "invalid" state. That state will never be seen in normal operation (assuming we always put the value back when done with it), but would be seen if an exception is thrown while the value is removed, and then that exception is caught and the reference accessed again.

For normal code, wrapping everything in an `Option` means adding a runtime cost and runtime type checks, which is why I ruled it out in previous discussions (e.g. restricting the discussion to "safe, *zero-cost* Rust"). However, it turns out that the `Future` api *already* effectively forces everything to have an extra "invalid" state anyway, so there's no additional cost to having one. This is the reason for the extra `Final` state in all the enums shown above.

Therefore, when updating the enum state during `poll`, we start by setting the tag to `Final`, which lets us get ownership over the current contents of the enum. Under normal operation, we would then set it back to a valid state, but if an exception is thrown in the middle and then caught and the future is re-polled, the future would just be in the `Final` state (which will panic when polled, like a future typically will when polled after completion).

### Tracking self-ness

The basic process is to start by setting the enum tag to `Final`, which gives an *owned* reference to the former contents of the enum variant, much like how you can take an owned value out of a `&mut Option<T>` (except that taking an owned *reference* is not something that currently exists in Rust).

Then we perform various mutations through the owned reference, which changes its type from `&own State1` to `&own State2` or whatever. Finally, once the variant pointer is updated to the correct type, we can set the tag of the original enum to match, thus restoring the invariant.

However, the last part is trickier than it sounds. The problem is that even if we have a `&mut MyFuture` (with the variant part currently borrowed) and a `&own State2` or whatever, the compiler can't know that it is safe to set the tag back to `Await2` *because it doesn't know that the `&own State2` actually points to the enum you're trying to update*.

Therefore, we need to add a function-local analysis pass to the compiler to facilitate this. When you borrow the variant of an enum, the compiler will keep track of the relation between the two local variables as long as they stay in the function, and allow a safe update of the enum if the variant pointer has the corresponding type.

### Another inconceivable type?

Now you might be wondering, isn't that enum-alias analysis pass yet another shadow type checker? Does this mean we have *another* inconceivable type to add to the type system?

It *is* a shadow type checker, but fortunately we don't have to add it to the type system. The reason is that in order to support safe async functions, we need to be able to name the type of any local variable *that is held across an await point*. Therefore, we only need to add inconceivable types to the type system *if it is possible for them to exist across an await*.

As shown earlier, partially moved types and borrowed types can both exist across an await, which is why we have to add them to the type system. However, if we're adding a *new* shadow type checker, we can just arbitrarily declare that the analysis stops at awaits, which avoids the need to add any new types to the formal type system.

Fortunately, the only thing we actually *need* the enum-alias pass for is to support safe enum updates within the `Future::poll` method, and `poll` is a non-async method, which means it can never contain awaits anyway. Therefore, there's no problem with restricting our new safe enum update feature to not span awaits.

### Leak

This sort of ad-hoc special analysis is certainly not elegant. In an ideal world, Rust would not have to have any inconceivable types at all, not even ones that don't cross awaits. And it certainly would be *possible* to turn this into a general purpose feature that is a first-class part of the type system.

However, doing this the proper way would require the introduction of *non-forgettable types*. Some people have already been asking for non-forgettable types to be added to Rust anyway for unrelated reasons (via a "`Leak`" auto-trait), but the results would not be pretty.

This post is already very long, and non-forgettable types would add much *more* complexity than anything I've covered, since it violates a more central assumption of the language than even non-movable types do. Therefore, for the sake of keeping this proposal *merely* very long and minimizing the complexity of Rust as much as possible, I think it's best to just punt on that subject and implement enum alias checking via special compiler magic rather than non-forgettable types.

The "special compiler magic" approach has the downside that it will be impossible to factor parts of the `poll` method out into separate helper functions, because the required types won't exist in the type system and hence can't be named in the function signature, but I think that's a small price to pay for leaving this can of worms unopened.

## Pin and Move

With that out of the way, there's one last topic to address, `Pin`.

You may have noticed a conspicuous lack of `Pin` in all my examples. That's because `Pin` was just a hack added due to the inability to introduce a `Move` auto-trait in a fully backwards compatible manner. But since the changes I'm proposing require breaking strict backwards compatibility *anyway* (good luck fixing the type signature of `Drop` in a backwards compatible manner!), we might as well assume that `Pin` gets replaced by a `Move` auto-trait for moveable types while we're at it.

However, we still need a way to replicate the functions `Pin` is currently serving, as it doesn't work quite the same way that `Move` would.

### Enum refinements

In current Rust, when a `Future` is initially created, you can freely move it around. However, you have to pin it before you can *poll* it, and once polled, it becomes unmovable.

In a `Move` world, this is basically saying that the `Initial` state of every future enum state machine has to be `Move`, but the other states of the enum may be non-`Move`. Since `poll` takes the enum by `&mut`, it can switch between the states and thus the future has to be assumed to be non-movable after polling.

However, Rust's current design doesn't support any way to reason like that. Rust's current type system is designed around the assumption that every value has exactly one type and that type never changes, which means that there is no way to talk about properties that hold now but not in the future. If an enum type implements an auto-trait, that means that *every* variant of the enum satisfies that trait, not just one variant.

This isn't just a problem for futures. It often comes up in current Rust with `Copy` too, as in "why can't I copy `None`"? For example, the following code will not compile because the array initial value has to be `Copy`, but `Option<SomeNotCopyType` is not `Copy` due to the unused `Some` variant.

```rust
struct SomeNotCopyType;

let foo: [Option<SomeNotCopyType>; 8] = [None; 8];
```

Therefore, we need a way to distinguish between "every variant of the enum satisfies this property" and "the *current* variant of the enum satisfies this property". The syntax `T: Future + Move` already means the former, so we need to come up with different syntax for the latter.

I'm not sure what the best syntax is, so I'll just go with `T: Future if Move`. `T: Future if Move` means "`T` is (any) future, *and* the value is *currently* `Move`", while `T: Future + Move` instead means "T is a future type where every variant is `Move`" (which would be `Unpin` in current Rust).

Since explicit trait implementations can only be done for the enum type as a whole, this sort of "per-variant trait impl" only makes sense for auto-traits and lifetimes. Therefore, the right side is restricted to auto-traits and lifetime bounds. `T: Future if (Move + 'static)` would be allowed, but `T: Future if Clone` would not.

Additionally, the "if" syntax can also be applied to *explicit* non-generic enum types. E.g `foo: MyEnum if Copy` means `foo` has type `MyEnum` *and* its current variant is one that is `Copy`.

### Stable deref types

In general, every borrowed type will be non-moveable. However, container types such as `Box`, `Vec`, `String`, `Rc`, etc. could optionally tell the compiler that borrowing the *contents* of the container does not cause the container itself to become non-moveable. This is what makes it possible to return data along with a pointer to that data. The outer value will always be moved by Rust's nature, but this is still safe as long as the *borrowed* data does not move.


# Conclusion

Whew, we're finally done! We've finally seen how to safely implement self-borrows and safe async functions in Hypothetical Future Rust.

To be honest, I think there's approximately zero chance that this gets implemented in Rust, since the nature of a language with a large ecosystem means that you can't just break backwards compatibility, and even seemingly trivial changes in Rust have been held up forever due to concerns around stabilization or documentation or whatever.

However, I hope that this post still helps people to think about the nature of the problem. In particular, it's frustrating to see people say that self-borrows are an inherent impossibility with borrow checking when that limitation is really just a consequence of idiosyncratic choices made by Rust, and if not in current Rust, it certainly could have been supported in an alternate history Rust that made slightly different choices, and likely will be supported in future languages with borrow checking.

Anyway, if you have any comments or suggestions, please let me know by commenting on Reddit.





