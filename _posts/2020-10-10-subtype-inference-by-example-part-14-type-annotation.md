---
layout: post
title: 'Subtype Inference by Example Part 14: Type Annotations— What are they good
  for?'
series: cubiml
series-num: 14
date: 2020-10-10 07:58 -0700
---
{% include series-util.html %}
{{series_header}}

[Last week]({{prev_url}}), we implemented conditional flow constraints (aka presence polymorphism) in cubiml. Today we'll take the language in a different direction and tackle the issue of how to allow the programmer to manually annotate types in their program. In this post, I'll cover why static type annotations are useful and how that informs their design, with the actual implementation next week. This post is a bit rant-y, so if you just want to see the code without all the background discussion, feel free to skip ahead to [the next post]({{next_url}}).

## Code generation and static types

Before we get into the question of why you actually might want to support static type annotations, I want to address one common use of type annotations which is a _bad_ idea.

Most popular statically typed languages leverage the static type system for _code generation_. Simply adding or changing type annotations changes the way your code behaves, whether it is inserting implicit conversions or implicitly choosing which functions to call and where. However, this has a number of downsides.

The biggest issue is that it makes the language much more complicated, because you can no longer decouple the static type system and the runtime semantics. In a language like Typescript, typechecking and execution are _independent_. You don't need to simulate the typechecker to determine what a given piece of code will do at runtime. However, most programming languages violate this property. For example, consider the following line of Rust. What does it do?

```rust
let cases = cases.into_iter().collect();
```

This is a trick question. In the particular context of the code where it came from, it converts a vector to a hashmap. However, this code could do nearly anything depending on how `cases` is used elsewhere in the code. In this case, the actual behavior is controlled by type declarations that are 300 lines and several layers of indirection removed from the code itself, but in larger projects, the type declarations might be in different files, or even in a separate crate.

Apart from the spooky action at a distance effect, this sort of thing is bad because it means that the details of the static type system are embedded into the runtime semantics of the language. Cubiml is a very simple language - not just because it hasn't had time to accumulate cruft, but because it was designed with care to be simple. You can fit the typing rules on one page and the runtime semantics on another page, more or less, and _you only need one of those pages for any given purpose_. 

With most programming languages by contrast, you need to know the static types of everything to determine what the code will do at runtime, which means that you can't modularize the language specification like that. The static type system is part of the runtime semantics. In especially bad (but nevertheless common) cases, even knowing the type system is not enough - you need to know the precise implementation details of the compiler to understand which types it will infer and hence what the code will do.

Unfortunately, this lack of modularity in design is nearly universal among popular statically typed languages. In fact, the only popular language I'm aware of that _doesn't_ do this (mostly) is Typescript, and in that case, the designers were _forced_ to keep static and runtime semantics separate because the runtime semantics already existed in the form of Javascript.

In addition to making the language unnecessarily complex and hard to reason about, the use of static types to determine behavior combines especially poorly with type inference. When you use static types to decide which functions to call, and those functions have different types that feed back into type inference, then you'll usually end up with a paradoxical loop and type inference no longer has well defined or predictable results. 

Many languages compound this problem by defining _default types_ that the compiler will fill in when it is unable to infer a type normally. While sometimes convenient (this is mostly done for numeric types to work around other design flaws in the language that would otherwise make numeric types unduly burdensome to use), it leads to unexpected behavior and also throws away any possibility of having predictable type inference. I've had at least one bug in Rust code that resulted from the compiler unexpectedly guessing the wrong types for an integer. 

Furthermore, default types have actually _prevented_ Rust from adding certain features, because default types mean that making the type system _more precise_ is no longer a backwards compatible change. Simply fixing the compiler to infer types _better_ is a breaking change because it means that it is no longer guessing different types where it would before, resulting in type errors for code that used to compile, or in some cases, code that silently behaves differently than before.

But enough about what not to do. Now let's look at some of the _good_ reasons why you might want to have static type annotations.

## Uses for type annotations

Obviously if you want to make a statically typed language but don't want to use type inference, then you'll need type annotations. However, type inference renders the traditional usage of type annotations obsolete. For example, cubiml has carefully been designed so that the compiler can typecheck entire programs with no annotations. You get all the benefits of traditional static type checking without the drawbacks of having to write annotations yourself. So why ruin that? There's three main reasons: increasing the number of compiler errors, improving typechecking performance and error message quality, and supporting type system features that are not inferable.

### Increasing the number of compiler errors

Typecheckers are generally designed to be _sound_, i.e. to reject programs that would result in an error condition at runtime if executed. (Languages usually include escape hatches to bypass the type system, such as Rust's `unsafe`, Typescript's `any`, or Ocaml's `Obj.magic`, but these are "use at your own risk", so we can mostly pretend they don't exist when discussing soundness of typechecking.)

However, sometimes you may want to reject programs that won't produce a language-defined error condition at runtime. Perhaps they violate an assumption of the programmer that isn't part of the default type checking and thus may go wrong at runtime in ways that don't result in type errors. 

Manual type annotations allow you to supply types which are less precise than those inferred by the compiler, and thus reject additional programs that the compiler would otherwise accept. For example, consider the following code:

```ocaml
let f = fun x ->
    {thing1=x + 32; thing2="Hello, " ^ x};
```

The function `f` takes an input and treats it as both an integer and a string within the function. There's no possible value that the function can operate correctly on, but the compiler will still accept it as long as the function is never actually called anywhere. This is _sound_, since the function won't produce a type error at runtime if it is never called, but it may not be what the programmer intended.

However, if we add a type annotation, `int -> {thing1: int; thing2: str}`, we can inform the compiler that `x` is intended to be an integer only, and thus the compiler will complain that it is being used as a string, even if the function is never called.

```ocaml
let f = (
    fun x -> 
        {thing1=x + 32; thing2="Hello, " ^ x}
    : int -> {thing1: int; thing2: str}
);
```

### Improving performance and error messages

When inferring types, the compiler has to keep track of the most precise type that is consistent with the code and typing rules, which makes type inference slow. Additionally, when there is a type error, the compiler doesn't know the programmer's intent and thus has to consider that the mistake could have been made at any point in the chain of inference leading to the type error. For example, consider the following code:

```ocaml
let addi = fun args -> args.a + args.b;

let addf = fun args -> args.a +. args.b;

let rec fib_sub = fun args ->
    if args.n <= 0 then 
        args.a
    else
        let a = addf args in
        fib_sub {n=args.n - 1; a=a; b=args.a};

let fib = fun n -> fib_sub {n=n; a=1; b=1}
```

This is a classic fibonacci number calculating function, but there's an issue. It can't seem to make up its mind whether to use floats or ints for the calculated values.
```
TypeError: Value is required to be a float here,
let addi = fun args -> args.a + args.b;

let addf = fun args -> args.a +. args.b;
                                 ^~~~~~ 

let rec fib_sub = fun args ->
But that value may be a integer originating here.
        fib_sub {n=args.n - 1; a=a; b=args.a};

let fib = fun n -> fib_sub {n=n; a=1; b=1}
                                   ^      
```                                   

But where's the actual mistake? Maybe the programmer meant for the values to be calculated as floats, and the mistake is writing `1` instead of `1.0` on the last line. Or maybe they meant them to be ints and the mistake was writing `addf` instead of `addi`. Or maybe `addf` was supposed to work on ints after all. 

The compiler has no way to read the programmer's mind, so any error message has to either be verbose enough to illustrate every possibility, or else leave out potentially important information. (Cubiml's current error messages take the later approach). Likewise, there is a long chain of inference that builds up to the error, making type inference slower.

However, the programmer can break the chain and solve these issues with a few judiciously placed manual type annotations. For example, maybe they meant the function to operate on floats:

```ocaml
let addf = fun args -> args.a +. args.b;

let fib_sub = 
    let rec fib_sub = fun args ->
        if args.n <= 0 then 
            args.a
        else
            let a = addf args in
            fib_sub {n=args.n - 1; a=a; b=args.a} in

    (* a manual type annotation for fib_sub *)
    ( fib_sub : {n: int; a: float; b: float} -> float );

let fib = fun n -> fib_sub {n=n; a=1; b=1}
```

The type annotation here leads to a simpler and more useful error message:
```
TypeError: Value is required to be a float here,

    (* a manual type annotation for fib_sub *)
    ( fib_sub : {n: int; a: float; b: float} -> float );
                                      ^~~~~             

let fib = fun n -> fib_sub {n=n; a=1; b=1}
But that value may be a integer originating here.
    ( fib_sub : {n: int; a: float; b: float} -> float );

let fib = fun n -> fib_sub {n=n; a=1; b=1}
                                        ^ 
```

Likewise, if they meant it to operate on ints, the resulting error message is more specific than before:

```
TypeError: Value is required to be a float here,
let addf = fun args -> args.a +. args.b;
                                 ^~~~~~ 

let fib_sub = 
But that value may be a integer originating here.

    (* a manual type annotation for fib_sub *)
    ( fib_sub : {n: int; a: int; b: int} -> int );
                            ^~~                   

let fib = fun n -> fib_sub {n=n; a=1; b=1}
```

Perhaps the programmer mistakenly thought that `addf` could add integers. In that case, adding a type annotation to check this assumption quickly reveals the issue.

```ocaml
let addf = fun args -> args.a +. args.b;

let rec fib_sub = fun args ->
    if args.n <= 0 then 
        args.a
    else
        (* let's make sure that addf is an int-adding function *)
        let addf = (addf : {a:int; b:int} -> int) in
        let a = addf args in
        fib_sub {n=args.n - 1; a=a; b=args.a};

let fib = fun n -> fib_sub {n=n; a=1; b=1}
```
```
TypeError: Value is required to be a float here,
let addf = fun args -> args.a +. args.b;
                                 ^~~~~~ 

let rec fib_sub = fun args ->
But that value may be a integer originating here.
    else
        (* let's make sure that addf is an int-adding function *)
        let addf = (addf : {a:int; b:int} -> int) in
                                     ^~~            
        let a = addf args in
        fib_sub {n=args.n - 1; a=a; b=args.a};
```

### Supporting non-inferable type systems

So far, we've only talked about type system features for which type inference is possible, since this is a series about type inference. However, every popular statically typed language has features that break type inference, often in many different ways. I suspect that a large part of this is just to work around the lack of subtyping in those languages (see also: [Ocaml's "relaxed value restriction"]({% post_url 2020-09-19-subtype-inference-by-example-part-11-the-value-restriction %}#the-relaxed-value-restriction)) but it is true that non-inferable type system features are occasionally useful. After all, if you want to verify Turing complete invariants in your code, you'll need a Turing complete type system to do it.

These languages typically require the programmer to provide some type annotations and then use type inference to fill in the rest. However, this isn't all that interesting to talk about from a type inference perspective. 

[As explained previously,]({% post_url 2020-09-19-subtype-inference-by-example-part-11-the-value-restriction %}#optimization), I've deliberately only focused on algorithms that minimize worst case asymptotic complexity in this series and ignored microoptimizations, even though microoptimizations are often important to real world performance. The main reason is that asymptotic complexity is an objective measure, while real world performance is subjective and highly dependent on the circumstances. 

The same problem applies to incomplete type inference. Programmers in languages like Haskell will often say that type annotations are rarely required "in practice", but there's no way to usefully judge such claims. Whether a type system is fully inferable is an _objective_ measure. Whether a language requires "few" or "many" type annotations "in practice" is subjective and highly dependent on the code that one writes "in practice".

In addition, requiring fewer type annotations in practice is not necessarily even a good thing! The real advantage of full type inference is not just the fact that it saves the programmer some keystrokes and makes refactoring easier, but the way it simplifies the conceptual model of the language. The pitch of a language like cubiml is that you don't have to worry about type theory. You can program like you would in Javascript and ignore the typechecker up until you make a mistake, with just a few minor exceptions. (Specifically, the typechecker is mostly flow and context insensitive and thus will sometimes reject valid programs where reasoning about their correctness would require flow or context sensitivity).

In partially inferred programming languages by contrast, the general experience of programming is that of adding type annotations at random until the compiler shuts up. Instead of type inference _simplifying_ the mental model of the language, it instead _complicates_ it. The programmer still has to mentally track what static type each value would have _and_ also reason about where annotations can and can't be omitted and why. If type annotations can generally be omitted without incident, that just makes the compiler errors all the more inscrutable when the programmer inevitably eventually runs into the case where they can't be. It also means that seemingly innocuous code changes will often suddenly cause other code to start or stop compiling for no apparent reason.

### Honorable mention: IDE support

There are some other uses for static type annotations that I haven't mentioned here. For example, some [IDEs](https://en.wikipedia.org/wiki/Integrated_development_environment) make use of type annotations to improve code completion, code search, offer popup documentation hints, etc. (and some IDEs use type annotations to make code completion _worse_, *grumble* *grumble*). 

However, I won't be covering this, since it is "just" a matter of UX and IDE design. The CS side is only relevant to the extent that available algorithms constrain what sort of analysis is technically feasible, but within those constraints, the actual design is a subjective and human-centric area of research. And as PyCharm demonstrates, it is easy to be too clever for your own good, with fancy analysis in the IDE leading to a _worse_ user experience than a "dumb" but well-designed IDE like Sublime Text (and even Sublime Text requires disabling the Typescript plugin in order to be usable).

## Conclusion

In light of the above, this series will focus on type annotations which cover types that the compiler could already infer on its own for the purposes of __improved performance and error messages__ and __constraining the code to produce more compiler errors__. Next week, we'll see how to add type annotations to cubiml to fulfill these goals.


{{series_footer}}
