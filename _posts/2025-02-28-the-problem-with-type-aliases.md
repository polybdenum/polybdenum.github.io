---
layout: post
title: The problem with type aliases
date: 2025-02-28 20:03 -0800
---

Programming languages typically support two different features for abbreviating complex types - *type aliases* and *newtypes*. However, type aliases lead to poor error messages and slow compile times, which is why I chose not to support them in my recently released language, [PolySubML](https://github.com/Storyyeller/polysubml-demo). In this post, I will explain the problems with type aliases and provacatively suggest that new languages should *only* support newtypes and stop supporting type aliases.

## What are type aliases and newtypes?

As your code grows, so do the types representing its logic, and thus there needs to be a way to *abbreviate* them by assigning shorthand names to commonly used types and components of types.

One way to do this is with a *type alias*. For example, in Rust, you can define a type alias as follows:

```rust
type MyInt = u32;
```

For those not familiar with Rust, `u32` means an unsigned 32-bit integer. `type MyInt = u32;` defines an alias so that whenever you write `MyInt`, it is as if you had put `u32` in that place instead.

A type alias defines a new *name* for an *existing* type. You now have two different ways to refer to what is the same underlying type, and the two are completely interchangeable. Thus you can write a function which takes a `MyInt` and returns the *same value* as a `u32` with no conversion (or vice versa) and it compiles with no problems, because from the compiler's perspective, it's just `u32 -> u32` in the first place:


```rust
fn foo(x: MyInt) -> u32 {
    x
}
fn bar(x: u32) -> MyInt {
    x
}
```

A type alias is *transparent*: `type Foo = Bar;` means that whenever you write `Foo`, it is equivalent to having written `Bar` instead. Can you have a *non*-transparent type abbreviation? In fact you can, and this feature is typically referred to as *newtypes*.

In Rust, you can do this as follows:

```rust
struct MyInt2(u32);
```

This defines a new *type*, not just a new name for an existing type. `MyInt2` has the same *runtime representation* as a `u32`, but is considered a completely distinct type for typechecking purposes. This means that the equivalent version of the previous functions will not typecheck:


```rust
fn foo2(x: MyInt2) -> u32 {
    x
}
fn bar2(x: u32) -> MyInt2 {
    x
}
```

```
error[E0308]: mismatched types
  --> src/main.rs:15:5
   |
14 | fn foo2(x: MyInt2) -> u32 {
   |                       --- expected `u32` because of return type
15 |    x
   |    ^ expected `u32`, found `MyInt2`

error[E0308]: mismatched types
  --> src/main.rs:18:5
   |
17 | fn bar2(x: u32) -> MyInt2 {
   |                    ------ expected `MyInt2` because of return type
18 |    x
   |    ^ expected `MyInt2`, found `u32`
   |
help: try wrapping the expression in `MyInt2`
   |
18 |    MyInt2(x)
   |    +++++++ +
```

Unlike type aliases, newtypes are *opaque*, meaning that the fact that it was originally defined as `u32` can only be exposed in a certain specific way, and only with explicit action by the user. In order to convert from the right hand side (`u32`) to the left hand side (`MyInt2`), you have to explicitly wrap the value by writing `MyInt2(x)`, and to convert back, you have to explicitly unwrap it by writing `x.0` (or `let MyInt2(x) = x;`, etc.)


```rust
fn foo2(x: MyInt2) -> u32 {
    x.0
}
fn bar2(x: u32) -> MyInt2 {
    MyInt2(x)
}
```

The above examples showed type aliases and newtypes which represent a single type, but they can also be *parameterized*. Instead of representing a single type, a parameterized type alias represents an entire family of types, with type parameters that can be substituted in. For example:


```rust
type MyPair<T> = (T, T);

fn foo(x: MyPair<u32>) -> (u32, u32) {
    x
}
fn bar(x: (u32, u32)) -> MyPair<u32> {
    x
}
```

`MyPair<T>` has a type parameter `T`, and every specific type substituted for `T` results in a separate type for the alias. For example, when `T=u32`, `MyPair<u32>` is an alias for the type `(u32, u32)`. However, `MyPair<String>` is an alias for `(String, String)` and so on. They can even be nested, e.g. `MyPair<MyPair<u32>>` is an alias for the type `((u32, u32), (u32, u32))`.

We will refer to these as *parameterized type aliases*, and the previous kind without parameters as *single-type aliases*. Newtypes can also be parameterized in a similar manner.

With that out of the way, it's time to look at the problems that type aliases cause.

## Single-type aliases and the error message problem

For *single-type* aliases, there are no *technical* reasons why I couldn't have added them to PolySubML. It would have been almost trivial to add support for single-type aliases to the typechecker. The main reason I didn't add them to PolySubML was because they cause *bad compiler error messages*.

When the compiler reports a type error in a user's code, it also needs to emit an error message that explains to the user why their code has a compile error, and help them figure out how to fix it. A natural starting point is to print out an error message of the form "the value here has type `X`, but it is used in a way that requires type `Y`". (You'll usually want to also filter `X` and `Y` to only display the part that differs and line them up for easy comparison so that the message scales better for large `X` and `Y`, but that's not important for the present discussion.)

This works great *if your language doesn't have type aliases* and requires type signatures to be written in one piece. You have two conflicting type signatures side by side, and the user can see that there is a difference and figure out from them what the mistake is and how to proceed. This is because the type signatures directly convey user intent, and showing a contradiction between them allows the user to immediately see what went wrong with their intentions.

However, with type aliases, type signatures no longer fully convey user intent, making for unhelpful and confusing error messages.

For example, consider the following code:

```rust
type Waffle = (u32, u32, u32, u32, u32, u32, u32, u32, u32);
type Smelter = (u32, u32, u32, u32, u32, u32, u32, u32, u64);

fn foo(x: Waffle) -> Smelter {
    x
}
```

```
error[E0308]: mismatched types
 --> src/main.rs:7:5
  |
6 | fn foo(x: Waffle) -> Smelter {
  |                      ------- expected `(u32, u32, u32, u32, u32, u32, u32, u32, u64)` because of return type
7 |     x
  |     ^ expected `u64`, found `u32`
  |
  = note: expected tuple `(_, _, _, _, _, _, _, _, u64)`
             found tuple `(_, _, _, _, _, _, _, _, u32)`
```

The error message prints out giant types which are verbose, distracting, and unhelpful. The user's actual mistake was to mix up completely different types, perhaps due to using the wrong variable name or some other mistake in the code. They never meant to treat a `Waffle` as a `Smelter` in the first place, so wasting time printing out exactly where the definitions of those types happen to differ is not particularly helpful. What the user should have seen is something more like "expected `Waffle`, found `Smelter`".

Now consider this code:

```rust
type Waffle = (u32, u32, u32, u32, u32, u32, u32, u32, u32);
type Pancake = (u32, u32, u32, u32, u32, u32, u32, u32, u64);

fn foo(x: Waffle) -> Pancake {
    x
}
```

Here, the user's mistake is the exact opposite. They expected `Waffle` and `Pancake` to be different names for the *same type*. A hypothetical "expected `Waffle`, found `Pancake`" error message would be completely unhelpful to the user, because they're deliberately treating a waffle as a pancake, and what they *actually* need to know is that the definitions of those aliases aren't actually the same.

However, these two examples are *the exact same code* from the compiler's perspective! The *same* code requires *different* error messages, depending on user intent which is not conveyed in the code. **Type aliases are too ambiguous to convey the user intent required to deliver good error messages**.

The fundamental problem here is that a type aliases equivocates between two different models. Sometimes, the user will think about it as if it were the fully expanded type it aliases to. Other times, they will think about it as an independent unit. Which mental model they're using in a particular case determines which type of error message would be appropriate, but the compiler has no way to know what they're thinking and just has to guess arbitrarily.


### We need to go deeper

In fact, it gets *even worse*. The previous examples only showed one level of type aliases, but type aliases can be defined in terms of other type aliases and nested to an arbitrary degree, forming arbitrarily long chains of aliases that can be arbitrarily far apart in the code, located in different files, modules, or even *different crates*.

And user intention can differ *at different points along the chain*. For example:

```rust
type City = (u32, u32, u32, u32, u32, u32, u32, u32, u32);
type Citty = (u32, u32, u32, u32, u32, u32, u32, u32, u64);

type Istanbul = City;
type Constantinople = Citty;

fn foo(x: Istanbul) -> Constantinople {
    x
}
```

In this case, *neither* of the previous kinds of error messages would be appropriate! Saying "expected `Istanbul`, found `Constantinople`" would not be helpful because the user intended `Istanbul` and `Constantinople` to refer to the *same* type. But fully expanding it and saying "expected `(_, _, _, _, _, _, _, _, u64)`, found `(_, _, _, _, _, _, _, _, u32)`" (what Rust actually does currently) is not helpful at all either.

The user's *actual* mistake here was defining `Constantinople` as `Citty` (a typo) when they actually meant to define it as `City`. The real problem is not at the start of the chain *or* at the end of the chain - it's in the *middle* of the chain!

### Newtypes to the rescue

Meanwhile, this problem does not exist at all for *newtypes*, because newtypes unambiguously convey user intent. A newtype *always* operates under the "independent named unit" model. In order to treat it as the underlying defined type instead, the user has to explicitly wrap and unwrap the values. This means that the compiler never has to guess how the user intended to interpret their types.

## Parameterized aliases and the compile speed problem

Bad error messages weren't the *only* reason I decided not to implement single-type aliases in PolySubML. My other concern is that users would be confused if I supported single-type aliases but did not support parameterized aliases. And unlike with single-type aliases, there is a hard technical blocker for parameterized type aliases. Specifically it is (as far as I know) **impossible to implement parameterized type aliases efficiently**.

Unlike with single-type aliases, parameterized type aliases can expand to types which are exponentially large. Consider this example:


```rust
type W<T> = (T,);

type A2<T> = W<W<T>>;
type A3<T> = A2<A2<A2<T>>>;
type A5<T> = A3<A3<A3<A3<A3<T>>>>>;

type B5<T> = W<W<W<W<W<T>>>>>;
type B3<T> = B5<B5<B5<T>>>;
type B2<T> = B3<B3<T>>;

fn foo(x: A5<u32>) -> B2<u32> {
    x
}
```

This code compiles because `A5<u32>` and `B2<u32>` both expand to the type `((((((((((((((((((((((((((((((u32,),),),),),),),),),),),),),),),),),),),),),),),),),),),),),)` (that's `2*3*5 = 5*3*2 = 30` layers). However, they do it in different ways, meaning there's no obvious way to type check this other than fully expanding the types or doing something equivalent to fully expanding the types (e.g. you can encode the types implicitly as a stack machine, but it will still go through all 30 layers before finishing).

This example only expanded to a type of size 30, but you can easily make it exponentially large just by adding extra rows. As far as I can tell, there is no way to typecheck this in subexponential time.

Requiring exponential time to typecheck is no concern for Rust, which already has multiple deliberately Turing-complete compile time code execution features anyway (macros and const fns). However, a key design goal of PolySubML was to have worst-case polynomial time type checking, and thus it is straight-out impossible to support parameterized type aliases in PolySubML or any other language that cares about guaranteed fast compilation.

As before, parameterized newtypes do not have this problem because the typechecker doesn't have to (and in fact shouldn't) expand them during typechecking. Newtypes are opaque and have to be explicitly wrapped and unwrapped by the user, making it impossible to create exponentially large types like this.


## Conclusion

Type aliases result in bad compile error messages and poor performance, while newtypes avoid this problem. As a bonus, newtypes also make code easier to read because you can tell whether type signatures match or not just by looking at how they are written.

Type aliases have a very long history in programming language design, and to be honest, I'm still not sure if it makes sense to abandon them completely. However, type aliases also introduce severe and insurmountable problems, so I think new language designers should at least strongly consider the removal of type aliases and support only newtypes for type abbreviation.




