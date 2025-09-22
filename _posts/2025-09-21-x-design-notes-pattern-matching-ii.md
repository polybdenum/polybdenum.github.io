---
layout: post
title: 'X Design Notes: Pattern Matching II'
series: xdesign
series-num: 6
date: 2025-09-21 16:35 -0700
---
{% include series-util.html %}
{{series_header}}

In the [previous post]({{prev_url}}) about the design of X (the currently untitled successor language to [PolySubML](https://github.com/Storyyeller/polysubml-demo)), we talked about pattern matching.

Pattern matching is a complex enough topic that I've broken it into two posts. Last week's post covered the core algorithms for type checking complex pattern matching (including exhaustiveness checking). This week will be a shorter and simpler post covering various extra features for pattern matching.

# I. Match guards

**Match guards** allow you to specify an *arbitrary* runtime condition for an arm of a `match` expression.

A match guard is specified by putting `when expr` after the pattern and before the `->`. If the pattern matches, then `expr` is executed, and the arm is taken only if `expr` also evaluates to `true`.

```ocaml
match x with
| `A x when x == 9 -> 1
| `A _ -> 2
| `B -> 3
```

For example, in this code, ```x = `A 9 ``` will result in `1`, but ```x = `A 42 ``` will result in `2`, because the `x == 9` check fails and the first arm is skipped.

## Type checking

The type checking side is very simple - just ignore any match arms containing guards! 

More specifically,

* Guarded arms are considered when determining the set of mentioned tags (which is the set used for exhaustiveness checking).
* Guarded arms are considered when adding type constraints to the matched value.
* Guarded arms are otherwise completely ignored during exhaustiveness checking.
* Guarded arms are not considered when performing type narrowing on later match arms.

The tricky part with match guards is actually the *runtime* semantics.

## A soundness trap

Traditional match expressions allow for exhaustiveness, where a fixed set of tags is handled for a variant, and this is ok because the compiler verifies that each tag is checked and handled at least once. However, this assumes that the tag can't *change* during the matching process.

Match guards allow for *arbitrary code* to be executed during the matching process, which means they can *mutate* the matched value, and change the tag to something that was already checked for earlier in the match, thus bypassing the compiler's exhaustiveness checks. This means that a naive approach to implementing match guards makes exhaustive matches unsound. 

In fact, *OCaml itself* had [a longstanding soundness bug](https://github.com/ocaml/ocaml/issues/7241) due to this issue. Prior to OCaml 5.3.0 (released January 2025), the following OCaml code would **segfault**:

```ocaml
type u = {a: bool; mutable b: int option}

let f x =
  match x with
    {a=false} -> 0
  | {b=None} -> 1
  | _ when (x.b <- None; false) -> 2
  | {a=true; b=Some y} -> y

let _ = f {a=true; b=Some 5}
```

One solution to this problem would be to just adjust the type checker to take into account that matches aren't actually exhaustive due to possible mutation. However, that would effectively mean banning exhaustive matches entirely when combined with match guards, which is extreme and makes the language less useful. A much better approach is to change the *runtime semantics* of matches so that match guards can't violate exhaustiveness checking.

## Runtime semantics

This raises the question of what runtime semantics should be chosen for match guards in order to prevent this issue. This is a case where we'll choose a different approach than OCaml due to different design priorities.

OCaml is a language used by people to actually do things in the real world, and so it tries to be fast, at least as fast as it can be within the niche of "GC languages that encourage heavy use of currying and linked lists". Real world usage also brings with it a larger ecosystem and more development resources (for example, Jane Street contributes significantly to the development of OCaml). 

Meanwhile, X is a hobby language designed by *one person* in his spare time with the goal of pushing the boundaries of type inference and programming language design aspects related to type inference. With no users and no development resources, X doesn't need to and can't afford to worry much about runtime performance of the compiled code. Instead, all design decisions are focused on keeping the language simple, and runtime performance just isn't a concern at all.

This difference in priorities is reflected in choices such as evaluation order. OCaml has an *unspecified* evaluation order, presumably to allow for more compiler optimizations, while X guarantees a strict left-to-right evaluation order because it makes the language simpler for the user and it's not like the compiler was going to be doing any optimizations anyway.

Likewise, OCaml leaves the precise semantics of match evaluation deliberately unspecified, whereas for X, we specify a simple and explicit runtime model. Specifically, in X, **all values bound by match patterns in a match expression are read *before* any match guards are executed**.

This neatly solves the exhaustiveness-checking soundness problem and provides a very simple runtime model that is easy to explain to users and easy to remember. The one downside is that it makes runtime execution of match expressions slightly less efficient.

This is because the compiler needs to generate code to read all the possibly-bound values and store them in local variables before beginning the actual `match` part, even though some of those values may not be used by the branch that is actually taken.

For example, the following `match` expression:

```ocaml
match x with 
| ({x; y}, `A z) when true -> f1 {x; y; z}
| (a, `B (b, c)) when b == 12345 -> f2 {a, c}
| ({z=`Foo {p}; y=(q, r)}, `B _) -> f3 {p; q; r}
| (_, _, m) -> m
```

would result in something like this at runtime:

```js
// Store all possibly-bound values in advance:
let {_0: $0, _1: $1, _2: $2} = x;
let {x: $3, y: $4, z: $5} = $0;
let {_0: $6, _1: $7} = $4; // (q, r) = y
if ($5.$tag == "Foo") {
    let {p: $8} = $5.$val;
}
if ($1.$tag == "B") {
    let {_0: $9, _1: $10} = $1.$val; // `B (b, c) 
}

// The actual match part:
if ($1.$tag == "A" && true) {
    f1({x: $3, y: $4, z: $1.$val})
} else if ($1.$tag == "B" && $9 == 12345) {
    f2({a: $0, c: $10})
} else if ($5.$tag == "Foo" && $1.$tag == "B") {
    f3({p: $8, q: $6, r: $7})
} else {
    $2
};
```

Notice how we have to check the tags in order to (conditionally) read the values that might be bound later, and then read the tags *again* during the actual matching process to decide which arm to execute.

# II. Or patterns

*Or patterns* let you combine a list of arbitrary other patterns. `pat1 | pat2 | pat3 | ...` will match if *any* of the subpatterns `pat1`, `pat2`, etc. match. For example

```ocaml
match x with
| (`A | `B | `C) -> 1
| `D -> 2
```

If `x` has the tag `A`, `B`, *or* `C`, then the first arm is taken. Otherwise, the second arm is taken.

OCaml allows or patterns to be arbitrarily nested and combined. For example, the following is also valid OCaml code:

```ocaml
match x with
| (`A | (`B `A | `B `C) | `C ((`A | `B), (`B | `A))) -> 1
| `D -> 2
```

Handling or patterns in full generality would be extremely complex, and it is likely impossible to do precise exhaustiveness checking, so we'd have to come up with further approximations. Fortunately, we don't actually have to worry about that.

## Or patterns in practice

*In practice*, every single example of or patterns that I was able to find uses only a single or pattern per match arm.

The main use of or patterns is to combine what would otherwise be separate match arms with the same handler code (usually but not always an error case). The ```(`A | `B | `C) -> 1``` example above exhibits this pattern.

In one example I found, the or pattern is nested within an `as` pattern:

```ocaml
let rec remove_duplicates = function
  | ([] | [_]) as l -> l
  | x :: (y :: _ as rest) when x = y -> remove_duplicates rest  
  | x :: rest -> x :: remove_duplicates rest
```

However, even in this case, there's still only a single or pattern (the `([] | [_])` part) per match arm.


Therefore, we can handle 99% of the use cases with 1% of the complexity by limiting or patterns to a single or pattern per match arm. This neatly solves the problem of how to handle it for type checking and exhaustiveness checking because we can just expand the pattern out and treat it as if it were written as a list of separate match arms for the purpose of exhaustiveness checking.

# III. Constant patterns

OCaml also allows *constants* to appear in patterns: 

```ocaml
match x with
| (`A true, _) -> 3
| (`B 42, "Hello") -> 4 
| _ -> 5
```

Constant patterns can mostly just be treated as syntactic sugar for match guards, where e.g. `(4, "X") -> foo` is just shorthand for something like `($0, $1) when $0 == 4 && $1 == "X" -> foo`.

Integer and string constants are the simplest, because there are an infinite number of possible values and the user can't reasonably expect exhaustive matching. Thus a wildcard is required anyway, and the match guard desugaring works just fine. (Rust allows exhaustive matching of integers via *range* patterns, but OCaml doesn't support this, so we fortunately don't have to either.)

Floating point constants are similar, but have some edge cases worth noting. First, there's "Not a number" (`NaN`), which doesn't compare equal to *itself*. However, there is no floating point *literal* for `NaN`, so it can't be used in patterns and we don't have to worry about how a `NaN` pattern should work. There's also the question of negative zero `-0.0`. OCaml allows `-0.0` to match `0.0`, so once again, we can just use match guard `==` semantics for everything.

The only tricky part are *boolean* constants, because booleans only have two possible values, `true` and `false`. Therefore, users might expect to be able to *exhaustively* match on them, and in fact, OCaml's exhaustiveness warning does take that into account.

We *could* implement that in X, but it would be a major increase in complexity for dubious benefit. Every place in all of the algorithms where we look at variant types and tags, we'd *also* have to look at boolean constants, and treat them similarly. This means tons of extra cases all over the code for no good reason.

If a user wants to *exhaustively* match on a boolean, they should either use nested `if` expressions or switch to using real variant types. There's not much reason to let people pretend that booleans are fake variant types as well.

It's not just a matter of complicating the language *implementation* either. Doing this also greatly complicates the language *specification*. Saying "only variant patterns matter for exhaustiveness" is a clear and simple rule to teach users. Changing "variant" to "variant and sometimes booleans too" just makes things a lot more complicated and confusing for users as well.

Therefore, in X, all constant patterns are treated as shorthand for match guards and do not participate in exhaustiveness checking.


# IV. Alias patterns

*Alias* patterns let you bind multiple names to the same value within a pattern. They are written by suffixing a pattern with `as name`.

For example in 

```ocaml
let (x, y) as p = (1, 2)
```

`x` and `y` are bound to `1` and `2` like normal, but `p` is also bound to the value as a whole (`1, 2`).


Alias patterns are pretty straightforward and trivial, but there is one point that merits discussion. Specifically, you might wonder whether the aliased binding should have the type of the original value or the type of the *pattern* that it aliases. Thanks to the addition of subtyping in X, these are not necessarily the same.

Consider this example:

```ocaml
let {x: any; y: int} as p = {x=1; y=2; z=3};
```

What type should `p` have? One possibility would be to give it the type of the *pattern* that it aliases, which in this case would be `{x: any; y: int}`. The other possibility is to give it the type of the matched value, which would be `{x: int; y: int; z: int}` in this case.

I think the latter is more useful in most cases. It's what users will probably expect, and as a bonus, it's also much easier to implement.

This means that alias patterns won't have implicit coercions applied. For example:


```ocaml
type Foo = {x: int; y: int; z: int};

let {x: any; y: int} as p = Foo {x=1; y=2; z=3};
```

In this case, `x` and `y` will still bind to `1` and `2` respectively like normal, because the pattern implicitly coerces the matched value from `Foo` back to a record. However, the alias pattern binding `p` has the *original* type, before implicit coercions, and so `p` will still have type `Foo` here. 

This may sound surprising, but it has the advantage of making alias patterns behave similarly to ordinary variable patterns and work independently of the pattern to the left. For example, if you remove the first pattern and change it to just

```ocaml
let p = Foo {x=1; y=2; z=3};
```

Then `p` would have type `Foo`. So doing it this way is more consistent and less surprising in many respects.




One last note is that X tries hard to ensure that it is always possible to add explicit type annotations everywhere so that it is possible for users to troubleshoot confusing type errors by adding explicit type annotations to narrow down the source of the problem.

Since alias patterns introduce a variable binding, we need to allow an optional type annotation as well, e.g. `_ as p: int`. OCaml doesn't appear to support this, but it's an obvious addition.

# V. Everything else

OCaml has a large number of other kinds of patterns, but for various reasons, they're not things we need to worry about in X. 

* Constructor patterns - In X, matching is always done on structural types (what OCaml refers to as polymorphic variants). When you match on a *nominal* variant type, it gets implicitly coerced to a structural variant type. Therefore, all match patterns in X are polymorphic variant patterns, and this covers the equivalent of both the polymorphic variant and constructor cases in OCaml. (In order to force a variant pattern to match a specific nominal type and no others, you can just name the coercion, so there is no loss in type safety compared to OCaml.)

* List patterns - OCaml has a lot of special shorthand syntax for dealing with singly linked lists. I don't think this is worth it because a) linked lists are inefficient and you usually want to use mutable array-lists in real world code, b) it takes up a lot of valuable syntactic real estate (e.g. X uses `[]` brackets for higher rank types instead) and c) the explicit syntax is not much longer than the shorthand syntax anyway. Therefore, X has no list-specific shorthand syntax for patterns *or* expressions.

* Module opens - I explained why this is a bad idea back in [the post on modules]({{first_url}}). 

* Lazy patterns - X doesn't support `lazy` at all. The closure/caching aspect is easily handled with a library and the special syntax doesn't seem worth the cost. Do you really need a *second* way to execute arbitrary code during the pattern matching process that badly?

* Exception patterns - X doesn't have special syntax for exception types. The equivalent in X is calling a runtime function to inspect the value's tag and then do an ordinary match on the result. 

# VI. Function shorthand syntax

OCaml has [syntactic sugar](https://en.wikipedia.org/wiki/Syntactic_sugar) for functions that just `match` on their argument:

```ocaml
let f = function
| `Some x -> x
| `None -> 0
```

is effectively just shorthand for


```ocaml
let f = fun arg -> (
    match arg with 
    | `Some x -> x
    | `None -> 0    
)
```

I considered trying to add this to X, but it has some unfortunate drawbacks and limitations.


One of the key design goals of X is to have helpful compiler error messages that always allow the user to narrow down the cause of mistakes, but this requires having explicit points in the source code that the error messages can point them to.

For example in PolySubML, this code

```ocaml
let f = fun arg -> (
    match arg with 
    | `Some x -> x
    | `None _ -> 0    
);

f `Oops{};
```

results in the error message

```
TypeError: Unhandled variant Oops
Note: Value originates here:
);
f `Oops{};
  ^~~~~    
But it is not handled here:
let f = fun arg -> (
    match arg with 
    ^~~~~~~~~       
    | `Some x -> x
    | `None _ -> 0    
Hint: To narrow down the cause of the type mismatch, consider adding an explicit type annotation here:
let f = fun (arg: _) -> (
            +   ++++      
    match arg with 
    | `Some x -> x
```

Notice how the error message suggests that the user add a type annotation to the function parameter. That would be impossible using OCaml's shorthand syntax, where the function doesn't have an explicit parameter in the first place!


Even worse, in X, polymorphic function definitions *always* have to be explicitly annotated. That would mean that for polymorphic functions, you couldn't use the shorthand syntax. As soon as you need to add type annotations, you have to use the full `fun`/`match` syntax *anyway*.

OCaml only gets away with having this shorthand syntax because it allows annotations to be omitted from polymorphic function definitions in most cases (they're still required in more complex situations, particularly once GADTs or recursion get involved).

Therefore, it doesn't make any sense to try to support this syntax in X.

# VII. If let

There is one convenient bit of shorthand syntax we can easily support however. `if let pattern = expr then e1 else e2` is just syntactic sugar for `match expr with | pattern -> e1 | _ -> e2`. 

This actually isn't a feature in OCaml at all. It's a feature taken from Rust. But if you're already supporting complex `match` expressions anyway, it's very simple to add and quite convenient, so it seems worth supporting in X.

# VIII. Conclusion

We've now seen how to handle OCaml-style pattern matching. Most of the extra features are relatively straightforward, but you do have to be careful around mutation during the match execution. 


This is the last of the topics I had planned for this series. However, I may end up writing another post or two. In particular, when I started writing these posts, I couldn't find a good design for the "forward type propagation" described in [the first post]({{first_url}}). I've since decided on an alternative design with better properties, so I may write a post going into more depth about that.

Until then, thank you for reading this series. Please let me know on Reddit if you have any comments or questions, or if there are any topics you'd like to see covered that I didn't have time to get into.



{{series_footer}}





