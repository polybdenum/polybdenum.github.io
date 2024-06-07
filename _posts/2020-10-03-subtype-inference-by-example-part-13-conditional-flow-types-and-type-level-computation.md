---
layout: post
title: 'Subtype Inference by Example Part 13: Conditional Flow Constraints, Presence
  Polymorphism, and Type Level Computation'
series: cubiml
series-num: 13
date: 2020-10-03 06:52 -0700
---
{% include series-util.html %}
{{series_header}}

[Last week]({{prev_url}}), we covered adding some more exotic features to cubiml, and in particular covered _flow typing_, a method of simulating case types (aka sum types) in languages that don't already have them. Today we will take a different track and improve the precision of native case types (making the equivalent changes to the simulated null case types from the previous post is left as an exercise to the reader, but follows very similar steps to those below.)

## Conditional flow constraints

Recall that case types are a way to create values that can represent one of several possibilities (with potentially different types) at runtime, in a way that can safely be matched at runtime. 

For example, the below code demonstrates a function that can take one of several shapes and compute its area. Importantly, this is all checked at compile time. If you try to pass a case that isn't handled, or pass the wrong type with a case that is handled, you'll get a type error at compile time.

```ocaml
let area = fun arg ->
    match arg with
        | `Square x -> x.len *. x.len
        | `Rect x -> x.height *. x.width;

area `Square {len=4.};
area `Rect {height=4.; width=2.5};

let area2 = fun arg ->
    match arg with
        | `Circle x -> x.radius *. x.radius *. 3.1415926
        | x -> area x;

area2 `Square {len=4.};
area2 `Rect {height=4.; width=2.5};
area2 `Circle {radius=1.2}
```

A match is allowed to handle cases that the caller never actually passes. At runtime, only the particular branch relating to the matched case will be executed. However, at compile time, match expressions are treated as if every branch could potentially be taken. For example, consider the following code

```ocaml
let increment = fun x ->
    match x with
        | `Int i -> i + 1
        | `Float f -> f +. 1.0;

(increment `Int 7) * -3
```

This results in a type error:
```
TypeError: Value is required to be a integer here,
        | `Float f -> f +. 1.0;

(increment `Int 7) * -3
^~~~~~~~~~~~~~~~~~     
But that value may be a float originating here.
    match x with
        | `Int i -> i + 1
        | `Float f -> f +. 1.0;
                      ^~~~~~~~ 

(increment `Int 7) * -3
```

At runtime, the increment function will return an int if you pass the `Int` case to it, and a float if you pass the `Float` case. However, the typechecker treats it as if every branch is always taken and thus infers the return type `int | float`. In this week's post, we will see how to fix this. But first a little disclaimer.

### Disclaimer

The main barrier to increased type precision is technical - which features can be implemented with what complexity? If a feature is not technically feasible to implement, there's no point in discussing it further, so that's what we've concerned ourselves with. 

However, just because you _can_ implement a feature doesn't mean you necessarily _should_. Sometimes, a less precise type system can actually be a good thing. For example, it's pretty easy to design a type checker that skips checking dead code entirely. However, typechecking unreachable code can still be useful for detecting additional bugs. Furthermore, making the type system less precise sometimes results in it being easier for programmers to mentally model and reason about, making the language less confusing.

To this end, the feature we'll be implementing today is a bit of a compromise. It still type checks every branch of a match expression, even unreachable ones, but only the potentially taken branches will contribute to the result type of the expression.

### Type system design

Recall that the typechecker frontend currently runs the following code for each branch of the match expression:

```rust
let (wrapped_type, wrapped_bound) = engine.var();
case_type_pairs.push((tag.clone(), wrapped_bound));

let rhs_type = bindings.in_child_scope(|bindings| {
    bindings.insert(name.clone(), wrapped_type);
    check_expr(engine, bindings, rhs_expr)
})?;
engine.flow(rhs_type, result_bound)?;
```

For our purposes, the most important part is the last line, which adds a flow constraint from `rhs_type`, the type of the match arm's right hand side, to `result_bound`, the result type of the match expression as a whole. Instead of adding this flow edge immediately, we want to instead store these nodes in the typechecker and only add the edge lazily once the branch is determined to actually be in use.

To start with, we add a typedef for a (value, use) pair representing a deferred flow constraint.
```rust
pub type LazyFlow = (Value, Use);
```

Then we add it to each branch of the case use type head and corresponding constructor function.
```rust
UCase {
    cases: HashMap<String, (Use, LazyFlow)>,
    wildcard: Option<(Use, LazyFlow)>,
},
```
```diff
     }
-    pub fn case_use(&mut self, cases: Vec<(String, Use)>, wildcard: Option<Use>, span: Span) -> Use {
+    pub fn case_use(&mut self, cases: Vec<(String, (Use, LazyFlow))>, wildcard: Option<(Use, LazyFlow)>, span: Span) -> Use {
         let cases = cases.into_iter().collect();
```

Next, we update the `check_heads` implementation. This is the most important part, type system-wise, but it's surprisingly simple. All we do is that whenever we check a case type, we also add the lazy flow constraint from the corresponding branch to the list of pending flow constraints. (Note the new `out.push(lazy_flow)` lines below.)
```rust
// Check if the right case is handled
if let Some((rhs2, lazy_flow)) = cases2.get(name).copied() {
    out.push((lhs2, rhs2));
    out.push(lazy_flow);
    Ok(())
} else if let Some((rhs2, lazy_flow)) = wildcard {
    out.push((Value(lhs_ind), rhs2));
    out.push(lazy_flow);
    Ok(())
} else {
```

Finally, we also have to update the code in the typechecker frontend.
```rust
let (wrapped_type, wrapped_bound) = engine.var();
let rhs_type = bindings.in_child_scope(|bindings| {
    bindings.insert(name.clone(), wrapped_type);
    check_expr(engine, bindings, rhs_expr)
})?;

case_type_pairs.push((tag.clone(), (wrapped_bound, (rhs_type, result_bound))));
```

Where we previously had `engine.flow(rhs_type, result_bound)`, we now just add the `(rhs_type, result_bound)` pair to `case_type_pairs`, which in turn gets passed to the typechecker core constructor function defined previously.

And likewise, we do the same thing with the code handling the wildcard branch, if any.

```rust
let (wrapped_type, wrapped_bound) = engine.var();
let rhs_type = bindings.in_child_scope(|bindings| {
    bindings.insert(name.clone(), wrapped_type);
    check_expr(engine, bindings, rhs_expr)
})?;

wildcard_type = Some((wrapped_bound, (rhs_type, result_bound)));
```

And that's it! The code example above now passes the typechecker. However, there are still some subtleties about the design to note.

### Polymorphism and conditional flow

At runtime, any given evaluation of a match expression will only result in a single branch being evaluated (and that branch's value being returned.) However, our code adds the type of a match arm to the result type for the match expression if that branch is reachable from _any_ call anywhere in the program.

This means that if we call `increment` with both the `Int` and `Float` cases, the result type will once again be `int | float` and we'll once again get a type error.

```ocaml
let id = fun x -> x;
(* Use id to force increment to be monomorphic *)
let increment = id (fun x ->
    match x with
        | `Int i -> i + 1
        | `Float f -> f +. 1.0);

(increment `Int 7) * -3;
(increment `Float 7.0) *. -3.0
```
```
TypeError: Value is required to be a integer here,
        | `Float f -> f +. 1.0);

(increment `Int 7) * -3;
^~~~~~~~~~~~~~~~~~      
(increment `Float 7.0) *. -3.0
But that value may be a float originating here.
    match x with
        | `Int i -> i + 1
        | `Float f -> f +. 1.0);
                      ^~~~~~~~  

(increment `Int 7) * -3;
```

This might make the feature seem pretty useless. What's the point of ignoring dead code when the programmer could just delete the dead code anyway? In fact, this feature basically is useless _for monomorphic code_. However, when combined with let polymorphism, the story changes completely.

In the previous example, we wrapped the definition of `increment` in a call to `id` in order to force monomorphization (recall that the value restriction does not take kindly to function calls). If we modify the above example to remove that call and let `increment` be polymorphic, it no longer produces a type error.

```ocaml
let increment = fun x ->
    match x with
        | `Int i -> i + 1
        | `Float f -> f +. 1.0;

(increment `Int 7) * -3;
(increment `Float 7.0) *. -3.0
```

This is because when `increment` is polymorphic, a fresh, independent copy of the type gets stamped out for every use, and the conditional flow only triggers for match arms reachable by callers _to that specific copy_. In the monomorphic case, a match arm is only unused if it is unused by all callers everywhere, in which case the code could simply be deleted. In the polymorphic case, a match arm might be unused at some callsites while still being in use by other callers elsewhere. It essentially turns the match expression type into "only pay for what you use" on a callsite by callsite basis.

### Presence variables

This kind of type feature is sometimes referred to as presence polymorphism, a close cousin of row polymorphism. We can describe the type scheme of the `increment` function above as ``forall Pi, Pf => (`Int int if Pi | `Float float if Pf) -> (int if Pi | float if Pf)``, where rather than the usual type variables `T` and `U` that range over monotypes, `Pi` and `Pf` are _presence variables_ that indicate the presence or absence of a case. 

## Type level computation

Type level computation is not a specific feature we will be implementing in the type system. Rather it is a cool but impractical trick you can do using the features we already implemented, and in particular using conditional flow constraints.

The key insight is that conditional flow allows us to perform operations on types _conditionally_ during type checking. Conditions are of course not required for type level computation- you can implement arbitrary computation on types even with just lambda calculus. However, the ability to use conditions makes it much easier and more natural. 

Without conditions, you have to encode everything into branchless code, [SPMD-style](https://pharr.org/matt/blog/2018/04/21/ispc-volta-c-and-spmd.html#making-spmd-on-simd-happen). Not only is this a pain to do, but it makes memory access highly inefficient. To perform random memory access in branchless code, you have to scan through the entire memory space on every single access and only keep the result for the one location you actually need. Conditional flow instead lets you write type level computations in a much more natural and efficient manner.

Recall from the previous post on the performance of let polymorphism that let polymorphism allows you to concisely compose an exponential number of calls to a single function with different types. Therefore, we will write a function that performs a single step of work, with the "program state" represented by the input and output types to the function. Then we use polymorphism to call that function a large number of times, essentially "running" our program for the desired number of steps.

### Compile time fibonacci

For the sake of demonstration, we will be implementing a function to compute Fibonacci numbers at compile time. Fibonacci numbers are easy to calculate. Typically, you would use something like the following code:

```ocaml
let rec fib_sub = fun args ->
    if args.n <= 0 then 
        args.a
    else
        fib_sub {n=args.n - 1; a=args.a + args.b; b=args.a};

let fib = fun n -> fib_sub {n=n; a=1; b=1};
fib 12
```

However, we want to do the computation using types at compile time, which requires a much more unusual coding style. In particular, we can't use loops or recursion. Instead, we have to perform a single step of the calculation and then "return" back the state. Additionally, we can't use regular integers, so we have to create our own.

### Type level integers

In order to do math at the type level, we need a way of representing integers where each integer is a distinct type. Traditionally, this is done using a unary encoding, but for efficiency, we'll use binary instead. 

Each number is represented as a string of binary digits, where each digit is represented using a case type variant. To make them easy to work with, we'll use little endian numbers (the least significant digit appears on the left when written in code) and have a special tag `End` to mark the end of the number. Here are some examples of the encoding:

```ocaml
let end = `End {};

let one = `1 end;
let two = `0`1 end;
let seven = `1`1`1 end;
let twelve = `0`0`1`1 end;
let million_and_eighty_seven = `1`1`1`0`1`0`0`1`0`1`0`0`0`0`1`0`1`1`1`1 end;
```

Then we need to write helper functions to increment, decrement, and add these encoded numbers, digit by digit.

```ocaml
let end = `End {};

(* Decrement x by 1. If x is already zero, return `Error,
    else, return `Ok (x - 1) *)
let rec decrement = fun x ->
    match x with
    | `End _ -> `Error {}
    | `1 xs -> `Ok `0 xs
    | `0 xs -> (
        match decrement xs with
        | `Ok xs_dec -> `Ok `1 xs_dec
        | _ -> _
    );

(* Add args.x + 1 *)
let rec increment = fun x ->
    match x with
    | `End _ -> `1 end
    | `0 xs -> `1 xs
    | `1 xs -> `0 (increment xs);

(* Add args.x + args.y *)
let rec add = fun args ->
    match args.y with
    | `End _ -> args.x
    | `0 ys -> add_shifted {x=args.x; ys=ys}
    | `1 ys -> add_shifted {x=increment args.x; ys=ys}
and add_shifted = fun args ->
    (* Add args.x + (args.ys << 1) *)
    match args.x with
    | `End _ -> `0 args.ys
    | `0 xs -> `0 (add {x=xs; y=args.ys})
    | `1 xs -> `1 (add {x=xs; y=args.ys})
    ;

let rec fib_sub = fun args ->
    match decrement args.n with
    | `Error _ -> args.a
    | `Ok n ->
        fib_sub {n=n; a=add {x=args.a; y=args.b}; b=args.a};


let fib = fun n -> fib_sub {n=n; a=`1 end; b=`1 end};
fib `0`0`1`1 end
```

### Simulating recursion

The above code still doesn't run at compile time due to the use of recursion. In order to do type level computations, we need to "unwrap" all the recursion and simulate a call stack. Each of our helper functions will take in a stack frame containing fields `val`, `stack`, and optionally other fields. `val` is set to whatever got "returned" by the previous function call. `stack` is the next frame on the stack. Any other fields in the frame are just what got saved when the frame was initially created.

Instead of making function calls directly, our functions will instead just push the name of the function to be called onto the stack and return the new stack. Then we have a `tick` function that just pops from the stack and calls the appropriate function.

Additionally, we need to split up each function into separate functions at every point where it calls a function so that we have a place to "return" to. For example, we can convert the `increment` function to this style as follows, adding an `increment2` function to handle pushing the final `` `0 `` onto the recursively "returned" value.

```ocaml
(* Add frame.val + 1 *)
let increment = fun frame ->
    match frame.val with
    | `End _ -> {frame | val=`1 end}
    | `0 xs -> {frame | val=`1 xs}
    | `1 xs -> (
        (* call increment2 (increment xs) *)
        (* where increment2 = fun x -> `0 x *)
        {val=xs; stack=`Increment {stack=`Increment2 {stack=frame.stack}}}
    );
let increment2 = fun frame -> {frame | val=`0 frame.val};
```

We can then call our increment function as follows
```ocaml
let tick = fun state ->
    match state.stack with
    | `Increment frame -> increment {frame | val=state.val}
    | `Increment2 frame -> increment2 {frame | val=state.val}
    (* if the computation is done, just return the state unchanged *)
    | `Done _ -> state
    ;

(* set up initial state to call increment `1`1`0`1 end *)
let state = {val=`1`1`0`1 end; stack=`Increment {stack=`Done {}}};
let state = tick state;
let state = tick state;
let state = tick state;
let state = tick state
```

Importantly, our increment function is computed _at compile time_, so we can make assertions about the result at compile time. For example, the below code asserts that the result is `` `0`0`1`1 end``. If it is anything else, we get an error at compile time.

```ocaml
match state.stack with | `Done _ -> _;
match state.val with | `0 x ->
    (match x with | `0 x ->
    (match x with | `1 x ->
    (match x with | `1 x ->
    (match x with | `End _ -> _))))
```

Incrementing numbers isn't that exciting, so let's go ahead and convert the rest of our fibonacci calculating code.

```ocaml
let end = `End {};

let push0 = fun frame -> {frame | val=`0 frame.val};
let push1 = fun frame -> {frame | val=`1 frame.val};

(* Add frame.val + 1 *)
let increment = fun frame ->
    match frame.val with
    | `End _ -> {frame | val=`1 end}
    | `0 xs -> {frame | val=`1 xs}
    | `1 xs -> (
        (* call push0 (increment xs) *)
        (* where push0 = fun x -> `0 x *)
        {val=xs; stack=`Increment {stack=`Push0 {stack=frame.stack}}}
    );

(* Decrement frame.val, with initial bit of return value representing status
    if frame.val is zero, returns `0 end to represent an error state
    otherwise, returns `1 (n-1). *)
let decrement = fun frame ->
    match frame.val with
    | `End _ -> {frame | val=`0 end}
    | `1 xs -> {frame | val=`1`0 xs}
    | `0 xs -> (
        (* call decrement2 (decrement xs) *)
        {val=xs; stack=`Decrement {stack=`Decrement2 {stack=frame.stack}}}
    );
let decrement2 = fun frame ->
    match frame.val with
    | `1 xs_dec -> {frame | val=`1`1 xs_dec}
    (* when val represents an error, return it unchanged *)
    | `0 _ -> {frame | val=`0 end}
    (* this case isn't actually reachable, but is needed for type checking *)
    | `End _ -> {frame | val=`0 end}
    ;

(* add frame.val + (frame.ys << 1) *)
let add_shifted = fun frame ->
    match frame.val with
    (* this case isn't actually reachable, but is needed for type checking *)
    | `End _ -> {val=`0 frame.ys; stack=frame.stack}
    | `0 xs -> (
        (* call push0 (add {val=xs; y=ys}) *)
        {val=xs; stack=`Add {y=frame.ys; stack=`Push0 {stack=frame.stack}}}
    )
    | `1 xs -> (
        (* call push1 (add {val=xs; y=ys}) *)
        {val=xs; stack=`Add {y=frame.ys; stack=`Push1 {stack=frame.stack}}}
    );

(* add frame.val + frame.y *)
let add = fun frame ->
    match frame.y with
    (* when y=0, return frame.val unchanged *)
    | `End _ -> frame
    | `0 ys -> add_shifted {val=frame.val; ys=ys; stack=frame.stack}
    | `1 ys ->  (
        (* call add_shifted {val=increment frame.val; ys=ys} *)
        increment {val=frame.val; stack=`AddShifted {ys=ys; stack=frame.stack}}
    );

(* computes an iteration of the fibonacci calculations:
    fib_sub (n, a, b) -> (n-1, a+b, a) where a=frame.val*)
let fib_sub = fun frame -> decrement {val=frame.n; stack=`FibSub2 {a=frame.val; b=frame.b; stack=frame.stack}};

(* note that here, val is the "n" value rather than the "a" value *)
let fib_sub2 = fun frame ->
    match frame.val with
    (* this case isn't actually reachable, but is needed for type checking *)
    | `End _ -> {val=frame.a; stack=frame.stack}
    | `0 _ -> {val=frame.a; stack=frame.stack}
    | `1 n -> {val=frame.a; stack=`Add {y=frame.b; stack=`FibSub {n=n; b=frame.a; stack=frame.stack}}};

let tick = fun state ->
    match state.stack with
    | `Push0 frame -> push0 {frame | val=state.val}
    | `Push1 frame -> push1 {frame | val=state.val}
    | `Increment frame -> increment {frame | val=state.val}
    | `Decrement frame -> decrement {frame | val=state.val}
    | `Decrement2 frame -> decrement2 {frame | val=state.val}
    | `AddShifted frame -> add_shifted {frame | val=state.val}
    | `Add frame -> add {frame | val=state.val}
    | `FibSub frame -> fib_sub {frame | val=state.val}
    | `FibSub2 frame -> fib_sub2 {frame | val=state.val}
    (* if the computation is done, just return the state unchanged *)
    | `Done _ -> state
    ;
```

Now we can test it by running the program for 256 ticks, which is enough to calculate the first 12 fibonacci numbers.

```ocaml
let tick2 = fun state -> tick (tick state);
let tick3 = fun state -> tick2 (tick2 state);
let tick4 = fun state -> tick3 (tick3 state);
let tick5 = fun state -> tick4 (tick4 state);
let tick6 = fun state -> tick5 (tick5 state);
let tick7 = fun state -> tick6 (tick6 state);
let tick8 = fun state -> tick7 (tick7 state);
let tick9 = fun state -> tick8 (tick8 state);

let fib9 = fun n ->
    (* set up the initial state to call fib_sub *)
    tick9 {val=`1 end; stack=`FibSub {n=n; b=`1 end; stack=`Done {}}};
```

The 12th fibonacci number is 377, or `` `1`0`0`1`1`1`1`0`1 end `` in binary. 
```ocaml
(* compute the 12th fibonacci number *)
let state = fib9 `0`0`1`1 end;
match state.stack with | `Done _ -> _;
(* the 12th fibonacci number is 377 = 0b101111001 *)
match state.val with | `1 x ->
    (match x with | `0 x ->
    (match x with | `0 x ->
    (match x with | `1 x ->
    (match x with | `1 x ->
    (match x with | `1 x ->
    (match x with | `1 x ->
    (match x with | `0 x ->
    (match x with | `1 x ->
    (match x with | `End _ -> _)))))))))
```
You can verify that it was all computed at compile time in the demo below. Changing any of the digits in the output assertion at the end will result in a compile time type error. Warning: compiling this program can be quite slow. I chose 256 ticks since that worked reasonably well on my computer, but if the demo starts getting too slow, try refreshing the page.

## Demo

<script src="/demos/cubiml/p13/demo.js"></script>
<noscript><em><strong>Error: This demo requires Javascript to run.</strong></em></noscript>
<cubiml-demo></cubiml-demo>

## Conclusion

Now that we've pushed the type system to its limits, next week I'll start covering how to add explicit type annotations. So far I've avoided them because the important part of this series is the type inference and adding new features to the type system is a lot more complicated and annoying when you have to update everything in multiple places and handle them in the manual type annotation syntax as well. But just because it's possible to write an entire program with no type annotations doesn't mean that it's necessarily a good idea, and so it's important to support type annotations in a "real-world" programming language.


{{series_footer}}
