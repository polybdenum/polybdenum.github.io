---
layout: post
title: 'X Design Notes: Parameterized Types and Higher Kinded Type Inference'
series: xdesign
series-num: 3
date: 2025-09-01 21:53 -0700
---
{% include series-util.html %}
{{series_header}}

In the previous posts about the design of X (the currently untitled successor language to [PolySubML](https://github.com/Storyyeller/polysubml-demo)) all of the examples for modules and nominal types used only simple types. However, we also need to support *parameterized types*, where a type can be *generic* over other *type parameters* (for example, a list type that is parameterized by the type of its elements). This may sound like a simple thing, but it's actually a very difficult subject, particularly once type inference is involved.

# I. What are parameterized types?

Suppose we want to define a type `IntList` representing an immutable singly-linked list of integers.

In OCaml, you might define it like this:

```ml
type intlist = Nil | Cons of int * intlist
```

And in X, you could write the same thing like this:

```ml
newtype rec IntList = Nil | Cons (int, IntList);
```

If you want a list that holds strings instead, you could just copy the definition and replace int with string:

```ml
type strlist = Nil | Cons of string * strlist
```

And so on for any other type of list you might want to define. However, this is very repetitive because you have to copy paste the definition every time. Furthermore, it makes it impossible to write code that works with *any* type of list regardless of what type of elements it contains.

Therefore, users need to be able to define a single *parameterized* `List` which is *generic* over the elements it contains. In OCaml, you would do it like this:

```ml
type 'a list = Nil | Cons of 'a * 'a list
```

And likewise in X syntax:

```ml
newtype rec List[T] = Nil | Cons (T, List[T]);
```

By specifying any type for the type parameter `T`, this can be turned into a specific list type that holds a specific element type. For example `List[int]` is equivalent to the original `IntList`, `List[str]` is equivalent to the original `StrList`, etc. 

This also means that you can write generic functions which operate on any type of list. For example, here's a `map` function which calls a specified callback function `f` on every element of the input list and returns a new list containing the results:


```ml
let rec map = fun[A; B] {input: List[A]; f: A -> B}: List[B] -> 
    match input with
    | `Nil -> Nil
    | `Cons (head, rest) -> Cons (f head, map {input=rest; f})
;
```

Note that in the above example, `List` itself is not a type. It's more like a *function* from types to types. Given any input type (e.g. `int`), `List[int]` represents a type. But `List` itself is a *type constructor* rather than a type. Likewise, `T` is a `type parameter`. It is a placeholder where types can be substituted, but is not itself a type.


# II. The inference problem

The previous section might make this feature seem trivial, but there are a lot of thorny questions involved once you scratch below the surface. For example, *How does this interact with existential types and type inference?*

In OCaml, you can create abstract types via the module system. By applying a signature, you can hide the underlying implementation of a type, resulting in a *new* type that is distinct from all others:

```ml
module M: sig 
  type intholder 
  val make: int -> intholder
  val get: intholder -> int
end = struct
  type intholder = int
  let make x = x
  let get x = x
end

let h: M.intholder = M.make 42
let i: int = M.get h
```

This example creates the new type `M.intholder` which wraps an `int`. However the use of abstraction means that `M.intholder` is a distinct type, and there is no way to access its contents other than through the provided `M.make` and `M.get` functions.

You can do the same thing in X:

```ml
let mod M: sig
  type intholder; 
  val make: int -> intholder;
  val get: intholder -> int;
end = struct
  let make = fun x -> x;
  let get = fun x -> x;
end;

let h: M.intholder = M.make 42;
let i: int = M.get h;
```

The main difference is that OCaml requires you to explicitly specify `type intholder = int` inside the `struct`, while X doesn't. You can still specify it in X if you want to, but this is purely optional because existential type parameters are *fully inferrable* in X.


Now what happens when parameterized types are added to the mix? Suppose that instead of having a simple `M.intholder` type that wraps an `int`, you wanted to make this example generic with a `'t M.holder` type constructor that can wrap any type.

In OCaml, you'd do that like this:

```ml
module M: sig 
  type +'a holder 
  val make: 'a -> 'a holder
  val get: 'a holder -> 'a
end = struct
  type 'a holder = 'a
  let make x = x
  let get x = x
end

let h: int M.holder = M.make 42
let i: int = M.get h
let h2: string M.holder = M.make "hello"
let k: string = M.get h2
```

Now comes the problem. Within the `struct`, `holder` is a *parameterized type alias* (the `type 'a holder = 'a`) part. In this case, `'a holder` is defined as an alias for `'a`. The problem is that parameterized type aliases **aren't inferrable**.

To see why this is, imagine you had type variables `_a` and `_b` and a *parameterized type* variable `_parameterized` which takes two parameters. Now imagine that you're trying to infer the values of these variables based on the constraint

```
_parameterized[_a; _b] = ((int, int, int), str);
```

The most "obvious" solution to this equation is `_parameterized[X; Y] = ((X, X, X), Y)`, `_a = int`, `_b = str`. However, that isn't the *only* possible solution. Another possible solution is `_parameterized[X; Y] = ((Y, Y, Y), X)`, `_a = str`, `_b = int`. 

But you can have even weirder solutions than that. For example, another solution is `_parameterized[X; Y] = ((int, X, Y), str)`, `_a = int`, `_b = int`. You could even have a solution like `_parameterized[X; Y] = ((int, int, int), str)`, `_a = float`, `_b = bool -> bool`, where the type parameters aren't even used at all.

With ordinary type inference, there is no ambiguity, because any type variable has to match the *entire* left hand (or right hand) side. E.g. if `_t` is a type variable, then the only solution to `_t = (int, int)` is if... `_t = (int, int)`. However, with an unknown *parameterized* type, there are too many degrees of freedom. You don't know *which part* of the type each *parameter* is supposed to match, and which parts the "scaffolding" of the parameterized type is supposed to match.

# III. The no-inference approach

If type inference is impossible, why not just give up and say that you have to write out the types (like you have to do in OCaml anyway)?

You could then translate the previous example to X like this:

```ml
let mod M: sig
  type holder[+a]; 
  val make: [a]. a -> holder[a];
  val get: [a]. holder[a] -> a;
end = struct
  type holder[a] = a; (* this line is now required *)
  let make = fun[a] (x: a): a -> x;
  let get = make;
end;

let h: M.holder[int] = M.make 42;
let i: int = M.get h;
let h2: M.holder[str] = M.make "hello";
let k: str = M.get h2;
```

This approach has the advantage of being similar to what OCaml already does, and it was the approach I planned to take in the early weeks when I first started planning X. However, it has serious problems.

One problem is that [parameterized type aliases can make compilation exponentially slow]({% post_url 2025-02-28-the-problem-with-type-aliases %}#parameterized-aliases-and-the-compile-speed-problem) or even undecidable (if recursive aliases are allowed). That means that you'd have to put restrictions on them, and I can't think of any natural restrictions that would solve the problem while also being easy to understand and not impacting developers much in ordinary code.

A second problem though is that generic type parameters *need* to be inferrable in order to make functor-like use cases easy and convenient.

# IV. Functors

In OCaml, *functors* are a special kind of function which operate on modules rather than ordinary values (as modules are not values in OCaml, [unlike in X]({% post_url 2025-08-18-x-design-notes-unifying-ocaml-modules-and-values %})).

For example, you can define a functor like this:

```ml
module F (M : sig 
  type t
  val make: t
  val double: t -> t * t
end): (sig 
  val x: (M.t * M.t)
end) = struct
  let x = M.double M.make
end
```

and then "call" it like this:

```ml
module M = F (struct 
  type t = int
  let make = 21
  let double x = (x + 3, x * 9)
end)
```

The functor syntax is quite verbose, but what this boils down to is effectively a function `F` that takes in two parameters, a value `make` and a function `double`, and then calls `double` on `make` and returns the result. 

In fact, here's an example in OCaml that does the exact same thing, using ordinary functions rather than functors:

```ml
(* Generic function version - same functionality without modules *)
let generic_double_operation ~make ~double = double make

let result_int = generic_double_operation ~make:21 ~double:(fun x -> (x + 3, x * 9))
```

The argument to `F` is a module `M` which contains a type `M.t`. `F` is *implicitly* generic over the type `M.t`. OCaml treats the `M.t` in the return type signature of `F` as the same type that was passed in as part of the argument.

X doesn't allow this sort of implicit polymorphism since it is completely redundant with *normal* polymorphism thanks to the fact that modules are just ordinary values in X. The way to express the same code in X is to use an ordinary polymorphic function. Here's a version equivalent to the original OCaml functor example, using the same names for clarity:

```ml
let F = fun[t] {make: t; double: t -> (t, t)}: {x: (t, t)} -> 
    {x=double make}
;

let M = F {make=21; double=fun x->(x + 3, x * 9)};
```

## Higher-kinded polymorphism

Now what happens when a functor takes in a module that contains a *parameterized* type?

Here's an example where the functor `F` takes in a function `make`, calls it on `42` and `"hello"`, and returns the results:

```ml
module F (M : sig 
  type +'a t
  val make: 'a -> 'a t
end): (sig 
  val a: int M.t
  val b: string M.t
end) = struct
  let a = M.make 42
  let b = M.make "hello"
end

(* "Calling" the functor *)
module M = F (struct 
  type 'a t = 'a
  let make x = x
end)
```

Unlike in the previous section, `F` isn't polymorphic over a *type* `t`. It is polymorphic over the *parameterized type* `'a t`.

This time, there is no way to rewrite this as an ordinary function in OCaml because OCaml functions can't be polymorphic over parameterized types. However, X does allow this (at least using the previously discussed "no-inference" approach):


```ml
let F = fun[t[+a]] {make: [a]. a -> t[a]}: {a: t[int]; b: t[str]} -> 
    {a=make 42; b=make "hello"}
;

let M = F {make=fun[a] a->a};
```

However, this doesn't quite work. *Ordinary* generic type parameters are fully inferrable, but as we saw in section II, parameterized types are *not* inferrable. Therefore, the parameterized type parameter `t` has to be specified explicitly, so the call would have to be written like this, with the extra `[t[a]=a]` part that explicitly provides the value of the `t` parameter for `F`:

```ml
let M = F[t[a]=a] {make=fun[a] a->a};
```

This isn't the end of the world, strictly speaking, but it is ugly and confusing, especially piled on top of all the existing problems with parameterized type aliases. It would be much nicer if we had a solution where everything is always fully inferrable, even when code is polymorphic over parameterized types.

# V. Type constructor inference

Fortunately, I eventually realized that there *is* a way to restore full type inference. The trick is to restrict the inference variables to *type constructors* rather than arbitrary parameterized type aliases. 

To see why, consider the previous example about the impossibility of type inference. Suppose we're trying to solve for the variables `_parameterized`, `_a`, and `_b` with the constraint

```
_parameterized[_a; _b] = Map[(int, str); bool -> int];
```

where `Map` is a type constructor. As seen previously, this is impossible to solve because there are multiple possible solutions. For example, you could have `_parameterized[X; Y] = Map[X; Y]`, `_a=(int, str)`, `_b=bool -> int`, but another possible solution is `_parameterized[X; Y] = Map[(Y, str); bool -> Y]`, `_a=float`, `_b=int`.

Now suppose we instead have

```
_tycon[_a; _b] = Map[(int, str); bool -> int];
```

where `_tycon` is a variable that is constrained to only range over type constructors. Suddenly, there is only one possible solution: `_tycon=Map`, `_a=(int, str)`, `_b=bool -> int`. 

In fact, we can already know that `_tycon=Map` as soon as we see `_tycon[_; _] = Map[_; _]` without even looking at anything else. Unlike arbitrary parameterized type aliases, which can make arbitrarily large and complex parts of the type, a variable that only ranges over type constructors can only match the top most level of the type and thus we don't have to look at anything else.

Likewise, we can already know that `_a=(int, str)` just from seeing `_[_a; _] = _[(int, str); _]` without looking at anything else. This is because unlike arbitrary type aliases, type constructors have a fixed structure. They can't "move around" their parameters to unexpected places, so you can match the parameters without even knowing what the top level looks like.

This means that not only is the equation solveable, but all three variables are solveable *independently*, which is necessary to give the type checker various desirable properties.

I think this is the most important insight I've had during the planning of X, and this is the approach I plan to actually implement.

## Example

Let's look at an example of how this actually works. 

Recall the previous example from the abandoned "arbitrary type aliases but no inference" approach. Thanks to the lack of inference, the `t` parameter of `F` has to be specified explicitly:

```ml
let F = fun[t[+a]] {make: [a]. a -> t[a]}: {a: t[int]; b: t[str]} -> 
    {a=make 42; b=make "hello"}
;

let M = F[t[a]=a] {make=fun[a] a->a};
```

In the new approach, we no longer have to specify it at all. `t` is automatically inferred to be `Holder`:

```ml
let F = fun[t[+a]] {make: [a]. a -> t[a]}: {a: t[int]; b: t[str]} -> 
    {a=make 42; b=make "hello"}
;

newtype Holder[a] = a;
let M = F {make=Holder};
```

Note the use of the `newtype` declaration. Under the new approach, generic variables can only match *existing* type constructors. Therefore, `newtype` is the only way to create type constructors out of nothing. You can also create type constructors via the usual abstraction process, but then the underlying implementation also has to be a type constructor, so at some point down the line, a `newtype` must be involved somewhere.

# VI. Variance, positional args, and desugaring

The *variance* of a type parameter controls how subtyping relationships among the parameters affect subtyping of the type as a whole. 

For example, suppose you have an *immutable* list type `List[T]`. Should `List[int]` be a subtype of `List[any]`? Clearly it should, because `List[int]` is more specific than `List[any]`. `List[any]` is a list that can hold any kind of value, while `List[int]` can only hold ints, but since `int` is a subtype of `any`, this is still valid.

Therefore, we have `List[U] <= List[V]` whenever `U <= V` where `<=` means "is a subtype of". To put it another way, `List[U] <= List[V]` *implies* `U <= V`. We call this a *covariant* parameter.


Now consider the type `Foo[A; B] = A -> B`. In this case, `Foo` is still covariant in the `B` parameter similar to above. Whenever `b1 <= b2`, we also have `Foo[a; b1] <= Foo[a; b2]`.

However, for the `A` parameter, this is reversed. Whenever `a1 <= a2`, we have `Foo[a2; b] <= Foo[a1; b]`. This is called a *contravariant* parameter.

Finally, you can have no subtyping relationships at all, which is called an *invariant* parameter. The most common example of invariance is when mutability is involved. An *immutable* list is covariant in its element type, but a *mutable* list is invariant in its element type.

Variance is per-parameter. For example, if you have `Foo[A; B; C; D] = {x=A; mut y=B; z=C->D}`, then `Foo` is covariant in `A` and `D`, contravariant in `C`, and invariant in `B`.


## Variance annotations

For a `newtype` declaration (e.g. `newtype Foo[A; B; C; D] = {x=A; mut y=B; z=C->D};`), the compiler can automatically infer the variance of each parameter based on the definition on the right hand side. However, when declaring a *variable* that ranges over unknown type constructors, there's no way for the compiler to know the variance of the parameters, so the user has to specify them explicitly.

As in OCaml, you can mark parameters as covariant with `+` and contravariant with `-`. For some reason, OCaml has no way to explicitly mark parameters as *invariant*, so we'll just use `+-` for that purpose.

Therefore, to declare a variable that could match the above `Foo`, you might write
```ml
type Var[+A; +-B; -C; +D];
```

Although variance can be automatically inferred for `newtype` declarations, the user can also specify them explicitly if they want to, e.g.

```ml
newtype Foo[+A; +-B; -C; +D] = {x=A; mut y=B; z=C->D};
```

# VII. Desugaring and type constructor variables

When you write a type constructor *invocation* like `Foo[int; str]`, that's not what is used in the underlying type system. In the underlying type system, type constructors have a fixed set of (named) covariant and contravariant type parameters. The source level annotations go through several steps of [desugaring](https://en.wikipedia.org/wiki/Syntactic_sugar) to reach this format. The first step is the removal of *positional arguments*.


Unlike OCaml, in X, type parameters are always named and can be specified by name. For example, if you have the declaration `newtype Foo[a; b] = ...`, then the type annotations `Foo[a=int; b=str]` and `Foo[b=str; a=int]` are both equivalent. 

As a convenience, X also allows the type parameters to be specified *positionally*, i.e. without explicit parameter names. In this case, they match parameters based on the order they were declared. E.g. `Foo[int; str]` is equivalent to `Foo[a=int; b=str]`. If the declaration were instead `newtype Foo[b; a] = ...`, then `Foo[int; str]` would be equivalent to `Foo[b=int; a=str]`. 


The second step is the addition of variance. Each type constructor *declaration* has fixed variance for each parameter (either inferred or explicitly specified by the user). At the invocation site, variance is added based on the declaration if not explicitly specified. *Unused* type parameters are just removed entirely.

For example, if you have a declaration `newtype Foo[a; b] = (a, b, a -> b);`, then `Foo` will have the inferred variance `Foo[+-a; +b]`. If you invoke it like `Foo[int; str; x=float]`, this is first converted to `Foo[a=int; b=str; x=float]` and then to `Foo[+-a=int; +b=str]`. 

The final step is fixing "invariant" parameters. In [Algebraic Subtyping](https://www.cs.tufts.edu/~nr/cs257/archive/stephen-dolan/thesis.pdf), the basis of X's type system, invariant parameters are modeled as a *pair* of parameters, one covariant and one contravariant.

Therefore, `Foo[+-a=int]` gets converted to `Foo[+a=int; -a=int]` under the hood. Unlike the previous two steps, there is no way for the user to desugar this explicitly. However, you *can* specify the two halves of the pair independently if you want, using the same syntax as for mutable record fields: `Foo[+-a=any <- int]` gets converted into `Foo[+a=any; -a=int]`. 

## Unknown declarations

The above steps assume that the type constructor has a known declaration, which will *usually* be the case. However, X also allows for inference of module-like values, including type constructor alias members. This means that code like the following is allowed:

```ml
let f = fun M -> (
    let x: M.t[+-a=int] = M.make 42;
    M.get x
);
```

Even though the type of `M` is unknown, this is still allowed thanks to type inference. However, this means that `M.t` doesn't refer to a known type constructor declaration, but rather just an inference variable. Therefore, the first two steps of desugaring mentioned previously can't be done.

When invoking a type constructor *inference variable* rather than a type constructor with a known declaration, there is no way for the typechecker to add in the parameter names and variance. Therefore, the user must specify them explicitly (e.g. `M.t[+-a=int]` in the example above).

# VIII. Namespaces

One last minor detail worth pointing out is that *type* alias members and *type constructor* alias members are kept in separate *namespaces*, so you can have a type constructor with the same name as a type and they won't shadow each other. This is required to ensure principal type inference in certain complicated cases (e.g. the union of two polymorphic functions where one has a regular type parameter and one has a type constructor parameter with the same name).

A consequence of the separate namespaces is that code like the following is valid:

```ml
newtype Foo[] = str;

let M = {
    type t[..] = Foo[..];
    type t = int;
    t = true
};

// M.t[] checks type constructor namespace (M.t[] is Foo[])
let x: M.t[] = Foo "Hello"; 

// M.t checks type namespace (M.t is int)
let y: M.t = 52;

// M.t in an expression checks value namespace (M.t == true)
let z = if M.t then "Hi" else "Bye";
```

This means that to refer to a type constructor, you always need `[]` after it, even if there are no parameters. You can declare type constructor aliases via `type Foo[..] = Bar[..];`, to distinguish them from regular type aliases (`type Foo = Bar;`). As a convenience, a `newtype` declaration with no type parameters will be added to both the type *and* type constructor namespaces. 

It's unfortunate that things have to be this way, but from a technical perspective, it seems like the cleanest solution.


# IX. Conclusion

Parameterized types may seem like a simple feature, but they're surprisingly difficult if you want fast compilation and type inference and all the other nice guarantees that X offers. In fact, along with the "forward type propagation" mentioned in [the first post]({% post_url 2025-08-18-x-design-notes-unifying-ocaml-modules-and-values %}#forward-type-propagation), this was one of the most difficult design decisions in X. The solution I came up with still has some downsides, but it seems like the best tradeoff available. 

While I wasn't able to cover every detail, I hope this post helps people understand how to implement advanced type system features like full inference for (a very limited subset of) higher kinded types. 

In the next posts, we'll cover some remaining features of OCaml, namely complex pattern matching and GADTs.


{{series_footer}}



