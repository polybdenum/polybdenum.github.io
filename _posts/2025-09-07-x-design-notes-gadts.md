---
layout: post
title: 'X Design Notes: GADTs'
series: xdesign
series-num: 4
date: 2025-09-07 21:50 -0700
---
{% include series-util.html %}
{{series_header}}

In the [previous post]({{prev_url}}) about the design of X (the currently untitled successor language to [PolySubML](https://github.com/Storyyeller/polysubml-demo)), we talked about parameterized types and higher-kinded inference. This week, we're going to talk about *GADTs*.

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

However, X is more flexible due to the inclusion of subtyping. In X, instead of equality, everything is based on *subtype* relations, which means that witnesses are not symmetrical. For example, `int :> any`, a witness allowing you to convert `int` to `any` is trivial, but the opposite direction, `any :> int` is unsound and can't exist. Thus, if you want to convert in both directions between two types, you need a *pair* of witnesses.

## Implicit conversions

The other difference is that in X, you have to invoke the witnesses explicitly, whereas OCaml mostly makes it implicit. 

>*Note: As described in [part 2]({% post_url 2025-08-24-x-design-notes-nominal-types-newtypes-and-implicit-coercions %}), there are some circumstances where X allows implicit conversions, but they don't apply to this example.*

While it might be possible to support implicit conversions in simple cases like this, it is not possible to support them in more complicated cases. In particular, full support of *polymorphic* implicit conversions would make type inference undecidable. And even the simple case becomes very hairy once you start considering the full implications (specifically, what kind of *syntax* would be used in type annotations to represent the union and/or intersection of multiple types that are equivalent in some places and not others?)

X attempts to make very strong guarantees about the behavior of type inference. For example, there are only a small number of clearly defined cases where annotations are necessary (when defining a generic function or consuming an existential record) and everything else is fully inferrable, no matter how complex the code might be. Any type annotation apart from those cases can be removed, and any place where a type is inferred can also be annotated explicitly. Adding and removing type annotations doesn't change behavior and doesn't change where the code compiles (unless you add an *incorrect* type annotation). And when there is a type error, the compiler error messages help you narrow down the problem.

I think these are very desirable properties to have, but there are tradeoffs. The flip side of making guarantees like this is that features can't be supported unless they can be made to work in *all* circumstances. This is especially troublesome when trying to add features which aren't inferrable, such as `let mod` described in the first post, the implicit coercions described in the second post, or match refutations as described later on in this post. In those cases, I've broken the rules a little in the name of convenience by allowing the types to be omitted when strictly speaking, they should be required. However, this is done as little as possible in cases where there seems to be a high cost/benefit ratio, and even then, I'm still trying to settle on a design that has the least impact on X's other goals.

In the case of implicit conversions as described here however, allowing them isn't just a little tweak. Even a partial implementation would throw out X's other design goals for dubious benefit, as the code will start to break once you do more complex things anyway. 


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

In OCaml, it's normal for code transformations like this to require the addition or removal of type annotations, but it goes against the design philosophy of X. 

Therefore, in X, you have to apply the conversions explicitly. This does mean a bit of extra typing in the source code, but in exchange, you get full type inference that works consistently and compiler error messages that reliably point you to the cause of the problem. Furthermore, OCaml often requires you to add type annotations in more complex cases anyway, further reducing the benefit of trying to do the conversions implicitly.

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

Having magic "tell the compiler to figure it out itself" features like this has a tradeoff. When they work, they're more convenient, since the user doesn't have to specify as much explicitly in the source code. However, the downside is that when they *don't* work, the user is stuck.

Precisely because the user doesn't have to clearly specify their intent, there's no way to identify exactly what the mistake was in the event of a type error. When you just have a "tell the compiler to go try everything" button, the only response on failure can be a generic "well I tried everything but nothing worked". In this case, a simple `.` doesn't convey *which* witness the user expected to be impossible, let alone what type it was expected to have.

As an alternative solution to preserve the magic while still having a good error debugging story, you can allow the user to *optionally* be more explicit. That way, in the event of an error, you can ask the user to use the more specific syntax in order to clarify intent and help narrow down the cause of the mistake.

For example, the way this might work is that you start with OCaml-like syntax like this:

```ocaml
match x with
| `Foo -> 1
| `Bar -> .
```

If the compiler is able to figure out what refutation is meant automatically, then there are no problems. If not, it asks the user to clarify which field was intended to hold the refutation, so that they might write something like this:

```ocaml
match x with
| `Foo -> 1
| `Bar {t} -> .
```

When using a `.` on the right hand side of a match arm, the left hand side is required to bind at most one variable. If a single variable is bound, the compiler will only look at that value for refutation.

If it can't automatically figure out the type either, it can ask the user to again add more information by supplying the type explicitly as well:

```ocaml
match x with
| `Foo -> 1
| `Bar {t: str :> int} -> .
```

At that point, there is no longer any ambiguity.

## Omitting cases

OCaml goes even further than this. It allows (and in fact requires) you to omit the cases entirely when they are known to be impossible:

```ocaml
let f (x: int foo) =
  match x with
  | Foo -> 1
  (* No Bar case listed at all! *)
```

However, this is definitely a step too far for X. The problem is again that there's no way to determine intent. If a case is omitted, it's not clear whether that is because the user intended it to not be handled, or whether the user intended it to "virtually" be present but refuted somehow. Without knowing the user's intent, there's no way to produce useful error messages, a core tenet of X. 

Part of the problem here is that OCaml requires variants to be explicitly typed, and requires them to point to a statically known type definition, but X does not. In fact, in X, you don't even need to use explicit variant type definitions at all. You can just write out the structural types by hand and get the same effect. This means that in X, *every single pattern match* is potentially a GADT, and the compiler has no way to know whether this is the case or not. Everything relies on type inference.

Since X doesn't require explicit type definitions, *every single error message involving a pattern match* would have to be changed to point out the possibility that it might be an unhandled variant *or* it might be a case where the user intended the variant to be present but refuted (in which case they need to switch to the explicit syntax of the previous section *anyway*). This makes every single error message much more verbose, even though it will almost never actually be relevant or useful.

The flipside of not requiring explicit types like OCaml does is that everything has to rely on the *syntax* instead to determine intent. Therefore, in X, if you intend a pattern to be handled by refutation, you need to add it to the `match` explicitly with a `.` on the right hand side. 

# VII. Conclusion

Despite their scary name, GADTs are relatively simple conceptually. At the core, it's just a feature for implicitly adding type witnesses to variant values. However, it does bring a lot of design headaches along with it because OCaml has different design constraints than X does and the gap cannot always be cleanly bridged. Some of the tradeoffs I've proposed here might be controversial, but I think it's the best compromise between preserving X's strong type inference guarantees and having behavior similar to OCaml. 



{{series_footer}}







