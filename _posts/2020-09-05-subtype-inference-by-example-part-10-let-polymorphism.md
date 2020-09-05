---
layout: post
title: 'Subtype Inference by Example Part 10: Let Polymorphism'
series: cubiml
series-num: 10
date: 2020-09-05 07:51 -0700
---
{% include series-util.html %}
{{series_header}}

[Last week]({{prev_url}}), we added inexhaustive matches and record extension to cubiml. Today we will tackle _let polymorphism_.

## Let polymorphism

Up until now, everything in the type system has been _monomorphic_, meaning that a single type is inferred for each expression. However, in some cases, this is unduly restrictive. Consider the following code example

```ocaml
let id = fun x -> x;

(id 1) + 3;
(id "x") ^ "y";
```

Currently, this results in a type error because `id` is forced to be monomorphic, giving it the inferred type `(int & string) -> (int | string)`. Essentially, monomorphism means that the compiler considers the arguments from _any_ call to a function to potentially flow to the result of _every_ call to that function. Therefore, if we call the function with ints and later with strings, they get mixed together in the function type, resulting in an error. 

In order to make the above code typecheck, we need to add _context sensitivity_ to the typechecker, making the compiler keep different calls to the same function separate and understand that only the arguments to a specific call may flow to the result of that specific call.

The Hindley-Milner system handles this via a feature known as _let polymorphism_. Basically, when inferring the type of a let bound variable (i.e. `let v = e1 in e2`), instead of inferring a single, monomorphic type for `v`, we instead infer a _type scheme_. 

### Type schemes

A type scheme is basically a template that can be used to stamp out new types on demand. For let-bound variables, we store the type scheme in the typing environment instead of a single type. Whenever the variable is referenced, the scheme is used to stamp out a new type which is specific to that particular usage of the variable.

In the code example above, without let polymorphism, `id` would have the inferred type `T -> T`. In this case, `T` is a single type variable, which means every use of `id` must share the _same_ value of `T` leading to the errors above. With let polymorphism, we instead infer the type scheme `forall T => (T -> T)`. This says that whenever `id` is referenced, we create a _new_ type variable and then return the type `T -> T` where `T` is the newly created variable. This means that different uses of `id` will have _different_ type variables `T` that don't interact at all, meaning that one could be substituted with `int` and another with `string` without causing any spurious type errors.

### Lazy let polymorphism

There are a number of ways to implement let polymorphism, but for now, we'll just go with the simplest and laziest possible implementation to make things easier to understand, even if it is slower than more optimized implementations.

Recall that the problem in the previous code example is that we want to be able to reuse the (let-bound) `id` function with different types every time it is referenced. Without polymorphism, we can still work around that by simply duplicating the code of the function whenever it is referenced. For example, if the above code were rewritten as follows, it would type check even without let polymorphism:

```ocaml
let id = fun x -> x
    in  (id 1) + 3;

let id = fun x -> x
    in  (id "x") ^ "y";   
```

Basically, the goal of let polymorphism is to be able to write a function and have the typechecker treat it as if it were duplicated whenever it is referenced for type checking purposes, but still have only one actual copy of the function at runtime. The simplest way to achieve this is to just rerun the typechecker on the definition code whenever the type scheme is instantiated (with some caveats we'll cover later).

## Implementation

Previously, we stored plain types in the frontend's typing environment (the map of variable names to previously inferred types). So to start, we need to modify it to store type schemes instead. 

```rust
#[derive(Clone)]
enum Scheme {
    Mono(Value),
    Poly(Rc<dyn Fn(&mut TypeCheckerCore) -> Result<Value>>),
}

struct Bindings {
    m: HashMap<String, Scheme>,
    changes: Vec<(String, Option<Scheme>)>,
}
```

Previously, bindings stored a `String -> Value` map. We define a new enum `Scheme` and change it to a `String -> Scheme` map. Note that the terminology here is slightly different than above. Our `Scheme` enum can store either a plain, monomorphic type (for function arguments and recursive variables) or a polymorphic type scheme (for let bound variables).

```rust
Poly(Rc<dyn Fn(&mut TypeCheckerCore) -> Result<Value>>),
```

In the later case, our enum stores a closure object, which can be called to stamp out new types on demand. It takes in a reference to the typechecker core, uses it to create any new type variables as applicable, and returns a new monomorphic type.

Next up, we have to update the code for handling `Variable` nodes in the AST:

```rust
Variable((name, span)) => {
    if let Some(scheme) = bindings.get(name.as_str()) {
        match scheme {
            Scheme::Mono(v) => Ok(*v),
            Scheme::Poly(cb) => cb(engine),
        }
    } else {
        Err(SyntaxError::new1(format!("SyntaxError: Undefined variable {}", name), *span))
    }
}
```

Previously, we just looked up the type in the bindings map. Now we look up the `Scheme` enum in the bindings map. If it contains a type, we use that, otherwise we call the contained closure to generate a fresh new type.

### Inferring type schemes

With that out of the way, it's time to actually create some type schemes. Recall that previously, our `Let` handling code was duplicated between handling `let` expressions and top level `let` definitions. Since we'll be making more complicated changes to it, I've gone ahead and refactored it to the `check_let` function to avoid duplication.

```rust
Let((name, var_expr), rest_expr) => {
    let var_scheme = check_let(engine, bindings, var_expr)?;
    bindings.in_child_scope(|bindings| {
        bindings.insert_scheme(name.clone(), var_scheme);
        check_expr(engine, bindings, rest_expr)
    })
}
```

Now comes the interesting part— `check_let` itself.

```rust
fn check_let(engine: &mut TypeCheckerCore, bindings: &mut Bindings, expr: &ast::Expr) -> Result<Scheme> {
    let saved_bindings = RefCell::new(Bindings {
        m: bindings.m.clone(),
        changes: Vec::new(),
    });
    let saved_expr = expr.clone();

    let f: Rc<dyn Fn(&mut TypeCheckerCore) -> Result<Value>> =
        Rc::new(move |engine| check_expr(engine, &mut saved_bindings.borrow_mut(), &saved_expr));

    f(engine)?;
    Ok(Scheme::Poly(f))
}
```
This might look a bit scary, but all it's doing is creating a closure that typechecks the given `Expr` and returns the resulting type. 

```rust
let saved_bindings = RefCell::new(Bindings {
    m: bindings.m.clone(),
    changes: Vec::new(),
});
let saved_expr = expr.clone();
```
First, we need to copy the typing environment and the ast subtree so we can store them in the closure. This isn't strictly necessary. It's possible to eliminate the AST copies and most of the binding copies by making a few changes elsewhere in the code, but for now we're going with the really lazy implementation approach to minimize the code changes required. (We do however have to mark the AST node type as cloneable. Failing to do so results in a very confusing compiler error in Rust, so watch out for that.)

```rust
let f: Rc<dyn Fn(&mut TypeCheckerCore) -> Result<Value>> =
    Rc::new(move |engine| check_expr(engine, &mut saved_bindings.borrow_mut(), &saved_expr));
```
After that, we just create the closure object. Sadly, Rust requires an explicit type annotation here.

```rust
f(engine)?;
Ok(Scheme::Poly(f))
```
Finally, we invoke the closure and then return a `Scheme` containing the closure. The first point is a bit subtle. Recall that our current implementation basically just typechecks the body of a `let` definition whenever the variable is referenced. However, cubiml has _strict_ execution semantics, which means we need to typecheck the definition at least once, even if the variable is never referenced. 

For example, consider the following code:
```ocaml
let x = false + 34 in
    "hello, world!";
```

Without the extra `f(engine)?` call above, the erroneous `false + 34` addition would pass the typechecker instead of returning an error, because the variable `x` is never referenced, and hence its scheme callback is never invoked.

Note that if you do variable resolution in a separate pass beforehand (which is a good idea anyway), you can eliminate the need for this check by marking (or even optimizing away) unused variables during variable resolution.

### The value restriction

Unfortunately, we're not quite done. The above code mostly works, but it is unsound when combined with mutation. Consider the following example:

```ocaml
let p = ref (fun x -> x);
(* 42 is a callable function, right? *)
p := 42;
!p "arg"
```

This example falsely passes the typechecker and crashes at runtime.
```
An error occurred during evaluation in the repl: TypeError: $.v0.$p is not a function
```

Next week, we'll see how to fix this issue using _the value restriction_.


{{series_footer}}
