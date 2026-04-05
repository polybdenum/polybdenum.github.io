---
layout: post
title: '1SubML: Plan vs Reality'
date: 2026-04-04 17:08 -0700
---
Last August, I wrote [a series of posts]({% post_url 2025-08-18-x-design-notes-unifying-ocaml-modules-and-values %}) outlining my ideas and plans for my then-upcoming programming language 1SubML. Now that [I've finally released 1SubML](https://github.com/Storyyeller/1subml), I decided to look back at how my original plans compare to what I actually ended up implementing.

Overall, I was successfully able to fulfill the original vision for 1SubML, but there were lots of under-the-hood changes and lots of minor features that I ended up not doing or doing differently, as well as new features that I didn't originally plan.

This post will go through all the ways that the final version of 1SubML differs from the original plan, in the approximate order of the original posts.


## I. Spine constructors

The single biggest change was abandoning [PolySubML](https://github.com/Storyyeller/polysubml-demo)-style structural polymorphism for *spine constructors* (i.e. nominal typing).

PolySubML was my previous language, and I naturally planned to build 1SubML on top of it, as an extension of PolySubML adding features like modules and higher kinded types that didn't make it into PolySubML.

As the name suggests, PolySubML's biggest feature was the addition of polymorphic types. In PolySubML, polymorphic types use *structural subtyping*. For example, `[T]. T -> (T, T)` is a subtype of `[T]. T -> (T, any)`.

Unfortunately, once I started work on my new language, I discovered that [PolySubML is broken]({% post_url 2025-11-12-polysubml-is-broken %}). Specifically, in certain complex pathological cases, it violated the writeable types property.

Once I finally realized that fully structural polymorphic types were impossible, I was forced to switch to the next best thing, *spine constructors*. Effectively, this means that the *non-polymorphic* parts of polymorphic types are still subject to subtyping, but the *polymorphic* parts of the type have to match *exactly*. 

For example, `[T]. T -> (T, int)` is still a subtype of `[T]. T -> (T, any)`, but `[T]. T -> (T, T)` is now an incompatible type, unlike in PolySubML. You can still use the `:>` operator to *explicitly* convert between different polymorphic types that are structurally compatible, but there are no longer any *subtyping* relationships between them.

*[See here for the technical details on spine constructors](https://github.com/Storyyeller/1subml/blob/master/docs/guide_ch4.md#spine-constructors).*

While switching to spine constructors by itself might not seem like such a big deal, it had huge ramifications for the rest of the language design, because many of the originally planned features only made sense with PolySubML-style polymorphism. For example...

## II. Existential destructuring

In PolySubML, generic functions and existential records are symmetric, in the sense that there is special syntax for creating values of generic functions (function definition syntax) and special syntax for *consuming* existential record values (pattern matching syntax).

Specifically, you can include *type* fields in record patterns, which makes the pattern match against an existential record type (and then pin the type). For example:

```ml
let foo: {type t; zero: t; add: (t, t) -> t} = 
    if whatever then 
        {zero=0; add: fun (a, b) -> a + b}
    else 
        {zero=0.0; add: fun (a, b) -> a +. b}
;
```

The original plan was to have this PolySubML-style existential destructuring syntax exist side-by-side in 1SubML with a newly introduced `let mod` syntax that pins an existential type *without* also destructuring the fields.


However, since I had to throw out PolySubML-style polymorphism completely, existential destructuring is no longer a thing. In 1SubML, the only way to pin existential types is to use a `mod` binding (a slightly simplified version of the originally proposed `let mod` syntax). 

Furthermore, the switch to spine constructors meant that the only way to *create* existential record values is using the newly introduced subsumption operator `(:>)`. The subsumption operator was not part of the original plan either, because with PolySubML-style types, subsumption is baked into the *subtype relation*, and there's no need for explicit conversions like there is with spine constructors.

## III. Struct syntax

OCaml has basic record syntax (`{}`) for ordinary values and module syntax (`struct .. end`) for module values. 

As 1SubML unifies values and modules, you can just use the normal record syntax for both. The original plan though was to *also* support OCaml-style `struct` syntax, and just have it be [syntactic sugar](https://en.wikipedia.org/wiki/Syntactic_sugar) for ordinary record syntax wrapped in a block:

```ml
let M = struct 
    type t = int;
    let x = 2;
    let z = 3;
end;
// is shorthand for
let M = (
    type t = int;
    let x = 2;
    let z = 3;
    {alias t=t; x; z}
);
```

However, this ended up being another indirect casualty of the switch to spine constructors. The problem is that switching to spine constructors changes the exact point in the code where the ordinary record -> existential record coercion occurs. Specifically it happens in the new `(:>)` expression (i.e. the outer scope) rather than the scope of the original record value (the inner scope).

This in turn means that it is easy to run into confusing scoping issues with `struct` syntax, making it into a giant footgun which isn't worth the cost of including. For example, 

```ml
mod M = (struct
    type foo = int;
    wrap=foo;
    unwrap=foo$;
end :> sig 
    type t;
    val wrap: int -> t;
    val unwrap: t -> int;
end);
```

desugars into

```ml
mod M = ((
    type foo = int;
    let wrap=foo;
    let unwrap=$foo;

    {alias foo=foo; foo; foo$; wrap; unwrap}
) :> { 
    type t;
    wrap: int -> t;
    unwrap: t -> int;
} with [t=_]);
```

The problem here is that the type `foo` goes out of scope after the inner `()` that `struct` desugars to, meaning that it is no longer in scope when `t` is inferred:

```ml
mod M = ((
    type foo = int;
    let wrap=foo;
    let unwrap=$foo;

    {alias foo=foo; foo; foo$; wrap; unwrap}
    // type foo goes out of scope here
) :> { 
    type t;
    wrap: int -> t;
    unwrap: t -> int;
} 
    with [t=_] // but we need to infer foo here!
);
```

Due to the scoping issues, this code example results in a type error, even though users might expect this code to compile. 

Since `struct` syntax would be confusing and not that useful anyway, I decided to just leave it out of 1SubML entirely.

In addition to `struct` syntax, there were lots of other features originally planned (`sig` syntax, record extension, module includes, etc.) that I only originally proposed for the sake of emulating OCaml-style module syntax. With `struct` removed from the language, 1SubML wasn't going to be emulating OCaml syntax *anyway*, so there was no point in including any of that other stuff either.

## IV. Early type propagation

One issue I endlessly struggled with in the design of 1SubML was the question of how much and what kind of *early type propagation* to do.

Conceptually, 1SubML's type checker works in two phases. First, the input source code is parsed and converted into type constraints and inference variables, and then type inference solves all the constraints (or reports a type error if there is a conflict). 

In the actual implementation, both steps are intertwined, but they behave as if they are independent, a separation which is important for making it easier to reason about the correctness of the type checker. Most importantly, this means that *the compiler is not allowed to observe the results of type inference*.

1SubML is carefully designed to make as many things inferable as possible. With the exception of polymorphic type parameters (which, strictly speaking, are not actually types and hence can't be inferred), there are only a handful of cases where explicit type annotations are required.

The only times when type annotations may be required are when type constraints depend on *types*, meaning that the types have to be known *before type inference*. These are `mod` bindings, subsumption expressions `(:>)`, file exports (which are just a subsumption expression + `mod` binding under the hood), implicit coercion declarations, and newtype definitions (only if you want to use implicit coercions). Everything else is fully inferable.


### Mod type annotations

This is mostly relevant to `mod` bindings, so I'll use that as an example.

`mod` bindings can *generate new types*, which has to be done before type inference runs. Therefore, a `mod` binding has to know the type of the input value, and that type has to be known before type inference runs, so that the compiler knows which new types, if any, to generate. (And similarly for new type aliases.)

Normally, this means that an explicit type annotation is required, e.g. `mod <name>: <type> = <expr>;`. However, requiring a type annotation on *every* `mod` binding would be a huge pain, especially when the type is already obvious from the right hand side. 

This is especially important because in order to use abstract types in a module, you need to convert the record to an existential type, which requires a subsumption expression (`mod M = (r :> <type>);`). This means that the user will nearly always be specifying the type on the right hand side (in the subsumption expression) *anyway*, so it would be a huge pain to have to repeat it on the left hand side as well. To handle such cases, we need *early type propagation* to propagate type information *before* type inference.

In the final version of 1SubML, `mod` type annotations can (roughly speaking) be omitted in the following cases:

* Record literals: `mod M = {x=4; y=6};`
* Typed expressions: `mod M = (r: <type>);`
* Subsumption expressions: `mod M = (r :> <type>);`
* Variables with known types: `let r: <type> = ...; mod M = r;`

I think this strikes a good balance, allowing type annotations to be omitted in cases that are a) easy for the user to understand and b) simple to implement in the type checker. However, the original plan included much more aggressive early type propagation.


### Abandoned type propagation

In the original post, [I proposed]({% post_url 2025-08-18-x-design-notes-unifying-ocaml-modules-and-values %}#forward-type-propagation) additionally propagating types through field access expressions, function call expressions, and conditional expressions, among others.

The original motivation for this was to more closely emulate the behavior of OCaml functors. In OCaml, functors do propagate types, and this would correspond to function calls and field accesses in 1SubML.

I ended up deciding not to do this for several reasons.

First off, with appropriate code design, I think the additional annotation burden would be minimal, so there's little benefit. 

Second, this greatly increases the complexity of the type checker as there now needs to be two completely independent implementations of type checking for each of these expressions, one for type propagation and one for the normal type inference case. 

Finally, I think it would also be confusing for users. For type inference errors, the 1SubML compiler will help you find the issue, but there is no way to do this for early type propagation. If the user expects early type propagation to apply in their code but it doesn't for whatever reason, they'll just get an error with no explanation and no way to troubleshoot it or find out *why* early type propagation didn't apply. Allowing type propagation across large distances through complex expressions in the code makes this much worse.



## V. Newtypes and coercions

Unlike the original post on handling modules, [the post on newtypes]({% post_url 2025-08-24-x-design-notes-nominal-types-newtypes-and-implicit-coercions %}) made it to implementation with only minor changes, mostly cosmetic syntax changes.

First off, the original proposal used `type` for type aliases and `newtype` for newtype definitions (e.g. `newtype foo = int;`). The final version of 1SubML instead uses `alias` for type aliases and `type` for newtype definitions, as I thought this would be clearer and more intuitive.

The syntax for pure identity function types also changed, with the originally proposed `a :> b` becoming `a => b` in the final language.

The syntax for registering custom implicit coercions is completely different. The original proposal was to allow adding an `implicit` prefix to any `let` binding:

```ml
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

However, doing things this way adds a lot of complexity for no real benefit, so I eventually settled on a simpler approach, where implicit coercions are registered using dedicated `implicit{}` declaration syntax. The new `implicit` syntax is specified at the point where the custom types are introduced, either a function definition, module binding, or export declaration.

Here's the above example translated into the final 1SubML syntax:

```ml
type foo = {x: int};

mod M 
    implicit{bar: bar$ bar} // implicit coercions registered here
    = (
    {
        bar=foo; 
        bar$=foo$
    }
    :> 
    {
        type bar; 
        bar: {x: int} => bar; 
        bar$: bar => {x: int}
    }
);
```

Finally, there was also a syntax change for coercion annotations in patterns. The original proposal prefixed the pattern with the coercion value *expression*, followed by `#`:

```ml
let foo$#{x=q} = v;
```

In the final version, you prefix the pattern with the *type*, and there is no `#` separator:

```ml
let foo {x=q} = v;
```

Doing things this way greatly simplifies the internal implementation *and* simplifies the user-visible syntax as well.

The motivation for the original `#` syntax was that I also wanted to be able to add inline coercion annotations to field access expressions. For example, `v.x` could be annotated explicitly as `v.foo$#x`. However, I eventually decided that this doesn't make sense and isn't necessary. In the final version of 1SubML, there is no special syntax for annotating field access expressions like this. If you want to add an annotation, you need to use a normal typed expression, e.g. `(v: foo).x`.


## VI. Higher-kinded types and subkinding

One design aspect that I struggled with for a long time was how exactly to handle higher-kinded types, and in particular, "subkinding". As 1SubML has sub*typing*, it seemed only natural to apply the same approach to *kinds* as well, but it was hard to figure out the details.

Eventually, I decided on a much simpler approach: no subkinding. In 1SubML, every type has exactly one kind, and kinds must match exactly when comparing types. This also resulted in having to tweak a number of other aspects of the type system compared to what I originally wrote.

### Type/constructor unification

[I originally proposed]({% post_url 2025-09-01-x-design-notes-parameterized-types-and-higher-kinded-type-inference %}#viii-namespaces) having separate namespaces for types and type constructors. In fact, even when I originally started implementing 1SubML, I still had a strict separation between types and type constructors planned, and duplicated all the type checker code to handle this. However, it quickly became unwieldy, and I realized it didn't make any sense to do things this way anyway.

The issue is that "type" vs "type constructor" is not the only distinction that matters. What you really care about is compatibility, i.e. kinds. Distinguishing type constructors with different kinds is just as important. Therefore, there is no point in having separate namespaces for types and type constructors, unless you're going to have a separate namespace for every *kind* of type constructor, and this didn't exactly seem like a good idea to me.

I eventually came up with a much simpler approach. In 1SubML, type constructors are also called "types". Everything is a "type", just with different kinds. `foo` and `foo[int]` are *both* "types", and there is a single namespace for all types, regardless of kind.

## VII. Variance annotations

First off, a cosmetic change: 1SubML uses `^` for annotating invariant type parameters, rather than the originally proposed `+-`.

Second, my original posts envisioned variance annotations on newtype parameters being optional, as they are in OCaml. When no explicit variances were specified, they would just be inferred from how the parameter is used on the righthand side of the newtype definition. 

There are several reasons why I decided to make variance annotations mandatory after all. First off, I realized that it would not generally be feasible to infer variances for *recursive* newtype definitions (e.g. `type rec foo[T] = T -> foo[T];`)

Since `type rec` definitions were going to require explicit variance annotations anyway, I thought that it would be confusing to users if variance annotations were mandatory for recursive definitions but optional for non recursive definitions. Better to just always require them. This of course also saves a massive amount of complexity required for global kind/variance inference. And of course, having mandatory annotations also reduces the scope for errors to propagate when the user makes a mistake.

One final reason was the removal of subkinding. Without subkinding, there's no single "most general" choice for parameter variances. For example, if you have `type foo[T] = (T, T);`. `T` is only used covariantly, so the normal "most general choice" would be to make it covariant, i.e. `type foo[+T]`.

However, without subkinding, kinds have to match exactly, and no choice would be correct if the user expected it to have a different kind. For example, if `foo` is passed to a generic function expecting a parameter of kind `[^]` at some point, then inferring the kind `[+]` for it as above would lead to an error. There's just no natural choice for inference in the absence of subkinding.

## VIII. Parameter naming

In PolySubML (and also 1SubML), the type parameters of polymorphic function and record types are distinguished *by name*. This means that `[A]. A -> A` and `[B]. B -> B` are distinct function types (though you can convert between them with an explicit subsumption expression) while `[A; B]. (A, B) -> (B, A)` and `[B; A]. (A, B) -> (B, A)` are considered the *same* type.

Naturally, I planned to make newtype parameters work the same way. In the original plan, newtype parameters were nominal, with positional parameters just being syntactic sugar. For example, if you had `type map[K; V] = ...`, then `map[str; int]` is just shorthand for `map[K=str; V=int]`, and you could also specify parameters by name explicitly if you wanted to (e.g. `map[V=int; K=str]`). However, in the final version of 1SubML, newtype parameters are purely positional and can't be specified by name.

One advantage of specifying parameters by name rather than position is that it allows you to specify only a subset of the parameters or provide *extra* parameters that will be ignored. However, with the removal of subkinding, that is now irrelevant - the parameters always have to exactly match anyway.

The *main* reason I decided on purely positional parameters was the introduction of spine constructors. Spine constructors are implicitly generated by the compiler, and thus have no explicit names for the parameters. I considered giving the parameters implicitly generated names `_0, _1, _2, ...` like I do for tuples, but decided that there was no point. Without subkinding, there's no real benefit to named parameters, and with spine constructors, there's a real cost in confusion and complexity to having named parameters. Therefore, it was better to just switch to purely positional parameters.


## IX. Kind annotations

With a type constructor application, we need to know how to interpret the parameters. For a normal type like `foo[int; str]` where `foo` is an ordinary type constructor, we can just look at the declaration of `foo` to find its kind, and hence the variance and kind of its parameters, and then use those when parsing the parameter list (the `[int; str]` part).

However, what happens when the type constructor is a *type inference variable*? (e.g. `_[int; str]`)

In the original plan, [I proposed]({% post_url 2025-09-01-x-design-notes-parameterized-types-and-higher-kinded-type-inference %}#unknown-declarations) putting annotations on the *parameters*.

```ml
let f = fun M -> (
    let x: M.t[+-a=int] = M.make 42;
    M.get x
);
```

In this example, `M.t` was a type inference variable, so annotations on the parameter are required: `+-a=int` indicating that the `int` was for the parameter named `a` with variance `+-`.

However, in the actual implementation of 1SubML, I decided to flip it and require annotations on the *constructor*. In 1SubML, the constructor must always have a known type in a type constructor application, and you can annotate it with `as <kind>` if necessary.

For example

```ml
type pair[+A; +B] = (A, B);

let p: _ as [+;+] [str; int] = pair ("", 3);
```

Here, `_ as [+;+]` annotates the inference variable `_` with kind `[+;+]`, so the compiler knows that the parameters are both covariant with kind `[]` (i.e. ordinary types like `int` or `str`).

In addition to `_`, the special type expressions `any` and `never` can likewise produce types of any kind and thus also require kind annotations when used as a type constructor:

```ml
let p: any as [+;+] [str; int] = pair ("", 3);
```

The kind annotation and kind inference system in 1SubML is relatively simple, because I figured that realistically, users will almost never actually run into the cases where it would be necessary, and thus it doesn't need to be polished and it is better to prioritize implementation simplicity.


## X. GADTs

1SubML does support an OCaml-like shorthand syntax for generating wrapper functions for variant types. For example,

```ml
type opt[+T] = | Some T | None;
```

is just syntactic sugar for

```ml
type opt[+T] = [`Some T | `None];
let Some = fun[T]. x: T :: opt[T] -> opt `Some x;
let None: opt[never] = opt `None ();
```

In addition to the basic variant type syntax, OCaml also supports an extended variant syntax referred to as Generalized Algebraic Data Types (GADTs). In OCaml, GADTs provide access to type equality witnesses, existential types, and altered match exhaustiveness checking behavior, among other things.

My original goal was to replicate as much of OCaml-style GADTs as possible in 1SubML. 1SubML already has native support for type witnesses and existential types, so that part would just be syntactic sugar. Just like how the ordinary variant syntax is syntactic sugar for implicitly generating a bunch of wrapper functions, the GADT syntax would be the same, except with implicitly generated witness values, existential types, etc. as applicable.

In the final version of 1SubML, I did not include any GADT shorthand syntax at all. You can still emulate GADTs by [writing explicit wrapper functions](https://github.com/Storyyeller/1subml/blob/master/tests/gadt2.test), but there's no syntactic sugar for it.

One reason for this is that I realized that my original plan to mechanically generate type witnesses based on the type parameters of the GADT would not actually be useful because the functions that people actually want would normally be different from what my proposal would have generated. 

Another factor is that a major goal of 1SubML is to have high quality error messages for compiler errors during type checking. Part of how 1SubML ensures good error messages is by carefully tracking the origin of everything and pointing to exactly where in the code the relevant type originated. 

In cases where a type error involves implicitly generated code, this doesn't work as well. The error message has to point to something less clear, like the newtype definition as a whole, rather than being able to show exactly where the problematic type appeared in the source code (since it never did appear in the source code for generated code).

This isn't an absolute barrier, as 1SubML does include a number of other features (newtype definitions, mod bindings, match expressions, etc.) that are offenders here, but it's still best to keep it to a minimum where possible. More importantly, the generated code for GADTs would be very complex, so there's more potential for confusing type errors and explicitness is more important than in simpler cases.

## XI. The magic dot

As mentioned previously, in addition to type witnesses and existential types, GADTs in OCaml also change the way that match exhaustiveness checking works. This means that in some cases when using GADTs, you are allowed (and in fact required) to omit some of the variants when pattern matching. In other cases, you have to include the variant in the match, but you can just put `.` on the right hand side instead of supplying a body for the match arm.

```ocaml
type _ foo = 
  | Foo : int foo
  | Bar : string foo

let f (x: int foo) =
  match x with
  | Foo -> 1
  (* No Bar case listed at all! *)
```

However, there are numerous issues with this feature.

The first problem is that it makes error messages for `match` expressions significantly worse. Normally, if a variant value has a type with tag `Foo` and flows to a match expression that does not handle `Foo`, you can just say that in the error message. You can just say "value with tag Foo originates here, but is not handled here" or whatever.

However, with OCaml-style GADTs, that goes out the window. In the case of an unhandled match case, there is no way to know whether a) the user left it out by mistake or b) deliberately omitted it under the assumption that it is considered unreachable due to GADTs. Therefore, instead of just directly telling the user what they did wrong, the compiler has to cover both possibilities in every possible error message, even though only one will ever actually be relevant to the user.

Second, it's a bad experience for the user. If the user expects a variant to be considered unreachable but the compiler disagrees, there's no way to figure out *why*. The reachability logic is just a big black box and there's no way to understand why it didn't trigger in any particular case. Or if the compiler error messages *were* augmented to include the full reasoning of why it didn't trigger, that would turn every single match error message into a massive wall of text, which would be just as bad.

Third, it introduces **negative reasoning** into the type system. The correctness of the match expression relies on the assumption that certain types *aren't* compatible or *aren't* inhabitable. Negative reasoning like this is not *inherently* unsound (after all, OCaml does it!) but it is very *risky*. The problem is that suddenly the soundness of your type system depends on *global* assumptions about the absence of other behavior. It's very easy to accidentally add a type system feature or even just a library which violates this assumption.

Negative reasoning is also very *fragile*. Even in OCaml, wrapping your code in a module with abstract types will make the GADT-based match pruning no longer work because the compiler has no way to know what the underlying types of two abstract types are, and thus is forced to assume they may be compatible. Meanwhile, 1SubML has *subtyping*, meaning that many types which would be considered incompatible in OCaml *are* compatible in 1SubML.


In light of these issues, even the "magic dot" feature that I originally proposed for 1SubML was a *very* watered down version of what OCaml allows. However, that didn't really solve the issue. Watering it down just meant that the proposed feature offered almost no *benefit* while still incurring all the *costs*. Therefore, I decided it was best to just leave it out entirely.


## XII. Pattern matching algorithms

The algorithms [I originally proposed]({% post_url 2025-09-14-x-design-notes-pattern-matching-i %}) for pattern matching were a bit of a mess. The problem is that I was trying to come up with a *single* algorithm to do three different things - exhaustiveness checking, reachability checking, *and* code generation.

I later realized that it was possible to simplify the algorithms and make them more accurate by using different algorithms for each task. 

For example, the *order* of match arms is significant for reachability checking and for code generation, but it doesn't matter at all for exhaustiveness checking. For exhaustiveness checking, all you care about is that every possible case is handled by *at least one* match case. The order of the match arms determines which arm will be taken during execution, but that doesn't matter at all for exhaustiveness checking.

## XIII. Or patterns

I originally envisioned handling or patterns as actual patterns, similar to OCaml. Since nested patterns can lead to exponential type checking, my original proposal was to just limit or patterns to a single instance per match arm. In my research, every *example* of or patterns in OCaml that I was able to find used only a single or pattern anyway, so this is unlikely to be a problem in practice.

However, an ad hoc "one instance per match arm" restriction is arbitrary and complicated to enforce and implement, so I later devised a more elegant approach: instead of `|` being a *pattern*, I just allowed multiple match cases to *share* a match arm body.

For example:

```ml
let f = fun x -> match x with 
    | `A (x, y)
    | `B y          -> y
;
```

In OCaml, this would be interpreted as a single giant or pattern (`` `A (x, y) | `B y ``). In 1SubML however, this is interpreted as *two different match cases* (`` `A (x, y) `` and `` `B y ``) which happen to share the same *body* (the `-> y`). 

I especially like this solution because OCaml *already* uses `|` to separate match arms *anyway*. Allowing multiple match cases to share a body achieves the same effect with *less syntax* than the OCaml equivalent. 

Since `|` is not actually a pattern in 1SubML, there's no way to nest them in the first place, and it automatically means they can't be used outside of match expressions (e.g. in function argument patterns or destructuring assignment patterns). 

Another consequence is that in 1SubML, the "or"ed together patterns can each contain individual *guard expressions*, something that is impossible in OCaml:

```
let f = fun x -> match x with 
    | `A y when y == 2
    | `A   when 1 == 5
    | _                -> x
;
```

## XIV. Other patterns

1SubML does support alias patterns, e.g. the `as p` in `let (x, y) as p = (1, 2);`. However, unlike the original plan, they are only allowed after record or tuple patterns, since it was unclear what the semantics should be for variant patterns, and it seemed like record patterns are the only case where alias patterns are actually useful anyway.

The original plan was to support constant patterns as syntactic sugar for guard expressions, e.g. `(true, x)` becomes `(_0, x) when _0 == true` where `_0` is a fresh variable. However, this is a lot of complexity for no real benefit and would likely lead to user confusion, so I didn't bother trying to implement it.

Lastly, I originally planned to add a Rust-style `if let` feature, but that didn't make it in. To be honest, I just completely forgot about it.

## XV. Constructor of

Apart from the differences discussed above, there were some unplanned features that I had to add due to the switch to spine constructors.

The first was `constructor-of!()`. One of the major guarantees of 1SubML is the *writeable types property*, which requires that any inferred types can always also be written explicitly. Since there is normally no way to explicitly refer to the type constructors generated for polymorphic types, I added `constructor-of!()` as a quick hack to enable that:

```ml
alias foo = constructor-of!([T]. (T, any) -> (T, any));

let f: foo[str; str] = fun[T] x: (T, str) :: (T, str) -> x;
let f: foo[any; int] = fun[T] x: (T, _) :: (T, _) -> (x._0, 12213);
```

The second extra feature was invariant pair shorthand syntax, which will require some background explanation.

## XVI. Invariant pairs

1SubML, like PolySubML and Cubiml before it, is based on [Algebraic Subtyping](https://www.cs.tufts.edu/~nr/cs257/archive/stephen-dolan/thesis.pdf), and thus the underlying type system is *polarized*, and types are always in covariant or contravariant position, never *in*variant. To make things convenient, the *user-facing* syntax however does support invariant types, with invariant types being represented as a (covariant, contravariant) *pair* under the hood.

For example, a mutable record field `{mut x: R <- W}` has a pair of types, `R <- W`, where `R` is the type that can be read from the field and `W` is the type that can be written to the field. For convenience, there is the shorthand syntax `{mut x: int}`, which is equivalent to `{mut x: int <- int}` except without the need to write the `int` twice.

The same applies to invariant recursive types. The type `rec r=(r -> int)` is equivalent to `rec r=((r -> int) -> int)`, except without the repetition of the `-> int` part.

In PolySubML, this shorthand is pure syntactic sugar, but thanks to the introduction of spine constructors, that is no longer the case in 1SubML. With spine constructors, the polymorphic parts of a type have to match *exactly*, which means that `[T]. T -> {mut x: T}` and `[T]. T -> {mut x: T <- T}` are *distinct types*.

By itself, this isn't a problem. The issue arises from the way that newtype definitions are desugared.

### Newtypes with invariant parameters

When a newtype definition contains an *invariant* parameter (specified by `^`), that parameter actually represents a *pair* of parameters under the hood. A parameter `T` becomes the pair `T` and `T$`, where `T` is used in covariant contexts and `T$` is used in contravariant contexts.

For example, `type foo[^T] = T -> T;` is roughly equivalent to `type foo[+T;-T$] = T$ -> T;`.

Although they represent a pair of parameters under the hood, invariant parameters are still specified as a single parameter in the syntax. As with the mutable field example, you can pass either a single type (`int`) or a pair of types `(int <- int)`. For example:

```ml
type foo[^T] = T -> T;
type bar[+V; -U] = U -> V;

let a: foo[int] = foo (fun x -> x);
let b: foo[int <- int] = foo (fun x -> x);
let c: foo[str <- bool] = foo (fun (x: bool) -> "Hello");

// bar has two parameters, so types are passed separately:
let d: bar[str; bool] = bar (fun (x: bool) -> "Hello");
```

Newtype definitions also implicitly generate functions to create and unwrap the new type:

```ml
type foo[^T] = T -> T;

// Wrap function has type [T; T$]. (T -> T$) => foo[T$ <- T] 
let _: [T; T$]. (T -> T$) => foo[T$ <- T] = foo;

// Unwrap function has type [T; T$]. foo[T <- T$] => (T$ -> T)
let _: [T; T$]. foo[T <- T$] => (T$ -> T) = foo$;
```

### Slash pair syntax

Now comes the problem. What are the types for the functions generated by a newtype definition like `type [^T] = {mut x: T};`?

The source level `T` parameter is replaced by the underlying covariant `T` parameter when used in covariant contexts, and `T$` in contravariant contexts. The problem is that here, those occur in the same location! If the newtype were instead defined as `{mut x: T <- T}`, there would be no problem, because one half would be replaced by `T` and the other half by `T$`. But with the shorthand syntax, this is impossible.

Therefore, 1SubML supports a special slash pair syntax `A/B` in polymorphic function types. `A/B` represents the type `A` when used covariantly and the type `B` when used contravariantly. This syntax essentially only exists so that the functions generated by newtype definitions can have writable types, but users can also use it on their own if they want to for some reason.

With the slash pair syntax, it is now possible to write the above function types:

```ml
type foo[^T] = {mut x: T};

// Wrap function has type [T; T$]. {mut x: T/T$} => foo[T$ <- T]
let _: [T; T$]. {mut x: T/T$} => foo[T$ <- T] = foo;

// Unwrap function has type [T; T$]. foo[T <- T$] => {mut x: T/T$}
let _: [T; T$]. foo[T <- T$] => {mut x: T/T$} = foo$;
```

Incidentally, this was another problem that caused many issues during development. Even after implementing the initial version of it, I wasn't happy and completely redesigned and rewrote it. **Twice**. 

It's amazing how much trouble and complexity can be caused by an obscure feature that is never even actually meant to be used and just exists to fill a gap in the type system. (To be fair, the same was true of the type union/intersection feature in PolySubML as well.)

## Conclusion

Even after spending weeks writing the original plans for 1SubML, there were a number of unresolved issues, and many more changes required by issues I ran into during development. On the one hand, it's an illustration of "no plan survives contact with the enemy", but on the other hand, the final version of 1SubML is still *basically* the same as the original vision, and I managed to fulfill all the original goals I had for the language. 

Anyway, I hope this post proved informative. Usually you only get to see the finished product and don't know anything about how things changed during development or *why* they ended up the way they did.

