---
layout: post
title: 'Subtype Inference by Example Part 1: Introducing CubiML'
date: 2020-07-04 08:58 -0700
series: cubiml
series-num: 1
---
{% include series-util.html %}
{{series_header}}

In recent years, there has been increasing interest in tools and programming languages that can automatically detect common types of bugs, in order to improve product quality and programmer productivity. Most commonly, this is done via _static type systems_, but traditional static type systems require large amounts of manual annotation by programmers, making them difficult to work with. Therefore, modern programming languages make increasing use of _type inference_, which provides the same benefits with few or no manual type annotations required. 

The most popular form of type inference is based on the _Hindley-Milner_ system, which is limited by its lack of support for _subtyping_. In [his 2016 PhD thesis](https://www.cs.tufts.edu/~nr/cs257/archive/stephen-dolan/thesis.pdf), Stephen Dolan introduced _Algebraic Subtyping_, a new type inference system with full subtyping support. However, as an academic thesis, _Algebraic Subtyping_ is an intimidating 157 pages full of formal mathematical proofs and short on practical implementation guidance. 

As someone who has spent much of the subsequent three and a half years understanding algebraic subtyping and trying to implement it in practical programming languages, I want to share the results of my studies. In this series of blog posts, I will show you how to actually implement algebraic subtyping, or rather, an improved version I call _cubic biunification_ which is faster and easier to understand, with detailed, step-by-step code examples and zero mathematical proofs.

## What is subtype inference and why is it important?

Most current languages with type inference use some variation of the Hindley-Milner system, which is based around _unification_, the process of iteratively _equating_ types to solve constraints. Unfortunately, this results in a system which is inflexible and unintuitive, leading to many language specific hacks and extensions in an attempt to work around the resulting issues. 

With unification, values that are used together are forced to have the same type. If you pass a value to a function, it's not enough for that value to have a type _compatible_ with the function's argument type. Unification forces it to be _equal_ to the function's argument type. If you pass two different values to the same function, they are forced to have the same type. Effectively, type constraints are propagated both forwards _and backwards_ relative to the dataflow of your program, which is confusing and leads to many type errors that do not reflect real bugs in the underlying program logic. A number of workarounds have been developed to avoid this issue in specific cases, but the underlying problem persists in any HM-derived inference system.

With subtyping by contrast, type inference is based around ensuring that each value has a type _compatible_ with its usages. Constraints follow the data flow of your program but do not flow "backwards", so there are no spurious type errors just because you happened to pass two different values with different, but compatible, types in the same place. This makes type inference much more powerful and also more intuitive. 

Furthermore, I think that evaluating subtype inference in the context of existing programming languages and paradigms undersells its potential, because it facilitates new styles of programming that are largely unexplored. In particular, most programming languages are reliant on programmer supplied type annotations, which means that each feature in the type system must have corresponding syntax in type annotations and must be easy to write concisely in said syntax. In effect, the type system is limited by the need to maintain a convenient manual type syntax.

The ability to typecheck an entire program with no manual type annotations removes this constraint and means that the programming language designers are free to experiment with new and more sophisticated types of static analysis with no burden on the end user. (Hindley-Milner of course does not require manual type annotations either, but the lack of subtyping makes its use less practical). 

For example, the programming language Rust has structurally inferred traits (`Send`, `Sync`, etc.) used to statically ensure properties such as thread safety and unwind safety. By default, a new type in Rust is considered thread safe if all of its components are thread safe and so on, meaning that the safety checks operate largely automatically with only the occasional need for explicit concern from the programmer. The subtype inference system presented here is capable of implementing similar features with minimal changes to the compiler, making it easy to experiment with adding such safety checks with no changes required to the end user code base. 

### That sounds great! What's the catch?

There are a couple of obstacles I see towards fulfilling the vision outlined above:

#### Performance

Hindley-Milner style type inference runs in approximately linear O(n) time for monomorphic code. Cubic biunification by contrast has worst case cubic O(n³) time complexity, hence the name. Subtype based inference is more powerful, but that power comes at a price, as the compiler has to do a lot more work. 

This is a less serious obstacle than it might initially seem, since worst case time complexity has not even been a consideration, let alone a blocker, among popular real-world programming languages. Most mainstream languages have type systems that are undecidable, or at the very least, have exponential complexity. Even Go, a language that prides itself on fast compilation, has a number of features which impose a quadratic blowup in compilation time and at least one feature that technically requires exponential time to compile.

That being said, I think performance is important, and is something I continue to research. Common practice among mainstream programming languages seems to be to just throw things at the wall and hope it is "fast enough in practice". I think it may be possible to define a subset of the language which matches how programs are written in practice while enabling improved complexity analysis, thus narrowing the gap between "fast in practice" and "slow in theory". 

#### Modularity

In practice, large codebases are going to use manual type annotations for various reasons, even if they are theoretically unnecessary. In particular, it is likely for codebases to be broken into modules or packages with explicitly typed interfaces, thus enabling the pieces to be type-checked independently, and hence type-checked in parallel and cached. Additionally, unnecessary type annotations may be added within modules to constrain the scope of compiler type errors or to improve IDE support such as autocompletion. 

This means that the advantages of a completely type annotation free codebase are unlikely to be realized in practice. However, it does not mean that the enterprise is futile. It is still incredibly useful to have a type inference system that does not require manual annotations, because it means that the programmer is free to add annotations only when and if they desire to, rather than being compelled by the dictates of arbitrary limitations in the compiler. It's easy to add annotations to a system that does not require them but impossible to do the reverse.

## Enough about type inference, where's the tutorial?

With background and motivations out of the way, it's time for the actual tutorial. Cubic biunification is a flexible framework suitable for a wide variety of programming languages, but for the purposes of the tutorial, I'll be stepping you through the implementation of __[cubiml](https://github.com/Storyyeller/cubiml-demo)__ (Cubic Biunification Metalanguage), a simple ML-like language implemented in Rust that compiles to Javascript. Cubiml is designed to serve as a demonstration of cubic biunification, without all the petty irrelevant details that a real-world language would have. In order to keep things simple, the initial feature set of cubiml is deliberately very minimal - it doesn't even have numbers, strings, or useful compiler error messages. Once we've gone through the core algorithm, I'll show you how to add other useful features (and error messages) in subsequent posts in the series.

### Cubiml syntax

To keep things simple, cubiml uses OCaml-like syntax. OCaml syntax is popular in the programming language design community, but it differs substantially from the syntax of C-derived languages that you may be more familiar with, so I've included an overview of cubiml's syntax below. If you are already familiar with OCaml syntax, feel free to skip ahead to the [next post]({{next_url}}). 

Keep in mind that cubiml is an _example_, not a _dictate_, and you can use the same underlying algorithms to implement languages with a wide variety of syntax and feature sets.

#### Booleans and conditionals

In cubiml `if` is an expression, not a statement. The general form is `if <expr> then <expr> else <expr>` where the `<expr>`s are sub-expressions. The first expression is evaluated, and depending on whether it is true or false, one of the other two subexpressions is evaluated, and the result of the `if` expression is that expression's value. For example, evaluating `if false then "Hello" else "World"` would result in `"World"`. (The initial version of cubiml doesn't have strings or numbers - we'll be adding those later, but I'm using them here anyway for the sake of demonstration). You can think of this as similar to the ternary operator (`a ? b : c`) present in some programming languages.

#### Records and fields

Records are a grouping of zero or more named values similar to "objects" or "structs" in other programming languages and are defined via `{name1=val1; name2=val2; ...}`. You can access the value of a field using the usual `.name` syntax. For example `{a=true; b="Hello"; c={}}.b` would evaluate to `"Hello"`.

#### Functions

In cubiml, all functions are required to take exactly one argument for simplicity. They are defined by `fun <arg> -> <expr>`. For example, a function which returns its argument unchanged could be written as `fun x -> x`. Functions are called by simply suffixing an argument, i.e. writing `a b` where `a` is the function to be called and `b` is the argument. For example 

    (fun b -> if b then "Hello" else "World") true

would evaluate to `"Hello"`, while 

    (fun x -> x.foo) {bar=false; foo="Bob"}

would evaluate to `"Bob"`. 

You can work around the one-argument limitation and simulate multiple function arguments by passing in a record. For example, instead of 

```js
function sum(a, b) {
    return a + b;
}

sum(7, 8)
```

in cubiml, you could do something like

```ocaml
let sum = fun args -> args.a + args.b;

sum {a=7; b=8}
```

In a real-world language, you would likely want to integrate multiple argument support directly into the language and have the typechecker handle stuff like this behind the scenes. However, in the interests of keeping the tutorial code as simple as possible and avoiding irrelevant details, cubiml does not do this.

> __Update:__ [The version of cubiml on Github](https://github.com/Storyyeller/cubiml-demo) does have a shorthand syntax for multiple arguments so that instead of writing `fun args -> args.a + args.b`, you can just write `fun {a; b} -> a + b`. To keep things simple, this is not covered in the tutorial.

#### Let bindings

No programming language would be complete without the ability to bind values to a variable name for later reference. In cubiml, this is done slightly differently than you may be used to. The general format is `let <name> = <expr1> in <expr2>`, where the variable `<name>` is visible in the body of `<expr2>`. The entire thing is an expression which evaluates to whatever `<expr2>` evaluates to.

For example,
```ocaml
let x = 7 * 8 in {foo=x; bar=x+1}     
```
would evaluate to `{foo=56; bar=57}`.

Let bindings can be nested like any other expression. For example, 
```ocaml
let x = 3 + 4 in
    let y = x * 2 in
        {x=x; y=y}
```
would evaluate to `{x=7; y=14}`.

This provides an equivalent to traditional imperative style code like the following that you might see in other languages

```js
let x = 3 + 4;
let y = x * 2;
return {x=x, y=y};
```

Note that the above format produces an expression which can be used in any context where an expression is expected. Cubiml follows the ML philosophy that (nearly) everything is an expression, even conditionals, function definitions, variable bindings, and other things that are statements in some languages.

However, this style is inconvenient when  interactively entering code into a REPL ([Read Evaluate Print Loop](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop)), because it requires you to input the entire program at once. To handle this, cubiml allows an alternate non-expression format at the top level of your code. At the top level, you can omit the `in <expr>` part, in which case the let statement produces a global binding which is visible to all subsequent code. For example, here is a possible session of code entered into the cubiml REPL. 

```
>> let x = {}

{}

>> let y = {x=x; other=false}

{x={}; other=false}

>> let z = {other=y.other; foo={y=y; x=x}}

{other=false; foo={y={x={}; other=false}; x=...}}
```

You can also separate multiple top level definitions with semicolons if you are entering multiple items at once.

```
>> let a = z.foo.y; let b = true

true

>> if b then y else x

{x={}; other=false}
```

#### Recursive let bindings

Sometimes, one wishes to have functions that call themselves recursively. Unfortunately, this is impossible with the above constructs since plain let-expressions can only refer to variables that were already defined. 

In order to support recursion, cubiml offers _recursive let expressions_ which are defined via `let rec` and allow the definition of the variable to refer to itself. For example, you could define a recursive fibonacci function as follows:

```ocaml
let rec fib = fun x ->
    if x <= 1 then 
        1
    else
        fib(x - 1) + fib(x - 2)
```

In order to avoid code referring to variables that don't exist yet, the right hand side of `let rec` variable definitions is restricted to be a function definition. This is unnecessarily strict, but it is a simple check that is easy to implement and is good enough for now. 


#### Mutual recursion

The above syntax works for a single function that refers to itself, but in some cases, you may want to have multiple functions that each refer to each other. Unlike in the case with `let`, simply nesting `let rec`s won't work. Therefore, `let rec` allows _multiple_ variable bindings, separated by `and`. For example, you can define mutually recursive `even` and `odd` functions as follows:

```ocaml
let rec even = fun x -> if x == 0 then true else odd(x-1)
    and odd = fun x -> if x == 0 then false else even(x-1)
```

#### Case types and matching

Sometimes you need to make different decisions based on runtime data in a type safe manner. Cubiml supports this via _case types_, also known as _sum types_, _enums_, or _variants_. Not all languages have sum types, so the concept may be unfamiliar to you. Basically, the way it works is that you can wrap a value with a tag, and then later match against it. The match expression has branches that execute different code depending on the runtime value of the tag. Crucially, each match branch has access to the static type of the original wrapped value for that specific tag. You can think of it like a simpler, statically checked version of Java's visitor pattern or a giant switch statement on an union in C.

To wrap a value, prefix it with a grave (\`) character and an uppercase Tag. E.g. `` `Foo {hello="Hello"}``

You can later match on it like follows

```ocaml

let calculate_area = fun shape ->
    match shape with
          `Circle v -> v.rad *. v.rad *. 3.1415926
        | `Rectangle v -> v.length *. v.height

calculate_area `Circle {rad=6.7}
calculate_area `Rectangle {height=1.1; length=2.2}
```

Notice that within the Circle branch, the code can access the rad field, and within the Rectangle branch, it can access the length and height field. Case types and matches let you essentially "unmix" distinct data types after they are mixed together in the program flow. Without case types, this would be impossible to do in a type safe manner.

> **Note**: The initial syntax shown in this tutorial has no \| before the first match arm. However, in [part 9]({% post_url 2020-08-29-subtype-inference-by-example-part-9-nonexhaustive-matching-record-extensions-and-row-polymorphism %}#grammar-and-ast) I changed the syntax to require a \| before the first match arm to make things more convenient, and the examples on Github reflect the latter syntax.

## Conclusion

That concludes the overview of cubiml's syntax. (I told you it was simple!) In the [next post]({{next_url}}), we will begin implementing the compiler's front-end, which is responsible for parsing the input and translating syntax-specific details into calls to the type checker.

{{series_footer}}
