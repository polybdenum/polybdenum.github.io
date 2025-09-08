---
layout: post
title: 'X Design Notes: GADTs'
series: xdesign
series-num: 4
date: 2025-09-07 21:50 -0700
---
{% include series-util.html %}
{{series_header}}

In the previous posts about the design of X (the currently untitled successor language to [PolySubML](https://github.com/Storyyeller/polysubml-demo)), we talked about parameterized types and higher-kinded inference. This week, we're going to talk about *GADTs*.

What are GADTs? GADT is short for "Generalized Algebraic Data Type", but that hardly makes the meaning any clearer.

# I. Ordinary algebraic data types


As the name suggests, GADTs are a generalized form of ordinary algebraic data types. But what are ordinary "algebraic data types"? That's just a fancy way of referring to *variant* types.

In OCaml, you can define a variant like this.

```ocaml
type myvariant = 
  | A 
  | B of int 
  | C of string * float
```
The type `myvariant` here has three possible variants, `A`, `B`, and `C`, which can hold different types of data. At runtime, values of `myvariant` contain a *tag*, which is used to determine which variant of the type the runtime value corresponds to.

The same example can be written in X as follows:

```ocaml
newtype myvariant = 
  | A 
  | B int 
  | C (str, float)
;
```

To create values of type `myvariant`, you can write `A`, `B 42`, etc. `A`, `B`, and `C` are known as *constructors*. In OCaml, variant constructors are their own special part of the language with their own syntax and behavior and so on. However, in X, variant constructors are just ordinary functions. 

The above syntax is a shorthand to automatically generate the functions for you in order to emulate OCaml behavior. However, you can also just write the functions yourself if you want. The above is shorthand for something like this:

```ocaml
newtype myvariant = [`A | `B int | `C (str, float)];

let A = myvariant `A 0;
let B = fun x -> myvariant `B x;
let C = fun x -> myvariant `C x;
```

Where for instance, `C` has the type `(str, float) -> myvariant`.


Variants can also be *parameterized* with type parameters, allowing them to be generic over the types of the contents they hold. In OCaml, this might look like:

```ocaml
type 'a option = None | Some of 'a
```

And in X, this same example would be written


```ocaml
newtype option[a] = | None | Some a;
```

As before, the X version is shorthand for generating constructor functions like this:

```ocaml
newtype option[a] = [`None | `Some a];

let None = option `None 0;
let Some = fun[t] (x: t): option[a=t] -> option `Some x;
```

So that's what ordinary variants look like. Now what makes a variant "generalized"?

# II. Generalized algebraic data types

In the previous examples, the return type of the generated constructor functions always had a fixed type. In particular, it is as generic as possible, with no constraints on the type parameters of the variant type (e.g. the `a` in `option[a]`). A *generalized* variant/ADT is one that lets you specify the return type explicitly so that you can add custom constraints to the type parameters.

Consider the following OCaml example:

```ocaml
type 'a myvariant = 
  | None 
  | Some of 'a
  | Int of int

let x: bool myvariant = Int 42
```

The "return type" of the `Int` constructor is still just `'a myvariant`. The fact that it stores an int is unrelated to the value of the `'a` parameter. That means that we can create a `'a myvariant` for *any* `'a`, even when using the `Int` constructor. In this example, we created one with type `bool myvariant`.

What if we wanted the `Int` constructor to instead have a return type of *only* `int myvariant` specifically?

In OCaml, you can do this by writing a `:` after the constructor name and then a function signature-like type specifying the "return type" of the constructor explicitly:

```ocaml
type 'a myvariant = 
  | None 
  | Some of 'a
  | Int: int -> int myvariant

(* No longer compiles *)
let x: bool myvariant = Int 42
```

Note that `Int of int` was changed to `Int: int -> int myvariant`. This means that the "return type" of `Int` is now `int myvariant`, causing a compile error when we try to assign it to a variable of type `bool myvariant`, exactly as desired.


Porting this syntax to X is fairly straightforward:

```ocaml
newtype myvariant[a] = 
    | None 
    | Some a 
    | Int: int -> myvariant[int]
;
```

This would result in implicitly generated constructor functions like the following:

```ocaml
newtype myvariant[a] = [`None | `Some a | `Int int];

let None = myvariant `None 0;
let Some = fun[t] (x: t): myvariant[a=t] -> myvariant `Some x;
let Int = fun (x: int): myvariant[a=int] -> myvariant `Int x;
```

However, this isn't quite right. As we'll see, there are a few details here that need to be changed. But in order to decide how to implement GADTs, we first need to understand what they're even used for.

# III. What are GADTs used for?

One thing that GADTs are used for in OCaml is existential types. In OCaml, GADTs are the easiest way to create existentially quantified types. However, X already has first-class support for existentially typed records, meaning that you don't need GADTs to emulate them. In fact, you don't even need variants at all to use existential types in X. So that use case is irrelevant.

The main and most fundamental use of GADTs however, is as *type witnesses*.

## Type witnesses

A *type witness* is a *value* whose existence is proof that a constraint between *types* held at some point in the past. This allows users to pass around information about type relationships as ordinary data, offering greater freedom than the restrictive rules of the type checker itself while still maintaining type safety.

To see how this works, here's the archetypal definition of a type witness in OCaml:

```ocaml
type (_, _) eq = Refl : ('a, 'a) eq

let _: (int, int) eq = Refl
let _: (string, string) eq = Refl
```

The variant type `('x, 'y) eq` has two type parameters and only a single constructor, `Refl`. `Refl` uses GADTs to impose a type constraint on its "return type", specifically that the two type parameters are a single type. This means that whenever you construct a value of type `eq`, it must start in the form `('a, 'a) eq` for some type `a`. 

You can construct a value of type `(int, int) eq` or `(string, string) eq`, but there's no way to construct a value of type `(int, string) eq`. Thus, the mere existence of a value of type `(a, b) eq` is proof that types `a` and `b` are actually equal, or were at some point.

This may seem useless by itself, but it becomes more useful when abstraction is used to hide type information. For example:

```ocaml
module M : sig
  type t
  val eq : (t, int) eq
end = struct
  type t = int
  let eq = Refl
end
```

This uses a module to create an *abstract* type `M.t`. The *underlying definition* of `M.t` is the type `int`, but that fact is hidden by the signature. This means that `M.t` is an opaque type that is distinct from any other type.

Since `M.t` and `int` are distinct types, attempting to use one in place of the other results in a type error:

```ocaml
let x: M.t = 5
(*
29 | let x: M.t = 5
                  ^
Error: The constant 5 has type int but an expression was expected of type M.t
*)
```

However, `M.t` was originally defined as `int`, and so *at that point*, it was known to be equal to `int`, which means that we can create a value of type `(t, int) eq`. If we then expose that value in the module, users can see there is a value of type `(M.t, int) eq`. The existence of that value proves that `M.t`'s underlying definition is equal to `int`, even though that fact is otherwise hidden by the signature.


In OCaml, you can use that proof by matching on the witness value:

```ocaml
let _ = match M.eq with Refl -> (
  let x: M.t = 5 in
  x + 1
)
```

Within the scope of the `match M.eq`, OCaml allows you to take advantage of the witness by treating `M.t` and `int` interchangeably. In this case, an `int` is implicitly converted to `M.t` and then back to `int` with no complaints from the compiler.

# IV. Type witnesses in X

Type witnesses are typically described as the most fundamental aspect of GADTs, to the point where if you have support for type witnesses, all the rest of GADTs can be built on top of that. Conveniently, X *already* supports type witnesses as a first-class concept, so that's exactly what we'll do.

In X, type witnesses take the form of *function values*, and specifically, pure identity functions. The type `a -> b` is the type of *arbitrary* functions that take `a` and return `b`. The type `a :> b` on the other hand is the type of *pure identity* functions that take `a` and return `b`. Since it is guaranteed to be a pure identity function, the existence of a value of type `a :> b` is proof that at some point, `a` was known to be a subtype of `b`.

Since type witnesses in X are also functions, you can "apply" the proof by *just calling it* like any other function.

That means that the above OCaml example could be written something like this in X:

```ocaml
let mod M: sig 
    type t; 
    val wit1: int :> t;
    val wit2: t :> int;
end = {wit1=id[]; wit2=id[]}; 

(* Convert from int to M.t by calling wit1 *)
let x: M.t = M.wit1 5;
(* Convert from M.t to int by calling wit2 *)
let _ = (M.wit2 x) + 1;
```

There are two differences to note here. The first is that witnesses in X don't have to be symmetrical.

OCaml is based around the notion of type *equality* rather than subtyping, which means that witnesses in OCaml are inherently symmetrical. That is to say, `(a, b) eq` is equivalent to `(b, a) eq`. 

However, X is much more flexible due to the inclusion of subtyping. In X, instead of equality, everything is based on *subtype* relations, which means that witnesses are not symmetrical. For example, `int :> any`, a witness allowing you to convert `int` to `any` is trivial, but the opposite direction, `any :> int` is unsound and can't exist. Thus, if you want to convert in both directions between two types, you need a *pair* of witnesses.

## Implicit conversions

The other difference is that in X, you have to invoke the witnesses explicitly, whereas OCaml mostly makes it implicit. 

>*Note: As described in [part 2]({% post_url 2025-08-24-x-design-notes-nominal-types-newtypes-and-implicit-coercions %}), there are some circumstances where X allows implicit conversions, but they don't apply to this example.*

While it would be possible to support implicit conversions like this in simple cases like this (specifically, when the types involved are monomorphic, as they are here), it is not possible to support them in more complicated cases. In particular, full support of *polymorphic* implicit conversions would make type inference undecidable. And even the simple case becomes very hairy once you start considering the full implications (specifically, what kind of *syntax* would be used in type annotations to represent the union and/or intersection of multiple types that are equivalent in some places and not others?)

X has the philosophy that if a feature is impossible to support in the general case, it shouldn't be supported at all. Users shouldn't be tricked by simple cases into thinking that something works only to get betrayed once their code becomes more complex. There need to be very simple and clear demarcations of what features are supported and what features aren't, and everything must work consistently and reliably within those lines. OCaml... has a different philosophy.

I recognize that this may be a controversial decision, but I think it is the best tradeoff. Especially when you have a language like X that is pushing the limits of type inference, it is important that the language be kept as simple and consistent as possible in order to make it easier to learn and use.


It's also worth pointing out that OCaml isn't immune from undecidability limitations. OCaml doesn't actually provide *full* support for implicit conversions either. It just handles things on a "best effort" basis and lets users gamble on whether their code will compile or not.

For example, the following example works in OCaml:

```ocaml
let f (x: M.t) : int = 
  (match M.eq with Refl -> x)
```

However, the trivial-seeming transformation of storing the intermediate result in a variable causes it to break:

```ocaml
let f2 (x: M.t) : int = 
  let y = (match M.eq with Refl -> x) in y
```

The resulting error message isn't terribly helpful either (using OCaml 5.3.0, the latest stable version as of this writing)

```
File "bin/main.ml", line 49, characters 41-42:
49 |   let y = (match M.eq with Refl -> x) in y
                                              ^
Error: The value y has type M.t but an expression was expected of type int
```

The whole point of the example is that `M.t` and `int` are *supposed* to be interchangeable, so this error message doesn't illuminate much.

The OCaml compiler doesn't try to explain why it performed or failed to perform implicit conversions in any given case, it just lets users try their luck and then scratch their heads and add seemingly-redundant type annotations until things start working again.

# V. Adding type witnesses to GADTs

With that out of the way, we can do the *proper* translation of GADTs into X, which additionally adds implicit type witnesses.

The following code in X

```ocaml
newtype MyGADT[+a] = 
    | None 
    | Some a 
    | Int: {x=int} -> MyGADT[int]
;
```
is [syntactic sugar](https://en.wikipedia.org/wiki/Syntactic_sugar) for

```ocaml
newtype MyGADT[a] = [`None | `Some a | `Int {x: int; a: int :> a}];

let None = MyGADT `None 0;
let Some = fun[t] (x: t): MyGADT[a=t] -> MyGADT `Some x;
let Int = fun {x: int}: MyGADT[a=int] -> MyGADT `Int {x; a=id[]};
```

Whenever a GADT constructor constrains a covariant type parameter `a`, it implicitly adds a member `a` with type `foo :> a` where `foo` is the actual type supplied for the parameter in the constructor definition (`int` in this case). Likewise, for a *contravariant* type parameter, it would add a member `a$` with type `a :> foo`. For an invariant parameter, it does both.

One consequence of this is that variance annotations are mandatory for type parameters constrained by GADT constructors. For normal type definitions, variance can be fully inferred from the type definition, but that is not the case for GADTs. For GADTs, the variance instead determines which type witnesses are added to the definition.

Note that in OCaml, GADT parameters are always invariant. You can mark parameters as invariant (via `+-`) in X to match that behavior, but X also allows you to use covariant or contravariant parameters as well.

The second consequence is that the body of a GADT constructor is required to be a record so that there's a place to *put* the implicitly added type witnesses. In OCaml, the witnesses just sort of magically exist off to the side somewhere and can't be seen or accessed in the syntax. In X, witnesses are ordinary values that can be manipulated using ordinary syntax, so they have to be stored somewhere inside the variant value.

# VI. Refutations and the magic dot

That mostly covers things, but there's one more feature of GADTs in OCaml that we need to discuss.

```ocaml
type _ foo = 
  | Foo : int foo
  | Bar : string foo

let f (x: int foo) =
  match x with
  | Foo -> 1
  | _ -> .
```

In this example, `x` has type `int foo`, which means that the `Bar` case is not actually reachable. The `Bar` case has an embedded type witness of `int = string`, but since `int` and `string` are distinct primitive types, such a witness value can never be constructed, meaning that the `Bar` case must be unreachable.

In this case, OCaml allows you to just write `.` on the right hand side of the match arm, rather than an actual expression to be executed. The `.` tells the compiler that the match arm is intended to be unreachable, and it should search the left hand side for an impossible witness.

This design goes against the design principles of X, specifically, that user intent must be clear so that the compiler can supply helpful error messages in the event of a mistake. In this case, a simple `.` doesn't convey *which* witness the user expected to be impossible, let alone what type it was expected to have.

As a compromise, I propose a slightly more verbose version for X:

```ocaml
match x with
| `Foo -> 1
| `Bar {t} -> .
```
When using `.`, the pattern on the left hand side must bind exactly one variable, and that variable must be an impossible witness type. This way, at least there's no ambiguity about which field the user was trying to use for refutation. 

This unfortunately still doesn't solve the type inference problem. "Is impossible" is not a type, and so the type of `t` cannot be inferred from `.`. Instead, we require that `t` have a type known immediately from its usage (which will normally be the case when using GADTs) and throw a compile error otherwise, requiring the user to supply an explicit type for `t`.

This is a pretty ugly and inelegant solution, but such are the tradeoffs when trying to emulate OCaml, which was not designed with elegant type inference in mind. There is a frequent tension between doing what is right from a theoretical perspective and doing something resembling what OCaml does.

## Omitting cases

OCaml goes even further than this. It allows (and in fact requires) you to omit the cases entirely when they are known to be impossible:

```ocaml
let f (x: int foo) =
  match x with
  | Foo -> 1
  (* No Bar case listed at all! *)
```

However, this is definitely a step too far for X. The problem is again that there's no way to determine intent. If a case is omitted, it's not clear whether that is because the user intended it to not be handled, or whether the user intended it to "virtually" be present but refuted somehow, and in the latter case, it is not clear where or how they expected the refutation to be derived.

Without knowing the user's intent, there's no way to produce useful error messages, a core tenet of X. Therefore, in X, if you intend a pattern to be handled by refutation, you need to add it to the `match` explicitly with a `.` on the right hand side. 

# VII. Conclusion

Despite their scary name, GADTs are relatively simple conceptually. At the core, it's just a feature for implicitly adding type witnesses to variant values. However, like many features in OCaml, it does bring a lot of design headaches along with it. Some of the tradeoffs I've proposed here might be controversial, but I think it's the best compromise between having a simple and elegant type system and having behavior similar OCaml. 






{{series_footer}}




