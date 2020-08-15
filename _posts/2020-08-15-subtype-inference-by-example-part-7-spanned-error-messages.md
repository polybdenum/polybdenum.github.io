---
layout: post
title: 'Subtype Inference by Example Part 7: Spanned Error Messages'
series: cubiml
series-num: 7
date: 2020-08-15 07:56 -0700
---
{% include series-util.html %}
{{series_header}}

[Last week]({{prev_url}}), we covered the addition of literals and operators to cubiml and presented the first complete demo of the language. However, while the compiler works, it is not very user friendly. In particular, it just prints out "Unexpected types" when a type mismatch occurs, with no elaboration. This week, we will improve cubiml's error messages.

## Spanned error messages

Most modern compilers have converged on _spanned error messages_, that is error messages which display your code and point out the particular portion relevant to the error.

For example, here is [an example error message](https://clang.llvm.org/diagnostics.html) from Clang, a C++ compiler with a focus on high quality error messages.

<pre>
$ <span style="font-style: italic;">clang -fsyntax-only t.c</span>
<span style="font-weight: bold;">t.c:5:11:</span> <span style="font-weight: bold; color: red;">error:</span> <span style="font-weight: bold;">indirection requires pointer operand ('int' invalid)</span>
<span>  int y = *SomeA.X;</span>
<span style="font-weight: bold; color: green;">          ^~~~~~~~</span>
</pre>

As another example, here is a typical compiler error message in Elm.

<pre>
<span style="color: rgb(51, 187, 200);">-- TYPE MISMATCH ----------------------------------------------- <span style="cursor: pointer; text-decoration: underline;">Jump To Problem</span>

</span>The 1st argument to `NewFace` is not what I expect:

59|           NewFace Model 1
                      <span style="color: rgb(252, 57, 31);">^^^^^</span>
This `Model` value is a:

    <span style="color: rgb(173, 173, 39);">Int -&gt; Model</span>

But `NewFace` needs the 1st argument to be:

    <span style="color: rgb(173, 173, 39);">Int</span>
</pre>

[IntercalScript](https://github.com/Storyyeller/IntercalScript), an early predecessor to cubiml, takes a similar approach:
<pre>
TypeError: Unexpected bool
typeck6.ics:26:45: Note: bool originates here
    if context == null then context = {fut: false, unsafe: false, dead: false} e
                                            ^----
typeck6.ics:658:25: but it is required to be an object here
                fut-span.print("Note: future assignment begins here")
                        ^-----
</pre>

In this post, we will see how to implement similar error messages in cubiml.

### Spans

The first step of course is to add spans. A _span_ refers to some contiguous portion of an input source file. Conceptually, a span is a triple of (source file, start position, end position). When parsing the input, we associate a span with each portion of the abstract syntax tree that could be involved in an error, and then use the span information to print out the nicely formatted messages with code snippets in the case of an error.

However, in our implementation, instead of actually passing around those triples, we will instead hide them inside a special `SpanManager` class to improve separation of concerns and hopefully performance. The `SpanManager` hands out opaque `Span` values which are secretly just an index into a list inside the manager where the real data is stored.

```rust
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub struct Span(usize);

#[derive(Debug, Default)]
pub struct SpanManager {
    sources: Vec<String>,
    spans: Vec<(usize, usize, usize)>,
}
impl SpanManager {
    fn new_span(&mut self, source_ind: usize, l: usize, r: usize) -> Span {
        let i = self.spans.len();
        self.spans.push((source_ind, l, r));
        Span(i)
    }
}
```

We also _intern_ spans, so if the same tuple is passed in twice, we can reuse the same index instead of creating a redundant span in the internal list. This isn't strictly necessary, but we might as well do it, and it does allow nice things like equality comparisons.

During parsing of a source file, all new spans created will be pointing to the same source file, so we wrap the span creation process in a second class `SpanMaker`, which remembers the current source file, so only the start and end positions need to be passed in. Therefore span creation is a two step process: first add the source file to `SpanManager`, which returns a `SpanMaker`, and then call `SpanMaker.span(l, r)` to create new spans.

```rust
impl SpanManager {
    pub fn add_source(&mut self, source: String) -> SpanMaker {
        let i = self.sources.len();
        self.sources.push(source);
        SpanMaker {
            parent: self,
            source_ind: i,
            pool: Default::default(),
        }
    }
}

#[derive(Debug)]
pub struct SpanMaker<'a> {
    parent: &'a mut SpanManager,
    source_ind: usize,
    pool: HashMap<(usize, usize), Span>,
}
```

Since only spans for the same source file can be potential duplicates, we do the duplicate detection inside `SpanMaker` using a `HashMap` that stores `(left, right)` pairs. When `span(l, r)` is called, we just check if `(l, r)` already exists in the map, and if not, insert a new entry into the parent `SpanManager`'s list.

```rust
impl<'a> SpanMaker<'a> {
    pub fn span(&mut self, l: usize, r: usize) -> Span {
        // Make the borrow checker happy
        let source_ind = self.source_ind;
        let parent = &mut self.parent;

        *self.pool.entry((l, r)).or_insert_with(|| parent.new_span(source_ind, l, r))
    }
}
```

Due to a limitation of Rust's borrow checker, we need to copy `SpanMaker`'s fields to local variables before doing the insertion. It is possible that future improvements to Rust will someday render this unnecessary.


```rust
impl SpanManager {
    pub fn print(&self, span: Span) -> String;
}
```

Next we need a way to actually convert `Span`s into those nicely formatter error messages. This is done in the `SpanManager.print` method. The basic idea is to just find the part of the line in the source that the span covers, and then print underneath it an appropriate length `^~~~~~` string. The cubiml implementation also includes up to two lines of context around the line where the span occurs, leading to results like the following:

```
let abs_float =
    fun x -> if x <. 0. then 0. -. x else x;
    ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 

let rec fib = fun x ->
```

I won't show the implementation here, since it's just a lot of tedious string splitting and formatting, but you can see the full code [here](https://github.com/Storyyeller/cubiml-demo/blob/v7/src/spans.rs#L26) if you are curious.

```rust
pub type Spanned<T> = (T, Span);
```

Lastly, we define a public typedef `Spanned<T>` which associates a span with a given value for convenience elsewhere in the codebase.

### Abstract syntax tree

Next, we have to add a place to store spans in the Abstract Syntax Tree and then fill them in in the parser. Recall that we need to store spans for any portion of the code that we might want to highlight in an error message. This is somewhat subjective and there are lots of ways to structure the AST, but here's the implementation I went with.

```rust
pub enum Expr {
    BinOp(Spanned<Box<Expr>>, Spanned<Box<Expr>>, OpType, Op, Span),
    Call(Box<Expr>, Box<Expr>, Span),
    Case(Spanned<String>, Box<Expr>),
    FieldAccess(Box<Expr>, String, Span),
    FuncDef(Spanned<(String, Box<Expr>)>),
    If(Spanned<Box<Expr>>, Box<Expr>, Box<Expr>),
    Let(VarDefinition, Box<Expr>),
    LetRec(Vec<VarDefinition>, Box<Expr>),
    Literal(Literal, Spanned<String>),
    Match(Box<Expr>, Vec<(Spanned<CaseMatchPattern>, Box<Expr>)>, Span),
    Record(Spanned<Vec<(Spanned<String>, Box<Expr>)>>),
    Variable(Spanned<String>),
}
```

### Parser

To generate spans in the parser, we first need a way to pass the `SpanMaker` into the parser so we can use it in the grammar productions. Luckily, Lalrpop makes this easy to do. All you have to do is add this line of code at the top of the grammar file and the generated parser function will sprout an extra `ctx` parameter, which we can then access in any of the grammar rules.

```
grammar(ctx: &mut spans::SpanMaker<'input>);
```

Lalrpop's syntax for accessing source positions is a bit annoying, but luckily we can wrap this in a macro.

```
Spanned<T>: spans::Spanned<T> = {
    <l: @L> <val: T> <r: @R> => (val, ctx.span(l, r))
};
```

The `Spanned<T>` macro takes in a _grammar rule_, that is, a sequence of terminals and nonterminals, as the `T` parameter and returns the result that that production produces, except wrapped with a `Span` added.

Next, we have to update all the grammar rules to add the generated spans to the AST, and then update the typechecker frontend and codegen (which I'll skip as usual) to handle the altered shape of the AST. This is a bit tedious and mostly the same for each type of AST node, so I'll just show the two most complicated cases, matches and binary operators, and let you figure out the rest. As usual, the complete code for this post can [also be viewed on Github](https://github.com/Storyyeller/cubiml-demo/tree/v7).

```
CaseMatchPattern = {
    Tag Ident,
}
MatchArm = {
    <Spanned<CaseMatchPattern>> "->" <CallExpr>,
}
MatchSub = "match" <Spanned<Expr>> "with" <SepList<MatchArm, "|">>;
Match: Box<ast::Expr> = {
    MatchSub => {
        let ((param, span), arms) = <>;
        Box::new(ast::Expr::Match(param, arms, span))
    }
}
```
For matches, we need to get a span for each case pattern that is matched, as well as a span for the input parameter. The former is handled by wrapping `CaseMatchPattern` in the `Spanned` macro. In the later case, we wrap the input `Expr` in `Spanned`, but then rearrange the span a bit and stick it in the last parameter to `ast::Expr::Match` to simplify the AST structure.

```
MultOpSub: (ast::OpType, ast::Op) = {
    "*" => (ast::OpType::IntOp, ast::Op::Mult),
    "/" => (ast::OpType::IntOp, ast::Op::Div),
    "*." => (ast::OpType::FloatOp, ast::Op::Mult),
    "/." => (ast::OpType::FloatOp, ast::Op::Div),
}
MultOp: Box<ast::Expr> = {
    Spanned<(Spanned<MultExpr> MultOpSub Spanned<CallExpr>)> => {
        let ((lhs, op, rhs), span) = <>;
        Box::new(ast::Expr::BinOp(lhs, rhs, op.0, op.1, span))
    },
}
```
For binary operators, we create a span for each input operand as well a span for the expression as a whole. I've also refactored these rules to avoid duplicating the code for every single operator of the same precedence class.

### Error messages

Next, we need a way to report error messages that include spans. Additionally, there's a bit of cleanup of cubiml's error handling to be done. 

In the initial version of cubiml, we created separate `SyntaxError` and `TypeError` classes to hold syntax and type errors respectively. However, we never actually made use of the fact that they are separate types. Instead, both error classes are just dumb holders of error message strings that got piped straight through to the user. Therefore, we will define a new `SpannedError` class to represent an error message containing spans, and redefine `SyntaxError` and `TypeError` to just be aliases of `SpannedError`. 

Having all of our errors be the same type also lets us get rid of the `Box<dyn error::Error>` nonsense in the typechecker frontend. Making `SyntaxError` and `TypeError` separate classes is another one of those engineering decisions that seemed like a good idea at the time but turned out to be unnecessary.

Anyway, here's our new `SpannedError` class. It just holds one or more string and span pairs. The `impl Into<String>` stuff is just a trick to make the API more convenient, letting us pass in either a static `&str` or an owned `String` without the need for explicit conversions.

```rust
#[derive(Debug)]
pub struct SpannedError {
    pairs: Vec<(String, Span)>,
}

impl SpannedError {
    pub fn new1(s1: impl Into<String>, s2: Span) -> Self {
        let p1 = (s1.into(), s2);
        SpannedError { pairs: vec![p1] }
    }

    pub fn new2(s1: impl Into<String>, s2: Span, s3: impl Into<String>, s4: Span) -> Self {
        let p1 = (s1.into(), s2);
        let p2 = (s3.into(), s4);
        SpannedError { pairs: vec![p1, p2] }
    }
}
```

The `Error` trait requires the implementing type to be displayable as a string. However, all our span printing logic is hidden inside the `SpanManager` class, meaning there's no way to properly print the error without access to the `SpanManager`. Therefore, we just pretend to implement `Error` with a do-nothing method.

```rust
impl fmt::Display for SpannedError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        Ok(())
    }
}
impl error::Error for SpannedError {}

```

Instead, we have a _separate_ method for _actually_ printing the error message which takes in a `SpanManager`:

```rust
pub fn print(&self, sm: &SpanManager) -> String {
    let mut out = String::new();
    for (msg, span) in self.pairs.iter() {
        out += &msg;
        out += "\n";
        out += &sm.print(*span);
    }
    out
}
```

### Match expression errors

Now that we have our new error class, it's time to use it. We'll start by reporting errors for duplicated match cases.


```rust
let mut case_names = HashMap::with_capacity(cases.len());
for (((tag, name), case_span), rhs_expr) in cases {
    if let Some(old_span) = case_names.insert(&*tag, *case_span) {
        return Err(SyntaxError::new2(
            "SyntaxError: Repeated match case",
            *case_span,
            "Note: Case was already matched here",
            old_span,
        ));
    }
```

To display a useful error for duplicated match cases (or analogously for duplicate record fields), we need to point to the case that was duplicated as well as the previous occurrence of that case. Previously, we just tracked a _set_ of already seen case tags in order to detect duplicates, but now, we replace that with a _map_ from case tags to spans. Whenever we process a new case, if it isn't already in the map, we insert it into the map along with its span. If it is in the map, we can retrieve the span of that case tag's first occurence from the map and pass it to `SpannedError::new2` together with the span of the newly seen instance of that tag.

For example, the following cubiml code

```ocaml
fun x ->
    match x with
      `Foo a -> 0
    | `Bar b -> 1
    | `Foo c -> 2
```

Produces the following error message:

```
SyntaxError: Repeated match case
      `Foo a -> 0
    | `Bar b -> 1
    | `Foo c -> 2
      ^~~~~~     
Note: Case was already matched here
fun x ->
    match x with
      `Foo a -> 0
      ^~~~~~     
    | `Bar b -> 1
    | `Foo c -> 2
```

Apart from that, only minor updates to the frontend are required for handling match expressions.


```diff
-        Match(match_expr, cases) => {
+        Match(match_expr, cases, span) => {
             let match_type = check_expr(engine, bindings, match_expr)?;
             let (result_type, result_bound) = engine.var();
```

We just get the newly added span field out of the ast node...

```diff
-            let bound = engine.case_use(case_type_pairs);
+            let bound = engine.case_use(case_type_pairs, *span);
             engine.flow(match_type, bound)?;
```

And pass it to `engine.case_use` for use in type errors. 

### Binary operators

In order to report spanned error messages in the case of type errors, we need to track spans within the typechecker core's type graph. For now, we use a very simple scheme which just tracks a span for each value and use. In the event of a type mismatch, we just display the span showing where the value originated and the span of where it is used in an incompatible manner.

As an example of how to pass through the new spans from the frontend to the core, here's the new implementation of binary operators in the frontend.

```rust
BinOp((lhs_expr, lhs_span), (rhs_expr, rhs_span), op_type, op, full_span) => {
    use ast::OpType::*;
    let lhs_type = check_expr(engine, bindings, lhs_expr)?;
    let rhs_type = check_expr(engine, bindings, rhs_expr)?;

    Ok(match op_type {
        IntOp => {
            let lhs_bound = engine.int_use(*lhs_span);
            let rhs_bound = engine.int_use(*rhs_span);
            engine.flow(lhs_type, lhs_bound)?;
            engine.flow(rhs_type, rhs_bound)?;
            engine.int(*full_span)
        }
        FloatOp => {
            let lhs_bound = engine.float_use(*lhs_span);
            let rhs_bound = engine.float_use(*rhs_span);
            engine.flow(lhs_type, lhs_bound)?;
            engine.flow(rhs_type, rhs_bound)?;
            engine.float(*full_span)
        }
        StrOp => {
            let lhs_bound = engine.str_use(*lhs_span);
            let rhs_bound = engine.str_use(*rhs_span);
            engine.flow(lhs_type, lhs_bound)?;
            engine.flow(rhs_type, rhs_bound)?;
            engine.str(*full_span)
        }
        IntCmp => {
            let lhs_bound = engine.int_use(*lhs_span);
            let rhs_bound = engine.int_use(*rhs_span);
            engine.flow(lhs_type, lhs_bound)?;
            engine.flow(rhs_type, rhs_bound)?;
            engine.bool(*full_span)
        }
        FloatCmp => {
            let lhs_bound = engine.float_use(*lhs_span);
            let rhs_bound = engine.float_use(*rhs_span);
            engine.flow(lhs_type, lhs_bound)?;
            engine.flow(rhs_type, rhs_bound)?;
            engine.bool(*full_span)
        }
        AnyCmp => engine.bool(*full_span),
    })
}
```

The code is long, but mostly straightforward. The main logic is duplicated for every possible `OpType`, but the basic idea is simple. For each operand, left, and right, we get the span for that expression and pass it to the corresponding bound function.

```rust
BinOp((lhs_expr, lhs_span), (rhs_expr, rhs_span), op_type, op, full_span) => {
// ...
let lhs_bound = engine.int_use(*lhs_span);
let rhs_bound = engine.int_use(*rhs_span);
```

Previously, we used a single bound (use type) for both operands, but now we have to create separate use types, since the associated span information will be different. This allows for more specific error messages that show _which_ of the operands resulted in the error like in the following example:

```
TypeError: Value is required to be a integer here,
let y = "Hello, world!";
let z = y;
5 + x * z + 23
        ^     
But that value may be a string originating here.
let x = -18;
let y = "Hello, world!";
        ^~~~~~~~~~~~~~~ 
let z = y;
5 + x * z + 23
```

```rust
BinOp((lhs_expr, lhs_span), (rhs_expr, rhs_span), op_type, op, full_span) => {
// ...
engine.int(*full_span)
```

We also have the new `full_span` field, which contains a span for the operator expression as a whole, which we pass to the value constructor for the operator's return type. This allows us to also print error information if the _result_ of the operator is involved in a type error, as in the following example.

```
TypeError: Value is required to be a record here,
let x = 7.8 *. -9.22;
x.foo
 ^~~~
But that value may be a float originating here.
let x = 7.8 *. -9.22;
        ^~~~~~~~~~~~ 
x.foo
```

### Typechecker core

Now that we've updated the parser, AST, and typechecker frontend, all that remains is to make the aforementioned changes to the typechecker core. 

```diff
 enum TypeNode {
     Var,
-    Value(VTypeHead),
-    Use(UTypeHead),
+    Value((VTypeHead, Span)),
+    Use((UTypeHead, Span)),
 }
```

First, we replace all the type node heads with a (head, span) pair. 

```diff
-    fn new_val(&mut self, val_type: VTypeHead) -> Value {
+    fn new_val(&mut self, val_type: VTypeHead, span: Span) -> Value {
         let i = self.r.add_node();
         assert!(i == self.types.len());
-        self.types.push(TypeNode::Value(val_type));
+        self.types.push(TypeNode::Value((val_type, span)));
         Value(i)
     }

-    pub fn func_use(&mut self, arg: Value, ret: Use) -> Use {
-        self.new_use(UTypeHead::UFunc { arg, ret })
+    pub fn func_use(&mut self, arg: Value, ret: Use, span: Span) -> Use {
+        self.new_use(UTypeHead::UFunc { arg, ret }, span)
     }
 
-    pub fn obj(&mut self, fields: Vec<(String, Value)>) -> Value {
+    pub fn obj(&mut self, fields: Vec<(String, Value)>, span: Span) -> Value {
         let fields = fields.into_iter().collect();
-        self.new_val(VTypeHead::VObj { fields })
+        self.new_val(VTypeHead::VObj { fields }, span)
     }
```

Then we update the constructor functions to take in the span and pass it through. This change is pretty repetitive, so I'm just showing part of it. I'm sure you get the idea.

```diff
-fn check_heads(lhs: &VTypeHead, rhs: &UTypeHead, out: &mut Vec<(Value, Use)>) -> Result<(), TypeError> {
+fn check_heads(lhs: &(VTypeHead, Span), rhs: &(UTypeHead, Span), out: &mut Vec<(Value, Use)>) -> Result<(), TypeError> {
     use UTypeHead::*;
     use VTypeHead::*;
 
-    match (lhs, rhs) {
+    match (&lhs.0, &rhs.0) {
         (&VBool, &UBool) => Ok(()),
         (&VFloat, &UFloat) => Ok(()),
```

Next, we of course need to update `check_heads` to take in (head, span) pairs instead of just the node heads themselves.

```diff
                     out.push((lhs2, rhs2));
                     Ok(())
                 }
-                None => Err(TypeError(format!("Missing field {}", name))),
+                None => Err(TypeError::new2(
+                    format!("TypeError: Missing field {}\nNote: Field is accessed here", name),
+                    rhs.1,
+                    "But the record is defined without that field here.",
+                    lhs.1,
+                )),
             }
         }
         (&VCase { case: (ref name, lhs2) }, &UCase { cases: ref cases2 }) => {
```

Then we modify the "missing field" and "missing case" errors to pass through the newly added spans, resulting in error messages like this.

```
TypeError: Missing field bar
Note: Field is accessed here
let x = {foo = 6};
x.bar
 ^~~~
But the record is defined without that field here.
let x = {foo = 6};
        ^~~~~~~~~ 
x.bar
```

Finally, we get to the mismatched type head handler. Previously, this was just a simple `_ => Err(TypeError("Unexpected types".to_string())),`. However, now we need to print out not only the spans of the offending value and use types, but also which head constructors they used. The new version of the "unexpected types" handler is below.

```rust
let found = match lhs.0 {
    VBool => "boolean",
    VFloat => "float",
    VInt => "integer",
    VStr => "string",
    VFunc { .. } => "function",
    VObj { .. } => "record",
    VCase { .. } => "case",
};
let expected = match rhs.0 {
    UBool => "boolean",
    UFloat => "float",
    UInt => "integer",
    UStr => "string",
    UFunc { .. } => "function",
    UObj { .. } => "record",
    UCase { .. } => "case",
};

Err(TypeError::new2(
    format!("TypeError: Value is required to be a {} here,", expected),
    rhs.1,
    format!("But that value may be a {} originating here.", found),
    lhs.1,
))
```
### Parser errors

We've now got much nicer type and syntax errors, but there is still one last finishing touch to be done. Now that we have the capability to display spanned errors, we might as well use it for parse errors as well. Parse errors are produced by `lalrpop` itself, a process we don't have control over, but we can easily write a function to convert the errors lalrpop produces into nice, spanned errors.

```rust
fn convert_parse_error<T: Display>(mut sm: SpanMaker, e: ParseError<usize, T, &'static str>) -> SpannedError {
    match e {
        ParseError::InvalidToken { location } => {
            SpannedError::new1("SyntaxError: Invalid token", sm.span(location, location))
        }
        ParseError::UnrecognizedEOF { location, expected } => SpannedError::new1(
            format!(
                "SyntaxError: Unexpected end of input.\nNote: expected tokens: [{}]\nParse error occurred here:",
                expected.join(", ")
            ),
            sm.span(location, location),
        ),
        ParseError::UnrecognizedToken { token, expected } => SpannedError::new1(
            format!(
                "SyntaxError: Unexpected token {}\nNote: expected tokens: [{}]\nParse error occurred here:",
                token.1,
                expected.join(", ")
            ),
            sm.span(token.0, token.2),
        ),
        ParseError::ExtraToken { token } => {
            SpannedError::new1("SyntaxError: Unexpected extra token", sm.span(token.0, token.2))
        }
        ParseError::User { error: msg } => unreachable!(),
    }
}
```

## Demo

<script src="/demos/cubiml/p7/demo.js"></script>
<noscript><em><strong>Error: This demo requires Javascript to run.</strong></em></noscript>
<cubiml-demo></cubiml-demo>

## Future work

We now have much nicer compiler error messages. However, there are a few remaining issues.

### Tabs and unicode

The current scheme of highlighting spans involves locating the offset of the span within the line and then printing the appropriate number of spaces and `~`s below it so that the `^~~~~` part lines up with the span. 

This works as long as every byte in the source code takes up the same space when displayed. However, tabs and unicode characters violate this assumption.

For example, the following code, which contains a unicode string and a tab before the `s + 2`,

```ocaml
let s = "This is ünicodè -> 𒍅 <-";
    s + 2
```

Produces the following error
```
TypeError: Value is required to be a integer here,
let s = "This is ünicodè -> 𒍅 <-";
    s + 2
 ^    
But that value may be a string originating here.
let s = "This is ünicodè -> 𒍅 <-";
        ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
    s + 2
```

Notice how the first arrow is misaligned due to counting the tab character as only a single space, rather than the four spaces it is here displayed as. Meanwhile, the second span highlight extends past the end of the string it is highlighting due to the use of multibyte unicode characters.

Unfortunately, I don't think there's a good way to solve this problem within the traditional command line interface paradigm, where the output is constrained to static plain text. However, it could be solved with more extensive editor integration by making the code editor natively aware of the spans in the error message. That way the editor can highlight the relevant spans directly, wherever they may appear in the editor windows.

### Longer error chains

Currently, we just display the location in the code where a value originated and the location where it is used in an incompatible manner. This often works well, especially with small code samples like we've shown here. However for larger, more complex codebases, this approach sometimes fails to provide relevant information about the true location of the bug.

The issue is that, although the endpoints of the flow are the most common locations of mistakes, the true bug can potentially be anywhere at any point in the chain of inference that led the compiler to deduce the type error. For example, if you have two standard library types `Foo` and `Bar`, and you accidentally pass a `Bar` to a function which expects a `Foo`, the resulting error message will just show two locations in the standard library (the `Bar` constructor and the `Foo` function), when the location of the actual bug is in the user code where the mixed up function call occured.

I ran into this issue several times while working on [IntercalScript](https://github.com/Storyyeller/IntercalScript), an early precursor to cubiml that used the same approach to error reporting. Unfortunately, I don't think this is a problem that has a good solution. You can of course easily modify cubiml to output the entire chain of inference leading to a type error and display each step to the user. However, this chain can be infeasibly large in pathological cases, either exponential or quadratic in the size of the program, depending on how you output it.

In traditional unification based languages, the maximum length of this chain is only linear in the size of the program, but that is still far too large to reasonably display to the programmer. Much ink has been spilled on attempting to solve this problem in languages like Haskell without a satisfactory answer. In practice, people just put manual type annotations everywhere in their code to avoid this issue. However, I think a more interesting potential approach is, once again, deeper editor integration, providing a mechanism to display errors _interactively_, allowing the programmer to expand the information on demand and quickly drill down to the actual problem using their knowledge of what the code was intended to do.

Anyway, with error messages out of the way, next week we will return to adding features to cubiml's type system. In particular, we will add support for mutability.

{{series_footer}}
