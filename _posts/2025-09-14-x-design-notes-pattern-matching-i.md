---
layout: post
title: 'X Design Notes: Pattern Matching I'
series: xdesign
series-num: 5
date: 2025-09-14 21:45 -0700
---
{% include series-util.html %}
{{series_header}}

In the [previous post]({{prev_url}}) about the design of X (the currently untitled successor language to [PolySubML](https://github.com/Storyyeller/polysubml-demo)), we talked about Generalized Algebraic Data Types (GADTs). This week, we're going to talk about *pattern matching*.

Pattern matching is a complex enough topic that I plan to break it up into two posts. The first (this one) will cover type checking and exhaustiveness checking for ordered pattern matching. Next week, we'll cover additional features that OCaml adds to pattern matching, including match guards, or patterns and constant patterns.

First off, we'll start with a review of how the existing pattern matching functionality in PolySubML works, and then look at what OCaml does that we need to add in X.

# I. Pattern matching in PolySubML

In PolySubML, all `match` expressions look at the tag of exactly one variant value.

The most basic form is a closed match:

```ocaml
let calculate_area = fun shape ->
    match shape with
        | `Circle {rad} -> rad *. rad *. 3.1415926
        | `Rectangle {length; height} -> length *. height;

calculate_area `Circle {rad=6.7};
calculate_area `Rectangle {height=1.1; length=2.2};
```

In this example, the `match` expression has an explicit list of possible tags (`Circle` and `Rectangle`). At runtime, it checks the tag of the `shape` value and chooses the corresponding branch based on that tag. If the actual tag of `shape` doesn't match one of those, you'll get a compile time error:

```
>> calculate_area `Square {len=9.17};

TypeError: Unhandled variant Square
Note: Value originates here:
calculate_area `Square {len=9.17};
               ^~~~~~~             
But it is not handled here:
let calculate_area = fun shape ->
    match shape with
    ^~~~~~~~~~~      
        | `Circle {rad} -> rad *. rad *. 3.1415926
        | `Rectangle {length; height} -> length *. height;
Hint: To narrow down the cause of the type mismatch, consider adding an 
explicit type annotation here:
let calculate_area = fun (shape: _) ->
                         +     ++++    
    match shape with
        | `Circle {rad} -> rad *. rad *. 3.1415926
```

The `match` expression infers a *closed* variant type for `shape`. The inferred type for `shape` is ```[`Circle {rad:float} | `Rectangle {length: float; height: float}]```. Any value that is passed can have at most that many tags - any extra tags means an unhandled case, resulting in a compile time type error.

## Wildcard matches

In addition to simple closed matches, you can also add a case at the bottom that matches when none of the explicit cases do, referred to as an open match. For example:


```ocaml
let calculate_area = fun shape ->
    match shape with
        | `Circle {rad} -> rad *. rad *. 3.1415926
        | `Rectangle {length; height} -> length *. height
        |  v -> "got something unexpected!"
```

Here, the `v` pattern matches whenever the above patterns don't. Therefore, calling it with a not-explicitly specified tag such as `Square` will still work (and result in "got something unexpected" at runtime). 

The inferred type of `shape` is now the *open* variant type ```[`Circle {rad:float} | `Rectangle {length: float; height: float} | any]``` where the `| any` part means that any tags not previously specified are still ok. Note that this is pseudocode for the sake of illustration. PolySubML does not provide any *syntax* for writing open variant types, though they are still used internally as in this example.

> Note: PolySubML also allows the final wildcard pattern to appear **before** the explicit variant patterns, i.e. the match semantics are order independent. I don't actually think this is a good design, but decided to try it as an experiment in PolySubML.

## Type narrowing

The type of the value for wildcard matches is *narrowed* based on the other (explicit variant) patterns. In the `calculate_area` example above, `v` would have the type "same as `shape` except not a `Circle` or `Rectangle`".

This makes it possible to further match on the wildcard value elsewhere. For example, in the below code, the new `calculate_area2` function explicitly handles the `Square` case and otherwise defers to the previously defined function to handle the `Circle` and `Rectangle` cases. This works because the compiler knows that the `v` in the wildcard branch is not a `Square`, so it will not complain that the original `calculate_area` function fails to handle squares.

```ocaml
let calculate_area = fun shape ->
    match shape with
        | `Circle {rad} -> rad *. rad *. 3.1415926
        | `Rectangle {length; height} -> length *. height;

let calculate_area2 = fun shape ->
    match shape with
        | `Square {len} -> len *. len
        |  v -> calculate_area v;

calculate_area2 `Circle {rad=6.7};
calculate_area2 `Square {len=9.17};
```

Now that we've seen what PolySubML currently supports, it's time to look at what features in OCaml we want to add to X.

# II. Pattern matching in OCaml

Unlike PolySubML, OCaml allows `match` expressions to contain more complex patterns that can check the tags of *multiple* variant values simultaneously.

```ocaml
let foo = fun arg ->
    match arg with
        | (`A, `A) -> 1
        | (`B, _) -> 2
        | (_, `B) -> 3

(* prints 1 3 2 2 *)
let _ = print_endline (string_of_int (foo (`A, `A)))
let _ = print_endline (string_of_int (foo (`A, `B)))
let _ = print_endline (string_of_int (foo (`B, `A)))
let _ = print_endline (string_of_int (foo (`B, `B)))
```

For example, this `match` expression expects `arg` to be a *tuple* where both fields consist of independent variant values, and the matching process looks at both of them when deciding which branch to take. If both variants have the tag `A`, it takes the first branch. If the first variant has the tag `B`, it takes the second branch. Otherwise, it takes the third branch.


In PolySubML, match syntax is restricted to be simple enough that the patterns are always *mutually exclusive*, apart from the optional final wildcard. However, with more complex patterns like those seen in OCaml, this is normally not possible or desirable. 

Instead, OCaml, freely allows match patterns to overlap, so that any given value could match multiple possible match arms. The runtime semantics of matching is *linear*: each pattern is tried one-by-one from top to bottom, and the first one that matches is the one chosen, even if there were others later on that could match as well.

That is why in the example above, ```foo (`B, `B))``` returns `2`. Both the 2 and 3 arms *could* match the value, but the 2 arm comes first, so that's the one chosen.

## Exhaustiveness

If *multiple* match arms can match, the first one is chosen. But what if *none* of the arms match?

For example, what does this print? ```(`A, `B)``` doesn't match *either* of the possible match arms here. 

```ocaml
let foo = fun arg ->
    match arg with
        | (`A, `A) -> 1
        | (`B, `B) -> 2

let _ = print_endline (string_of_int (foo (`A, `B)))
```

The answer is that it throws an exception at runtime. In OCaml, most `match` expressions are treated as if there were an implicit extra match arm at the bottom that matches *every* value and throws an exception when executed. So including the implicit default arm, the effective logic of the previous example is something like

```ocaml
let foo = fun arg ->
    match arg with
        | (`A, `A) -> 1
        | (`B, `B) -> 2
        | _ -> raise (Match_failure ("..." , 0, 0))
```

Where `("..." , 0, 0)` is the filename and line and column number, included to help you know where the error was thrown from.


The newer programming language Rust does not share this behavior. In Rust, matches are statically checked, and it is a *compile error* if the match arms don't cover every possibility. You can still *opt in* to OCaml -like behavior by explicitly adding a `_ => panic!()` to the end of each match, but you don't have to.

I think the Rust approach is much better here because you can always opt out of static checking by adding a wildcard pattern to the end, but there's no way to do the reverse. Furthermore, it's nice to have guarantees that expressions won't implicitly throw exceptions at runtime and to catch errors at compile time instead.

Therefore, X will need some way to check whether the match arms cover every possibility or not, and raise a compile time error if so, a process called exhaustiveness checking. 


# III. Terminology

*This section is not too important, so feel free to skip it, but it might help explain assumptions and terminology that appear later.*

## Paths

A *path* identifies the location of a sub-pattern relative to the root. Each path is a possibly empty list of record field accesses and variant tags matched. Notation wise, we'll use `$` to represent the empty path and `$.foo`, `$.bar.baz` etc. to represent paths of subelements.

For example, in the pattern `let {foo=x; bar={hello=y; world=z; w}} = e`, the bindings `x`, `y`, `z`, and `w` appear at paths `$.foo`, `$.bar.hello`, `$.bar.world` and `$.bar.w` respectively. In X, tuples are just records with names of the form `_n` for increasing integers. Therefore, in the tuple pattern `let (x, _, y, (_, z)) = e`, `x`, `y`, `z` appear at paths `$._0`, `$._2`, and `$._3._1` respectively.

Patterns within a `match` expression can also contain variant patterns, which control whether the match arm is selected or not at runtime, based on the tag of the matched value. These are written using ```$.`Foo``` and do not correspond to actual expressions the way that record access does.

For example, in

```ocaml
match expr with
| `A (x: int, _, z) -> 0
| `B {y; rest=`C z} -> 1
| x -> 2
```

The `match` expression has three arms. In the first arm, there are two bindings `x` and `z` at paths ```$.`A._0``` and ```$.`A._2``` respectively. The second arm has two bindings `y` and `z` at paths ```$.`B.y``` and ```$.`B.rest.`C```. The last arm has a single binding `x` at path `$` (the empty path).

## Decision points

Paths can be used to refer to the location not just of bound values, but of any subpattern within a pattern. They're especially useful for referring to a point in a pattern where a variant value is read so we can branch on the tag. We call these *decision points*.

For example, in the pattern ```(`A _, `B foo)```, there are two decision points, at paths `$._0` and `$._1` respectively. At runtime, the values that appear at those paths relative to the original matched expression will be read, and their tags will be used to decide whether or not to take this arm of the match. This pattern also contains one variable binding, `foo`, at path ```$._1.`B```.

The reason decision points are important are because they are the only values which control whether the match arm is chosen or not. For the purposes of determining whether a match pattern will be chosen or not, the only thing you need to know is the list of (path, tag) pairs.

For example in the pattern ```(`A _, `B (x: int), `C `D)```, the (path, tag) pairs are ```($._0, A), ($._1, B), ($._2, C), ($._2.`C, D)```. These are the only parts that matter for checking whether the pattern will be taken or not. The `x: int` part imposes a *type constraint* on the matched value, but does not participate in runtime matching. If `x` is not actually an `int`, that's a *static type error*. It won't just move on to trying the next pattern, the way that matching variant tags does.

We'll assume whatever data representation is most convenient. In practice rather than a list of pairs, you would likely use a hashmap mapping paths to tags. 

## Internal variant types

The tree merging process described in section IV assumes that we can always "flatten" the intersection of multiple variant types to a single variant type. However, this is not possible using the types in PolySubML. Specifically, there is no way to simplify the intersection of ```[`Foo any | t1]``` and ```[`Bar any | t2]```. Therefore, we need to *extend* the internal representation of variant types to accommodate this.

We will extend this with the form ```[(`Foo int) & t1 | (`Bar str) & t2]``` where `t1` matches if the tag is `Foo`, but matches against the *whole* variant type rather than just the type of the contents, and likewise `t2` matches if the tag is `Bar`, etc. 

This might sound a bit confusing so hopefully an example helps. ```[(`Foo int) & t | t]``` is equivalent to the *intersection* of the types ```[`Foo int | any]``` and `t`. This ensures that it is always possible to flatten the intersection of open variant types.

Note that like open variant types in general, this is not syntax that is externally visible, it's just pseudocode for the sake of describing the type representations used internally during type checking.


# IV. Type checking

Before we get into the more difficult topic of exhaustiveness checking, we'll first cover the easy part of type checking.

The process of type inference for `match` expressions is relatively straightforward (ignoring some complications we'll get into later). 

First, we convert each pattern to a tree representing a type, except that all variant patterns are converted to *open* types rather than *closed* types. For example, the pattern ```(`Foo int, str)``` results in the tree ```{_0: [`Foo int | any]; _1: str}```, where we have the open type ```[`Foo int | any]``` rather than the closed type ```[`Foo int]``` like you might expect. This is because in a `match` expression, anything not handled by one pattern might be handled by other patterns, and we're going to need to join them together later.

The second step is to merge these trees in the obvious way in order to create one big tree representing the inferred type of the expression being matched against. 

To see how this works, let's look at an example:

```ocaml
match expr with
| (`Foo a, b) -> 0
| (c, `Foo d) -> 1
| (`Bar e, `Bar f) -> 2
| (g, `Blah h) -> 3
```

First off, we add an inference variable for every bound variable that does not have an explicit type annotation. We'll represent these variables as `_a, _b, _c, ...` respectively:

```ocaml
match expr with
| (`Foo a: _a, b: _b) -> 0
| (c: _c, `Foo d: _d) -> 1
| (`Bar e: _e, `Bar f: _f) -> 2
| (g: _g, `Blah h: _h) -> 3
```

Now we need to infer a type for `expr`. We start by creating a type tree for each individual match arm as described above:

```
(`Foo a: _a, b: _b)
=> {_0: [`Foo _a | any]; _1: _b}

(c: _c, `Foo d: _d)
=> {_0: _c; _1: [`Foo _d | any]}

(`Bar e: _e, `Bar f: _f)
=> {_0: [`Bar _e | any]; _1: [`Bar _f | any]}

(g: _g, `Blah h: _h)
=> {_0: _g; _1: [`Blah _h | any]}
```

Now we merge them together:


```
{_0: [`Foo _a | any]; _1: _b}
++ {_0: _c; _1: [`Foo _d | any]}
=> {_0: [(`Foo _a) & _c | _c]; _1: [(`Foo _d) & _b | _b]}

++ {_0: [`Bar _e | any]; _1: [`Bar _f | any]}
=> {_0: [(`Foo _a) & _c | (`Bar _e) & _c | _c]; _1: [(`Foo _d) & _b | (`Bar _f) & _b | _b]}


++ {_0: _g; _1: [`Blah _h | any]}
=> {_0: [(`Foo _a) & _c & _g | (`Bar _e) & _c & _g | _c & _g]; _1: [(`Foo _d) & _b | (`Bar _f) & _b | (`Blah _h) & _b | _b]}
```

Note that this process is just for the sake of illustration. I may end up implementing it slightly differently, such as building up a single tree incrementally rather than building multiple trees and then merging them.


## Type narrowing

The above algorithm doesn't include *type narrowing* as described in section I. At the very least, we need to make sure that everything that the functionality of PolySubML is still supported in X, including `match` expressions with type narrowing. We need type narrowing to definitely work for the simple kind of match that is possible in PolySubML, and ideally make it work in as many cases as is feasible.

The solution is that when processing the pattern in one match arm, we also look at all the patterns from *previous* match arms, and look for any prior patterns that have exactly one more (path, tag) pair than the current pattern, while otherwise being the same or more general than the current pattern (i.e. a subset of the pairs).

For example, consider these patterns:

```ocaml
match expr with
| (`A, _, `C, x: int) => 0
| (_, `B, `C, `D) => 1
| (_, `B, `C, _) => 2
```

When processing the `=> 2` arm, we look at the previous patterns. We see that the ```(`A, _, `C, x: int)``` pattern is a subset of the current pattern ```(_, `B, `C, _)``` except for the addition of the `A` tag at path `$._0`, so we know that in the last arm, the first wildcard will never match `A`. 

Likewise, the ```(_, `B, `C, `D)``` pattern is the same except for the addition of `D` at path `$._3`, so the last wildcard on the last arm will definitely not match `D`.

This handles the single match case of PolySubML, while also providing additional type narrowing in the complex match case as well when possible.

## Soundness

The previously described process generates a type which is compatible with all the patterns in the match arms, but is not sound by itself. Consider this example:

```ocaml
match expr with
| (`A, `A) => 0
| (`B, `B) => 1
```

The resulting type inferred for `expr` is ```([`A | `B | any], [`A | `B | any])```. This says that either part of the tuple could *independently* be `A` or `B` (or anything else, but we'll get to that in section VIII). This means that the type allows for values like ```(`A{}, `B{})```, even though there is no match arm that actually handles that case, leading to unsoundness.

This is where *exhaustiveness checking* comes in, to verify that the code is actually correct.

# V. Precise exhaustiveness checking is NP-Hard

By looking at the patterns, we can get the set of all tags referenced for each decision point. Then for each possible combination of tags (or other to check for handling of wildcards), we'd like to know whether one or more of the patterns covers it. 

The simplest approach would be to go through every possible combination one by one and check whether any of the match arms handle that case or not. However, there's an exponentially large number of cases to check, and hence this naive brute force approach requires exponential time. 

Can we do better than that using a more sophisticated algorithm? Unfortunately, the answer is "no". Exhaustiveness checking is *co-NP complete*, meaning that there is no (known) way to do significantly better than brute force. 

## Satisfiability

The archetypal NP-complete problem is boolean satisfiability. This asks, given a list of clauses and boolean variables in a particular form, e.g. `(a or b or not c) and (not a or c) and (b or d or not e)`, whether there is some `true/false` assignment of the variables that satisfies every clause.

Although formally proving the impossibility of solving boolean satisfiability in polynomial time is one of the greatest unsolved problems in mathematics, it is [extremely likely](https://scottaaronson.blog/?p=1720) that satisfiability requires exponential time.

Furthermore, boolean satisfiability is trivially reducible to the match exhaustiveness problem, meaning that any algorithm to solve exhaustiveness can also solve boolean satisfiability. For example, the satisfiability problem `(a or b or not c) and (not a or c) and (b or d or not e)` is equivalent to determining whether the following `match` expression is exhaustive or not:

```ocaml
match expr with
| {a=`F; b=`F; c=`T} -> ...
| {a=`T; c=`F} -> ...
| {b=`F; d=`F; e=`T} -> ...
```

This means that precise exhaustiveness checking almost certainly requires exponential time, and at the very least, there is no *known* way to solve it in polynomial time (and if you *did* somehow find one, you'd have better things to do with your time, like breaking every code, hacking every computer, stealing all the Bitcoin, collecting the Millennium Prize, etc.).

Other languages aren't afraid to use algorithms which require exponential, or even infinite time, but X is different. X makes a hard guarantee of worst-case polynomial time compilation, which means that we can't do precise exhaustiveness checking. 

# VI. Decomposition-based exhaustiveness checking

Since we can't do precise exhaustiveness checking, we need to find a way to *approximate* it in polynomial time. And since X's type checker has to be *sound*, the approximation can only go one direction. We can't falsely declare a match to be exhaustive when it isn't, because that would be a soundness hole, so all the "errors" have to be of the other kind, rejecting matches even when they truly are exhaustive, much like how static type checkers normally reject programs even if they aren't "really" incorrect according to the runtime semantics.

Fortunately, with the right approach, this isn't a problem in practice. We just need an algorithm that can precisely handle the simple cases that people actually care about. Only people who go out of their way to encode pathological match patterns would have to worry about "false positives", and in that case, they only have themselves to blame. After all, if the computer can't easily tell whether a match is exhaustive or not, *humans* won't be able to easily tell either, and they should split up the code anyway just for the sake of readability.

## Match decomposition

Complex matches can often be seen as a shorthand for nested simple matches. For example,

```ocaml
match x with 
| `A -> (
    match y with 
    | `A -> 0
    | `B -> 1
)
| `B -> (
    match y with 
    | `A -> 2
    | `B -> 3
)
| _ -> (
    match y with 
    | `A -> 4
    | `B -> 5
)
```

could instead be written as 

```ocaml
match (x, y) with 
| (`A, `A) -> 0
| (`A, `B) -> 1
| (`B, `A) -> 2
| (`B, `B) -> 3
| (_, `A) -> 4
| (_, `B) -> 5
```

Likewise, for many match expressions, the same transformations can be done in reverse, turning a complex match expression into a *tree* of simple match expressions. 

This is the basic idea behind the exhaustiveness algorithm we'll use. It can precisely check exhaustiveness for any *decomposable* match expression, which will handle the cases that people care about in practice.

## The algorithm

First off, we assume that every pattern has been reduced to the form `Map[Path, Tag]`, i.e. a hashmap where the keys are the paths of decision points in the pattern and the value is the corresponding variant tag required (paths with a wildcard pattern are omitted from the map), as described in section III.

Second, note that *order doesn't matter* for the purpose of exhaustiveness checking. In the case where a value could match multiple patterns, the order determines *which* arm is taken at runtime. For exhaustiveness, we only care about whether *at least one* pattern matches any possible value, not which one. Therefore, we can assume that the input is an unordered *set* of patterns.

Now the algorithm performs the following steps:

1) If the set is empty, no possible values match, and we can stop.

2) If the set contains an empty map (i.e. unconditional wildcard pattern), *every* possible value matches and we can stop early.

3) If there is a pattern that contains only a single path/tag, remove it, along with every other pattern containing the same path/tag pair. Mark that tag as definitely matched and continue with the remaining set. (This is equivalent to decomposing with an *open* simple match, i.e. one containing a wildcard at the end).

4) Now we check if we can decompose with a *closed* simple match. If every pattern contains the same path, remove that path, split the set into subsets grouped by tag, and then recursively check every one of the smaller sets. If there are multiple possible paths to split on, choose the one that is lexicographically first.

5) At this point, it is impossible to do fully precise exhaustiveness checking, so we just have to continue as best we can by *removing* one or more patterns from the set. Specifically, we find the minimum number of patterns that have to be removed before we can continue decomposition in step 4, and then remove them. As before, ties are broken lexicographically.

> Note: This is the key departure from traditional algorithms. If you **duplicate** and split the problematic cases rather than just removing them, then you get the precise exponential algorithms used in other languages.

## Example

To see how this works, consider the following example of a non-decomposable match:

```ocaml
match expr with 
| (`F, `F, _) -> 0
| (`F, _, `F) -> 1
| (_, `F, `F) -> 2
| (`T, `T, _) -> 3
| (`T, _, `T) -> 4
| (_, `T, `T) -> 5
```

We start with the following set of patterns:

```
(`F, `F, _)
(`F, _, `F)
(_, `F, `F)
(`T, `T, _)
(`T, _, `T)
(_, `T, `T)
```

None of rules 1-4 apply, so we reach rule 5 and have to choose some patterns to discard. The minimum number of removals required to proceed is two, and we break ties by choosing the lexicographically first path (`$._0` in this case). This means we need to remove arms 2 and 5:

```
(`F, `F, _)
(`F, _, `F)
(`T, `T, _)
(`T, _, `T)
```

We can then apply rule 4, resulting in two smaller sets:

```
F -> (`F, _)
     (_, `F)

T -> (`T, _)
     (_, `T)
```

Then we continue recursively on each of these sets, and rule 3 handles everything. The result is the following decomposed tree:

```ocaml
match expr._0 with 
| `F -> (
    match expr._1 with 
    | `F -> 0
    | _ -> (match expr._2 with 
            | `F -> 1
    )
)
| `T -> (
    match expr._1 with 
    | `T -> 3
    | _ -> (match expr._2 with 
            | `T -> 4
    )
)
```

Since the original `match` was not decomposable, we had to remove two arms (2 and 5) in order to decompose it into a tree. Therefore, this tree does not exactly match the original. In particular, the original *was* exhaustive, but the decomposed tree does not cover the cases ```(`F, `T, `T)``` or ```(`T, `F, `F)``` since the match arms that would have covered them were removed. Therefore, this example will result in a compile error.

# VII. Error messages

Now it's time to talk about what the *error messages* look like, as well as some further minor details around exhaustiveness and type checking.

If the exhaustiveness check fails, it yields a possible case that (seemingly) isn't covered by the match patterns. We can suggest that the user add a match arm which handles the missing case.

Therefore, an example like
```ocaml
match expr with 
| (`A, `A) -> 0
| (`B, `B) -> 1
```

Might result in an error message like this:
```
MatchError: Match expression does not handle the case (`A, `B).
match expr with
^~~~~ 
| (`A, `A) -> 0
| (`B, `B) -> 1
```

However, just because we detect a case as unhandled doesn't mean it is *actually* unhandled. Recall the pathological match example from before:

```ocaml
match expr with 
| (`F, `F, _) -> 0
| (`F, _, `F) -> 1
| (_, `F, `F) -> 2
| (`T, `T, _) -> 3
| (`T, _, `T) -> 4
| (_, `T, `T) -> 5
```

If the user got an error like this,

```
MatchError: Match expression does not handle the case (`F, `T, `T).
match expr with
^~~~~ 
| (`F, `F, _) -> 0
| (`F, _, `F) -> 1
```

the user would probably be pretty confused and might think there's a bug in the compiler, because that case *is* handled, by the ignored match arm ```(_, `T, `T) -> 5```.


Therefore, when we detect an exhaustiveness failure, we need to check it against all the ignored patterns to see if the detected case is *actually* unhandled or not. If the case *is* handled by one of the ignored patterns, then we need to display a different error message instead. Instead of telling the user that their match is non-exhaustive, we need to tell them that exhaustiveness *can't be statically verified* and suggest a match arm to split up in order to fix the problem.

```
MatchError: Match exhaustiveness can not be statically verified.
match expr with
^~~~~ 
| (`F, `F, _) -> 0
| (`F, _, `F) -> 1

Hint: Consider splitting this match arm up to make it verifiable:
| (`T, _, `T) -> 4
| (_, `T, `T) -> 5
^~~~~~~~~~~~~~~~~~

You can split it into multiple cases depending on the tag at this position:
| (`T, _, `T) -> 4
| (`F, `T, `T) -> 5
   ++
```

At this point, you might wonder, if we already know that the case is actually handled, why even report an error in the first place? Why not just keep going until we find a case that is *actually* unhandled, and only report an error then?

The answer is that if you do that, you're just back to the naive brute force approach of trying every case one by one. Since there are exponentially many possible cases, this could take an exponentially long time, so it's not an option if you want compilation to be fast.

## Wildcards

To be clear, the imprecision is only an issue if you create a complex non-decomposable match expression *and* you need precise exhaustiveness checking. Usually, in complex cases, people will just add a catch-all wildcard pattern to the end of the match anyway, since it's too much trouble to try to force complex patterns to be perfectly exhaustive (and as mentioned, OCaml even adds catch-all wildcards to match expressions *implicitly*).

In the previous example, the user could solve the exhaustiveness problem by just adding a `_ ->` to the bottom:

```ocaml
match expr with 
| (`F, `F, _) -> 0
| (`F, _, `F) -> 1
| (_, `F, `F) -> 2
| (`T, `T, _) -> 3
| (`T, _, `T) -> 4
| (_, `T, `T) -> 5
| _ -> failwith "This shouldn't actually be reachable"
```

Step 2 in the exhaustiveness checking algorithm exits early as soon as a wildcard is seen, ensuring that this always works. However, the error messages do not suggest adding a catch-all wildcard pattern because we assume that any user who goes to the trouble of writing a complex match with no wildcards probably wants precise checking, and if they ever do give in, they should know how to add a wildcard arm already, since this is a simple and common task. 


# VIII. Closed types

So far, I glossed over the question of how exactly you determine the set of cases that should be checked for exhaustivity. Consider this example:

```ocaml
match (x, y) with
| (`A, `C) -> 0
| (`A, `D) -> 1
| (`B, `D) -> 2
| (`B, `E) -> 3
```

Which decomposes as follows:

```ocaml
match x with 
| `A -> (
    match y with 
    | `C -> 0
    | `D -> 1
)
| `B -> (
    match y with 
    | `D -> 2
    | `E -> 3
)
```

What type should we infer for `(x, y)`? We *could* infer the type ```([`A | `B], [`D])```, which is the most general type that is guaranteed to be handled. The right hand side only handles `C` if the first tag is `A` and only handles `E` if the first tag is `B`, but `D` is handled in both cases. Therefore, *any* value of type ```([`A | `B], [`D])``` is handled, and this is the most general type for which that is true.

However, that is not the behavior I recommend. We should assume that the user will not *deliberately* write unreachable match arms. If the user writes a pattern like ```(`A, `C)```, they probably want `C` to be an accepted tag and will get confused if it is not.

Therefore, in X, the exhaustiveness checker requires that *every explicitly mentioned tag* be covered. In the above example, that would be something like ```([`A | `B], [`C | `D | `E])```. This in turn results in a match error because cases like ```(`A, `E`)``` are not covered. Since the user presumably meant for that to be covered, telling them this up-front is a much better experience than giving them a confusing type error down the line.


Exhaustiveness checking *also* checks whether *other* non-mentioned tags are covered, i.e. the match allows for an *open* variant type. So in reality, it would be checking against ```([`A | `B | any], [`C | `D | `E | any])```. However, if the wildcard part *isn't* covered, the checker *does not produce an exhaustiveness error*. Instead, it just removes the relevant wildcard from the inferred types (this is how it is possible to infer a closed variant type).

The reason for this difference in behavior is that when the user writes a wildcard pattern, they may not actually intend to handle *every* possible tag. They may just be using it as a shorthand to handle multiple tags that are mentioned elsewhere.

Consider this example:

```ocaml
match expr with 
| (`A, `A) -> 0
| (`B, _) -> 1
| (_, `B) -> 2
```

When the user wrote ```(`B, _)```, they *might* have intended to handle arbitrary tags, e.g. ```(`B, `C)``` or whatever. But more likely, they didn't. More likely, they just wrote that as a shorthand so that the match arm could cover both ```(`B, `A)``` and ```(`B, `B)``` with one pattern. Therefore, we only raise an exhaustiveness error if there is a tag *explicitly mentioned* somewhere in the match expression which is not covered.

## Type errors

As usual with type checking, we need to track the *reason* why the type was closed so that we can provide useful type error messages later. For example, in this code:

```ocaml
let p = `A{};
let q = 42, `A{}, p;
let _ = match q with 
    | (_, `A, _) -> 0
    | (_, `B, `B) -> 1;
```

The inferred type for `q` will be ```(any, [`A | `B], [`B])```, leading to a type error, since the actual tag `A` isn't covered in the last position. The error message will be something like this:

```
TypeError: Unhandled variant A
Note: Value originates with tag `A here:
let p = `A{};
        ^~~~
let q = 42, `A{}, p;
let _ = match q with 

But the case (_, `B, `A) is not handled here:
let p = `A{};
let q = 42, `A{}, p;
let _ = match q with 
        ^~~~~
    | (_, `A, _) -> 0
    | (_, `B, `B) -> 1;
```

This way, the user knows that it is specifically the ```(_, `B, `A)``` case that is not handled (as ```(_, `A, `A)``` is in fact handled).

In PolySubML, the type errors always simply point to the location where the value was used with an incompatible type. But with complex pattern matching, that is not sufficient, since the user won't know which part of the pattern the errant value flowed to, or under which conditions it is not guaranteed to be handled. Thus we need to display a full pattern in the error message to show them an example of a case that isn't handled.


# IX. Conclusion

In this post, we saw how to implement checking for complex pattern matching. Complex pattern matching is much more convenient than the simple pattern matching that Cubiml and PolySubML supported, but it is also tricky to statically check and leads to more complex error messages.

In addition to what was described here, OCaml also supports various extra features in pattern matching such as match guards, or patterns, and constant patterns. Now that we've covered the core algorithms for pattern matching in this post, we'll look at how to handle extra features next week.





{{series_footer}}



