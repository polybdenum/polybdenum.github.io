---
layout: post
title: Hitting the wall with Rust's borrow checker
date: 2024-06-23 23:16 -0700
---

For many years, I've dreamed of creating my own programming language with advanced type checking, but no matter how hard I try, I've never been able to find a design that satisfies me. The fundamental dilemma runs as follows:

1. [In order to catch common bugs, you need linear types, lifetimes, and borrow checking.](/2023/03/05/fixing-the-next-10-000-aliasing-bugs.html)
2. In order to be useful, functions have to be generic over lifetimes.
3. In order to be useful, you need to be able to pass around lifetime-generic functions (aka higher rank lifetimes).
4. In order to be useful, you need to support closures, methods, or equivalent functionality.
5. In order to be useful, you need some form of subtyping for lifetimes, whether this is explicit intersections and unions or generic lifetime bounds.
6. Typechecking higher rank lifetimes with subtyping is NP-Complete, meaning it requires exponential time in the worst case and leads to bad error messages.
7. I want my language to have fast *worst case* compilation times.

Today I got curious to see how Rust solves this dilemma, as Rust is the first mainstream language with borrow checking and lifetimes. Unfortunately, the answer turns out to be that **it doesn't**. Not even the *easy* part. If you do anything even the slightest bit complicated, the compiler just yells at you to go away and hope that [Polonius](https://blog.rust-lang.org/inside-rust/2023/10/06/polonius-update.html) might someday fix things.

Let's see how lifetime checking works in Rust, or rather doesn't work.

**Note: The following is entirely based on experimentation with the Rust Playground and some failed searches for help. It is possible that there's some obscure workaround I wasn't able to find. In fact, I would _very much like_ to be wrong about this. Please let me know if I am.**


# Basic lifetime bounds

First, we have the most basic function. This just takes in a reference and returns the same reference. Since we want it to be usable for references with arbitrary lifetimes, we define a lifetime parameter (the `<'a>` part between `id` and `(`), and then annotate the function as taking an argument of type `&'a u8` and returning the type `&'a u8`.

```rust
fn id<'a>(a: &'a u8) -> &'a u8 {
    a
}
```

Now let's try a slightly more complicated function, where we take in *two* references with different lifetimes, and can return either one of them.

```rust
fn choice<'a, 'b>(a: &'a u8, b: &'b u8) -> &??? u8 {
    if (true) {a} else {b}
}
```

Defining two lifetime parameters and corresponding argument types is straightforward enough, but what is the return type? What goes in the `???` part? We need a lifetime that is the *intersection* of `'a` and `'b`, i.e. a lifetime that lasts only as long as both `'a` *and* `'b` are still valid. You might expect to be able to write `'a & 'b` or something for the intersection, but unfortunately, Rust does not have syntax for lifetime intersections or unions. Instead, we'll have to use a minor workaround.



This particular example actually has a much simpler solution. Thanks to variance, we don't actually need multiple lifetimes in the first place. We can just use a single lifetime for everything.

```rust
fn choice<'a>(a: &'a u8, b: &'a u8) -> &'a u8 {
    if (true) {a} else {b}
}
```

However, it's easy to modify the example so that a single lifetime no longer works. For example, what if we want to return the first reference (`a`) *and* a reference that can be either `a` or `b`?

```rust
fn choice2<'a, 'b>(a: &'a u8, b: &'b u8) -> (&'a u8, &??? u8) {
    (a, if (true) {a} else {b})
}
```

In this case, using a single lifetime will no longer work. If we did try to use a single lifetime, the first return value would incorrectly be tied to the second argument. Therefore a second lifetime of some sort is required. Fortunately, this isn't hard to fake.

Rust doesn't have intersections or unions, but it does let you specify *bounds* on the lifetime parameters, which is just as good. In particular, we can solve this example by adding the bound `'a: 'b`, which says that `'a` *outlives* `'b`, and thus `'b` is a subtype of `'a`.


```rust
fn choice2<'a: 'b, 'b>(a: &'a u8, b: &'b u8) -> (&'a u8, &'b u8) {
    (a, if (true) {a} else {b})
}
```

# True intersections

The previous example works because we never return a reference of lifetime `'b` only, so we can afford to "reinterpret" `'b` as actually being `'a & 'b` thanks to variance. However, we can modify the example by returning *both* input references as well as their intersection:


```rust
fn choice3<'a, 'b>(a: &'a u8, b: &'a u8) -> (&'a u8, &'b u8, &??? u8) {
    (a, b, if (true) {a} else {b})
}
```

What should go in the `???`? The natural approach is to try adding a *third* dummy lifetime parameter to represent the intersection of `'a` and `'b`. We'll call this dummy lifetime `'a_and_b` and add the bounds `'a: 'a_and_b` and `'b: 'a_and_b` in order to force `'a_and_b` to be at most as long as the intersection of `'a` and `'b`.


```rust
fn choice3<'a: 'a_and_b, 'b: 'a_and_b, 'a_and_b>(
    a: &'a u8,
    b: &'a u8,
) -> (&'a u8, &'b u8, &'a_and_b u8) {
    (a, b, if (true) { a } else { b })
}
```

This *should* work, but unfortunately, the compiler emits a spurious error instead:


```
error: lifetime may not live long enough
  --> src/lib.rs:18:5
   |
14 | fn choice3<'a: 'a_and_b, 'b: 'a_and_b, 'a_and_b>(
   |            --          -- lifetime `'b` defined here
   |            |
   |            lifetime `'a` defined here
...
18 |    (a, b, if (true) { a } else { b })
   |    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ function was supposed to return data with lifetime `'b` but it is returning data with lifetime `'a`
   |
   = help: consider adding the following bound: `'a: 'b`
```

For some reason, the Rust compiler seems to *really, really* not like intersections. If you ever attempt to intersect two lifetimes, it will force you to add a linear ordering between them for no good reason.


To be honest, I didn't expect to get stuck this quickly. I figured that Rust probably only had partial support for higher rank lifetimes, but I assumed that at least the most basic functions which just take and return a lifetime directly would be well supported. Unfortunately, that's not the case.

# Higher rank lifetimes

It turns out that even basic pure functions are broken, but let's see how *higher rank* lifetimes are handled as well, for completeness. So what is a higher rank lifetime?


Remember our `id` function before? What is its type?

```rust
fn id<'a>(a: &'a u8) -> &'a u8 {
    a
}

static _ID: ??? = id;
```

What goes in the `???`? `id` is a function that can take in a reference with *any* lifetime and returns a reference with the *same* lifetime. It is *generic* over the input lifetime. Therefore, any *specific* lifetime we try to put in the type signature is incorrect. We need some way of writing a *type signature* with a generic lifetime parameter. These are known as *higher rank lifetimes*.

As it turns out, this is possible in Rust. The way to do it is with the syntax `for<'a> ...`. In particular, the type of our `id` function can be written as `for<'a> fn(&'a u8) -> &'a u8`:


```rust
static _ID: for<'a> fn(&'a u8) -> &'a u8 = id;
```


Now what about our `choice2` function? This is basically the same as `id` except with the added complication that we need to put a *bound* on the `'a` parameter as well. The natural thing to try would be to use the same bound syntax as before:


```rust
fn choice2<'a: 'b, 'b>(a: &'a u8, b: &'b u8) -> (&'a u8, &'b u8) {
    (a, if (true) {a} else {b})
}

static _CHOICE2: for<'a: 'b, 'b> fn(&'a u8, &'b u8) -> (&'a u8, &'b u8) = choice2;
```

Rust's *grammar* even does allow bounds here. Unfortunately, the compiler as a whole does not:

```
error: bounds cannot be used in this context
  --> src/lib.rs:18:26
   |
18 | static _CHOICE2: for<'a: 'b, 'b> fn(&'a u8, &'b u8) -> (&'a u8, &'b u8) = choice2;
   |                        ^^
```

For some reason, you can't actually write bounds in types, even though this is usually required to represent the actual types of functions.

Fortunately, there is a secret, very ugly workaround. You can't write *explicit* bounds in types, but Rust will magically insert *implicit* bounds in some cases, which work just as well. Specifically, if any part of the type mentions something like `&'b &'a ()`, Rust will implicitly add a `'a: 'b` bound, and implicit bounds *are* still allowed in types.

Therefore, we can add a completely pointless extra dummy parameter to the function with a type that mentions `&'b &'a ()`, in order to insert the implicit bound we need. This requires callers to pass a dummy parameter everywhere for no reason, but hey, at least it works:


```rust
use std::marker::PhantomData;
fn choice2<'a, 'b>(a: &'a u8, b: &'b u8, phantom: PhantomData<&'b &'a ()>) -> (&'a u8, &'b u8) {
    (a, if (true) { a } else { b })
}

static _CHOICE2: for<'a, 'b> fn(&'a u8, &'b u8, PhantomData<&'b &'a ()>) -> (&'a u8, &'b u8) =
    choice2;
```




# Closures

So far, we've only looked at the *easy* case, with simple pure functions. Now let's see how Rust handles *closures*. Specifically, let's see what happens if we want to bind values to our `choice2` function in order to create a partial function. Recall that `choice2` was defined as follows:


```rust
fn choice2<'a: 'b, 'b>(a: &'a u8, b: &'b u8) -> (&'a u8, &'b u8) {
    (a, if (true) {a} else {b})
}
```

Let's see what happens if we want to *bind* a *specific* value to a parameter. For example, one thing we could do is bind the dummy parameter so callers don't have to pass it at every callsite.


```rust
fn outer() {
    let bound = |a, b| choice2(a, b, PhantomData);
}
```

Now, what is the type of `bound`? As it turns out, it is impossible to name the type of `bound`, not just because of lifetimes, but for [unrelated dumb reasons](/2024/06/07/the-inconceivable-types-of-rust-how-to-make-self-borrows-safe.html#unnameable-types) as well. We can solve *that* particular issue by boxing everything and using `dyn Trait` for no reason (no, not even `impl Trait` is allowed here).

```rust
fn outer() {
    let bound: Box<dyn for<'a: ???, 'b> Fn(&'a u8, &'b u8) -> (&'a u8, &'b u8)> =
        Box::new(|a, b| choice2(a, b, PhantomData));
}
```

However, even with the `Box`, it's still impossible to name the type due to the lack of support for lifetime bounds. Remember, the whole reason we even added the `PhantomData` parameter in the first place is that it is necessary in order to make the function type nameable in Rust's type system. Therefore, we'll have to give up on this line.

Now let's try binding an external reference value (`x`) to the first parameter (`a`). Fortunately, this part actually works for once:

```rust
fn outer<'x>(x: &'x u8) {
    let bound_a: Box<dyn for<'b> Fn(&'b u8, PhantomData<&'b &'x ()>) -> (&'x u8, &'b u8) + 'x> =
        Box::new(|b, phantom| choice2(x, b, phantom));
}
```

Binding `x` to the `b` parameter also works:

```rust
fn outer<'x>(x: &'x u8) {
    let bound_b: Box<dyn for<'a> Fn(&'a u8, PhantomData<&'x &'a ()>) -> (&'a u8, &'x u8) + 'x> =
        Box::new(|a, phantom| choice2(a, x, phantom));
}
```

# Fixing variance

Unfortunately, the extra `PhantomData` parameter in the previous examples doesn't just add pointless noise to every callsite, it also breaks *variance*.

Suppose hypothetically that Rust supported lifetime bounds and the dummy parameter was not necessary. In that case, our `bound_a` closure `|b| choice2(x, b)` would just have the type `for<'b> Fn(&'b u8) -> (&'x u8, &('b & 'x) u8)>`.

This is *covariant* in `'x`, meaning that substituting a longer lifetime for `'x` results in a subtype, and vice versa. For example, if we instead bound a `'static` lifetime, the result should be something that is a *subtype* of the `'x` version. However, the `PhantomData` parameter is covariant in `'x` (which gets flipped to *contravariant* since it is a function parameter), making the function type overall is *invariant*.


In order to restore the correct variance, we have to change the `PhantomData` to something *contravariant* like so:

```rust
fn choice2b<'a, 'b>(a: &'a u8, b: &'b u8, phantom: PhantomData<fn (&'b &'a ()) -> ()>) -> (&'a u8, &'b u8) {
    (a, if (true) { a } else { b })
}

static _CHOICE2B: for<'a, 'b> fn(&'a u8, &'b u8, PhantomData<fn (&'b &'a ()) -> ()>) -> (&'a u8, &'b u8) =
    choice2b;
```

We can then bind closures with `choice2b` like before:

```rust
fn outer2<'x>(x: &'x u8) {
    let bound_a: Box<
        dyn for<'b> Fn(&'b u8, PhantomData<fn(&'b &'x ()) -> ()>) -> (&'x u8, &'b u8) + 'x,
    > = Box::new(|b, phantom| choice2b(x, b, phantom));

    // Check reassigning with same type
    let bound_a: Box<
        dyn for<'b> Fn(&'b u8, PhantomData<fn(&'b &'x ()) -> ()>) -> (&'x u8, &'b u8) + 'x,
    > = bound_a;
}
```

Since repeating the type like that all the time makes the code very verbose, let's define a type alias `BoundA<'bound>` to make things clearer:

```rust
fn outer2<'x>(x: &'x u8) {
    type BoundA<'bound> = Box<
        dyn for<'b> Fn(&'b u8, PhantomData<fn(&'b &'bound ()) -> ()>) -> (&'bound u8, &'b u8)
            + 'bound,
    >;

    let bound_a: BoundA<'x> = Box::new(|b, phantom| choice2b(x, b, phantom));
    
    // Check reassigning with same type
    let bound_a: BoundA<'x> = bound_a;
}
```


# Subtyping

Now let's test whether variance actually works. Since our `bound_a` closure is covariant in `'x`, we should be able to bind a `'static` reference instead of `x` and assign it to the `BoundA<'x>` type and have it still work.


```rust
fn outer2<'x>(x: &'x u8) {
    type BoundA<'bound> = Box<
        dyn for<'b> Fn(&'b u8, PhantomData<fn(&'b &'bound ()) -> ()>) -> (&'bound u8, &'b u8)
            + 'bound,
    >;

    let s: &'static u8 = &0;
    let bound_a: BoundA<'x> = Box::new(|b, phantom| choice2b(s, b, phantom));
    
    // Check reassigning with same type
    let bound_a: BoundA<'x> = bound_a;
}
```

Notice how we're now binding `s` inside the closure instead of `x`. This part does work.


We can also bind `s` and give it a `BoundA<'static>` type. This works as well:

```rust
fn outer2<'x>(x: &'x u8) {
    type BoundA<'bound> = Box<
        dyn for<'b> Fn(&'b u8, PhantomData<fn(&'b &'bound ()) -> ()>) -> (&'bound u8, &'b u8)
            + 'bound,
    >;

    let s: &'static u8 = &0;
    let bound_a: BoundA<'static> = Box::new(|b, phantom| choice2b(s, b, phantom));
}
```

Now it's time to test subtyping. Logically, if our `s` closure works when assigned to the `BoundA<'x>` type *and* works when assigned to the `BoundA<'static>` type, and `BoundA<'static>` is a subtype of `BoundA<'x>`, we should be able to first assign it to the `BoundA<'static>` and then reassign it to the `BoundA<'x>` and have it still work. Right???


```rust
fn outer2<'x>(x: &'x u8) {
    type BoundA<'bound> = Box<
        dyn for<'b> Fn(&'b u8, PhantomData<fn(&'b &'bound ()) -> ()>) -> (&'bound u8, &'b u8)
            + 'bound,
    >;

    let s: &'static u8 = &0;
    let bound_a: BoundA<'static> = Box::new(|b, phantom| choice2b(s, b, phantom));
    
    let bound_a: BoundA<'x> = bound_a;
}
```

```
error: lifetime may not live long enough
  --> src/lib.rs:75:18
   |
68 | fn outer2<'x>(x: &'x u8) {
   |           -- lifetime `'x` defined here
...
75 |     let bound_a: BoundA<'static> = Box::new(|b, phantom| choice2b(s, b, phantom));
   |                  ^^^^^^^^^^^^^^^ type annotation requires that `'x` must outlive `'static`
```

# (╯°□°)╯︵ ┻━┻







