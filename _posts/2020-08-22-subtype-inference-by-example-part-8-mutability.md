---
layout: post
title: 'Subtype Inference by Example Part 8: Mutability'
series: cubiml
series-num: 8
date: 2020-08-22 06:54 -0700
---
{% include series-util.html %}
{{series_header}}

[Last week]({{prev_url}}), we added improved error messages to the cubiml compiler. This week, we'll return to feature development and add mutability to the language and type system.

Up until now, everything in cubiml has been immutable, meaning that it is impossible to change a value once created. Mutability is often maligned since it increases the potential for bugs, but it also allows many algorithms to be expressed much more naturally and is essential for writing efficient code. We will be implementing mutability in the form of ML-style _references_. 

## References

Traditional imperative languages support mutability in many forms - mutable local variables, mutable struct fields, etc. However, in order to keep cubiml simple, we've been implementing each concept with a single dedicated feature in the type system and minimal syntactic sugar. For example, cubiml functions always take exactly one argument. If you want a function to take multiple arguments, you can instead simulate that by passing a record with multiple fields to the function. 

In the same manner, all mutability in cubiml is done through the reference type. You can simulate traditional mutable fields by storing a reference in a record field, and a mutable variable by storing a reference in a variable and so on.

ML references are not quite the same as what you may be used to. They are pointers to a mutable, garbage collected storage location on the heap and support three operations:

* `ref x` creates a new reference that initially holds the value `x`. Note that this _copies_ the value of `x` to a new location and returns a pointer to that location. `ref foo.bar` returns a pointer to a location that is initialized with the value of `foo.bar`, rather than a pointer to the field of `foo` itself.
* `!r` _dereferences_ the reference `r` and returns whatever value is currently stored inside. This is another example where ML-style and C-style syntax differ confusingly.
* `r := x` _stores_ `x` inside the reference `r`, overwriting whatever value was previously stored there. Traditionally, this operation returns a unit value (i.e. empty record), but we'll follow the approach of C-style assignments as Javascript does, where assignment returns the new value, since that's easier to implement when compiling to Javascript. You'll probably want to do things differently in your own language, but it's an easy change to make.

Note that references may be aliased. For example, we can create a reference `a` and copy it to the variable `b`. Then any changes made via `b` are visible via `a` and vice versa, as shown in the following REPL session.

```
>> let a = ref 42

ref 42

>> let b = a

ref 42

>> b := 77

77

>> !a

77
```

We can also see that creating a reference does not affect the original value.

```
>> let foo = {bar = 12}

{bar=12}

>> let r = ref foo.bar

ref 12

>> r := 77

77

>> foo.bar

12
```

## Variance

Before we add references to the core type system, we need to introduce the concept of _variance_. We briefly touched on this in earlier posts when dealing with function types, but it's time to explain it in more depth.

When considering subtyping with generic types, there are two main types of type parameters, _covariant_ and _contravariant_. 

_Covariant_ types are ones where the parent type follows the same subtype relationship as the type parameter. For example, if we have a generic type `Foo[T]` with covariant type parameter `T`, and we have types `A` and `B`, where `A` is a subtype of `B`, then `Foo[A]` is a subtype of `Foo[B]`. Most of the time, this is what you want.

_Contravariant_ types are ones where the subtyping relationship is _reversed_. If we have types `A` and `B`, where `A` is a subtype of `B`, then `Foo[B]` is a subtype of `Foo[A]`. The most common example is the argument type of a function. Suppose you have a function that takes an `A`. You can call it with an `A`, but not with a `B`, since `B` is a supertype of `A`, i.e. it is less specific than `A`. Now consider a function that takes a `B`. You can call it with an `A` _or_ you can call it with a `B`. This function is strictly more general than before, so it is a _subtype_ of a function that requires an `A`. In fact, functions are contravariant in their argument type and covariant in their return type.

However, there is a third possible kind of variance: an _invariant_ type parameter. As their name suggests, invariant type parameters do not induce any subtype relationships in their parents. If we have types `A` and `B`, where `A` is a subtype of `B`, then there is no subtype relationship between `Foo[A]` and `Foo[B]` in either direction. We can only assign one `Foo` to another if their type parameters are _equal_.

Invariant types are typically used for mutable data structures. For example, consider what variance a list type `List[T]` should have. If the list is immutable (read only), the answer is easy - `T` should be covariant. Suppose we again have types `A < B`, and consider `List[A]` and `List[B]`. Since we're talking about immutable lists, the only available operation is to read from them. `List[B]`'s contract is that `get()` always returns a `B`. Now look at `List[A]`. `get()` returns an `A`, but `A` is a subtype of `B`, so it also returns a `B`! Therefore, `List[A]` is strictly more general and we have `List[A] < List[B]`.

When the lists are mutable, everything changes. `List[B]`'s contract is that `set()` takes in a `B`. However `List[A]`'s `set()` method can't handle arbitrary `B`s. It can only handle `A`, which is a subtype of `B`. Therefore `List[A]` can't be a subtype of `List[B]`. However, `List[B]` can't be a subtype of `List[A]` either, because its `get()` method only returns `B`s, not `A`s. Therefore, when it comes to _mutable_ data structures, the relevant type parameters must be invariant.

On a side note, Java infamously got this wrong with arrays when designing the original language. Despite the fact that Java's arrays are mutable, they decided to make them covariant rather than invariant. This means that 

```java
Object[] foo = new String[1];
foo[0] = new Integer(0);
```

is valid Java code which compiles without errors. When you try to store the `Integer` in the array which can't actually handle it (due to being created to only hold `String`s), you'll get an `ArrayStoreException` _at runtime_.

### Death to invariance!

At this point, you may have noticed an issue. The biunification algorithm is all about propagating _subtype_ constraints. In our `check_heads` function, when checking non-primitive types, we create new flow (i.e. subtype) relations between the component types, either in the same direction for covariant types or in the opposite direction for contravariant types. However, with an invariant type, we would have to somehow create an _equality_ constraint between the component types instead, and biunification is incompatible with equality constraints. 

The solution to this dilemma is to realize that invariance isn't really a fundamental concept, merely a consequence of imprecision when describing a type and conflating the covariant and contravariant parts of that type. 

To illustrate, let's take the mutable list example from before and write out a pseudocode interface for it.

```
class List[T] {
    get(index: int) -> T;
    set(index: int, value: T) -> void; 
}
```

If we look at each method individually, there aren't any issues. In `get`, `T` only appears as the return type, meaning that it can safely be covariant. In `set`, `T` only appears as an argument, meaning that it can safely be contravariant. The only reason we need `T` to be invariant is that we're using a _single_ type parameter for both cases.

Therefore, the solution to eliminating invariance is to replace each invariant type parameter with a _pair_ of type parameters, one covariant and one contravariant. In this case, we might have a `List[W, R]` type, where the covariant `R` parameter describes the types that can be _read_ from the list, while the contravariant `W` parameter describes the types that can be _written_ to the list.

If this sounds a lot like how we previously handled variables in the typechecker then congratulations, you're catching on. In fact, this is also how we solve the problem of ensuring that the new `W` parameter is constrained to be a subtype of the `R` parameter - that is that every read from the list can see every type written to that list. We can leverage the existing design of the typechecker by just creating a variable node and using its two "ends" as the two type parameters!

## Implementation

As usual, we start by adding the new operations to the AST.

```diff
     LetRec(Vec<VarDefinition>, Box<Expr>),
     Literal(Literal, Spanned<String>),
     Match(Box<Expr>, Vec<(Spanned<CaseMatchPattern>, Box<Expr>)>, Span),
+    NewRef(Box<Expr>, Span),
     Record(Spanned<Vec<(Spanned<String>, Box<Expr>)>>),
+    RefGet(Spanned<Box<Expr>>),
+    RefSet(Spanned<Box<Expr>>, Box<Expr>),
     Variable(Spanned<String>),
 }
```

### Grammar

When it comes to adding the new syntax to the language grammar, the main complication is deciding which precedence to use. There were a few considerations when I was choosing precedence levels:

* Dereferencing is a simple operation that you'll likely want to do frequently and inside of more complex expressions. For example, if you have two int references `a` and `b`, you'll probably want to be able to add their values, so stuff like `!a + !b` should work without requiring parenthesis. Likewise, `p := !p + 1` needs to work.
* You should be able to easily dereference chains of nested references, e.g. `!!r`.
* However, making dereferencing a `SimpleExpr` causes a conflict with field access, since it makes code like `!a.b` ambiguous - should it be `(!a).b` or `!(a.b)`? I think most people will expect the latter, so I put it in a new precedence level in between `SimpleExpr` and `CaseExpr`.
* `ref x` uses the same syntax as function calls (`f x`), so it seems like it would make sense to give it the same precedence as function calls, but doing so causes conflicts, and that wouldn't work well in any case since function calls are left associative. Therefore, I put it one level up under `CaseExpr`, which still allows for desirable syntax like passing references to a function call (`f ref x`) and creating references to a case type (``ref `Foo {}``).
* It's rarely useful to take the value of a reference assignment (`r := x`), so I put that at the lowest level of precedence. 
* In the case of `a := b := c`, it makes no sense to parse it as `(a := b) := c`, so the left hand side needs to at least be a `CompareExpr`. However, assigning to the result of an operator makes no sense (they only return primitive types anyway), so I bumped the left hand side all the way up to `CallExpr`.

Anyway, with all that out of the way, here are the new grammar rules.

```diff
@@ -113,6 +113,20 @@ LetRec: Box<ast::Expr> = {
 }
 
 
+NewRef: Box<ast::Expr> = {
+    Spanned<("ref" CaseExpr)> => {
+        let ((_, expr), span) = <>;
+        Box::new(ast::Expr::NewRef(expr, span))
+    }
+}
+RefGet: Box<ast::Expr> = {
+    "!" <Spanned<RefExpr>> => Box::new(ast::Expr::RefGet(<>))
+}
+RefSet: Box<ast::Expr> = {
+    <Spanned<CallExpr>> ":=" <Expr> => Box::new(ast::Expr::RefSet(<>))
+}
+
+
 MultOpSub: (ast::OpType, ast::Op) = {
     "*" => (ast::OpType::IntOp, ast::Op::Mult),
     "/" => (ast::OpType::IntOp, ast::Op::Div),
@@ -167,9 +181,14 @@ SimpleExpr = {
     VarOrLiteral,
     "(" <Expr> ")",
 }
-CaseExpr = {
+RefExpr = {
     SimpleExpr,
+    RefGet,
+}
+CaseExpr = {
+    RefExpr,
     Case,
+    NewRef,
 }
 CallExpr = {
     CaseExpr,
@@ -194,6 +213,8 @@ Expr = {
     Let,
     LetRec,
     Match,
+    RefSet,
 }
 
 TopLevelItem: ast::TopLevel = {
```

### Type nodes

Now comes the most interesting part - adding references to the type system. This of course involves a new variant in the type node head enums:

```diff
     VFunc { arg: Use, ret: Value },
     VObj { fields: HashMap<String, Value> },
     VCase { case: (String, Value) },
+    VRef { write: Option<Use>, read: Option<Value> },
 }
 #[derive(Debug, Clone)]
 enum UTypeHead {
@@ -31,6 +32,7 @@ enum UTypeHead {
     UFunc { arg: Value, ret: Use },
     UObj { field: (String, Use) },
     UCase { cases: HashMap<String, Use> },
+    URef { write: Option<Value>, read: Option<Use> },
 }
```

Recall that references contain two component types: a covariant type indicating the type of values read from the reference and a contravariant type indicating the type of values writable to that reference. However, in our language, any given use of a reference is either a read or a write, not both. Therefore, we need to make the use type head parameters optional. This lets us represent a read to a reference by `UTypeHead{write: None, read: Some(T)}` and a write to a reference by `UTypeHead{read: None, write: Some(T)}`.

As far as the _value_ type head goes, there's no particular need to make the parameters optional, but we've done so here anyway for consistency. This also has the nice side effect of making it possible to represent read-only or write-only reference values. Our language doesn't have any syntax to actually create such values, but it's still a useful demonstration of how to do it, should you want to add them to your own language. 

Read-only and write-only reference types are particularly useful in a language which supports explicit type annotations (so far omitted from cubiml for simplicity). For example, you could create a mutable reference and then manually assign it a read-only reference type before passing it to some other code to statically ensure that that code does not modify the reference you passed it.


Next, we add references to our `check_heads` implementation.

```rust
(&VRef { read: r1, write: w1 }, &URef { read: r2, write: w2 }) => {
    if let Some(r2) = r2 {
        if let Some(r1) = r1 {
            out.push((r1, r2));
        } else {
            return Err(TypeError::new2(
                "TypeError: Reference is not readable.\nNote: Ref is made write-only here",
                lhs.1,
                "But is read here.",
                rhs.1,
            ));
        }
    }
    if let Some(w2) = w2 {
        if let Some(w1) = w1 {
            // flip the order since writes are contravariant
            out.push((w2, w1));
        } else {
            return Err(TypeError::new2(
                "TypeError: Reference is not writable.\nNote: Ref is made read-only here",
                lhs.1,
                "But is written here.",
                rhs.1,
            ));
        }
    }
    Ok(())
}
```

As mentioned previously, cubiml does not have any syntax for creating read-only or write-only references, so it is not actually possible to reach these checks. However, I've included them here anyway for the sake of illustration.


```diff
@@ -88,6 +118,7 @@ fn check_heads(lhs: &(VTypeHead, Span), rhs: &(UTypeHead, Span), out: &mut Vec<(
                 VFunc { .. } => "function",
                 VObj { .. } => "record",
                 VCase { .. } => "case",
+                VRef { .. } => "ref",
             };
             let expected = match rhs.0 {
                 UBool => "boolean",
@@ -97,6 +128,7 @@ fn check_heads(lhs: &(VTypeHead, Span), rhs: &(UTypeHead, Span), out: &mut Vec<(
                 UFunc { .. } => "function",
                 UObj { .. } => "record",
                 UCase { .. } => "case",
+                URef { .. } => "ref",
             };
 
             Err(TypeError::new2(
```

To round out the implementation in the typechecker core, we need to add references to the pair of match expressions used to display types when generating error messages, and add the constructor functions to the public interface.

```rust
pub fn reference(&mut self, write: Option<Use>, read: Option<Value>, span: Span) -> Value {
    self.new_val(VTypeHead::VRef { write, read }, span)
}
pub fn reference_use(&mut self, write: Option<Value>, read: Option<Use>, span: Span) -> Use {
    self.new_use(UTypeHead::URef { write, read }, span)
}
```

### Frontend

Lastly, we need to add support in the typechecker frontend. (We also have to add support in codegen and the demo UI, but as always, I'm not covering those here.)

```rust
NewRef(expr, span) => {
    let expr_type = check_expr(engine, bindings, expr)?;
    let (read, write) = engine.var();
    engine.flow(expr_type, write)?;
    Ok(engine.reference(Some(write), Some(read), *span))
}
```
The frontend implementation should be pretty straightforward if you've been following along so far. As usual, we first typecheck the subexpressions, then create the relevant use type and add a flow constraint to it. 

The only tricky part is in `NewRef` where we create a variable and use both "ends" of the variable as the two type parameters of the reference, as described previously. As far as the others go, `RefGet` is pretty much the same as `FieldAccess`, just with a reference use type instead of a record use type, while `RefSet` is a bit similar to how function calls are handled.

```rust
RefGet((expr, span)) => {
    let expr_type = check_expr(engine, bindings, expr)?;

    let (cell_type, cell_bound) = engine.var();
    let bound = engine.reference_use(None, Some(cell_bound), *span);
    engine.flow(expr_type, bound)?;
    Ok(cell_type)
}
RefSet((lhs_expr, lhs_span), rhs_expr) => {
    let lhs_type = check_expr(engine, bindings, lhs_expr)?;
    let rhs_type = check_expr(engine, bindings, rhs_expr)?;

    let bound = engine.reference_use(Some(rhs_type), None, *lhs_span);
    engine.flow(lhs_type, bound)?;
    Ok(rhs_type)
}
```

And that's it for this week. Next week, we'll cover how to add inexhaustive case matching and record extension to the type system (and by extension, the language).


{{series_footer}}
