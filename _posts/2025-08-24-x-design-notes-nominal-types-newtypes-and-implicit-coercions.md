---
layout: post
title: 'X Design Notes: Nominal Types, Newtypes, and Implicit Coercions'
series: xdesign
series-num: 2
date: 2025-08-24 23:38 -0700
---
{% include series-util.html %}
{{series_header}}

Earlier this year, I released [PolySubML](https://github.com/Storyyeller/polysubml-demo), a proof of concept ML-like language combining for the first time structural subtyping, first class higher rank types, [high quality error messages]({% post_url 2025-02-14-designing-type-inference-for-high-quality-type-errors %}), and worst-case polynomial time type inference, among other features. My next language (which I'll call X here, since I haven't chosen a name yet), has the ambitious goal of extending PolySubML to support as many of OCaml's features as possible. 

In this series of posts, I'll be explaining the planned design of X and the considerations behind its design decisions. [Last time]({{prev_url}}), we covered modules. This time, we'll cover the subject of **nominal types**. As a toy language, PolySubML got away with having only structural types, but for realistic programming, nominal types are also necessary.

# I. A review of OCaml

Before we get into the design of X, let's quickly review how OCaml works so we know which functionality we're trying to emulate. If you're already familiar with OCaml, feel free to skip this section.

Type definitions in OCaml have many possible options, so I'll only cover the most common three forms. 

First off, you can have a type definition with no righthand side at all:

```ocaml
type t
```

This represents an opaque type and is typically used in module signatures for abstraction. This is analogous to the use of existential type parameters for this purpose in PolySubML and X. See [the previous post]({{prev_url}}) for a more in-depth explanation.


Second, you can define a *type alias*:

```ocaml
type foo = int 
```

This form does not define a new type at all. Rather, it creates a new way to refer to an *existing* type. In this case, `foo` can now be used to refer to the type `int`. Since `foo` is just a new name for an existing type, the two are completely interchangeable:


```ocaml
let x: foo = 42
let f: int = x
```

Lastly, you can have a *nominal type* definition. This can be either a record or variant type. Nominal record type definitions look like this:

```ocaml
type myrecord = {
  id: int;
  name: string;
}

(* Create a record *)
let r: myrecord = { id = 1; name = "Alice" }
(* Access a record field *)
let x = r.id + 10
```

And nominal variant type definitions look like this:


```ocaml
type myvariant = 
  | A 
  | B of int 
  | C of string * float

(* Call variant constructors *)
let foo: myvariant = B 42
let bar: myvariant = C ("example", 3.14)

(* Match on a variant *)
let _ = match foo with
  | A -> print_endline "Variant A"
  | B n -> Printf.printf "Variant B with value: %d\n" n
  | C (s, f) -> Printf.printf "Variant C with values: %s and %f\n" s f
```

In these examples, `myrecord` and `myvariant` are *new* types which are distinct from all other types, but they aren't completely opaque either. 


## Newtype wrappers

Oftentimes, you want to create a new nominal type that has the same underlying representation as an existing type, but is considered a distinct type in the type system. This lets you enforce invariants and protect against bugs, particularly when passing multiple parameters with the same type to a function. For example, if you have a function that just takes `(string, string, string)`, it's easy to accidentally pass the parameters in the wrong order, leading to subtle bugs. If it instead took say, `(RepoName, BranchName, FileName)` where those are all distinct types wrapping `string`, mixing up the parameter order would lead to a compile-time type error.

OCaml doesn't have direct support for newtype wrappers, but you can accomplish the same thing by defining a one-variant or one-field nominal type with the `[@@unboxed]` attribute. For example, here's how you might define a newtype wrapper of `int` named `foo` in OCaml:

```ocaml
type foo = Foo of int [@@unboxed]

(* Create a value *)
let x = Foo 42
(* Unwrap a value *)
let Foo y = x
(* y is the contained int *)
let _ = y + 34
```

With this method, you can wrap values using function syntax (`Foo 42`), but unwrapping is a lot harder. The only way to *unwrap* a value is by pattern matching on it (`let Foo y = ...`).

For comparison, let's look at how Rust handles newtype wrappers:

```rs
#[repr(transparent)]
struct Foo(u32);

fn main() {
    // Create a value
    let x = Foo(42);
    // Unwrap a value by pattern matching
    let Foo(y) = x;
    // Unwrap a value by accessing the field
    let z = x.0;
}
```

In Rust, the idiomatic form of newtype wrappers is using `struct`, which allows you to unwrap values with simple field syntax (`x.0`) in addition to pattern matching. 

In OCaml, you can do something similar by using records rather than variants to define newtype wrappers:

```ocaml
type foo = {foo: int} [@@unboxed]

(* Create a value *)
let x: foo = {foo=42}
(* Unwrap a value *)
let y = x.foo
```

This lets you unwrap values using field syntax (`x.foo`). However, you can no longer use function syntax to wrap values and have to instead use the awkward `let x: foo = {foo=42}` syntax instead. 

> Note: the `: foo` part can be omitted if the field name `foo` is unique among record type definitions in the current scope.*


You *can* create newtype wrappers in OCaml that use function syntax for both wrapping and unwrapping by using a custom module instead of an ordinary type definition, but doing so is very verbose and repetitive:


```ocaml
module M : sig 
  type foo 
  val foo : int -> foo 
  val unpack_foo : foo -> int
end = struct 
  type foo = int 
  let foo x = x 
  let unpack_foo x = x
end
open M

(* Create a value *)
let x = foo 42
(* Unwrap a value *)
let y = unpack_foo x
(* y is the contained int *)
let _ = y + 34
```

# II. Newtype syntax in X

OCaml uses `type` both for aliasing existing types and creating new types, which can be pretty confusing. Worse though is that the syntax would be *ambiguous* if copied into X unchanged, due to the fact that X has structural record types.

Consider `type foo = {x: int};`. What should this mean in X? It could be declaring an *alias* to the existing structural record type `{x: int}`, or it could be declaring a *new* *nominal* type as it would in OCaml. 

Therefore, in X, `type` is always used for creating type *aliases* and `newtype` is always used for creating *new* types. `type foo = {x: int};` declares an alias while `newtype foo = {x: int};` declares a new type.


Speaking of which, X also has direct shorthand syntax for creating newtype wrappers. For example, `newtype foo = int;` creates a newtype wrapper named `foo` that wraps the underlying type `int`. Unlike in OCaml, where ordinary type definitions only directly support nominal record and variant types, in X you can declare newtypes wrapping *arbitrary* types such as `int`.

## Constructor and destructor functions

As for how to construct and destruct values of nominal types, X just uses function syntax for both, simplifying the language and allowing maximum flexibility.


```ocaml
newtype foo = int;

(* Create a value *)
let x = foo 42;
(* Unwrap a value *)
let y: int = foo$ x;
```

The way this works is that each `newtype` declaration actually creates *three* items, a new type and two new *values*. In addition to adding the type to the current scope, it also adds a constructor and destructor function to the current scope. The generated constructor function has the same name as the type while the destructor function has that name suffixed by "$".

Therefore the example has something like the following signature under the hood:


```ocaml
newtype foo = int;
// Generates items with the following signature:
type foo;
val foo: int -> foo;
val foo$: foo -> int;
```

This is similar to the manual module example in OCaml in the previous section, except that $s are not valid in identifiers in OCaml, so you have to pick a different name for the destructor function (`unpack_foo` in the previous example). Also, the OCaml module example requires *ten lines* of code with tons of repetition, whereas X's `newtype` feature is just one simple line of code.

Note that `foo$` here is an *identifier*, not special syntax. The generated identifier ends in `$` to reduce risk of accidental shadowing, but it is an ordinary value binding like any other. For instance, you could write `let abc = foo$;` and then use `abc` instead.

## Variant constructors

OCaml's type definition syntax supports records and variants. The record case is covered "for free" as a special case of X's general newtype feature. `newtype foo = {x: int};` is just a special case of `newtype foo = <type>;` where the type on the right-hand side happens to be the structural record type `{x: int}`.

However, OCaml's variant type syntax has different behavior. It adds constructor functions per variant rather than one for the type as a whole. We can just copy this into X (except using `newtype` instead of `type`).

Here's the `myvariant` example from the first section, translated into X:

```ocaml
newtype myvariant = 
  | A 
  | B int 
  | C (str, float)
;

// Generates items with the following signature:
type myvariant;
val A: myvariant;
val B: int -> myvariant;
val C: (str, float) -> myvariant;
val myvariant$: myvariant -> [`A any | `B int | `C (str, float)];
```

There's still a single destructor function named `myvariant$`, but we now have per-variant constructors `A`, `B`, and `C`. 


## First class constructor functions

The constructor and destructor functions that X generates are ordinary function values that can be manipulated like any other value, greatly simplifying the language.

By contrast, constructors (and record fields) are *not* first-class subjects in OCaml. OCaml variant constructors may *use* function call syntax, but they are not actually functions. For example, you can't bind them to values and pass them around, the way you could for ordinary functions:

```ocaml
type myvariant = 
  | A 
  | B of int 

(* works *)
let x = B 42

(* doesn't work *)
let b = B
let y = b 42

```

As a consequence, OCaml has a lot of extra language surface area and special cases to deal with constructors and record fields. 

For example, OCaml has a feature called private types, which allows you to export types in a *one-sided* manner: users can *destruct* values of the type to inspect their contents, but they can't *construct* values of that type without going through the wrappers provided by the defining module (which allows for invariants to be enforced during construction).

This is necessary because in OCaml, the only way to inspect the contents of a variant value is to pattern match on it, and pattern matching requires access to a variant's constructors, but access to the constructors would ordinarily allow the user to also *construct* values using those constructors.


Here's an example of private types from the OCaml manual, showing how to use it to enforce an invariant on the `B` variant:


```ocaml
module M : sig
  type t = private A | B of int
  val a : t
  val b : int -> t
end = struct
  type t = A | B of int
  let a = A
  let b n = assert (n > 0); B n
end
```

To achieve the same functionality in X, you can just *not export* the constructor functions! No special "private type" functionality is needed at all. Here's the same example converted to X:

```ocaml
let mod M: sig 
    type t;
    val t$: t -> [`A any | `B int];
    (* A and B are not exported *)

    val a: t;
    val b: int -> t;
end = struct 
    newtype t = | A | B int;
    let a = A;
    let b = fun n -> (
        assert n > 0;
        B n 
    );
end;
```

By using ordinary function values to create and destruct values of nominal types, X saves a huge amount on the language complexity budget. However, we're going to spend *part* of those savings on one more feature to make nominal types more convenient to work with: implicit coercions.

# III. Subtyping and coercions

The use of functions for wrapping and unwrapping values is simple and flexible, but it's not always convenient.

Consider the following example:

```ocaml
newtype user = {first_name: str; last_name: str};

let get_name = fun u -> (
    (user$ u).first_name ++ " " ++ (user$ u).last_name
);
```

It's inconvenient to have to write `(user$ u).first_name` just to access a field of the wrapped value. It would be much nicer if we could just write `u.first_name` instead like in a traditional language.

## Subtyping

One approach you might consider is to make `user` a *subtype* of `{first_name: str; last_name: str}`. You could do this by defining `user` as an *alias* of the structural record type `{first_name: str; last_name: str; _some_secret_field_name_whose_presence_indicates_that_this_record_is_a_user: any}`. 

This way (assuming appropriate visibility rules), users of the type can inspect values as if they were structural values (i.e. read `first_name` and `last_name`) without any explicit unwrapping calls. However, users couldn't *create* values of this type without access to the secret field name, and code that wants to be sure it's getting a "real" `user` value can just look for the presence of the `_some_secret_field_name_whose_presence_indicates_that_this_record_is_a_user` field.

This approach is something you *could* do, but it has serious downsides. It provides the *type safety* benefits of nominal types (i.e. there's no way to forge values without access to the secret field name) but it doesn't provide *abbreviation*. In addition to type safety, users want to use nominal types so that they have short names to refer to their types, rather than writing out the full structure each time the type is mentioned. This approach would require users to write out `{first_name: str; last_name: str; _some_secret_field_name_whose_presence_indicates_that_this_record_is_a_user: any}` every single time rather than `user`, which is obviously a non-starter.

In this particular case, the "abbreviation" part could be solved via a type alias, but that is an incomplete solution. When *parameterized* or *recursive* types are involved, type aliases make type checking exponentially slow or *undecidable* respectively, and any approach to nominal types that doesn't allow parameterization or recursion is a non-starter.

Therefore, we need a solution that *doesn't* involve subtyping, but still behaves almost *like* the subtyping version.

## Implicit coercions

A general trick to support features that would normally break type checking is to replace true *subtyping* relations with *implicit coercions*. PolySubML already used this trick in order to support type inference with higher rank types, as [higher rank types are well known to make type inference undecidable](https://www.sciencedirect.com/science/article/pii/S0168007298000475). PolySubML worked around this by making instantiation of generic types an *implicit coercion* instead of a *subtyping relation*.

The difference between the two is that *subtyping* means that one type is substitutable for another in *any and all* circumstances. This means that the substitution can happen an arbitrary number of times *recursively* during type checking. A *coercion* on the other hand is only applied in specific circumstances based on the *syntax* of the programming language, meaning the substitution can happen at most a fixed number of times and thus cannot break typechecking.

> Note: This distinction between coercions and true subtyping is my own personal terminology. Other authors may use these terms differently or use other terms to refer to the same mechanisms.

Since subtyping is not an option, we need to add implicit coercions for record field access.

# IV. Implicit coercion rules

The original goal was to be able to write `u.first_name` instead of `(user$ u).first_name`. To solve this, we can "just" declare that field access expressions are a point in the syntax where implicit coercions can occur and that if you write `u.first_name` and the typechecker sees that `u` is not a record type, it will automatically search for and apply the appropriate coercion, as if you had written `(user$ u).first_name` all along.

This brief description elides a number of critical details however.

## Pure identity function types

First off, *implicit coercions need to be pure identity functions*. It would be very bad if the `user$` function secretly had side effects because then side effects would be happening for a function call *that isn't even present in the source code*, which would be a nightmare to debug. And in any case, the issue is forced because the X compiler *doesn't generate any code* for implicit coercions. They exist purely during typechecking and have no impact on the runtime code. 

Therefore, we need a way to track whether functions in X are pure identity functions (and thus eligible as coercions) or not. The existing function type `foo -> bar` is the type of *arbitrary* functions from `foo` to `bar`. Values of type `foo -> bar` can have arbitrary side effects and may just loop forever or throw an exception rather than actually returning a value of type `bar`.

To this end, we introduce a new type, `foo :> bar`, the type of *coercion functions* from `foo` to `bar`. Values of type `foo :> bar` are guaranteed to be pure identity functions and can thus safely be "executed" implicitly during typechecking. `foo :> bar` is a *subtype* of `foo -> bar` (i.e. pure identity functions are also just functions) but the reverse is not true.

> Note: I chose `:>` for this syntax because it matches OCaml coercion syntax. I originally considered `=>` instead.

For simplicity, it is impossible for users to create values of type `foo :> bar` themselves. The only values of this type are the functions implicitly generated by `newtype` declarations. Since `user$` was generated by `newtype user = ...`, the compiler *knows* it is a pure identity function.

Even if the user defines their own identity function (e.g. `fun x -> x`), it will be considered to have a regular function type (e.g. `int -> int` rather than `int :> int`). It may be possible to lift this restriction in the future, but for now, it doesn't seem to me to be worth the cost. Checking user function definitions for purity and termination would introduce a *lot* of complexity for dubious benefit.

## Coercion resolution

Second comes the question, *how does the typechecker find and choose which coercions to apply?*. Coercion selection is done based on the type of the "left hand side", i.e. the `u` in `u.first_name`. The compiler checks the list of eligible coercion functions for the one with the appropriate source type (`user :> _`) and chooses that one.

This means that we need a way for the user to specify eligible coercion functions. Whenever a user writes `newtype foo = ...`, the `foo$` destructor function is automatically marked as an eligible coercion if it has an appropriate type. However, users also need to be able to explicitly add coercions, since passing types around through modules and functions would otherwise lose the coercions.


This is done with the `let implicit` syntax modifying a `let` binding, like so:

```ocaml
newtype foo = {x: int};
(* foo$ implicitly marked as a coercion for foo *)

(* Create a module wrapping foo as a new type named bar *)
let mod M: sig 
    type bar;
    val bar: _ -> bar;
    val bar$: bar -> _;
end = {bar=foo; bar$=foo$};

(* There are no coercions for M.bar, but we can add one like this *)
let implicit bar$ = M.bar$;
(* Any binding in a pattern can be marked implicit. It could have also been done like this: *)
let {implicit bar$} = M;
```

When a binding is marked as `implicit`, it must have a type known from [forward propagation]({% post_url 2025-08-18-x-design-notes-unifying-ocaml-modules-and-values %}#forward-type-propagation). Additionally, the left hand side of that type must be a nominal type and the right hand side must be a record or variant type.

That just leaves the question of what to do if there are *multiple* coercions available for a given type (which can only happen if the user manually adds extra bindings). In this case, my current plan is to just use the most recent (innermost) one, but I'm not entirely settled on this.

## Monomorphism

Additionally, in order to keep the type system simple and easy to understand, we impose the restriction that *at most one* coercion can be applied at any given site, and that single coercion must be used for *all* values of that expression.

This means that the following code results in a type error:

```ocaml
newtype foo = {x: int};
newtype bar = {x: int};

let v = if whatever then 
    foo {x=32}
else 
    bar {x=99}
;

(* type error! *)
v.x;
```

This is because there isn't a single coercion that can apply at `v.x`, as the type of `v` could be `foo` *or* `bar`. If it is converted to `(foo$ v).x`, that will work for the `foo` case but break for the `bar` case. Likewise, if it were `(bar$ v).x`, that would work for the `bar` case but not the `foo` case. Therefore `v.x` results in a type error.

This also applies to the *absence* of a coercion, i.e. if the left hand side *already* had the correct type. This example also results in a type error for similar reasons:

```ocaml
newtype foo = {x: int};

let v = if whatever then 
    foo {x=32}
else 
    {x=99}
;

(* type error! *)
v.x;
```

On one branch, `v` has type `foo` and thus needs `foo$` to be applied. On the other branch, `v` already has type `{x: int}` and thus *can't* have `foo$` applied. Therefore, this is a type error.

# V. Explicit coercion annotations

[An important design principle of X]({% post_url 2025-02-14-designing-type-inference-for-high-quality-type-errors %}#rule-4-allow-the-user-to-write-explicit-type-annotations) is that anything which can be inferred can also optionally be written explicitly by the user if they so desire. Since field access coercions are inferred, we also need a way for the user to write them explicitly.

To do this they can use the syntax `u.user$#first_name`, which is roughly equivalent to `(user$ u).first_name` except that the first one specifies `user$` as the coercion (meaning it must be an eligible coercion function) while `(user$ u).first_name` allows `user$` to be an arbitrary function. Furthermore, when an explicit coercion is provided using this syntax, no implicit coercions will be performed.

This is not syntax that users are ordinarily expected to write, since coercions are fully inferrable. Rather, it is included because it may be useful to help narrow down type errors while debugging.

For example, in this code, `v.x` is a type error, but the compiler doesn't know whether the user intended `v` to have type `foo` or type `bar` (or even something else for that matter), so the resulting compiler error message has to mention both possibilities.

```ocaml
newtype foo = {x: int};
newtype bar = {x: int};

let v = if whatever then 
    foo {x=32}
else 
    bar {x=99}
;

(* type error! *)
v.x;
```

The user can narrow down the cause of the error by specifying the coercion explicitly. If they change `v.x` to `v.foo$#x`, that would tell the compiler that `v` is intended to have type `foo`, allowing the error message to immediately point to the `bar {x=99}` part as the mistake.

As a reminder, `$` is not part of the *syntax* here. `foo$` is just a variable name. Writing `let abc = foo$; v.abc#x;` would have the exact same effect. However, it is recommended that users keep the `$` at the end of the name to make the code clearer.

Finally, users can also explicitly annotate the *absence* of a coercion by writing `v.#x`. This will prevent implicit coercions and result in a type error if `v` is anything other than a structural record type.

Each field access expression in the source code is a point where a different coercion could be applied. In an expression like `a.b.c`, either or both of the field accesses could apply coercions, and you could write them out explicitly like `a.foo$#b.bar$#c`.


## Pattern matching coercions

This handles ordinary field access syntax, but for consistency, we need implicit coercions in pattern matching as well.

First off is *record destructuring* assignment. Instead of `let q = v.x;` one could write `let {x=q} = v;`, so we need coercions to be handled similarly:


```ocaml
newtype foo = {x: int};
let v = foo {x=542};

(* Record pattern with implicit coercion *)
let {x=q} = v;

(* Record pattern with explicit coercion *)
let foo$#{x=q} = v;

(* Record pattern with explicit *lack* of coercion *)
let #{x=q} = v; (* type error: v is foo, expected a record *)
```

Second, we also need implicit coercions in *variant* pattern matches, so that it is easier to work with nominal variant types as well:

```ocaml
newtype foo = [`A int];
let v = foo `A 321;

(* Variant pattern with implicit coercion *)
let `A q = v;

(* Variant pattern with explicit coercion *)
let foo$#`A q = v;

(* Variant pattern with explicit lack of coercion *)
let #`A q = v;
```

I'm planning to cover variant pattern matching in more depth in a later post when I get to complex pattern matching and GADTs.

# VI. Conclusion

In this post, we saw how to add OCaml-style nominal record and variant types, as well as a general purpose newtype mechanism. Nominal types might seem like a relatively small and simple feature, but they can be surprisingly tricky. In this post, we saw that there are several new features required: `newtype`, `:>` types, `implicit` bindings, and explicit coercion annotations.

However, there's more. In this post, we only looked at *simple* type declarations, but we also want to support *parameterized* and *recursive* types, which bring a much more difficult set of problems that we'll look at next time.



{{series_footer}}



