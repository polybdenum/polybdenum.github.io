---
layout: post
title: When Zero Cost Abstractions Aren't Zero Cost
date: 2021-08-08 20:07 -0700
---

Rust is built around the concept of "zero cost abstraction". The idea is that you can write human-friendly high level code and the compiler will give you for free performance at least as good as any optimized low level code you could have written yourself. With zero cost abstraction, you no longer have to trade off between maintainability and performance. 

Unfortunately, it is difficult to ensure that zero cost abstractions are truly zero cost, and Rust often fails to meet this lofty ideal in practice. In this post, I will show two examples where even a seemingly simple zero cost abstraction isn't actually zero cost.

## The newtype pattern

One of the most fundamental abstractions is *the newtype pattern*. This is where a user defined type is a simple wrapper for another type, with no additional data or behavior changes other than encapsulation. For example, we might define a wrapper around the `u8` type like this:

```rust
#[derive(Clone, Copy, PartialOrd, Ord, PartialEq, Eq, Debug)]
pub struct WrappedByte(u8);
```

There are a number of uses for such newtypes. For example, using rich semantic types helps catch bugs. Instead of passing around bare ints for height and weight, you can define custom `Height` and `Weight` types that wrap the int type, and then the compiler will catch any bugs where you mistakenly set weight using a height value or vice versa, all with no runtime cost.

Additionally, in Rust, newtypes are often necessary for implementing traits, due to the coherence rule. If you want to interact with another library, or you just need to override the standard trait definitions, the way to do it is to use a wrapper type.

Lastly, and perhaps most importantly, newtypes provide *encapsulation*. By exposing the wrapper type in a library but not its contents, you know that all values of that type were produced through normal use of the library's API. Furthermore, the library user is unable to accidentally depend on implementation details, and thus you have flexibility to make improvements to the library in the future. 

In this example, the only thing a user of the `WrappedByte` type would know is that it is copyable and comparable. We could replace the implementation with any integer type, or even more exotic combinations, without breaking library users. And we could restrict things further - for example, if it was meant to be a random opaque token, we could decline to implement `Ord` to prevent users from misusing it.


In a language like Java or Python, defining wrapper types like this has a runtime cost, forcing programmers to choose between abstraction and performance. However, Rust is a high performance systems programming language with an optimizing compiler, so one would expect that our `WrappedByte` type has exactly the same performance as if we just used a `u8` everywhere with no wrapping. Unfortunately, it turns out that this isn't always the case.

## Specialization

Let's see if our `WrappedByte` type is really zero cost. Here's a simple piece of code that just measures how long it takes to allocate a giant array of zero bytes:


```rust
fn main() {
    let t = Instant::now();
    let v = vec![0u8; 1<<34];
    println!("{:?}", t.elapsed());
}
```

Let's see how long it takes:

```
$ cargo run --release
4.291µs

```

Not bad. Rust is pretty good at allocating memory and doing nothing with it. Now let's see what happens when we use a wrapper type:


```rust
fn main() {
    let t = Instant::now();
    let v = vec![WrappedByte(0); 1<<34];
    println!("{:?}", t.elapsed());
}
```

```
$ cargo run --release
5.299196942s

```

What on earth?! Simply adding a newtype caused the code to be **over a million times slower!** And that's in release mode, with the full optimizing might of rustc and LLVM thrown at the problem. It should take the exact same amount of time to run.


What went wrong? The answer is *specialization*. 

Historically, Rust was based around the notion of *parametric polymorphism*. This means that generic code must define the interface expected of the types it is instantiated with, and only rely on that interface. Since general code is not allowed to peer past its trait bounds, it must treat every input implementing that trait equally. This enforces an abstraction boundary where users of the code can supply any equivalent trait implementation and get the same behavior back.

Unfortunately, abstraction barriers have a downside. While preventing one piece of code from making assumptions about another is great for modularity and maintainability, it is not so great for optimization, because making assumptions about other code allows you to skip steps that are unnecessarily *in the particular context of one user* and even select specialized algorithms.

Therefore, Rust recently introduced *specialization*, an experimental feature that allows generic code to use different implementations based around the type (or traits of the type) it is actually instantiated with, rather than coding to the ostensible interface. So far, it is only used in a few places in the standard library, but one of those places happens to be the function that `vec![v; n]` calls, and that function has a specialized implementation for `u8`.

When called specifically with `u8`, `vec![v; n]` will call an optimized function to allocate zeroed memory if `v` is 0, or fill memory with a fixed byte pattern if `v` is nonzero. However, when `v` has an arbitrary type, it will instead just `clone()` it for every single element of the array, which is many orders of magnitude slower. So much for zero cost abstraction.


## Stacked borrows

[Stacked borrows](https://github.com/rust-lang/unsafe-code-guidelines/blob/master/wip/stacked-borrows.md) is a proposal to formalize the low level semantics of Rust references and figure out what exactly programmers are and aren't allowed to do with them, and consequently, what assumptions the compiler is and isn't allowed to make when optimizing them.


One of these guarantees is that references that are passed into a function are assumed by the compiler to be valid for the entire duration of the function. This is useful to enable certain optimizations. For example, consider the following code:

```rust
fn foo(r: &u32) -> u32 {
    let v = *r;
    bar();
    v
}
```

where `bar` is a function defined elsewhere in the code, perhaps even in a separate crate. In some cases, it may be desirable to move the read of `r` after the call to `bar`. Perhaps it avoids spilling a register or improves pipelining or something.

```rust
fn foo(r: &u32) -> u32 {
    bar();
    *r
}
```

Should this optimization be valid? In safe Rust, there's no question that it is. However, safe Rust has to coexist with unsafe Rust that may be doing all sorts of subtle pointer tricks under the hood. If `bar` is defined elsewhere, the compiler does not know what its definition looks like (and whether it internally uses unsafe code) and thus must treat it like a black box.

A language like C would just give up at that point, but Rust aspires to better things. The goal of the Stacked Borrows project is to enable the compiler to make optimizations *even in the presence of blackbox functions*. To this end, Stacked Borrows contains the rule that if a function takes a reference as argument, that reference must remain valid for the entire lifetime of the function call, and any unsafe code must follow that rule. 

This allows the compiler to make the optimization without knowing anything about the implementation of `bar`, because even if `bar` contains unsafe code, that unsafe code is not allowed to violate the Stacked Borrows rules, and if it does, it is the fault of the unsafe code authors rather than the compiler authors.

This rule might seem a bit artificial. Why apply it only to references? Why not just say that *all* lifetime parameters of a function must outlive that function, whether they are direct reference arguments or buried in a struct somewhere? Unfortunately, [this turned out to not be possible](https://github.com/rust-lang/unsafe-code-guidelines/issues/125). Consider the following code:


```rust
fn break_it(rc: &RefCell<i32>, r: Ref<'_, i32>) {
    // `r` has a shared reference, it is passed in as argument and hence
    // a protector is added that marks this memory as read-only for the entire
    // duration of this function.
    drop(r);
    // *oops* here we can mutate that memory.
    *rc.borrow_mut() = 2;
}

fn main() {
    let rc = RefCell::new(0);
    break_it(&rc, rc.borrow())
}
```

In this code, `RefCell`'s guard type `Ref` has a fake lifetime parameter. However, `Ref` only protects access to the underlying cell for as long as the `Ref` _value_ exists. Dropping the `Ref` in the middle of a function is perfectly valid in safe Rust, and thus it is invalid to assume that its fake lifetime parameter outlives the function call.

Rather than try to fix the implementation of `Ref`, the Stacked Borrow authors instead chose to restrict this rule to bare reference parameters. Unfortunately, understandable as it is, the desire to optimize one specific case while neglecting the general case once again breaks zero cost abstractions.

For example, suppose we take our `foo` function from above and put the reference in a newtype:

```rust
struct Wrap<T>(T);

fn foo(r: Wrap<&u32>) -> u32 {
    let v = *r.0;
    bar();
    v
}
```

One would expect this to have the same performance as without the wrapper, but under the Stacked Borrows proposal, it may not. This is because the addition of the wrapper means that the compiler is no longer allowed to assume that the lifetime outlives the function call, and thus is no longer allowed to move the reference read to after the call to `bar`.


## Conclusion

The point of this post is not to bash the Rust team, but rather to raise awareness. Language design is a difficult process full of contradictory tradeoffs. Without a clear vision of which properties you value above all else, it is easy to accidentally violate the guarantees you think you are making. This is especially true for complex systems languages like C++ and Rust which try to be all things to all people and leave no stone of potential optimization unturned. 
