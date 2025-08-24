---
layout: post
title: Why You Need Subtyping
date: 2025-03-25 19:13 -0700
---
Ever since Stephen Dolan's 2016 thesis [Algebraic Subtyping](https://www.cs.tufts.edu/~nr/cs257/archive/stephen-dolan/thesis.pdf) showed how to combine type inference and subtyping, I've been developing increasingly sophisticated programming languages based on those ideas, first [IntercalScript](https://github.com/Storyyeller/IntercalScript) in 2019, then [CubiML](https://github.com/Storyyeller/cubiml-demo) in 2020, [PolySubML](https://github.com/Storyyeller/polysubml-demo) in 2025, and with my next language already in the planning stages.

I've long thought that subtyping is the next great evolution in programming language design and that it is a critical feature for new programming languages. However, existing programming languages have little or no subtyping, and there is a general lack of awareness about subtyping in the programming community. Therefore, in this post, I will explain what subtyping is and why it is so important.


## What is subtyping?

If you remember the fad for Object Oriented Programming, "subtyping" might call to mind classes and inheritance hierarchies. However, subtyping is a far more basic and general notion than that.

We say that type `X` is a subtype of type `Y` in a language if a value of type `X` can be used wherever type `Y` is expected. Notice that this has nothing to do with classes or inheritance. In a trivial sense, subtyping is present in every language because types are always subtypes of themselves under this definition. However, the important question in language design is to what extent does the compiler allow for non-trivial subtyping relationships.

What might subtyping look like? First, let's consider a high level language with boxed records, like Javascript or Python:

```js
// r: {x: int, y: int}
function foo(r) {
    console.log(r.x + r.y);
}

foo({x: 42, y: 21, z:18});
```

`foo` only reads the `x` and `y` properties of its argument, but you can pass in any value that has those properties, even if it also has *other* properties that `foo` does not look at. Javascript does not actually have type annotations, but if it did, it might look something like "`foo` requires a value of type `{x: int, y: int}`, while the argument passed has type `{x: int, y: int, z: int}`". In this case, `{x: int, y: int, z: int}` is a *subtype* of `{x: int, y: int}`

## Yes, you need subtyping even for low level languages

The usual reaction to an example like this is something like "Well, that might be ok for high level languages where all values are boxed anyway, but if you care about performance, you need to compile things with fixed type-dependent memory representations, so you can't have subtyping relationships between records of different widths like that. Therefore, there's no need for subtyping for most languages."

However, this reaction is misguided. While the specific example in the previous section is something you'd only see in unoptimized languages, even optimized languages still need subtyping. They'll have *fewer* subtyping relationships, but not *zero* subtyping.

Memory layout optimization means you can't have any subtyping relationships between types with different memory layouts. If your type system is sparse enough that there is only one type for each memory layout, then it is true that you won't have any nontrivial subtyping relationships. However, such a sparse type system is not very useful.

As computers have grown faster, there's been a strong trend towards leveraging them to help programmers develop software faster by catching bugs automatically at compile time. That means that type systems naturally evolve to capture more and more properties of the code worth checking, *including properties that don't map 1:1 to memory layouts*. And that in turn means you have subtyping!

## Null checking

Consider the problem of null checking, Tony Hoare's infamous Billion Dollar Mistake. Null pointer errors are such a common problem in programming that most modern languages have some way of checking nullability in the type system to statically prevent mistakes.

For example, in Kotlin, `String?` is the type of nullable strings, which could be a normal `String` value or `null`. Meanwhile, `String` is the type of non-nullable strings, which are statically guaranteed to not be `null`:

```kotlin
val not_null: String = "Hello";
val maybe_null: String? = "World";

fun takes_nonnull(x: String) {}
fun takes_nullable(x: String?) {}

// Can pass String to String
takes_nonnull(not_null);
// Can pass String? to String?
takes_nullable(maybe_null);
// Can *also* pass String to String?
takes_nullable(not_null);
```

Key to the usability of this system is the fact that you can freely pass non-nullable values even where nullable values are expected. If a function accepts a value that can be String or null, it is ok to pass it a value that is guaranteed to be a String and not null. Or in other words, `String` is a *subtype* of `String?`!

`String` and `String?` are two *different* types that have the *same* memory layout, so even with type-specific memory layouts, we still have a non-trivial subtyping relationship. In order to statically check properties like nullability that don't affect memory layout, the compiler needs to support subtyping.

## Alias checking

In the case of null checking, your lattice of types is fairly trivial - you just have `String` and `String?`. Every type is either nullable or not. However, that's merely scratching the surface of the kinds of analysis that type checkers are and will be called on to perform.

For example, the next great frontier in static type checking is alias analysis. Alias related issues are a common source of bugs and in order to statically prevent them, [you need a *borrow checker*]({% post_url 2023-03-05-fixing-the-next-10-000-aliasing-bugs %}). This associates each pointer with *permissions*, each of which can be valid for a specific *lifetime*.

Every pointer has the same *runtime representation* (they're all just pointers in memory). However, the *static types* are completely different. The permissions of your pointers only exist at compile time and have no effect on the runtime behavior of the code, but they are still critical to catching aliasing bugs during compilation.

As with null checking, the "extra" information naturally gives rise to subtyping relationships. If you have a pointer with more permissions, it should still be usable in a place that only requires a pointer with fewer permissions. If you have a conditional value derived from two possible values (e.g. `if foo {p} else {q}`), then the new pointer should have the permissions that *both* of the possible source pointers *share*. And so on.


Unlike with null checking, where you just have one bit of "extra" information associated with each type (can the values be null or not?), with borrow checking, you have an *infinite* amount of possible information that can be associated with each type. This means that it is more important than ever to have a type system and compiler that are designed from the ground up to work well with subtyping.

## Conclusion

As the null checking example shows, nearly every language has *some* sort of subtyping. However, type systems and compilers are often not designed with subtyping in mind, leading to lots of preventable rough edges. The more sophisticated the type system, the bigger the cost of not taking subtyping seriously in the design. In order to design the programming languages of tomorrow, *Algebraic Subtyping*-inspired designs will become even more important.

See [here]({% post_url 2020-07-04-subtype-inference-by-example-part-1-introducing-cubiml %}) for a basic tutorial on how to implement subtyping with type inference.



