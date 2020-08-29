---
layout: post
title: 'Subtype Inference by Example Part 9: Match Wildcards, Record Extension and
  Row Polymorphism'
series: cubiml
series-num: 9
date: 2020-08-29 07:37 -0700
---
{% include series-util.html %}
{{series_header}}

[Last week]({{prev_url}}), we added mutability to cubiml. This week we'll cover wildcard match patterns and record extension.

## Match wildcards

Up until now, our match expressions have been _exhaustive_, meaning that they are required to list a series of cases to check against, and passing in anything to the match expression which isn't on the list of cases results in a compile time error. For example, the following code

```ocaml
let area = fun arg ->
    match arg with
        | `Square x -> x.len *. x.len
        | `Rect x -> x.height *. x.width;

area `Circle {radius=1.2}
```

results in a type error because `Circle` is not on the list of cases handled by the match expression.

```
TypeError: Unhandled case `Circle
Note: Case originates here
        | `Rect x -> x.height *. x.width;

area `Circle {radius=1.2}
     ^~~~~~~             
But it is not handled here.
let area = fun arg ->
    match arg with
          ^~~     
        | `Square x -> x.len *. x.len
        | `Rect x -> x.height *. x.width;
```

Most of the time, this is what you want. However, sometimes you might not know the full set of possible cases, and you just want to have a "default" or "else" branch with a generic handler for any unexpected case. Alternatively, you might know the complete set of possible cases, but want to handle most of them in the same way. These scenarios can be handled by a _wildcard_ match pattern.

```ocaml
let area = fun arg ->
    match arg with
        | `Square x -> x.len *. x.len
        | `Rect x -> x.height *. x.width
        |  _ -> "error: unexpected case";

area `Circle {radius=1.2}
```

Instead of listing a tag in the match pattern (e.g. `` `Square x``), you just list an identifier, (`_` in the above example). Such a _wildcard_ pattern matches values with any possible tag. 

In the above example, our "default" handler didn't actually use the input value, so we just bound it to `_` in the match pattern. However, any identifier could be used here, and a variable with that name is created within the body of the match arm as usual. For example, the below example prints out the erroneous value instead (using a hypothetical `debug` function defined elsewhere).

```ocaml
let area = fun arg ->
    match arg with
        | `Square x -> x.len *. x.len
        | `Rect x -> x.height *. x.width
        |  x -> "Error: Expected a Square or Rect, got " ^ (debug x) ^ " instead.";

area `Circle {radius=1.2}
```

The above examples don't actually care about the type of the `_` or `x` variable at all. However, the true power of wildcard matches comes when we make the type system a bit smarter and give the bound variable a type that is _refined_ with the knowledge of the branches not taken, i.e. the explicitly matched cases that it didn't have. For example, we would like `x` above to have the type "same type as `arg` except that it is not a `Square` or `Rect`".

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

This allows us to do stuff like the above example, where we take the wildcard variable and pass it to a second match elsewhere. Since the `x` in `area2` is statically known to not be a `Circle`, the compiler allows us to pass it to the match in the original `area` function, even though `area` does not handle the `Circle` case. 

This allows us to do things like match some cases in one place and defer handling other cases to other parts of the code, as in the above example, in a completely type safe and statically checked manner. However, it is actually even more powerful than that, since we don't have to have a single, linear chain of matches. We can add, remove, and change cases, add arbitrary conditional logic in the middle, etc. and still have everything checked by the compiler at compile time.

With that out of the way, it's time to implement wildcard matches.

### Grammar and AST

This time around, the parser changes required are more significant than usual. First off, the abstract syntax tree.

```diff
@@ -36,7 +36,12 @@ pub enum OpType {
 }
 
 type VarDefinition = (String, Box<Expr>);
-type CaseMatchPattern = (String, String);
+
+#[derive(Debug)]
+pub enum Pattern {
+    Case(String, String),
+    Wildcard(String),
+}
 
 #[derive(Debug)]
 pub enum Expr {
@@ -49,7 +54,7 @@ pub enum Expr {
     Let(VarDefinition, Box<Expr>),
     LetRec(Vec<VarDefinition>, Box<Expr>),
     Literal(Literal, Spanned<String>),
-    Match(Box<Expr>, Vec<(Spanned<CaseMatchPattern>, Box<Expr>)>, Span),
+    Match(Box<Expr>, Vec<(Spanned<Pattern>, Box<Expr>)>, Span),
     NewRef(Box<Expr>, Span),
     Record(Spanned<Vec<(Spanned<String>, Box<Expr>)>>),
     RefGet(Spanned<Box<Expr>>),

```

The natural way to express the match with possible a wildcard at the end is to just have a list of case matches, like before, plus an optional wildcard match field afterwards. However, trying to enforce that there is at most one wildcard pattern in a match and that wildcards can only come at the end of the match is difficult to do at the grammar level. Instead, we specify matches at the grammar level as a list of patterns, each of which can be a case or wildcard, and then enforce the above-mentioned validity constraints later, in the typechecker frontend.

Therefore, we replace `CaseMatchPattern` with a new `Pattern` enum that can hold a `Case` or `Wildcard` pattern, and update the grammar to match.

```diff
     <Spanned<Tag>> <CaseExpr> => Box::new(ast::Expr::Case(<>)),
 }
 
-CaseMatchPattern = {
-    Tag Ident,
+MatchPattern: ast::Pattern = {
+    Tag Ident => ast::Pattern::Case(<>),
+    Ident => ast::Pattern::Wildcard(<>),
 }
 MatchArm = {
-    <Spanned<CaseMatchPattern>> "->" <CompareExpr>,
+    "|" <Spanned<MatchPattern>> "->" <CompareExpr>,
 }
```

I also took the opportunity to modify the match syntax slightly to require a `|` before the initial match arm, simplifying the syntax and avoiding the need to add and remove `|`s as you rearrange the match arms, another change I wish I had thought of in the original version of cubiml.


```diff
-MatchSub = "match" <Spanned<Expr>> "with" <SepList<MatchArm, "|">>;
+MatchSub = "match" <Spanned<Expr>> "with" <MatchArm+>;
```

### Typechecker frontend

The frontend code for matches also changed quite a bit.

```rust
Match(match_expr, cases, span) => {
    let match_type = check_expr(engine, bindings, match_expr)?;
    let (result_type, result_bound) = engine.var();

    // Result types from the match arms
    let mut case_type_pairs = Vec::with_capacity(cases.len());
    let mut wildcard_type = None;

    // Pattern reachability checking
    let mut case_names = HashMap::with_capacity(cases.len());
    let mut wildcard = None;

    for ((pattern, pattern_span), rhs_expr) in cases {
        if let Some(old_span) = wildcard {
            return Err(SyntaxError::new2(
                "SyntaxError: Unreachable match pattern",
                *pattern_span,
                "Note: Unreachable due to previous wildcard pattern here",
                old_span,
            ));
        }

        use ast::Pattern::*;
        match pattern {
            Case(tag, name) => {
                if let Some(old_span) = case_names.insert(&*tag, *pattern_span) {
                    return Err(SyntaxError::new2(
                        "SyntaxError: Unreachable match pattern",
                        *pattern_span,
                        "Note: Unreachable due to previous case pattern here",
                        old_span,
                    ));
                }

                let (wrapped_type, wrapped_bound) = engine.var();
                case_type_pairs.push((tag.clone(), wrapped_bound));

                let rhs_type = bindings.in_child_scope(|bindings| {
                    bindings.insert(name.clone(), wrapped_type);
                    check_expr(engine, bindings, rhs_expr)
                })?;
                engine.flow(rhs_type, result_bound)?;
            }
            Wildcard(name) => {
                wildcard = Some(*pattern_span);

                let (wrapped_type, wrapped_bound) = engine.var();
                wildcard_type = Some(wrapped_bound);

                let rhs_type = bindings.in_child_scope(|bindings| {
                    bindings.insert(name.clone(), wrapped_type);
                    check_expr(engine, bindings, rhs_expr)
                })?;
                engine.flow(rhs_type, result_bound)?;
            }
        }
    }

    let bound = engine.case_use(case_type_pairs, wildcard_type, *span);
    engine.flow(match_type, bound)?;

    Ok(result_type)
}
```

This is primarily due to the need to report syntax errors for illegal combinations of wildcard matches (i.e. anything appearing after a wildcard pattern is a syntax error, since anything after a wildcard is unreachable.)

Recall that previously, we reported a syntax error for repeated case tags, and we maintained a map `case_names` from tags to spans to facilitate this. Whenever we processed a case pattern, we would first check the tag against `case_names`. If that tag was already present, we would return an error `"SyntaxError: Repeated match case"`, using the new span and the span of the previous occurence that we got from the map.

```rust
// Pattern reachability checking
let mut case_names = HashMap::with_capacity(cases.len());
let mut wildcard = None;
```

```rust
if let Some(old_span) = wildcard {
    return Err(SyntaxError::new2(
        "SyntaxError: Unreachable match pattern",
        *pattern_span,
        "Note: Unreachable due to previous wildcard pattern here",
        old_span,
    ));
}
```

The new code is fairly similar. In addition to the `case_names` map, we have the variable `wildcard: Option<Span>` which optionally holds a span pointing to the previously seen wildcard pattern, if any. In addition to the duplicate case check, we have a second validity check for wildcards. Whenever we process a pattern, whether it is a case or wildcard pattern, we first check the `wildcard` variable. If it is `Some`, i.e. a wildcard pattern was already seen, we report an error, since anything after a wildcard pattern is unreachable. Additionally, the error message text has been updated.

```rust
            Wildcard(name) => {
                wildcard = Some(*pattern_span);

                let (wrapped_type, wrapped_bound) = engine.var();
                wildcard_type = Some(wrapped_bound);

                let rhs_type = bindings.in_child_scope(|bindings| {
                    bindings.insert(name.clone(), wrapped_type);
                    check_expr(engine, bindings, rhs_expr)
                })?;
                engine.flow(rhs_type, result_bound)?;
            }
```

Apart from that, we have the actual code for checking the right hand side of the match arm for wildcard patterns. This is nearly identical to the code for case patterns, but Rust's borrow checker makes it difficult to avoid duplicating the code here.

```rust
let bound = engine.case_use(case_type_pairs, wildcard_type, *span);
```
Lastly, we of course need to pass the variable for the wildcard match (if any) to the case type constructor.


### Typechecker core

To start with, we add a new field `wildcard` to the `UCase` use type head, giving the use type for the bound variable if there was a wildcard pattern, and `None` otherwise.

```rust
UCase {
    cases: HashMap<String, Use>,
    wildcard: Option<Use>,
},
```
```rust
pub fn case_use(&mut self, cases: Vec<(String, Use)>, wildcard: Option<Use>, span: Span) -> Use {
    let cases = cases.into_iter().collect();
    self.new_use(UTypeHead::UCase { cases, wildcard }, span)
}
```
We also update the constructor function to pass it through.

Now comes the most interesting part - the implementation of `check_heads`. This part is a bit trickier. Consider the following code.

```ocaml
match (`Tag x) with
    | `CaseA a -> _
    | `CaseB b -> _ 
```

Recall that under the existing system, this will result in a call to `check_heads` that can roughly be described by the following pseudocode:

```
lhs = VCase{case=("Tag", x)}
rhs = UCase{cases=Map{"CaseA" => a, "CaseB" => b}}
check_heads(lhs, rhs)
```
where `x`, `a`, `b`, etc. are standins for the type nodes of the variables with the same names.

The way we currently check this in `check_heads` is that we take the left's tag (`"Tag"`) and look it up in the `cases` map of the right hand side. If the tag isn't present, we return a type error. Otherwise, we add a flow constraint from the child node on the left to the corresponding child node on the right. So if the tag were `"CaseA"`, we would add the flow relation `x -> a`, and if it were `"CaseB"`, we would instead add `x -> b`.

In order to implement wildcard matches with the desired semantics, we have to change things slightly. For code like the following

```ocaml
match (`Tag x) with
    | `CaseA a -> _
    | `CaseB b -> _ 
    | c -> _
```

we would have the following pseudocode.
```
lhs = VCase{case=("Tag", x)}
rhs = UCase{cases=Map{"CaseA" => a, "CaseB" => b}, wildcard=Some(c)}
check_heads(lhs, rhs)
```

`check_heads` proceeds similarly as before, except that when the left's tag is not present in the right's `cases` map, we instead consult the right's `wildcard` field. If it is `None`, we return a type error like before. If it is _not_ none, we add a flow constraint from _lhs_ (not `x`!) to that variable, i.e. `lhs -> c` where `lhs = VCase{case=("Tag", x)}` is the _entire_ type node containing the head we are checking.

At this point, we run into a problem - `lhs` isn't actually passed to `check_heads`. Up until now `check_heads` has only created flow relations between the child nodes of the two nodes being checked. This meant there was no need to pass the parent nodes themselves in, only their _heads_. However, now we need to get the _pointer_ (i.e. index) to the lhs node as whole.

This means we have to change the signature of `check_heads` and add the new `lhs_index` and `rhs_index` parameters. We aren't actually using `rhs_index` right now, but it's nice to be consistent, and we will use it later.

```rust
fn check_heads(
    lhs_ind: ID,
    lhs: &(VTypeHead, Span),
    rhs_ind: ID,
    rhs: &(UTypeHead, Span),
    out: &mut Vec<(Value, Use)>,
) -> Result<(), TypeError> {
```

```diff
     while let Some((lhs, rhs)) = type_pairs_to_check.pop() {
         if let TypeNode::Value(lhs_head) = &self.types[lhs] {
             if let TypeNode::Use(rhs_head) = &self.types[rhs] {
-                check_heads(lhs_head, rhs_head, &mut pending_edges)?;
+                check_heads(lhs, lhs_head, rhs, rhs_head, &mut pending_edges)?;
             }
         }
     }
```

Now that we're passing in the required data to `check_heads`, it's time for the updated case branch in `check_heads`, which implements the logic described above.

```rust
(
    &VCase { case: (ref name, lhs2) },
    &UCase {
        cases: ref cases2,
        wildcard,
    },
) => {
    // Check if the right case is handled
    if let Some(&rhs2) = cases2.get(name) {
        out.push((lhs2, rhs2));
        Ok(())
    } else if let Some(rhs2) = wildcard {
        out.push((Value(lhs_ind), rhs2));
        Ok(())
    } else {
        Err(TypeError::new2(
            format!("TypeError: Unhandled case {}\nNote: Case originates here", name),
            lhs.1,
            "But it is not handled here.",
            rhs.1,
        ))
    }
}
```

## Record extension

So far, there's been a remarkable symmetry between our record and case types. In particular, our case value types have exactly the same structure as our record use types, and our case use types have the same structure as our record value types. Now that we've added a new feature to case use types, the question naturally arises as to what the equivalent feature for record value types is. The answer is _record extension_.

Recall that after adding wildcard matches, our case use type head now looks like this

```rust
UCase {
    cases: HashMap<String, Use>,
    wildcard: Option<Use>,
},
```

Previously, we just added a map of strings to use types, but today we added an optional extra use type named `wildcard`. The corresponding change for records is to add an optional extra value type, which we'll name `proto`.

```rust
VObj {
    fields: HashMap<String, Value>,
    proto: Option<Value>,
},
```

For cases, the semantics are that we check each value against the map of cases, and if not present, add a flow constraint to the wildcard instead (if present). Essentially, `wildcard` is an extra value that we _delegate_ all cases to if they aren't among the explicitly listed cases. 

For records, the equivalent is that we have an explicitly listed set of _fields_, and any field lookups that are not on that list get delegated to the `proto` value instead. It's basically a way of saying "here's another place to look for fields if you didn't find what you're looking for here."

This sounds a lot like inheritance, which in Javascript is done with _prototypes_, hence the name. As far as user-visible language features go, the actual effect of this is that we can take a record and extend it to create a new record with extra fields, which also has all the fields of the old record, or equivalently, delegates missing field lookups to the old record. Therefore, we call this _record extension_.

Ocaml sadly doesn't support record extension, so we'll have to make up some syntax for it ourselves, or more accurately, borrow Elm's record extension syntax instead. In Elm, [prior to version 0.16](https://elm-lang.org/news/compilers-as-assistants#simplified-records), you could begin a record with `{ foo |` to include all the fields of `foo` in the new record.

```ocaml
let foo = {a=1; b=""; c=false};
let bar = {foo | a=true; d=-23}
```

Note that the "prototype" value does not have to be statically known. In fact, it can be any arbitrary expression, as long as you wrap it in parenthesis.

```
>> let baz = {(if foo.c then foo else bar) | c=true}

{a=true; b=""; c=true; d=-23}
```

Previously, we described record extension using prototypes, but it is not necessarily actually implemented that way. In fact, there are two different ways to look at record extension. 

The first view is the inheritance view we already covered, where each record contains the fields explicitly defined in its definition along with an optional link to a prototype value where missing fields will be looked up at runtime. The other view is the copying view, where a record _copies_ all the fields from its prototype at the time of creation and does not maintain any link to the prototype afterwards.

{% raw %}
Since our records are immutable, there is no observable behavior difference between the two views. In fact, cubiml uses the inheritance view in the typechecker and the copying view in the actual generated code. The generated code copies all the fields from the parent object at creation time, rather than using Javascript prototypes, so `{a=1; b=2}` and `{{a=1; b=6} | b=2}` produce _identical_ values at runtime. 

This is also why for the `baz` example above, the REPL printed out `{a=true; b=""; c=true; d=-23}`, instead of something like `{{{a=1; b=""; c=false} | a=true; d=-23} | c=true}`, like it might if the links were tracked at runtime.
{% endraw %}

### Implementation

Anyway, with that out of the way, it's time to actually implement record extension. This is very similar to the implementation of wildcard matches, so I won't go over it in too much detail.

As usual, we start with the AST and grammar.

```diff
-    Record(Spanned<Vec<(Spanned<String>, Box<Expr>)>>),
+    Record(Option<Box<Expr>>, Vec<(Spanned<String>, Box<Expr>)>, Span),

 
+RecordExtension = {
+    <CallExpr> "|"
+}
 KeyPairExpr = {
     <Spanned<Ident>> "=" <Expr>,
 }
-RecordSub = "{" <SepListOpt<KeyPairExpr, ";">> "}";
+RecordSub = "{" <RecordExtension?> <SepListOpt<KeyPairExpr, ";">> "}";
 Record: Box<ast::Expr> = {
-    Spanned<RecordSub> => Box::new(ast::Expr::Record(<>)),
+    Spanned<RecordSub> => {
+        let ((proto, fields), span) = <>;
+        Box::new(ast::Expr::Record(proto, fields, span))
+    }
 }

```

After that, we have the typechecker frontend. The implementation is a lot simpler in this case because we don't have to bother with trying to track syntax errors for unreachable match patterns like we did before. All we have to do is typecheck the `proto` value if present, and pass it through to the value type constructor.


```diff
-        Record((fields, span)) => {
+        Record(proto, fields, span) => {
+            let proto_type = match proto {
+                Some(expr) => Some(check_expr(engine, bindings, expr)?),
+                None => None,
+            };
+
             let mut field_names = HashMap::with_capacity(fields.len());

@@ -223,7 +259,7 @@ fn check_expr(engine: &mut TypeCheckerCore, bindings: &mut Bindings, expr: &ast:
                 let t = check_expr(engine, bindings, expr)?;
                 field_type_pairs.push((name.clone(), t));
             }
-            Ok(engine.obj(field_type_pairs, *span))
+            Ok(engine.obj(field_type_pairs, proto_type, *span))
         }

```

Lastly, we have the typechecker core. The implementation in the core type system is identical to the one for wildcard matches above, just with the polarities reversed.

```rust
(
    &VObj {
        fields: ref fields1,
        proto,
    },
    &UObj { field: (ref name, rhs2) },
) => {
    // Check if the accessed field is defined
    if let Some(&lhs2) = fields1.get(name) {
        out.push((lhs2, rhs2));
        Ok(())
    } else if let Some(lhs2) = proto {
        out.push((lhs2, Use(rhs_ind)));
        Ok(())
    } else {
        Err(TypeError::new2(
            format!("TypeError: Missing field {}\nNote: Field is accessed here", name),
            rhs.1,
            "But the record is defined without that field here.",
            lhs.1,
        ))
    }
}
```


```diff
-    VObj { fields: HashMap<String, Value> },
+    VObj {
+        fields: HashMap<String, Value>,
+        proto: Option<Value>,
+    },
```

```diff
-    pub fn obj(&mut self, fields: Vec<(String, Value)>, span: Span) -> Value {
+    pub fn obj(&mut self, fields: Vec<(String, Value)>, proto: Option<Value>, span: Span) -> Value {
         let fields = fields.into_iter().collect();
-        self.new_val(VTypeHead::VObj { fields }, span)
+        self.new_val(VTypeHead::VObj { fields, proto }, span)
     }
```

## Row polymorphism

So far, we've been implementing useful features in the type system without worrying about what syntax to use to describe it. However, the features shown today are a bit inconvenient to write with traditional type syntax, as suggested by the previous "same type as `arg` except that it is not a `Square` or `Rect`" circumlocution.

In order to describe the types of operations like record extension, people invented _row polymorphism_. This is like regular polymorphism (i.e. generic types) except that instead of type variables that can be substituted for different types, we have _row variables_, which can be substituted for sets of fields.

This means that an operation like `fun x -> {x | foo=4}` can be described with a row type like `row R: {R} -> {R | foo: int}`. 

Traditionally, the formal treatment of record extension includes a restriction that the input row does not contain any of the labels for the newly defined fields. However, in cubiml, we have no such restriction and just let fields defined in the child override any fields copied from the parent, since this makes more sense in practice, especially when applied to the dual case of wildcard matches. But duplicate field restrictions are easy to implement in the type checker using similar techniques to the ones shown above, should you so desire.


### Let polymorphism

Although the abstract operation of record extension is row polymorphic, any particular cubiml code using it is not polymorphic because the version of cubiml we've covered so far does not support polymorphism yet.


Consider the following code

```ocaml
let f = fun x -> {x | foo=4};
let _ = f {a=5; b="hello"};
(f {c=8.3}).c
```

This will result in a type error ("Missing field c"), because the compiler isn't smart enough to separate the different inputs to the function. Currently, the typechecker treats function calls as if all calls to a given function are mixed together, so it thinks that the `.c` on the second call to `f` might see the `{a=5; b="hello"; foo=4}` resulting from the first call to `f`.

The version of cubiml we have so far has the _row_ part of row polymorphism down, but not the _polymorphism_ part. The above code is just a special case of the following code, which has the exact same issue.

```ocaml
let f = fun x -> x;
let _ = f {a=5; b="hello"};
(f {c=8.3}).c
```

In order to allow code like this to typecheck, we need to make the type analysis context sensitive and have it treat every call to a function as an _independent_ type, so that inputs to one function call don't pollute the results seen by every other call to that function, type-wise. Next week, we will cover _let polymorphism_, the standard method for handling this.


{{series_footer}}
