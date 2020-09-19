---
layout: post
title: 'Subtype Inference by Example Part 11: The Value Restriction and Polymorphic Recursion'
series: cubiml
series-num: 11
date: 2020-09-19 07:28 -0700
---
{% include series-util.html %}
{{series_header}}

In the [last post]({{prev_url}}), we covered a very basic implementation of _let polymorphism_, which allows let-bound functions to be called with different types at each callsite. Unfortunately, it is also unsound when combined with mutation. Today, we will see how to fix the unsoundness using _the value restriction_.

## The value restriction

Recall that the following example incorrectly passes the typechecker and crashes at runtime.

```ocaml
let p = ref (fun x -> x);
(* 42 is a callable function, right? *)
p := 42;
!p "arg"
```
```
An error occurred during evaluation in the repl: TypeError: $.v0.$p is not a function
```

The issue is that in the typechecker, we treat `let` expressions as if the body was duplicated whenever the variable is referenced but only output a single copy in the compiled code. This works for immutable code, but not for code containing references, because the underlying code creates a _single_ reference that is shared by all uses of that variable. In order to fix this, we need to ensure that reference types are always shared, rather than duplicated.

To make things even more complicated, it is undesirable to _always_ force references to be monomorphic. Consider the following example:

```ocaml
let id = fun x ->
    let temp = ref x in
        !temp;

(id 1) + 3;
(id "x") ^ "y";
```

The use of a reference is an implementation detail of our new `id` function, and we wouldn't want it to prevent `id` from being polymorphic. In fact, it is safe to let `id` be polymorphic in this case because every call to the `id` function will generate a _fresh_ reference at runtime, so the `id 1` and `id "x"` calls aren't sharing mutable state at all.

To solve this problem, SML introduced the _value restriction_. This basically states that a let-bound variable should only be made polymorphic if all references and function calls within its definition appear inside of function definitions.

Prior to the value restriction, SML used a much more complicated system that tried to track which functions might potentially contain mutable state. However, this is complicated and error prone and leads to undesirable restrictions as shown above. The value restriction basically throws up its hands and assumes that _any_ function may potentially leak mutable state and instead restricts function _calls_. 

Basically, any "bare" use of references (or function calls, which are considered tantamount to references in this system) forces monomorphization. However, if those references or function calls are "protected" by appearing inside a function definition, it is ok to make that function polymorphic since the body of the function will be re-executed whenever it is called and create new references as applicable.

### Implementing the value restriction

For now, we won't bother implementing the full value restriction, since that would require writing a new set of AST-walking code to recursively check for the presence of references and function calls. Instead, we'll use a conservative approximation and only generalize let variables where the right hand side is a function definition directly, achieving 95% of the use case of let polymorphism with 5% of the effort.

```rust
fn check_let(engine: &mut TypeCheckerCore, bindings: &mut Bindings, expr: &ast::Expr) -> Result<Scheme> {
    if let ast::Expr::FuncDef(..) = expr {
        // Right hand side is a function definition - ok to make it polymorphic
        let saved_bindings = RefCell::new(Bindings {
            m: bindings.m.clone(),
            changes: Vec::new(),
        });
        let saved_expr = expr.clone();

        let f: Rc<dyn Fn(&mut TypeCheckerCore) -> Result<Value>> =
            Rc::new(move |engine| check_expr(engine, &mut saved_bindings.borrow_mut(), &saved_expr));

        f(engine)?;
        Ok(Scheme::Poly(f))
    } else {
        // Right hand side is something other than a function definition
        // treat it monomorphically for now.
        // TODO - implement the recursive value restriction checks
        let var_type = check_expr(engine, bindings, expr)?;
        Ok(Scheme::Mono(var_type))
    }
}
```

In our new `check_let` function, we check whether `expr` is a `FuncDef`. If it is, we return a polymorphic type scheme as before. Otherwise, we just eagerly type check the body and return a monomorphic type.

The previous example of unsoundness now results in a type error at compile time as expected.

```
TypeError: Value is required to be a function here,
(* 42 is a callable function, right? *)
p := 42;
!p "arg"
^~      
But that value may be a integer originating here.
let p = ref (fun x -> x);
(* 42 is a callable function, right? *)
p := 42;
     ^~ 
!p "arg"
```

## Polymorphic recursion

Now that we have regular `let` expressions out of the way, it's time to add polymorphism for `let rec`s. Recall that the way we typecheck a `let rec` definition is to create a type variable, add it to the environment, typecheck the right hand side of the definition with that environment, and then add a flow constraint from that result to the original variable. 

The use of a temporary type variable seems like it would prevent us from inferring polymorphic schemes for `let rec` expressions. In fact, it is true that a `let rec`-bound variable must be monomorphic within the scope of its own definition. 

```ocaml
let rec id = fun x ->
    (* id must be monomorphic here *)
    let _ = (id 1) + 3 in
    (* so this results in a type error *)
    let _ = (id "x") ^ "y" in
    x;
```

For example, the above code defines a normal identity function `id` using `let rec`, except that the `id` function also calls itself with different types. Since `id` is just set to a (monomorphic) type variable while evaluating the definition, this will necessarily result in a type error. 

```
TypeError: Value is required to be a string here,
    let _ = (id 1) + 3 in
    (* so this results in a type error *)
    let _ = (id "x") ^ "y" in
            ^~~~~~~~         
    x;

But that value may be a integer originating here.
let rec id = fun x ->
    (* id must be monomorphic here *)
    let _ = (id 1) + 3 in
                ^        
    (* so this results in a type error *)
    let _ = (id "x") ^ "y" in
```

This is not merely an artifact of the algorithm we are using; it is a fundamental limitation. Allowing _polymorphic recursion_, where a recursive function is allowed to call itself with different types, makes type inference undecidable, no matter the algorithm used.

However, there are no such issues preventing us from inferring a scheme for a `let rec`-bound variable _outside_ of its definition. For example, consider the following silly recursive `id` implementation:

```ocaml
let rec id = 
    fun x ->
        if true then
            x
        else
            (* id is monomorphic here *)
            id(x);

(* But it is safe to make id polymorphic here 
    now that we're done typechecking its definition *)
(id 1) + 3;
(id "x") ^ "y";
```

The above function is essentially equivalent to the normal, non-recursive `id` implementation, so it would be nice if we could use it polymorphically as well. Luckily, we can. The trick is that once we're doing evaluating the recursive definition, we turn it into a polymorphic scheme and _replace_ the binding, changing it from a monomorphic temporary variable to the resulting polymorphic scheme. That way, any code outside of the recursive definition can use it polymorphically.

```rust
fn check_let_rec_defs(
    engine: &mut TypeCheckerCore,
    bindings: &mut Bindings,
    defs: &Vec<(String, Box<ast::Expr>)>,
) -> Result<()> {
    let saved_bindings = RefCell::new(Bindings {
        m: bindings.m.clone(),
        changes: Vec::new(),
    });
    let saved_defs = defs.clone();

    let f: Rc<dyn Fn(&mut TypeCheckerCore, usize) -> Result<Value>> = Rc::new(move |engine, i| {
        saved_bindings.borrow_mut().in_child_scope(|bindings| {
            let mut temp_vars = Vec::with_capacity(saved_defs.len());
            for (name, _) in &saved_defs {
                let (temp_type, temp_bound) = engine.var();
                bindings.insert(name.clone(), temp_type);
                temp_vars.push((temp_type, temp_bound));
            }

            for ((_, expr), (_, bound)) in saved_defs.iter().zip(&temp_vars) {
                let var_type = check_expr(engine, bindings, expr)?;
                engine.flow(var_type, *bound)?;
            }

            Ok(temp_vars[i].0)
        })
    });
    f(engine, 0)?;

    for (i, (name, _)) in defs.iter().enumerate() {
        let f = f.clone();
        let scheme = Scheme::Poly(Rc::new(move |engine| f(engine, i)));
        bindings.insert_scheme(name.clone(), scheme);
    }
    Ok(())
}
```

As usual, the actual implementation of polymorphic `let rec`s is complicated horrifically by the need to potentially handle multiple mutually recursive definitions. On the bright side, we don't have to worry about the value restriction in this case since we previously defined `let rec`s to only allow function definitions on the right hand side at the language grammar level. If you decide to relax that restriction, you'll of course have to add the check back here.

## The relaxed value restriction

The original value restriction proved to be overly burdensome in OCaml, so OCaml actually uses a slightly modified variant called the _relaxed value restriction_ which accepts more programs than the classic value restriction while still maintaining soundness.

However, it turns out that the relaxed value restriction is basically just a hack to make up for OCaml's lack of subtyping. The issue stems from the fact that there are values which can naturally be given monomorphic types in the presence of subtyping but require polymorphism to express without subtyping. 

For example, consider the case of a generic immutable list type, `List[T]`. Since the lists are immutable, `T` is covariant, rather than invariant, as described in [the post four weeks ago]({% post_url 2020-08-22-subtype-inference-by-example-part-8-mutability %}). The question is, _What is the type of an empty immutable list_?

An empty list should be usable any place a list of strings would be expected, of a list of ints, or any other type of list. With subtyping, the answer is easy. The empty list just has type `List[Bot]`, where `Bot` is the bottom type, the subtype of all other types. Thanks to covariance, this means `List[Bot]` is a subtype of `List[T]` for all `T` as desired, no polymorphism necessary.

However, without subtyping, this isn't possible. You have to choose a specific value for `T`. Give the empty list the type `List[int]` and it can't be mixed with lists of strings, and vice versa. Therefore, without subtyping, there is no monomorphic type that makes sense for empty lists. You instead have to give it the _polymorphic_ type scheme `forall T => List[T]`. 

Unfortunately, this combines with the value restriction to make it impossible to usefully return empty lists from functions. Therefore, OCaml added the relaxed value restriction, which states that an expression which the value restriction would otherwise prohibit from being polymorphic can still be made polymorphic if every type parameter of the resulting type scheme appears only in covariant or contravariant position, but not both. 

However, this is just the set of types that can be monomorphically typed with subtyping! Covariant-only type parameters can just be assigned `Bot` as above, while contravariant-only type parameters can be assigned `Top`, the _supertype_ of all types. Subtyping gives us the relaxed value restriction _for free_.

## Performance

Our lazy implementation of let polymorphism is hideously inefficient due to recursively rerunning the type checker every time a variable is referenced. Naturally, it is also the _best possible_ in terms of worst case runtime complexity. (╯°□°)╯︵ ┻━┻

### The iron law of computational complexity

What I like to call "the iron law of computational complexity" is the somewhat unintuitive observation that the more powerful an algorithm is, the slower it must be, at least in the worst case. Suppose you're studying some new problem `FOO`, and discover that `SAT` (boolean satisfiability, a notoriously hard problem) can be reduced to `FOO`, meaning that an algorithm to solve `FOO` would also let you solve `SAT`. The layperson might think "Great news! Once we solve FOO, we'll also be able to solve SAT. This is surely a great breakthrough on the road to solving SAT!" whereas the complexity theorist sighs and thinks "Welp, I guess there's no hope of solving FOO either then." 

It turns out that you can't bluff math just by adding extra layers of indirection. An algorithm is at least as slow in the worst case as the time required to solve the hardest problem it can solve. In the case of type inference, this means that every increase in the precision (i.e. power) of the type system comes at a cost. 

Programmers love powerful type systems because it lets them check more complicated invariants in the code, but it is that very capability which makes type inference slower. In the case of subtyping, the added power of subtyping means going from nearly-linear time type inference to type inference which requires cubic time in the worst case (under plausible hardness assumptions). In this light, let polymorphism comes at a very high cost indeed. Type inference of let polymorphism requires _exponential_ time.

### Exponential blowup

To see this, consider the following code pattern.

```ocaml
let f = fun x -> x;
let f2 = fun x -> f (f x);
let f3 = fun x -> f2 (f2 x);
let f4 = fun x -> f3 (f3 x);
let f5 = fun x -> f4 (f4 x);
```

`f2` calls `f` twice, and thus copies its type twice. `f3` calls `f2` twice, and thus copies `f2` twice, which means copying `f` _four times_. Then `f4` copies it eight times and so on, resulting in an exponential explosion.

You may wonder whether this is merely a weakness of the current algorithm that could be fixed with sufficiently clever memoization and the like. In the toy example above, it of course could be, since all the f functions just simplify down to `fun x -> x`. But in general, the answer is no.

In the above example, `f` is just the identity function, but the example works the same regardless of which function `f` is. If we replace `f` with an _arbitrary_ function, `f2` still calls `f` twice on its argument. Then `f3` calls `f2` twice, which is equivalent to calling `f` four times, and so on. Let polymorphism allows us to concisely express an exponential number of calls to an arbitrary function _with different types for each call_. This conciseness is both its strength and its fatal flaw.

In particular, it is possible to write a function `f` which simulates a single step of an arbitrary Turing machine _at the type level_, where the old and new state of the machine are encoded in the input and output types of the function. Calling `f` multiple times _polymorphically_ simulates the Turing machine for multiple steps, so type checking our nested polymorphic `fn` functions requires simulating an arbitrary Turing machine for `2^n` steps _at compile time_. Since the machine's state is encoded in the output type, you can write code that will either typecheck or produce a type error depending on whether an arbitrary Turing machine halts in at most `2^n` steps or not. Therefore, it is impossible to do better than exponential time in the worst case, no matter how clever your algorithm.

Incidentally, polymorphic recursion allows you to express an _infinite_ number of calls to a given function with different types for each call, meaning that a finite amount of code can require simulating infinite steps of a Turing machine at compile time. This helps explain why polymorphic recursion makes type inference undecidable.

### Optimization

In this series, I have deliberately avoided doing any optimizations except where necessary to improve the worst case complexity. The primary reason was to keep the code as simple as possible to make it easier to follow. However, another reason is that worst case complexity is an objective measure, whereas "real world performance" is variable and highly dependent on the benchmark. It is often the case that whether a particular change makes the compiler faster or slower in practice depends entirely on what kind of code you use it on in practice. The lack of existing languages with subtyping makes this especially problematic, since it means a lack of real world code written with subtyping, making it hard to test and profile different compiler designs.

That being said, optimizing the implementation of let polymorphism is pretty important if you want to use it in a real language, so I figured I'd be remiss not to at least summarize the techniques that compilers use to make it "fast in practice". 

The most important step is to avoid re-running the entire type checking logic whenever a type scheme is instantiated. Instead, just run it once to produce a type graph, and then copy that graph using fresh type variables whenever the scheme is instantiated. To ensure soundness, be sure to stop the copying once you hit parts of the graph that were defined outside the scope of the `let` definition. To further speed things up, you can limit the copying to variables where both "ends" are still reachable, and apply all the usual simplification techniques to reduce the size of the graph being copied in the first place.

## Conclusion

With let polymorphism under our belts, we've now implemented all the "essential" features of ML style type inference. Next week, we'll add more exotic features like flow typing and mixed comparison operators.



{{series_footer}}
