---
layout: post
title: Designing type inference for high quality type errors
date: 2025-02-14 11:05 -0800
---

Type inference has a reputation for causing unhelpful error messages from the compiler when there is a type error. For example, here's a typical comment:

> [I started a project at work with flowjs, got inscrutable type errors in a different file than wherever the root cause was and bailed for typescript.](https://news.ycombinator.com/item?id=39876998)

However, things don't have to be this way. Type inference's bad reputation is due to design decisions in existing languages that sacrifice good error messages in exchange for other goals. There is nothing inherent to type inference that prevents you from offering good error messages.

I recently released [PolySubML](https://github.com/Storyyeller/polysubml-demo), a programming language combining global type inference with subtyping and advanced polymorphism, and supporting good type error messages was a constant consideration during development. In this post, I will explain how I designed PolySubML's error messages and why I think existing languages tend to fall short in this respect.

But first, a few disclaimers:

First off, this post is solely concerned with error messages for **type errors**. Dealing with *syntax errors*, particularly parser errors, is a completely different topic that is outside the scope of this post.

Second, the focus here is helping the user to **understand why their code won't compile** and identify the cause of the error. In some cases, compilers will also attempt to guess what the user meant and suggest a fix, but this is inherently heuristic-based and subjective, and outside the scope of this post.

Lastly, PolySubML is an experimental hobby programming language that has never been used at large scale. It is a **proof of concept** and *demonstration* of my ideas, but it is a very different sort of beast than widespread battle-tested languages. Since PolySubML is a one-person hobby project, the focus is on the *underlying algorithms* and design aspects, rather than aspects like polish which are a function of time and people (the Rust compiler in particular has had almost infinite polish applied over the years, thanks to its incredibly large and dedicated community.)

With that out of the way, let's get on to the pitfalls that often make compiler error messages suck:

# Rule 1: Never guess or backtrack

Generally speaking, users think their code is correct when submitting it to the compiler. Sometimes, people will speculatively compile to try to identify bugs or places that need to be updated during a refactor, but even then, the user merely thinks that there might be bugs *somewhere* in the abstract. They won't be convinced of the presence of bugs unless the compiler provides specific evidence explaining where and why there is a bug. (Or rather, a violation of the language's typing rules which *often* but not necessarily indicates a bug.)

**The job of a compiler error message is to prove to the user that their code is invalid** according to the language's rules, ideally in a way that helps the user identify where they went wrong and how the problem can be corrected.

Abstractly, the process of type checking can be modeled as deriving *a set of facts* about the code, with specific rules for deriving new facts based on previous facts, with the rules determined by the language. For example, you might have reasoning along the lines of "`4` has type int" and "if `4` has type int, then after `let x = 4`, `x` also has type int" and "in `x.foo`, `x` is required to be a record", and "if an expression of type int is used as a record, the program is invalid".

The general form of the rules is "if A and B and C, then D", where the typechecker continually derives facts from the right hand side of rules once the left hand side is satisfied. Eventually it either derives a contradiction and reports a type error, or it doesn't and the code compiles successfully. This leads to proofs that are relatively short and easy to understand - once a contradiction is reached, you can easily work backwards and show the user a sequence explaining exactly why their code is invalid, step by step. (Realistically, you probably don't want to show the user *every* step for reasons of verbosity, but the point is that you *could* if necessary. More on this in section 3.)

However, this all goes wrong if your language includes rules of the form "if A and B and C, then D **or E**". Suddenly, instead of proceeding monotonically from start to finish, the compiler has to *guess* how to proceed. This means that the compiler has to try *every possibility* in order to discover a type error. For example, if you know A, B, and C, that lets you conclude "D or E", but "D or E" doesn't help at all by itself. If say, D turns out to lead to a contradiction, you can't immediately report an error like before - instead you have to backtrack and see if E leads to a contradiction *too*.

## Ad-hoc overloading

The above description is very abstract, so let's look at a more concrete example - specifically *ad hoc overloading*. In some languages, you might have multiple different functions with the same name and different type signatures, and the compiler needs to try each one in turn and can only report a type error if *every single possible choice* results in an error.

For example, in Java, you might have something like

```java
void foo(A x) {}
void foo(B x) {}
void foo(C x) {}

//...
foo(v);
```

Where `A`, `B`, and `C` are distinct types. In order to type check `foo(v)`, the compiler has to try all three possible `foo` functions to see if *any* of them typecheck. If `v` has type `C`, then it will first try `A`, find a type error, backtrack and try `B`, find a type error, backtrack *again* and try `C`, and finally find a valid match. If `v` instead had some *other* type, say `D`, then the typechecker would have to try all three functions before it could prove there is a type error.

So why is this so bad? Having to guess and backtrack will make typechecking very slow, but it *also* makes compiler error messages terrible.

Without guessing, error messages are simple and easy because there is a direct chain of reasoning leading to a contradiction. However, when the typechecker has to make guesses like with the overloading example, that all goes out the window.

In order to prove to the user that `foo(v)` has a type error, the compiler has to prove that `v` does not have type `A` (with some chain of reasoning) *and* prove that `v` does not have type `B` (with another chain of reasoning) *and* also prove that `v` does not have type `C`. Suddenly, the proof of an error is three times as long. But worse yet, *this is completely useless to the user*.

The *user* doesn't care about *every* possibility. The user intended to call *some specific* function `foo`, not every possible function. Perhaps they *intended* for `v` to have type `B` and made a mistake. (Or perhaps `v` having type `D` is correct but they mistakenly thought that there is a version of `foo` which takes `D` as argument.)

If the user intended `v` to have type `B`, then what they care about is the proof that `v` does *not* have type `B` (so they can figure out what the mistake was and correct it). They don't care at all that the compiler also checked the hypothetical possibilities of `A` and `C` and found that those don't work either, since they never intended for that to be the case in the first place!

**If you force the typechecker to make guesses, it will guess things the user didn't intend, and the resulting error messages will be bloated and irrelevant to the user.**

## Going exponential

From the previous example, you might agree that overloading is bad, but not *that* bad. After all, checking the type of the argument should be trivial in this case since the types involved are so simple (assuming no inheritance or anything at least). However this was the simplest possible case, for the sake of example. Overloading gets worse. *Much* worse.

For example, usually languages do not force users to annotate a type on *literally every expression in the program*. Which means that oftentimes the type of something is temporarily unknown and has to be inferred. Instead of just checking the known type of `v` against `A`, `B`, and `C` and immediately detecting a contradiction, you might have to go through a whole chain of inference to rule out each case.

Even worse than that, functions often have multiple arguments, and so guessing which overload to use *also* influences what types every *other* argument to the function is expected to take as well. That means that the guess cascades, and for each guess of the first argument, you have to independent check the other arguments, which may in turn involve yet more guesses and backtracking. Likewise, checking the type of the argument may be non trivial when the type is generic, and so checking a guess for the top level type requires recursion to check the type parameters, which in turn involve more guesses.

This means that such guessing will often blow up *exponentially*. For every top level guess, you have to try every possibility at the second level decision point, and for each of *those*, you have to try every possibility at the third level decision point, etc.

This is not just a theoretical issue. In Swift, [even very basic expressions cause exponential blowup in typechecking](https://www.cocoawithlove.com/blog/2016/07/12/type-checker-issues.html). Something as simple as `let g: Double = -(1 + 2) + -(3 + 4) + 5` takes *20 seconds* to typecheck in Swift 3.1. The problem isn't just limited to Swift either. Swift has (or had) an especially cursed design where even *integer literals* cause exponential blowup, but the same problem can occur in any language with ad-hoc overloading. For example, [here's someone running into exponential typechecking in Java](https://stackoverflow.com/questions/30707387/troubleshoot-slow-compilation).

Even worse is C++, where its template system runs on the principle of ["substitution failure is not an error"](https://en.wikipedia.org/wiki/Substitution_failure_is_not_an_error), which roughly means "try every possibility and only report an error if every single combination of choices leads to a failure". This means that usage of templates often results in a) exponential increases in compilation time and b) exponentially large compile error messages. Even worse, abuse of this "feature" became *standard practice* in the C++ community (referred to as "template metaprogramming"). C++ is legendary for being slow to compile and having *massive* completely incomprehensible error messages, and this is a major reason why.

Therefore, the first and most important step to ensure good error messages is to **design your type system so the typechecker never has to guess or backtrack**.

# Rule 2: Don't jump to conclusions

The first rule merely afflicts *most* real-world programming languages. Now it's time to get *really* controversial with something that nearly every language gets wrong.

Consider the following Ocaml code:


```ocaml
let _ = [1; ""]
```

Compiling this results in an error message:


```
File "bin/main.ml", line 1, characters 12-14:
1 | let _ = [1; ""]
                ^^
Error: This expression has type string but an expression was expected of type
        int
```

This error message tells us that `""` has type `string`, which is good, but it also claims that it was expected to have type `int` for no apparent reason, which is less good. There is nothing inherent about lists in Ocaml that requires them to be ints. Something like `[""; ""]` would compile just fine. The *actual* cause of the conflict is something that Ocaml didn't highlight at all - the `1` *next* to the highlighted portion.

Now in this case, the example is small enough that the user could probably deduce the actual cause of the mismatch just by looking at the code *near* the point of the error. However, as the code becomes bigger and more complex, that quickly becomes impossible. For example, consider the following:

```ocaml
type 'a ref = {mutable v: 'a}
let v = {v=`None}

(* Fake identity function which secretly stores the value in shared mutable state *)
let f = fun x -> (
    match v.v with
    | `None -> let _ = v.v <- `Some x in x
    | `Some old -> let _ = v.v <- `Some x in old
)

(* assume lots of code in between here *)
(* blah blah blah *)

let _ = 1 + f 1

(* assume lots of code in between here *)
(* blah blah blah *)

let _ = 5.3 -. f 2.1
```

This produces the following, rather unhelpful error message:

```
File "bin/main.ml", line 19, characters 17-20:
19 | let _ = 5.3 -. f 2.1
                      ^^^
Error: This expression has type float but an expression was expected of type
        int
```

That's it, the entire compiler output. Again, we can see that the highlighted expression is a `float`, but there's absolutely no indication of *why* Ocaml expected it to be an `int` instead.

Unlike the previous example, looking at the surrounding code won't make it any clearer either. Even looking at the definition of the `f` function being called nearby doesn't help as `f` doesn't have an explicit type signature. The actual cause of the mismatch is a different *call* to `f` in a different part of the code, with no indication of how to find it.


The fundamental problem here is that when Ocaml requires two types to be equal, it doesn't actually keep track of the types that it expected to be equal. It just blindly **assumes that whichever type it happens to see first is the gospel truth** and proceeds under that assumption. Doing it this way does make typechecking slightly faster (due to having to track less data), presumably the reason that the Ocaml compiler is implemented this way. However, the result is completely unhelpful error messages.

If the user writes `[1; ""]`, then maybe they intended it to be a list of ints and the `""` is incorrect. But it could *also* be the case that they intended to have a list of strings and the `1` is the incorrect part. (Or possibly, the user was just not aware that Ocaml forbids having both ints and strings in the same list and will be left confused either way as long as the error message doesn't explain this restriction.)

So what would a better error message look like? Let's look at how PolySubML handles the same example. The code isn't quite directly comparable because PolySubML doesn't force type equality like this in the first place, but in this particular example, the end result is still the same, so it still offers a useful comparison.

Here's the same code from before, translated to PolySubML:


```ocaml
let v = {mut v=`None 0};

(* Fake identity function which secretly stores the value in shared mutable state *)
let f = fun x -> (
    match v.v <- `Some x with
    | `None _ -> x
    | `Some old -> old
);

(* assume lots of code in between here *)
(* blah blah blah *)

let _ = 1 + f 1;

(* assume lots of code in between here *)
(* blah blah blah *)

let _ = 5.3 -. f 2.1;
```

And here's what the PolySubML compiler outputs:

```
TypeError: Value is required to have type float here:
(* blah blah blah *)
let _ = 5.3 -. f 2.1;
            ^~~~~~~~  
However, that value may have type int originating here:
(* blah blah blah *)
let _ = 1 + f 1;
              ^  
(* assume lots of code in between here *)
Hint: To narrow down the cause of the type mismatch, consider adding an explicit type annotation here:
    match v.v <- `Some x with
    | `None _ -> x
    | `Some (old: _) -> old
            +   ++++     
);
```

Notice how PolySubML shows both sides of the conflict, where a value of type `int` originates and then flows to a place where type `float` is required. Not only that, but the error message also suggests a place to add a manual type annotation to help narrow down the cause of the mistake. This brings us to the next rule, a technique I came up with for PolySubML which as far as I know has not been done before.

# Rule 3: Ask the user to clarify intent

In my previous language, [CubiML](https://blog.polybdenum.com/2020/07/04/subtype-inference-by-example-part-1-introducing-cubiml.html), type error messages show where a) a value originates with a certain type and then b) flows to a use where it is required to have an incompatible type. For simple cases, this is already enough for the user to understand the problem. However, thanks to type inference, there might be an arbitrarily long and complex path from a) to b) which the user won't understand. For example, in the previous section, the int flows into a function call, through a mutable field, a match expression, and then back out of the function to a different call of the same function.

As described in the previous sections, there is a chain of inference starting from the provided source code and the language's rules which lead to a contradiction. However, the compiler doesn't know *which part* of that chain contains the problem. The user's mistake could be at any point in that chain.

One approach would be to show the user the entire chain of reasoning leading to the contradiction. That would certainly ensure that the part with the true mistake is also shown. However, long error messages are useless because the user won't be able to actually hunt through the lengthy output to find the one part that's actually relevant to them. Therefore, we need to keep error messages relatively short, which seems like an impossible contradiction.

Fortunately, there's another possibility - *ask the user for clarification* to narrow down the location of their mistake. Instead of presenting the entire chain to the user, just ask for the ground truth at one point in the chain, which will in turn rule out one half and allow you to progressively narrow down the location of the mistake.

For example, look at the last part of the PolySubML error message shown in the previous section:

```
Hint: To narrow down the cause of the type mismatch, consider adding an explicit type annotation here:
    match v.v <- `Some x with
    | `None _ -> x
    | `Some (old: _) -> old
            +   ++++     
);
```

In the case of a type error, PolySubML makes a list of every inference variable involved in the conflicting chain, and then picks one (usually near the middle) and suggests that the user add an explicit type annotation for it.

Assuming the user adds a correct type annotation, that narrows down the problem. For example, suppose you have something like `int -> x -> y -> z -> float`, where a value of type `int` flows to a use of type `float`, passing through points `x`, `y,` and `z`, on the way.

Suppose we suggest that the user add a type annotation to `y`. Perhaps the user intended for it to be an `int`, in which case we get `int -> x -> int -> z -> float` and the conflict is narrowed down to the `int -> z -> float` part. Or perhaps they meant for it to be a `float`, in which case the conflict is narrowed down to `int -> x -> float`. Either way, the location of the user's mistake has been narrowed down.

Suggesting locations for type annotations like this is especially effective because that's likely what the user would be doing anyway. Faced with a confusing type error that they can't figure out, users will often start adding extra type annotations to their code to try to narrow down the problem.

However, if the user doesn't know where the problem is, they often also won't know where it would be useful to add type annotations *either*, and will waste a lot of effort without getting anywhere. With PolySubML by contrast, the compiler explicitly highlights a location where adding a type annotation is *guaranteed* to help narrow down the cause of the mistake, leading to much faster and more effective debugging.

## Aside: Why even have type inference?

Opponents of type inference will often ask what the point of even having type inference is if you have to add type annotations to track down errors. First, there's the obvious rebuttal that regardless of language, nobody ever annotates *every single expression* in the program, because that's just not feasible or useful, and so everyone supports type inference to some extent, it's only a matter of degree.

But the other point is that having to annotate 5% of your code 5% of the time is much less work than being required to preemptively annotate 100% of your code 100% of the time. And especially with PolySubML, it will lead you directly to the problem, meaning few annotations are required to find it. And if you really want to, you can just remove the type annotations again afterwards (though you'll often want to leave them around as documentation, etc.)

## When type annotations aren't enough

When a type conflict involves one or more inference variables, PolySubML will display the endpoints of the conflict and *also* will suggest explicitly annotating one of those inference variables to help narrow down the cause of the conflict if it is not clear to the user.

That's all well and good, you might wonder, but what happens in the case of a type conflict that *doesn't* involve any inference variables? That's a good question and I unfortunately don't have a good answer to it.

The good news is that such conflicts are inherently localized. For example, in the PolySubML typechecker, every function has a typed signature. If the user does not provide explicit types for the function, the compiler just implicitly inserts inference variables and uses those instead. This means that any type conflict which does not involve inference variables is also guaranteed to not cross any function boundaries.

Likewise, the compiler also inserts inference variables when there is no explicit type annotation for mutable record fields, nontrivial pattern matching, polymorphic instantiation, and most variable assignments, among other things. This means that the scope of a type conflict is inherently limited if it does not pass through any inference variables.

In the case of a conflict with no inference variables, PolySubML will display the endpoints of the conflict (like usual) and also display the expression where the conflict was detected during type checking. For example, in the following code:


```ocaml
let f = fun (x: int): int -> x + 1;
let a = 42.9;
let _ = f a;
```

PolySubML's error message is as follows:


```
TypeError: Value is required to have type int here:
let f = fun (x: int): int -> x + 1;
                ^~~              
let a = 42.9;
let _ = f a;
However, that value may have type float originating here:
let f = fun (x: int): int -> x + 1;
let a = 42.9;
        ^~~~  
let _ = f a;
Note: Type mismatch was detected starting from this expression:
let f = fun (x: int): int -> x + 1;
let a = 42.9;
let _ = f a;
        ^    
```

Hopefully, these three data points along with the constrained scope of the conflict will be enough for users to understand the issue in most cases. However, I'm concerned that in especially complex cases, that may not be enough.


The fact that there are no inference variables involved in a type conflict implies that the code effectively has two conflicting types right next to each other. However, if the types are especially big and complex, the user may not be able to determine the problematic parts, even with the conflicting types side by side.

I'm not sure what a good solution to that problem would be. Unlike with chains of *data flow*, where there is the widely accepted and understood solution of adding intermediate type annotations to narrow down the problem, there's no way for the user to explicitly clarify intent *within the middle of a complicated type signature itself*. If anyone has a solution to this problem, please let me know. (Note that this is a problem any language will have, whether or not you're doing type inference.)

# Rule 4: Allow the user to write explicit type annotations

In you're going to suggest that the user add explicit type annotations to help narrow down errors, you need to also make it *possible* for the user to add explicit type annotations.

For example, consider *generic functions*. A generic function is one that operates on placeholder types (aka type variables) which can be substituted for any type later, and in particular can be substituted for multiple *different* types at different points in the code.

In PolySubML, an example of a generic function is `fun (type t) (x: t): t -> x`. This is an identity function which can operate on *any* type. Instead of the type signature mentioning a specific type, it is defined with the type parameter `t`. Whenever the function is called, the type parameters are substituted with inference variables, with different inference variables at each callsite, a process called *instantiation*.

This leads to the question: Is there syntax for *explicit* type instantiation? PolySubML was designed to follow Ocaml syntax as closely as possible. In Ocaml, there is no syntax for explicitly providing types when instantiating a generic type. They presumably didn't see the need, since the instantiated types can always be inferred anyway.


However, just because the types *can* be inferred doesn't mean there is no need for explicit syntax. After all, the user might want to explicitly provide the types in order to narrow down type errors, document the types, or place additional constraints on the code.

Consider the following example:

```ocaml
let f = fun (type t) (x: t): t -> x;
let _: float = f 42;
```

In the `f 42` code, `f` *could* be instantiated with `t=int`, in which case it will conflict with the expected return type of `float`. Alternatively, it could be instantiated with `t=float`, in which case the return type is correct but it conflicts with the argument type of `int`. This code has a conflict, but there's no way to know which half the user intended and which half is the mistake. If the user were able to provide an explicit type for `t`, they could indicate which one they meant and thus narrow down the error.

In PolySubML, type error messages will suggest adding an explicit type annotation to an inference variable if possible, which means that there needs to be a way for the user to supply explicit type annotations for any sort of inference variable, including those generated by generic function instantiation. And this means we need syntax for explicit instantiation.

Since Ocaml doesn't have any syntax for this, I had to make up my own for PolySubML. In PolySubML, you can explicitly instantiate polymorphic types by putting the types in square brackets after the expression, e.g. `f[t=int]`, `f[t=float]`, `f[t=str -> bool]`, etc.

And thus, the above code results in the following error message:

```
TypeError: Value is required to have type float here:
let f = fun (type t) (x: t): t -> x;
let _: float = f 42;
    ^~~~~        
However, that value may have type int originating here:
let f = fun (type t) (x: t): t -> x;
let _: float = f 42;
                ^~  
Hint: To narrow down the cause of the type mismatch, consider adding an explicit type annotation here:
let f = fun (type t) (x: t): t -> x;
let _: float = f[t=_] 42;
                +++++    
```


# Rule 4b: Allow the user to write explicit type annotations

In the previous section, we saw that you have to be careful to ensure that your language syntax offers a place to add explicit type annotations where necessary. However, that's not the only thing that can make it impossible for users to add type annotations.

A much more common problem is that many languages don't have *syntax for writing the types* themselves. For example, consider the following Rust code:


```rust
fn main() {
    let x = 42;
    let f: _ /* ??? */ = |y| x + y;
    f(23);
}
```

This code compiles and works just fine. However, *there is no possible type annotation you could add* to `f` (the part marked `???`) and still have your code compile (at least not without using the Nightly compiler and opting into unstable features).

The problem is that Rust has types which exist *in the type system* but for which *there is no syntax to actually write the type*. This means that your code works *as long as the types are inferred*. However since there is no way to actually *write* the types you are using, you're completely stuck as soon as you need to add explicit type annotations.

Async streams are especially bad here because a) they tend to have complicated types, especially if you chain multiple stream operations and b) it is normally impossible to write any of the types involved. Debugging errors in Rust code using async streams is an exercise in frustration, which normally consists of staring at the code and making random adjustments until something compiles.

One time, I wasted considerable time attempting to add explicit type annotations to narrow down the cause of a type error in some stream code I was working on. I even tried breaking it up and adding `Box`es so I could use `dyn Trait`, and I *still* wasn't able to get it working with explicit types and still had no idea what the cause of the original compile error was. I ended up having to completely rewrite the code in question to stop using streams at all since it was impossible to debug compile errors.

But enough ranting. The point here is that you shouldn't do this. **Any type that can be inferred must also be possible to write explicitly**.

## It's harder than you might think

Avoiding putting *deliberately* unwritable types into your language the way Rust did is a good first step. However, that's not enough by itself, because it is very easy to *accidentally* have unwriteable types as well.

The requirement that every inferrable type also be possible to express explicitly means that the typechecker can't have any *special powers* that let it do things which can't be done in the type syntax. There's a constant temptation to say "oh lets just add this one extra analysis to the typechecker, that will solve a common pain point and allow more correct code to compile." But unless you *also* add corresponding explicit type syntax (which you usually won't, because that makes the language "more complicated"), you've just broken this rule.

## An accidental violation

In fact, even if you're deliberately trying to follow this rule, it is still very easy to break if you aren't careful.

During the design of PolySubML, this rule was a major consideration, and I even went so far as to add an extra feature (type unions and intersections) to the type syntax just to make necessary types expressible in one specific edge case. And even despite that, I *still* messed it up!

In the original release of PolySubML, the following code compiled:

```ocaml
let ref = {mut v: _(* ??? *) =`None 0};
let {type t; a: t; b: t->t} = {a=3; b=fun x->x+1};

ref.v <- `Some a;
match ref.v with
| `Some a -> b a
| `None _ -> 0
;
```

This code doesn't have any actual *type conflicts*, so what's the problem? The problem is that it is inferring a type that can't be written.

Specifically, there is no annotation that could be written for field `v` on the first line (where the `???` is). The *inferred* type for `v` is ``(`Some t)``, where `t` is the abstract type created by the pattern match on line 2. However, since `t` is only *defined* on line 2, there is no way for the user to explicitly write it in an annotation on line 1. The compiler is inferring a type that can't be written, exactly what I tried so hard to avoid!

Therefore, I had to modify PolySubML in order to ensure that it can only infer *types that were in scope at the point of the inference variable being inferred* in order to guarantee that the user could explicitly write that type at that point if they wanted to. Compiling the same code in PolySubML today instead results in a type error, thus satisfying rule 4.

# Rule 5: Do not include static type inference in your runtime execution model

I won't say much here because I already wrote [an entire blog post on the topic](https://blog.polybdenum.com/2022/04/25/when-type-annotations-are-code-too.html), but I figured I should mention this here for completeness, because it is another common design issue that causes type inference to behave in complex and surprising ways, and thus contributes to the bad reputation of type inference.

# Conclusion

Type inference has a reputation for confusing and impossible-to-debug type errors. However, there is no reason why it has to be this way. If you design your language in the right way, you can still have high quality type errors even with powerful global type inference. This does mean avoiding certain features which are often convenient, but I think in the long run, having high quality error messages in your language is the superior tradeoff.




