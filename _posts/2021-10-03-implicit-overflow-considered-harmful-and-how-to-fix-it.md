---
layout: post
title: Implicit Overflow Considered Harmful (and how to fix it)
date: 2021-10-03 14:31 -0700
---

A common problem in programming language design is the question of what the type of integral literals should be, and if they are untyped, what the rules for implicitly converting them to regular integer types should be. This is part of the more general problem of how to handle having multiple integer types with overflow and the conversions between them. There are many approaches to this problem, but they all have significant downsides. 

The reason is because this entire problem is built on a flawed premise. Asking what the most user-friendly way to implicitly insert overflows is is like asking what the driest kind of water is. All the answers are unsatisfactory because you are asking the wrong question in the first place.

The *right* question is "__Why do you even need multiple integer types in the first place?__"


### Shorts, ints, and longs, oh my!

Mainstream programming languages typically have a large number of different integer types (`short`, `int`, `long`, `s16`, `s32`, etc.) that differ in both the range of allowable values as well as their memory representation and runtime behavior.

The reason that integer type conversions are such a huge issue is because none of these types are subtypes of any other in the sense of the [Liskov Substitution Principle](https://en.wikipedia.org/wiki/Liskov_substitution_principle). When the behavior of one type is a subset of another, there are no issues with implicit conversion, but these types all have different, mutually incompatible behaviors, and thus converting between them leads to much confusion and bugs.

The reason for this is _overflow_. When you write `int` in Java, you aren't actually getting integer math. Instead, all operations are performed modulo `2**32`, meaning that e.g. `1000000 * 1000000 = -727379968`. Moreover, overflow is different for each type. Do the same operation with longs instead, and you get `1000000L * 1000000L = 1000000000000L`.

Overflow has two major effects. The first is that code may not do what you would naively expect. A new programmer seeing `a + b` would typically think of it as adding two numbers together, like the simple, easy to reason about integer math taught in school, but this is not what most languages actually do. Moreover, most of the time they coincide, making it easy to miss bugs during development and testing.

However, even if the programmer remembers to take overflow into account (despite the absence of any indication of it in the code), the problems aren't over. The large number of integer types, each with their own overflow behavior, means that to understand what some integer code does, it's not enough to have the code in hand. You also need to know the static types of every relevant value and expression, and while some types are indicated in the code, the rest are typically determined only by resort to complex and unintuitive promotion rules or the inscrutable whims of a type inference engine.

How does overflow work out in practice? Let's look at an example.

### Stagefright

In 2015, security researcher Joshua Drake announced several overflow-related security vulnerabilities in the Android media library libstagefright, leading to massive press coverage and consternation and ultimately major changes in the Android security ecosystem.

What you may not know is that Drake's initial patches for the Stagefright vulnerabilities themselves contained overflow bugs and thus failed to actually fix the issue. Furthermore, in one case he wasn't even the first to notice and attempt to fix the overflow vulnerability. This one line of code in libstagefright took _three_ attempts to fix for good:

[Patch 1](https://android.googlesource.com/platform/frameworks/av/+/edd4a76eb4747bd19ed122df46fa46b452c12a0d%5E%21/media/libstagefright/SampleTable.cpp)

```diff
     mTimeToSampleCount = U32_AT(&header[4]);
+    uint64_t allocSize = mTimeToSampleCount * 2 * sizeof(uint32_t);
+    if (allocSize > SIZE_MAX) {
+        return ERROR_OUT_OF_RANGE;
+    }
     mTimeToSample = new uint32_t[mTimeToSampleCount * 2];
```

[Patch 2](https://android.googlesource.com/platform/frameworks/av/+/e2e812e58e8d2716b00d7d82db99b08d3afb4b32%5E%21/media/libstagefright/SampleTable.cpp)

```diff
     mTimeToSampleCount = U32_AT(&header[4]);
-    uint64_t allocSize = mTimeToSampleCount * 2 * sizeof(uint32_t);
+    uint64_t allocSize = mTimeToSampleCount * 2 * (uint64_t)sizeof(uint32_t);
     if (allocSize > SIZE_MAX) {
         return ERROR_OUT_OF_RANGE;
     }
```

[Patch 3](https://android.googlesource.com/platform/frameworks/av/+/a105482ae577852ffd08ce88ae5d1ba81db875ac%5E%21/media/libstagefright/SampleTable.cpp)

```diff
     mTimeToSampleCount = U32_AT(&header[4]);
-    uint64_t allocSize = mTimeToSampleCount * 2 * (uint64_t)sizeof(uint32_t);
+    uint64_t allocSize = (uint64_t)mTimeToSampleCount * 2 * sizeof(uint32_t);
     if (allocSize > SIZE_MAX) {
         return ERROR_OUT_OF_RANGE;
     }
```

As you can see, C's promotion and overflow rules are so confusing that even experienced engineers routinely mess them up, even when specifically looking for overflow bugs. Clearly, a better solution is needed. In fact, the Android team later [enabled a special compiler option to abort on all integer overflow, signed or unsigned](https://android-developers.googleblog.com/2016/05/hardening-media-stack.html), thus eliminating the possibility of similar vulnerabilities in the media stack for good.


### Type inference

Go and Rust, among others, looked at this mess and decided to get rid of implicit integer conversions entirely, avoiding the confusion of C promotion rules at the expense of extreme verbosity. However, apart from the burden of having to needlessly write explicit casts everywhere, the rise of type inference has led to all sorts of new possibilities for confusion and footguns.

Integers are of course not the only source of type inference related pitfalls in Rust. Methods like `collect()` can do many different things depending on type annotations elsewhere in your code, and the relevant type annotations may be far away from the code in question, or potentially even in different crates. However, this is at least mitigated somewhat by the fact that the compiler will require you to add explicit type annotations when the inference engine can't decide on what the type should be.

In the case of integer literals by contrast, the compiler will just randomly make up types when it isn't sure rather than ask the user (specifically, it chooses `s32`). This once led to a real world overflow bug in a Rust project I worked on. Here's a simplified Rust example that demonstrates the same issue:


```rust
fn main() {
    dbg!(set_flag(1, 32));
}

fn set_flag(x: u64, shift: u64) -> u64 {
    x | (1 << shift) as u64
}
```

I expected type inference to infer that the `1` should be a `u64` like everything else. Instead, it defaulted to `s32`, causing the code to blow up with overflow errors. In this case, removing the `as u64` part fixes the issue, but it is not immediately clear that this is what will happen or that removing a cast would fix things, and my original code was more complicated anyway.


## Avoiding overflow

So if overflow is bad, especially when combined with multiple integer widths, what is the solution?

If you're designing a high level language, the obvious solution is to use true integer semantics (aka bigints) everywhere like Python does. However, this approach is not popular in low level languages due to the difficulty of optimizing bigint code.

In order to generate efficient binaries, you need to be able to store integers in machine words (or smaller) and use native instructions to do math on them (with the attendant implicit overflow). The way to square this circle is to define the language semantics in terms of true mathematical integers (bigints) where math operations never overflow, and then require the programmer to add enough annotations that the code can nevertheless be compiled efficiently.

The advantage of this is a very simple language specification free of pitfalls and surprising behavior. It's a lot easier to start with correct code and add performance than to add correctness to fast broken code, which is why people routinely write safe code in Rust and fail to do so in C++ despite considerable effort. But what might such annotations look like? Below I outline one way to do this, dubbed IntLang.


### Range analysis

First off, we need to ensure that all values stored in memory can be represented in 8, 16, 32, or 64 bits. Language-wise, this means that we need to verify that the range of possible values for any given variable is sufficiently small, and this means _range analysis_.

Semantically, every integer in the program is just typed `Int`, the type of true integers. However, to allow for optimization, we also define subtypes `Int<a, b>` for every `a <= b` that represent the set of integers between `a` and `b`. These are true subtypes - anything you can do with an `Int`, you can do with an `Int<a, b>`, etc. - there's no type dependent overflow behavior like there is with small ints in traditional languages.

Obviously, explicitly specifying bounds everywhere like this is unwieldy, so in practice, we would define aliases `uN` and `sN` for common signed and unsigned integer widths, with e.g. `s8 = Int<-128, 127>` and `u16 = Int<0, 65535>` etc., and expect the programmer to use those in most cases. The full range types just exist for internal use in type inference, as well as a way for the programmer to express more precise invariants where desired.

Keep in mind that these types merely _refine_ the set of possible _values_ - the _behavior_ is still that of bigints regardless of type. E.g. `(100 : u8) * (100 : u8) = 10000`.


### Storage types

At this point, you might be inclined to just have the compiler store every value in the smallest memory size that fits the static range of possible values, and emit a compile error if any value has a type which is not a subtype of `s64` or `u64` (and thus can't be fit within 64 bits). This can work for a high level language, but is not sufficient for low level, performance oriented languages.

The reason is because the programmer may want to have the memory layout use a larger space than necessary for various reasons, such as ABI compatibility or pointer compatibility with values of a larger type.

Essentially, the whole original problem of integer literals and integer conversions and so on stems from the practice in traditional languages of letting the quirks of a low level implementation detail (storage representation) dictate the high level semantics of the language (overflow, etc.). In order to put language design on a solid footing, we need to explicitly separate the two.

In our hypothetical IntLang, every memory location will have both a _value type_ (`Int<a, b>`) and a _storage type_ (`i8`, `i16`, `i32`, or `i64`) that determines how the values are represented in memory. Note that here I use `iN` to refer to an `N` bit integer with no particular signedness interpretation, while `uN` and `sN` refer to the sets of possible values of unsigned and signed integers respectively.

For value types, `Int<a, b>` is a subtype of `Int<c, d>` whenever `c <= a` and `b <= d`. However, there are no subtype relationships between distinct storage types. For example, if you have a pointer `*i8` to an 8-bit location and try to pass it to a function expecting a `*i64` (pointer to 64 bit location), the function will read the wrong number of bytes. Therefore different storage types can't be mixed.

Pointers to the _same_ storage type _can_ be mixed as long as the value types are compatible. For example, if you have a function that takes `* const i64 + u64` (a read-only pointer to any 64 bit unsigned int), you can freely pass it a `*i64 + Int<1, 42>` (a pointer to an int known to be between `1` and `42`, stored in 64 bits).


### Narrowing operations

Now that we have the memory model out of the way, how do we map the bigint math to efficient machine instructions?

> **Note:** I'm going to assume the compilation target is WebAssembly (WASM), as that is a relatively simple and small ISA. If you're targeting a native ISA like x86, you'll have more options available in code generation.

Since the ISA only provides fixed width instructions with overflow, there's obviously no way to map arbitrary sequences of bigint operations onto native instructions. Therefore, we require the programmer to insert explicit narrowing operations as necessary to enable efficient code generation. There are two types of narrowing operations we should support, _wrap_ and _check_.

The first, wrapping (`wrapU8()`, `wrapS32()`, etc.), reduces the value to the requested range using modular two's complement arithmetic, i.e. overflow. For example, `wrapS32(1000000000000) = -727379968`. This is similar to what `(short)x`, `(int)x`, etc. do in Java. It is useful in cases where overflow is actually desirable, such as cryptography or random number generators.

The second, checking, panics or aborts if the value is not in the requested range. E.g. `checkU8(x)` returns `x` unchanged if `0 <= x <= 255` and panics otherwise. It may be worthwhile to additionally or instead have a version that returns a `Result` for use with the `?` operator in Rust-inspired languages, but the exact error handling scheme chosen is irrelevant to the proposal here.

Checking should be used by the programmer whenever the result is not statically known to be in range and overflow is not desirable. They can of course just use `wrap` instead to emulate the behavior of traditional languages and avoid the performance overhead of error checking, but this is generally a poor idea given the long history of overflow bugs. Still, the programmer's choice is irrelevant to this proposal. 

Incidentally, the Android media stack example mentioned previously shows that it is possible to use runtime overflow checking everywhere in a large, performance sensitive codebase, with minimal runtime overhead. 


### Code generation

With that out of the way, how do we actually generate code? And how do we decide when and where to require explicit narrowing operations?

One possibility would be to just require a `wrap` after every single operation. This does faithfully replicate the behavior of existing languages, but it is unduly verbose and burdensome on the programmer. Luckily, we can be a lot smarter in the compiler, and thus require `wrap`s less often.

First off, we can do all intermediate operations with 64 bit math by default. For storage, it is important to be able to use smaller amounts of memory in order to improve cache performance, but when it comes to the actual math instructions, there is generally no benefit (barring vectorization) for doing math with smaller than native width. 

This already lets us calculate some operations exactly. For example, suppose we add two `s8`s. When we load them from memory, they have the type `Int<-128, 127>`. Then for the addition, we have 

`x : Int<-128, 127>, y : Int<-128, 127> => (x + y) : Int<-256, 254>`

Since `Int<-256, 254>` is still within the bounds of an `i64`, the runtime value calculated using machine operations matches the abstract, language level value defined via bigint semantics, and thus no wrapping is required.

> **Note:** I'm assuming that your type inference engine is capable of producing a conservative approximation of the bounds for any operation result given bounds on the inputs. The details of this are not relevant here. It is worth noting however that you may want to use an unnecessarily coarse approximation in some cases in order to improve compiler performance. For example, you should probably saturate the computed bounds somewhere above `2**64` in order to avoid computing and carrying around huge type bounds if someone e.g. writes `1 << 999999999999` in the code. 

However, that's the easy case. What happens once the bounds grow past 64 bits? Whether we need wrapping or not depends on how the result is used.


### Modular operations

The usual integer operations we might want for our language can be divided into three groups: binary math (`+ - * / % ^ & | << >>`), equality comparison (`== !=`) and ordered comparison (`< <= > >=`).

The first group can further be divided into what I call _modular_ and _non-modular_ operations, based on whether they are compatible with the modular arithmetic structure of two's complement math.

An operation `op` is modular if inputs that are equal modulo `2**N` produce outputs that are equal modulo `2**N`. Or in other words,

`a ~ c mod 2**N, b ~ d mod 2**N => (a op b) ~ (c op d) mod 2**N`

These operations have the nice property that the low bits of the output do not depend on high bits of the input. The modular operations are `+ - * ^ & | <<` according to this definition.


Whenever we apply a machine instruction to some values, the result is equal mod `2**64` to what the mathematical "true" result would have been in the absence of overflow. The modular property means that this is true for any _chain_ of modular operations, no matter how long. Therefore, any number of modular operations can be chained together with no intermediate `wrap()` calls, as long as the result is eventually `wrap()`ed before it is used with a non-modular operation.


### Non-modular operations

For non-modular operations (`/ % >>`) and comparisons, this is unfortunately no longer true. Therefore, we have to check the type of each input, and if the input ranges are not contained within either `s64` or `u64`, we return a compiler error telling the programmer to insert an explicit `wrap()` call.

Note that since the intermediate values at runtime are `i64`s, `wrapU64` and `wrapS64` are actually no-ops. Their purpose is merely to force the abstract language semantics of the code to match what we can actually provide efficiently. As an optimization, it is possible to sometimes turn smaller wraps into no-ops as well, though I'm not sure if it is worth the added complexity. For example, you could look ahead and if you see a sequence of modular operations followed by a `wrapS32` or `wrapU32` call, you could use 32-bit math for the intermediate operations rather than 64-bit in order to make the final wrap a no-op.

For equality comparisons, there are some special cases we can optimize further. For example, if the ranges of the inputs are non-overlapping, the comparison is just a constant `false`. Otherwise, we merge the input ranges and check whether the total size is `2**64` or more.

If the size of the input range is less than `2**64`, no wrapping is required, even if that range does not fit within `s64` or `u64`. This is because the runtime values are equal to the abstract values mod `2**64`. If the range of possible values is less than `2**64`, the modulo can not cause any distinct values to appear equal, and thus doing the equality comparison on the mod `2**64` values is equivalent to doing them on the abstract values.

Finally, when an intermediate value is stored back to memory, we have to verify that its range is within the value type of the storage location. If not, it's a compiler error and the programmer has to insert a `wrap` or `check` call.


### Implementing check()

The simplest way to implement `check` is as an ordinary conditional. For example, `check<Int<a, b>>(x)` would de-sugar to something like `if a <= x <= b then x else *jump to error handling code*`.

Note that `<=` is a non-modular comparison, which means that if the input `x` has a range outside of `s64` or `u64`, the above rules will require the programmer to insert a call to `wrap` _before_ the `check` call. This is presumably not what the programmer wants, so I recommend instead having the compiler search backwards through the expression tree to find the place where the bounds first became too big and suggest that the programmer insert a `check` call there instead.

Some targets, such as x86, have a special overflow flag, which allows you to check whether an operation overflowed after the fact. Unfortunately, this is not available on targets like WASM, but if you aren't interested in compiling to WASM, the use of the overflow flag can allow more efficient implementations of `check` and/or allow you to support `check` operations after an entire sequence of operations.


## Conclusion

The system proposed here has a number of advantages over the approach of traditional languages. 


First off, overflow is _explicit in the code_. If you see a call to `wrap`, you know that overflow can occur at that point, and if you don't, it can't. This makes it much easier to understand what the possible behaviors of a piece of code are.

Second, the _kind_ of overflow is explicit as well. You no longer have to worry about your math getting arbitrarily wrapped at 65536 just because you wanted to economize on storage space in your memory representation, or even worse, because the type inferer noticed that your values once fraternized with some values that did. Instead, you can just look at the code. If you want to wrap at 16 bits, you call `wrapU16()`, and if you don't, you don't.

Third, it _reduces the scope_ of potential overflows. In a traditional language, _every single math operation_ is potentially subject to overflow. Under this system, you only have to be concerned about the explicit `wrap` calls. This is a bit like having every pointer operation in the program an NPE waiting to happen versus only looking for `.unwrap()`s.

Fourth, every possible expression has a single, well-defined type, even integer literals. In Rust, trying to call any methods on an integer literal will net you confusing error messages about the nonexistant `{integer}` type. In our "IntLang", integer literals are just like any other expression, and can be used in the same way.

Lastly, this also has advantages over the "traditional overflow, but tell the compiler to insert aborts whenever this happens" approach, such as used by the Android media stack. Implicitly trapping on every overflow breaks the law of associativity - you run into situations where `(a + b) + c` will trap while `a + (b + c)` is perfectly fine. In the IntLang approach, traps are represented explicitly in the code, so you can see them or the lack thereof when refactoring code, and won't have to worry about sudden breakages from seemingly innocuous code transformations.









