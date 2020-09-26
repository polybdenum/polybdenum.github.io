---
layout: post
title: 'Subtype Inference by Example Part 12: Flow Typing and Mixed Comparison Operators'
series: cubiml
series-num: 12
date: 2020-09-26 08:09 -0700
---
{% include series-util.html %}
{{series_header}}

[Last week]({{prev_url}}), we finished implementing let polymorphism, the final missing piece of the classic Hindley-Milner type system as well as that of Algebraic Subtyping. So far, everything we've implemented has been based on the type system presented in Algebraic Subtyping, or at least on straightforward extensions of that system. 

However, this week we will throw elegance out the window and see some of the exotic features that can be hacked into the type system with cubic biunification. Specifically, we will be implementing mixed comparison operators and flow typing.

## Mixed comparison operators

Recall that when we originally implemented operators, we introduced separate versions of the comparison operators for comparing ints and floats. I.e. you must use `<` for comparing ints but use `<.` for comparing floats. However, it would be nice if we could use the same operator for both, or even compare an int against a float directly.

```ocaml
>> 9007199254740992 > 9007199254740992.0
false

>> 9007199254740992 >= 9007199254740992.0
true

>> 9007199254740993 > 9007199254740992.0
true
```

Up until now, there's been a beautiful symmetry between our value and use type heads. However, it's time to break that by adding a new use type head, `UIntOrFloat`, with no corresponding value type.

```diff
     UFloat,
     UInt,
     UStr,
+    UIntOrFloat,
     UFunc {
         arg: Value,
         ret: Use,
```

Next, we need to update `check_heads` to use the new head type. A `UIntOrFloat` will match against a `VInt` _or_ a `VFloat` on the left hand side. This is a pretty trivial change code wise, but it still strays quite far from anything envisioned in the original Algebraic Subtyping thesis.

```diff
         (&VFloat, &UFloat) => Ok(()),
         (&VInt, &UInt) => Ok(()),
         (&VStr, &UStr) => Ok(()),
+        (&VInt, &UIntOrFloat) => Ok(()),
+        (&VFloat, &UIntOrFloat) => Ok(()),
 
         (&VFunc { arg: arg1, ret: ret1 }, &UFunc { arg: arg2, ret: ret2 }) => {
             out.push((ret1, ret2));
```

Lastly, we update the AST, grammar, typechecker frontend, etc. to use the new type. This is pretty straightforward, so I won't cover it in depth.

```diff
--- a/src/ast.rs
+++ b/src/ast.rs
@@ -31,8 +31,7 @@ pub enum OpType {
     FloatOp,
     StrOp,
 
-    IntCmp,
-    FloatCmp,
+    IntOrFloatCmp,
     AnyCmp,
 }
 
--- a/src/core.rs
+++ b/src/core.rs
@@ -169,6 +172,7 @@ fn check_heads(
                 UFloat => "float",
                 UInt => "integer",
                 UStr => "string",
+                UIntOrFloat => "float or integer",
                 UFunc { .. } => "function",
                 UObj { .. } => "record",
                 UCase { .. } => "case",
@@ -269,6 +273,9 @@ impl TypeCheckerCore {
     pub fn str_use(&mut self, span: Span) -> Use {
         self.new_use(UTypeHead::UStr, span)
     }
+    pub fn int_or_float_use(&mut self, span: Span) -> Use {
+        self.new_use(UTypeHead::UIntOrFloat, span)
+    }
 
     pub fn func(&mut self, arg: Use, ret: Value, span: Span) -> Value {
         self.new_val(VTypeHead::VFunc { arg, ret }, span)

--- a/src/grammar.lalr
+++ b/src/grammar.lalr
@@ -164,15 +164,10 @@ AddOp: Box<ast::Expr> = {
     },
 }
 CmpOpSub: (ast::OpType, ast::Op) = {
-    "<" => (ast::OpType::IntCmp, ast::Op::Lt),
-    "<=" => (ast::OpType::IntCmp, ast::Op::Lte),
-    ">" => (ast::OpType::IntCmp, ast::Op::Gt),
-    ">=" => (ast::OpType::IntCmp, ast::Op::Gte),
-
-    "<." => (ast::OpType::FloatCmp, ast::Op::Lt),
-    "<=." => (ast::OpType::FloatCmp, ast::Op::Lte),
-    ">." => (ast::OpType::FloatCmp, ast::Op::Gt),
-    ">=." => (ast::OpType::FloatCmp, ast::Op::Gte),
+    "<" => (ast::OpType::IntOrFloatCmp, ast::Op::Lt),
+    "<=" => (ast::OpType::IntOrFloatCmp, ast::Op::Lte),
+    ">" => (ast::OpType::IntOrFloatCmp, ast::Op::Gt),
+    ">=" => (ast::OpType::IntOrFloatCmp, ast::Op::Gte),
 
     "==" => (ast::OpType::AnyCmp, ast::Op::Eq),
     "!=" => (ast::OpType::AnyCmp, ast::Op::Neq),

--- a/src/typeck.rs
+++ b/src/typeck.rs
@@ -90,16 +90,9 @@ fn check_expr(engine: &mut TypeCheckerCore, bindings: &mut Bindings, expr: &ast:
                     engine.flow(rhs_type, rhs_bound)?;
                     engine.str(*full_span)
                 }
-                IntCmp => {
-                    let lhs_bound = engine.int_use(*lhs_span);
-                    let rhs_bound = engine.int_use(*rhs_span);
-                    engine.flow(lhs_type, lhs_bound)?;
-                    engine.flow(rhs_type, rhs_bound)?;
-                    engine.bool(*full_span)
-                }
-                FloatCmp => {
-                    let lhs_bound = engine.float_use(*lhs_span);
-                    let rhs_bound = engine.float_use(*rhs_span);
+                IntOrFloatCmp => {
+                    let lhs_bound = engine.int_or_float_use(*lhs_span);
+                    let rhs_bound = engine.int_or_float_use(*rhs_span);
                     engine.flow(lhs_type, lhs_bound)?;
                     engine.flow(rhs_type, rhs_bound)?;
                     engine.bool(*full_span)
```

## Flow typing

In modern programming languages, you can use _case types_ (aka sum types) to represent values that might have one of several possible values and/or types in a way that can be checked statically by the compiler. For example, the below cubiml code implements a singleton pattern that calls the provided initialization function at most once, using a case type with cases `None` and `Some` to represent the states where the data is uninitialized and already initialized respectively.

```ocaml
let lazy_init = fun init_cb ->
    let cache = ref `None {} in
    fun _ ->
        match !cache with
        | `Some val -> val
        | `None _ -> (
                let val = init_cb {} in
                let _ = cache := `Some val in
                val
            );
```

However, older languages, particularly C inspired ones, may not have case types. However, the need for expressing values that have one of multiple possibilities doesn't go away just because the language doesn't support it well. Instead, programmers in these languages resort to simulating case types implicitly, without the language support or static type checking of true case types.

For example, in a C-style language, a programmer might write the above code using a null pointer to represent the uninitialized state and a non-null pointer to represent the initialized state. Whenever they read the value, they then need to check it against null before using it, but there is no compiler assistance to enforce this. In fact, forgetting to check for null values is such a common bug that null pointers are often called "the billion dollar mistake".

Type systems and type inference are usually discussed in the context of designing a new language. However, it is also possible to create new type checkers for _existing_ programming languages. Doing so is much harder because you no longer have the power to shape language features to facilitate type checking and instead have to work with whatever ad-hoc code patterns programmers were using in the legacy code you wish to analyze. 

However, the payoffs are also great, since it allows you to catch bugs in a vast ecosystem of existing legacy code. Most efforts in this regard have focused on C and Javascript due to their immense economic importance matched only by their immense error-proneness. For example, Typescript is an effort to improve type checking of JS code.

Additionally, even when designing a new language, you may need to add null pointers for interoperability with existing languages. For example, Kotlin supports sum types via sealed classes and when expressions, but it still has null pointers as well for Java interoperability.


### Null safety

Typechecking legacy code means finding ways to deal with the existing code patterns, and that usually means adding a limited form of flow sensitive typing. Today I'll demonstrate one of the simplest cases, static null safety checking.

Our goal is to statically ensure that a potentially null value is never used without first checking it against null via `if x != null then ...` or similar code. To do this, we recognize such if expressions and treat them specially in the typechecker, treating them like a match against an implicit case type.

However, there is another complication - how to expose the refined types. Our match expression syntax was designed from the ground up for handling case types, so each branch binds a new variable which has the appropriate type. For example, in 

```ocaml
match foo with
    | `None _ => ...
    |  non_null_foo => ...
```

The `non_null_foo` variable will have the same type as `foo`, except with the `None` case statically removed. However, if we are trying to convert legacy if expressions to pattern matching, we don't have that luxury. A normal if statement doesn't introduce any new variables which we can give the refined type to.

Therefore, we restrict the special case handling to the case of if expressions where the condition is of the form `foo == null` or `foo != null`, where `foo` is a _local variable_ (not an arbitrary expression). Then, within the appropriate branch, we can give that variable the refined type _in place_. Our goal is to implement something like the following

```ocaml
(*  Create a value that might be null, at least from the 
    typechecker's point of view. *)
let s = if true then "Hello" else null;

(* s has type "string | null" here *)
if s != null then 
    (*  Within this branch, s instead has the type "string".
        String concatenation is allowed here since s is 
        statically known to be a string and not null. *)
    s ^ " world!" 
else 
    (*  We could give s the type "null" here, but that's 
        pretty much useless, so we'll just leave its
        type unchanged on the "null" branch *)
    "error, unexpected null";

(* s has type "string | null" again here *)
s
```





### Null values

To start with, we need to add null values to cubiml. We add a new primitive type, `null`, to the type system, and a new literal `null` that creates a value of that type. This is pretty straightforward, since adding primitive types follows the exact same process that we previously followed for other primitive types like booleans and strings. The only difference is that there is a null value type but no null use type.


```diff
@@ -5,6 +5,7 @@ pub enum Literal {
     Bool,
     Float,
     Int,
+    Null,
     Str,
 }

@@ -17,6 +17,7 @@ enum VTypeHead {
     VBool,
     VFloat,
     VInt,
+    VNull,
     VStr,
     VFunc {
         arg: Use,
@@ -161,6 +162,7 @@ fn check_heads(
                 VBool => "boolean",
                 VFloat => "float",
                 VInt => "integer",
+                VNull => "null",
                 VStr => "string",
                 VFunc { .. } => "function",
                 VObj { .. } => "record",
@@ -257,6 +259,9 @@ impl TypeCheckerCore {
     pub fn int(&mut self, span: Span) -> Value {
         self.new_val(VTypeHead::VInt, span)
     }
+    pub fn null(&mut self, span: Span) -> Value {
+        self.new_val(VTypeHead::VNull, span)
+    }
     pub fn str(&mut self, span: Span) -> Value {
         self.new_val(VTypeHead::VStr, span)
     }

@@ -38,6 +38,7 @@ VarOrLiteral: Box<ast::Expr> = {
     Spanned<Ident> => Box::new(
         match <>.0.as_str() {
             "false" | "true" => ast::Expr::Literal(ast::Literal::Bool, <>),
+            "null" => ast::Expr::Literal(ast::Literal::Null, <>),
             _ => ast::Expr::Variable(<>)
         }
     ),

@@ -160,6 +160,7 @@ fn check_expr(engine: &mut TypeCheckerCore, bindings: &mut Bindings, expr: &ast:
                 Bool => engine.bool(span),
                 Float => engine.float(span),
                 Int => engine.int(span),
+                Null => engine.null(span),
                 Str => engine.str(span),
             })
         }
```

### Null check types

Next, we need to add a null check _use_ type to the type system.

```rust
UNullCase {
    nonnull: Use,
},

pub fn null_check_use(&mut self, nonnull: Use, span: Span) -> Use {
    self.new_use(UTypeHead::UNullCase { nonnull }, span)
}
```

Note that the span parameter is never actually used here, but we still have to include it since the current design stores a span for _every_ type node,

Next, we add support in `check_heads`.

```rust
(&VNull, &UNullCase { .. }) => Ok(()),
(_, &UNullCase { nonnull }) => {
    out.push((Value(lhs_ind), nonnull));
    Ok(())
}
```

Checking this type is pretty simple. It's basically just an extremely stripped down version of the wildcard case matches we covered before. If the left hand side is a non-null value, we add a flow constraint from it to the `nonnull` field of the use type, analogously to the `wildcard` field of case use types. If the left hand side is a null value, we just do nothing.

We also need to add it to the fallthrough branch of `check_heads` since Rust isn't smart enough to realize that it will never be involved in a type error due to matching against _any_ value type on the left hand side.
```diff
                 UObj { .. } => "record",
                 UCase { .. } => "case",
                 URef { .. } => "ref",
+                UNullCase { .. } => unreachable!(),
             };
```

### Frontend null checks

Now comes the most complicated part - actually making use of this type. The bulk of the work is done in the typechecker frontend. Recall that we want to find expressions of the form `if foo == null then...` or `if foo != null then...` and treat them specially.

To do this, we find the branch in the frontend that handles `If` expressions, and insert a bunch of code to look for the `if foo != null then...` pattern and do something different in that case.


```rust
// Handle conditions of the form foo == null and foo != null specially
if let BinOp((lhs, _), (rhs, _), ast::OpType::AnyCmp, op, ..) = &**cond_expr {
    if let Variable((name, _)) = &**lhs {
        if let Literal(ast::Literal::Null, ..) = **rhs {
            let lhs_type = check_expr(engine, bindings, lhs)?;

            // Flip order of branches if they wrote if foo == null instead of !=
            let (ok_expr, else_expr) = match op {
                ast::Op::Neq => (then_expr, else_expr),
                ast::Op::Eq => (else_expr, then_expr),
                _ => unreachable!(),
            };

            let (nnvar_type, nnvar_bound) = engine.var();
            let bound = engine.null_check_use(nnvar_bound, *span);
            engine.flow(lhs_type, bound)?;

            let ok_type = bindings.in_child_scope(|bindings| {
                bindings.insert(name.clone(), nnvar_type);
                check_expr(engine, bindings, ok_expr)
            })?;
            let else_type = check_expr(engine, bindings, else_expr)?;

            let (merged, merged_bound) = engine.var();
            engine.flow(ok_type, merged_bound)?;
            engine.flow(else_type, merged_bound)?;
            return Ok(merged);
        }
    }
}
```

This is a pretty big chunk of code, so let's break it down. First off, we check if the if condition is of the form `foo == null` or `foo != null`, where `foo` is a local variable. Then we grab the (unrefined) type of that variable and store it in `lhs_type`.

```rust
if let BinOp((lhs, _), (rhs, _), ast::OpType::AnyCmp, op, ..) = &**cond_expr {
    if let Variable((name, _)) = &**lhs {
        if let Literal(ast::Literal::Null, ..) = **rhs {
            let lhs_type = check_expr(engine, bindings, lhs)?;            
```

Next, we find the AST subexpressions corresponding to the branches of the if expression when the checked variable is non-null or null. For `!= null` comparisons, these are just the then and else branches of the if expression respectively. For `== null` comparisons, the branches are reversed.

```rust
// Flip order of branches if they wrote if foo == null instead of !=
let (ok_expr, else_expr) = match op {
    ast::Op::Neq => (then_expr, else_expr),
    ast::Op::Eq => (else_expr, then_expr),
    _ => unreachable!(),
};
```

Next, we need to refine `lhs_type` to get the "non-null version" of the type.
```rust
let (nnvar_type, nnvar_bound) = engine.var();
let bound = engine.null_check_use(nnvar_bound, *span);
engine.flow(lhs_type, bound)?;
```
This process is very similar to that of wildcard case matches, except it's much simpler because there's only one branch. Recall that `null_check_use` takes in a use type parameter. In `check_heads`, whenever a value type head is checked against the resulting use type head `UNullCase`, we add a flow constraint from the left hand (value) type to the use type stored inside the right hand side when the left hand side is non-null. When the left hand side is null, we do nothing. 

Here is what will happen, step by step in the type checker, assuming that `lhs_type` has the type `string | null`.

* add flow `VString -> lhs_type_bound` where `lhs_type_bound` is the "left side" of the `lhs_type` type variable (by assumption)
* add flow `VNull -> lhs_type_bound` (by assumption)
* `bound = UNullCase{nonnull=nnvar_bound}`
* add flow `lhs_type -> bound`. 
    * due to reachability, this generates calls to `check_heads(VString, bound)` and `check_heads(VNull, bound)`
* `check_heads(VString, bound)`:
    * `VString` is not null, so we add the flow constraint `VString -> bound.nonnull`.
    * `bound.nonnull = nnvar_bound`, so this means that `VString` flows to `nnvar_bound`.
    * Since `nnvar_bound` is the "left half" of the variable represented by `nnvar_type`, this means that `nnvar_type` "sees" the `VString`. We can think of `nnvar_type` as now being the type `string`.
* `check_heads(VNull, bound)`:
    * `VNull` is null, so we don't take any further action

The end result is that `nnvar_type` has the type `string` when `lhs_type` has the type `string | null`. Essentially, it is the non-nullified version of `lhs_type` as expected.


Next, we typecheck the non-null branch in a new bindings environment where the variable has the refined type `nnvar_type` instead of `lhs_type`.

```rust
let ok_type = bindings.in_child_scope(|bindings| {
    bindings.insert(name.clone(), nnvar_type);
    check_expr(engine, bindings, ok_expr)
})?;
```

We typecheck the null branch in the original bindings environment, where the variable has the unrefined type `lhs_type`. We _could_ refine its type to just plain `null` here, but there's no real point, because cubiml doesn't let you do anything with the fact that the variable is guaranteed to be null at a given point. Only a guarantee of non-nullness is actually useful. 
```rust
let else_type = check_expr(engine, bindings, else_expr)?;
```

Lastly, we "union together" the result types of the two branches by creating flow constraints to a new temporary variable as usual, and then return the union type.
```rust
let (merged, merged_bound) = engine.var();
engine.flow(ok_type, merged_bound)?;
engine.flow(else_type, merged_bound)?;
return Ok(merged);
```

### Handling polymorphism

The above code mostly works, but there is a problem with it. When adding special case behavior to existing language constructs, it's important to make sure that doing so does not randomly break unrelated code. Unfortunately, the implementation above potentially breaks polymorphic code. Consider the following example:


```ocaml
let id = fun x -> x;

if id != null then
    let _ = (id 1) + 3 in
            (id "x") ^ "y"
else {}
```

The above code calls `id` with multiple, incompatible types. However, thanks to let polymorphism, it should still work, and in fact, without the special-cased null check behavior, it does work. Unfortunately, the above implementation of null checking magically replaces `id`'s polymorphic type scheme in the environment with a _monomorphic_ refined type, resulting in a spurious type error:

```
TypeError: Value is required to be a integer here,

if id != null then
    let _ = (id 1) + 3 in
            ^~~~~~       
            (id "x") ^ "y"
else {}
But that value may be a string originating here.
if id != null then
    let _ = (id 1) + 3 in
            (id "x") ^ "y"
                ^~~       
else {}
```

Thanks to our laziness when implementing the value restriction last week, this is pretty easy to fix. Since we only generalize function definitions, we know that a polymorphic type scheme will always represent a function type, and hence be non-null. Therefore, it's safe to simply skip such cases and not bother trying to refine the type at all.

```rust
if let Some(scheme) = bindings.get(name.as_str()) {
    if let Scheme::Mono(lhs_type) = scheme {
        // same code as before...
    }
}
```

The cubiml implementation only performs the null-checking for `if foo != null then ...` when `foo` has a monomorphic type in the current bindings. We can get away with that since the overly conservative implementation of the value restriction means that polymorphic type schemes are always just function types. 

However, if you implement the _full_ value restriction, type schemes can represent arbitrary types, potentially including null values, so you must do the null checking polymorphically as well. If you use the recommended optimized approach to implementing let polymorphism of pre-computing a type graph and then copying that graph on demand, then this is just a matter of creating a _new_ type scheme with the same pre-computed type graph except with the null check node added to the graph.

```rust
// Handle conditions of the form foo == null and foo != null specially
if let BinOp((lhs, _), (rhs, _), ast::OpType::AnyCmp, op, ..) = &**cond_expr {
    if let Variable((name, _)) = &**lhs {
        if let Literal(ast::Literal::Null, ..) = **rhs {
            if let Some(scheme) = bindings.get(name.as_str()) {
                if let Scheme::Mono(lhs_type) = scheme {
                    // Flip order of branches if they wrote if foo == null instead of !=
                    let (ok_expr, else_expr) = match op {
                        ast::Op::Neq => (then_expr, else_expr),
                        ast::Op::Eq => (else_expr, then_expr),
                        _ => unreachable!(),
                    };

                    let (nnvar_type, nnvar_bound) = engine.var();
                    let bound = engine.null_check_use(nnvar_bound, *span);
                    engine.flow(*lhs_type, bound)?;

                    let ok_type = bindings.in_child_scope(|bindings| {
                        bindings.insert(name.clone(), nnvar_type);
                        check_expr(engine, bindings, ok_expr)
                    })?;
                    let else_type = check_expr(engine, bindings, else_expr)?;

                    let (merged, merged_bound) = engine.var();
                    engine.flow(ok_type, merged_bound)?;
                    engine.flow(else_type, merged_bound)?;
                    return Ok(merged);
                }
            }
        }
    }
}
```

Above is the complete, fixed version of the code. It's pretty ugly, but good enough for the purposes of demonstration. If you decide to make more extensive use of flow typing in your language, you will need to refactor things a bit to do the checks more cleanly, since ad-hoc insertions like this quickly pile up and start to cause bugs. Ideally, you'll be able to unify your flow typing implementation with the code that handles pattern matching, since they're doing basically the same thing under the hood.

Next week, we will push the type system even further by adding conditional flow edges to the type checker (aka presence variables) and see how to do arbitrary computations in the type system at compile time.

{{series_footer}}
