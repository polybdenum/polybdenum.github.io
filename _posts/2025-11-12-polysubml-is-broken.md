---
layout: post
title: PolySubML is broken
date: 2025-11-12 19:04 -0800
---

In 2020, I released [Cubiml](https://github.com/Storyyeller/cubiml-demo), a language based on [Algebraic Subtyping](https://www.cs.tufts.edu/~nr/cs257/archive/stephen-dolan/thesis.pdf), and earlier this year, I followed it up with [PolySubML](https://github.com/Storyyeller/polysubml-demo), extending it with polymorphic types. No sooner had I released PolySubML then I started planning the design of my *next* programming language, which would have all the features I wanted to add but didn't have time for with PolySubML.

In August, I released [a series of blog posts]({% post_url 2025-08-18-x-design-notes-unifying-ocaml-modules-and-values %}) explaining the planned design of my new language, which I codenamed X since I hadn't chosen a name for it yet. When I wrote the blog posts, I assumed it wouldn't take long to begin work on X, because I already had a working base language with PolySubML, and thought it would be straightforward to add the new features I described. Unfortunately, the opposite happened. Two months later, not only have I not made any progress on X, I discovered in the process that **PolySubML itself was fundamentally flawed**.

In this post, I will give a quick explanation of the problem I discovered in PolySubML and an idea for an alternative approach.

## I. Recursive types

The first key point is that Algebraic Subtyping has *recursive types*. A recursive type represents an infinite type. For example, the type ```rec list=[`Nil | `Cons (int, list)]``` is shorthand for the infinite expansion ```[`Nil | `Cons (int, [`Nil | `Cons (int, [`Nil | `Cons (int, ...)])])]```

The recursive types are *equirecursive*, meaning that each type is *equal* to its infinite unrolling, with no separate wrapping or unwrapping steps required. There can be multiple different representations of the same mathematical type. For example, the above type could alternatively be written ```rec list=[`Nil | `Cons (int, [`Nil | `Cons (int, list)])]``` or even ```[`Nil | `Cons (int, rec list=[`Nil | `Cons (int, list)])]```. All of these result in the same infinite expansion, and thus are considered alternate representations of the same type.

Within the typechecker, recursive types are represented as a graph with backwards edges between the type nodes, forming a loop. Although the theoretical type is infinitely large, only types that loop after a finite number of steps can ever be created in the language, and so their internal representations are guaranteed to be finite as well.

### Unions

Algebraic subtyping also has *subtyping*, which means you can take the union or intersection of different types. Taking the union of two finite recursive types results in another finite recursive type, though its minimal representation may be much larger than those of the original types.

As an example, consider the types 

```
type A = rec list=[`Nil | `Cons (int, [`Nil | `Cons (float, list)])];
type B = rec list=[`Nil | `Cons (int, [`Nil | `Cons (float, [`Nil | `Cons (float, list)])])];
```

Type `A` represents a linked list which contains an `int` at even numbered nodes and a `float` at odd numbered nodes. Type `B` represents a linked list which contains an `int` at every third node and a `float` otherwise. What happens if you union them together? The result is 

```
rec list=[`Nil | `Cons (int, [`Nil | `Cons (float, [`Nil | `Cons (any, [`Nil | `Cons (any, [`Nil | `Cons (any, [`Nil | `Cons (float, list)])])])])])];
```

Since the input types repeat with periods of 2 and 3 respectively, the union type repeats with a period of 6. It represents a linked list where every sixth element is an `int` and repeats in the pattern `int, float, any, any, any, float, int, float, any, any, any, float, ...`. The first entry mod six is `int` because both of the corresponding input types have `int`s at that position, and likewise, the next is `float`, and then the next three are `any` because the input types disagree and so the result could be an int *or* a float at those positions.

## II. Polymorphic types

Algebraic Subtyping itself has no support for *polymorphic* types, but these are a key part of any realistic language, so for PolySubML, I added them to the type system. 

A polymorphic function type has *type parameters*, which will be substituted with actual types on a *per call-site* basis when the function is called. 

For example, the function type `[T]. T -> T` represents a polymorphic identity function. Whenever you call it, you can substitute in a fresh type for `T`, meaning that the same function could be used as the identity function for ints (`int -> int`), strings, floats, etc.

An important goal of PolySubML was for polymorphic types to be ordinary, first-class types. This means for example, that they can freely be nested. For example, you might write the type of a curried polymorphic pair construction function as `[A]. A -> [B]. B -> (A, B)`. In this case, the outer function type returns a function type that is *itself* polymorphic (`[B]. B -> (A, B)`).

### Polymorphism and recursive types

Since polymorphic types are ordinary first-class types, they need to be usable with recursion in the same way that any other type would be.

For example, you could write a polymorphic function that returns a (recursive) linked list like this:

```
[T]. T -> rec list=[`Nil | `Cons (T, list)]
```

Likewise, you could have a linked list where the *elements* are polymorphic identity functions like this:

```
rec list=[`Nil | `Cons ([T]. T -> T, list)]
```

Note that in the first example, the definition of the type parameter (`T`) and its usage are separated by the beginning of the recursive type. In the second example, both the definition and usage are nested within the recursive type. In either case though, any writable type necessarily has a finite representation.

## III. The writable types property

The **writable types property** states that for any program which successfully typechecks using type inference, and any source code location or set of locations where a type was inferred but an explicit type could be provided, then there is *some* explicit type annotation you could add which would cause the program to still compile. Or in other words, every *inferrable* type can also be written *explicitly*.

This may sound like a trivial statement, but it is a property that most real-world languages violate. As a language designer, it's actually extremely difficult to maintain this property even when you try. Nevertheless, I think it is a very important property for languages to have and that for instance, [violations of this property are a major cause of Rust's problems]({% post_url 2024-06-04-the-inconceivable-types-of-rust-how-to-make-self-borrows-safe %}), and thus ensuring this property was a key design goal for PolySubML.

One consequence of this property is that the union (or intersection) of writable types must itself be writable. For example, if you have writable types `A` and `B`, then you can write code like `let _ = if foo then (bar: A) else (baz: B);`. The type of the if expression should be the union `A | B`, and thus this type must *also* be writable.

With that background out of the way, it's time to explain the problem I discovered with PolySubML's type system.

## IV. The problem

In the written representation of a type, you can only refer to type parameters which are in scope. This means that uses of type parameters are always "below" the point of their definition. You can't have a type parameter use connected to its definition by the "backwards" edge of a recursive type. By definition, the infinite expansion of every writable type has a finite representation, meaning there's some place where you can insert "backwards" edges to break cycles without violating this rule.

However, the same is not true for the *union* of polymorphic types. It's possible to have the definition-use chains of type parameters from the two input types continually *overlap* when merged, resulting in a type which has no possible finite representation.

For example, consider the union of the following types:

```
rec f=[T]. any -> T -> f
any -> (rec f=[T]. any -> T -> f)
```

Each of the input types has a two level cycle, where the type parameter use appears two levels below the definition. However, the levels are offset by one between the two types, meaning that when merged, the def-use segments continually overlap.

The merged type has the infinite representation

```
[T]. any -> [T as T2]. T -> [T as T3]. T2 -> [T as T4]. T3 -> ...
```

There is no possible finite representation for this type, and hence, we have an example of the union of two writable types being non-writable, a violation of the writable types property.

## V. Analysis

This might seem like a trivial problem to have. After all, the issue can only occur in contrived circumstances, and even then, the problem only results in a violation of the writable types property, which is a property that other languages don't even try to provide in the first place. 

However, the entire point of PolySubML was to explore new type checking algorithms and demonstrate a better approach to design type checkers, one that provides powerful guarantees not just in the easy cases but in every possible case. Having a type checker that merely "works in practice" defeats the purpose.

I think the root cause was abandoning the algebraic structure that gives Algebraic Subtyping its name. The core type system of Algebraic Subtyping is defined using an elegant algebraic structure that makes it easy to prove very powerful properties about the type system. However, there didn't appear to be any way to fit polymorphic types into this framework. Since any realistic language needs to have polymorphic types, I did my best to add them on top as an ad-hoc extension to the type system. And while I found a way to *mostly* make things work, it turned out to have some hidden flaws.

## VI. A path forward

The key reason for all my difficulties with PolySubML is that I wanted polymorphic types to be *structural*, to have subtyping and behave like any other type. For example, in PolySubML, `[T]. T -> T` is a *subtype* of `[T]. T -> any`, which is in turn a subtype of `never -> any`. 

Fortunately, if we abandon that goal and decide to *not have subtyping* for polymorphic types, all the problems go away. I think it should be possible to support polymorphic types within the framework of Algebraic Subtyping by modeling them as implicitly generated nominal type components. This means that there are no longer any subtyping relationships between different polymorphic types as above, but polymorphic types otherwise still work normally and all the nice algebraic properties of the type system are restored. 

## VII. Conclusion

In this post, we went through the background behind recursive and polymorphic types, and how the combination can result in a violation of the writable types property in PolySubML, as well as a possible workaround for future languages.

To be honest, I'm still a bit stunned. However, being forced to abandon design goals can also be a bit liberating. At least now I know that the reason I spent so many months working on the design of X without any progress is because the problems I was trying to solve were impossible all along. Now that I know that it's likely impossible to have full structural subtyping for polymorphic types, I can hopefully find a design for X without it, as outlined above.





