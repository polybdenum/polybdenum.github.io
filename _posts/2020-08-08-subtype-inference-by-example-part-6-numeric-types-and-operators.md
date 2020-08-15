---
layout: post
title: 'Subtype Inference by Example Part 6: Numeric Types and Operators'
series: cubiml
series-num: 6
date: 2020-08-08 10:27 -0700
---
{% include series-util.html %}
{{series_header}}

[Last week]({{prev_url}}), we finished covering how to implement the _cubic biunification_ type inference algorithm, using the language [`cubiml`](https://github.com/Storyyeller/cubiml-demo) as an example. However, in order to keep the initial tutorials streamlined and easy to follow, the initial version of cubiml was very minimal. Today we will begin the process of extending cubiml with new features to make it more useful and interesting. We will start simple by adding integer, floating point, and string literals to the language (and type system) as well as operators to use with them.

## Designing a number

Before we can begin, we have to decide _what_ we're implementing. Among existing programming languages, there is massive variation in how numeric types and operators work, with varying degrees of confusion and convenience, strictness and flexibility, and verbosity and amenability to type inference. 

### Int vs i32

The first question is which numeric types to support. Many old fashioned and/or low level programming languages support fixed width integral types, because they're easy to implement in the compiler. If an operation on a fixed width integer produces a result that does not fit within the chosen width, it silently gets truncated, or even worse, produces undefined behavior. This _integer overflow_ problem results in a very common class of bugs in such languages. 

Therefore, cubiml instead offers a single, arbitrary precision integer type, which makes the language much simpler and easier to understand and greatly reduces the potential for bugs. There are two main counterarguments to this approach. 

The first is that in cases where the modular arithmetic entailed by fixed width integer arithmetic is a desired part of the program logic, it leads to shorter code. However, the resulting code is error-prone and hard to read, and in any case, it makes no sense to let your language semantics be defined by what was convenient for compiler implementers 50 years ago. It's much better to keep modular arithmetic and truncation explicit in the rare cases where they are desirable.

The more reasonable complaint is that arbitrary precision integers are hard to optimize and provide poor performance by default. This is not an issue for cubiml, since it compiles to Javascript, but it can be a problem for low level languages that emphasize performance. 

For such languages, I recommend keeping integers as mathematical (arbitrary precision) integers within the language specification and simply requiring the programmer to insert explicit wrapping instructions and/or annotations as necessary so that each integer variable is statically known to only hold values that can be efficiently represented in the underlying machine storage. This not only simplifies the language, it also ensures that the user considers when and where integer overflow can happen and how to handle it appropriately, eliminating a large class of bugs.

### Operators

The next question is the design of operators. Can users define them? Are they just specially named methods on objects, or global functions, or intrinsic to the compiler? In the later two cases, what should their type signatures be?

User defined operator semantics works well in a dynamic language where everything is just methods on objects, but it works less well in statically typed languages due to the issue of how to determine in the compiler what code any given operator in the source code should represent. One approach is to explicitly pass around a list of functions to be used. This is very verbose, so languages usually provide a way to pass around the function list implicitly, as with Haskell's typeclasses or Scala's givens. However, this greatly complicates the language, so we'll avoid it in cubiml for now. 

To keep things simple in cubiml for didactic purposes, ints, floats, and strings are implemented as primitive types in the type system (just like we already did with booleans), and operators are intrinsics handled in the compiler rather than in library code. However, that still leaves the question of what types each operator should accept and produce.

### Operator type signatures

The simplest type to implement is an operator that takes and produces a single, specific type. For example, you could have an integer comparison operator with the type signature `(int, int) -> bool`. Likewise, you could have an integer addition operator `(int, int) -> int`. Since this is easy to implement and doesn't require adding any new concepts to the type system, this is the approach we will go with for now in cubiml.

Having type specific operators necessitates using a different operator for every type. For example, in many popular languages, the `+` operator is used for integer addition, floating point addition, _and_ string concatenation. In cubiml, we follow the Ocaml approach of disambiguating operators by appending a period to floating point operators. This means that `+` is reserved for integer addition and `+.` must be used for floating point addition (string concatenation is `^` in Ocaml). This approach obviously only works if you have a relatively small number of numeric types - it'd be completely unworkable if your language had the usual panoply of fixed width integers of varying sizes and signedness, but then again, I think having those is a bad idea to begin with.

In increasing order of implementation difficulty and complexity, the next up is an operator that can take in values of multiple types, including values of different types. For example, instead of having the integer comparison operator `>` typed `(int, int) -> bool` and the floating point comparison operator `>.` typed `(float, float) -> bool`, we could instead have a single comparison operator that lets you freely compare ints and floats, typed `(int | float, int | float) -> bool` where `|` is type union. This can be implemented with only minor changes to the typechecker, but it does require type checker changes and adds complexity, so I avoided it and kept the comparison operators separate for now. 

Note that this only works for operators that produce a fixed result type. You could theoretically have a generic addition operator following that approach with a type like `(int | float, int | float) -> int | float`, but that doesn't really make any sense and a result value of `int | float` is pretty much useless. Also note that the type signature `(int | float, int | float) -> bool` allows you to compare an int against a float. If you wanted to restrict the operator so it can only compare an int against an int and a float against a float, the type signature would be `((int, int) -> bool) & ((float, float) -> bool)`, a much more complicated beast. Likewise, the hypothetical combined addition/concatenation `+` operator would need to have the type signature `((int, int) -> int) & ((float, float) -> float) & ((string, string) -> string)`. This brings us to ad-hoc polymorphism.

### Ad-hoc polymorphism

So far everything we've done has been based on _parametric polymorphism_. This approach to code reuse involves finding an interface (or letting the compiler calculate it for you) that represents the requirements placed on inputs to a function, and writing the function code to only use that interface, making the code reusable with any type that is compatible with that interface. 

An alternative form of polymorphism, _ad-hoc polymorphism_, refers to code that can only be used with a specifically enumerated list of types. This is the result of traditional method overloading in languages like C++ and Java, where you can e.g. define a method `foo` taking an int and also define a `foo` method taking a float, and then you can call `foo` on ints and floats but no other types. Unfortunately, ad-hoc polymorphism also plays havoc with type inference, in addition to being brittle and unmaintainable from a user perspective.

Ad-hoc polymorphism can express almost arbitrary constraints, which goes against everything that makes global type inference work. Instead of propagating flow edges and types and iterating until convergence to find the single most general type for an expression, the compiler has to solve an arbitrary system of constraints, which is in general undecidable. For example, we previously saw that the combination of equality constraints and subtyping makes type inference undecidable in general, but the entire point of the ad-hoc polymorphism discussed here is to support equality constraints.

That being said, I believe that it is possible to handle this specific case and shoehorn it into the current type checker design. The reason is because we don't need _arbitrary_ equality constraints here, only equality of primitive types, which can be expressed by requiring that all values flowing to a given usage share the same type constructor head. (_Recursive_ equality constraints, which can reach inside a type constructor to enforce equality among the component types, would make type inference undecidable).

However, doing this is a horrible hack that goes against all the principles which underlie the system's design. In fact, it's so ugly that I'll go ahead and outline it here instead of saving it for a future post, since I don't have any plans to implement it in cubiml. The trick is to add a new type of use head node in the graph whose head is _mutable_. Whenever a value head flows to that use head and `check_heads` is called, we store the value's type constructor in the use head's mutable storage. Then if it is different from any type constructor that previously flowed to that head, we can raise a type error.

### Equality operators

In cubiml, the equality operators `==` and `!=` can be called with operands of any type, even operands of two different types. Unlike with `<`, `+`, etc. it is useful to be able to use them on objects, functions, etc. Some languages enforce the additional restriction that the two operands have _equal_ types, but as described above, this is incompatible with subtype inference. Furthermore, it's a questionable decision to begin with, since comparing values of unrelated types still has meaning (they are unequal), and overzealous restrictions can cause problems if you attempt to make the type system more precise. For example, you may want to track constant values in the type system, giving integer constants a special type which is a subtype of general ints. However, you would still want to be able to compare integer variables against constants in this case!


## Implementation

With all the theory out of the way, it's time to actually implement the new types, literals, and operators.

### Adding primitive types

As far as the type system goes, the only change is the addition of three new primitive types: ints, floats, and strings. Since these are primitive types, the implementation is the exact same as with booleans, making the changes required straightforward.


First we add the head constructors.

```diff
 #[derive(Debug, Clone)]
 enum VTypeHead {
     VBool,
+    VFloat,
+    VInt,
+    VStr,
     VFunc { arg: Use, ret: Value },
     VObj { fields: HashMap<String, Value> },
     VCase { case: (String, Value) },
```
 ```diff
 #[derive(Debug, Clone)]
 enum UTypeHead {
     UBool,
+    UFloat,
+    UInt,
+    UStr,
     UFunc { arg: Value, ret: Use },
     UObj { field: (String, Use) },
     UCase { cases: HashMap<String, Use> },
```

Next, we handle them in the `check_heads` function.

 ```diff
     match (lhs, rhs) {
         (&VBool, &UBool) => Ok(()),
+        (&VFloat, &UFloat) => Ok(()),
+        (&VInt, &UInt) => Ok(()),
+        (&VStr, &UStr) => Ok(()),
+
         (&VFunc { arg: arg1, ret: ret1 }, &UFunc { arg: arg2, ret: ret2 }) => {
             out.push((ret1, ret2));
             // flip the order since arguments are contravariant

```

Lastly, we add the public constructor methods.

```diff
     pub fn bool(&mut self) -> Value {
         self.new_val(VTypeHead::VBool)
     }
+    pub fn float(&mut self) -> Value {
+        self.new_val(VTypeHead::VFloat)
+    }
+    pub fn int(&mut self) -> Value {
+        self.new_val(VTypeHead::VInt)
+    }
+    pub fn str(&mut self) -> Value {
+        self.new_val(VTypeHead::VStr)
+    }
+
     pub fn bool_use(&mut self) -> Use {
         self.new_use(UTypeHead::UBool)
     }
+    pub fn float_use(&mut self) -> Use {
+        self.new_use(UTypeHead::UFloat)
+    }
+    pub fn int_use(&mut self) -> Use {
+        self.new_use(UTypeHead::UInt)
+    }
+    pub fn str_use(&mut self) -> Use {
+        self.new_use(UTypeHead::UStr)
+    }
 
     pub fn func(&mut self, arg: Use, ret: Value) -> Value {
         self.new_val(VTypeHead::VFunc { arg, ret })
```

### Literals

The next step is to add literals to the language. We start by adding them to the AST.

```diff
 #[derive(Debug)]
 pub enum Literal {
-    Bool(bool),
+    Bool,
+    Float,
+    Int,
+    Str,
 }
 
 type VarDefinition = (String, Box<Expr>);
```

Previously, we parsed boolean literals and stored the literal value as a `bool` inside the `ast::Literal` enum. However with the new literal types, parsing and serializing them would require a bunch of complicated logic that we don't actually need. Since the type checker doesn't care about literal values, we'll just represent literal values as a `String` of source code that is passed through to codegen unchanged. Doing this also avoids the need to add a dependency on a bignum library for representing the integer literal values. 

```diff
     If(Box<Expr>, Box<Expr>, Box<Expr>),
     Let(VarDefinition, Box<Expr>),
     LetRec(Vec<VarDefinition>, Box<Expr>),
-    Literal(Literal),
+    Literal(Literal, String),
     Match(Box<Expr>, Vec<(CaseMatchPattern, Box<Expr>)>),
     Record(Vec<(String, Box<Expr>)>),
     Variable(String),
```

Since all literal values are now represented the same way (a `String`) regardless of type, we also move them outside the `ast::Literal` enum and store them directly in the `ast::Expr::Literal` variant. It's a shame I didn't work ahead further on cubiml so I could avoid making design decisions like this that I'd have to undo later, making me look foolish, but such is the life of a software engineer.


#### Grammar

Next we add literals to the parser, which mostly consists of writing a bunch of giant regular expressions. There are a few minor differences from Ocaml's literal syntax here - we don't allow extra leading zeroes and floating point literals require a decimal point, even when an exponent is specified (Instead of `1e3`, you need to write `1.e3` or `1.0e3`). 

Lastly, we treat the minus sign for negative literals as part of the literal itself, rather than a unary minus applied to a positive literal as is done in most languages. This greatly simplifies the code, at the expense of occasionally leading to counterintuitive behavior for ambiguous syntax. For example, `5-3` will be parsed as the nonsensical functional call `5 (-3)` rather than `5 - 3` as intended, since `-3` is a valid token. This is mostly a consequence of using functional style function calls (`func arg`), whose lack of parenthesis surrounding arguments introduces lots of ambiguity and confusion into the syntax, and is largely not an issue with more traditional syntax.

```diff
 Ident: String = <r"[a-z_]\w*"> => String::from(<>);
 Tag: String = <r"`[A-Z]\w*"> => String::from(<>);
 
+IntLiteral: String = <r"-?(?:0|[1-9][[:digit:]]*)"> => String::from(<>);
+FloatLiteral: String =
+    <r"-?(?:0|[1-9][[:digit:]]*)\.[[:digit:]]*(?:[eE]-?[[:digit:]]+)?"> => String::from(<>);
+StringLiteral: String =
+    <r#""[^\\"]*(?:\\[tn'"\\][^\\"]*)*""#> => String::from(<>);
```

```diff
 VarOrLiteral: Box<ast::Expr> = {
     Ident => Box::new(
         match <>.as_str() {
-            "true" => ast::Expr::Literal(ast::Literal::Bool(true)),
-            "false" => ast::Expr::Literal(ast::Literal::Bool(false)),
+            "false" | "true" => ast::Expr::Literal(ast::Literal::Bool, <>),
             _ => ast::Expr::Variable(<>)
         }
     ),
+
+    FloatLiteral => Box::new(ast::Expr::Literal(ast::Literal::Float, <>)),
+    IntLiteral => Box::new(ast::Expr::Literal(ast::Literal::Int, <>)),
+    StringLiteral => Box::new(ast::Expr::Literal(ast::Literal::Str, <>)),
 }
 
 If: Box<ast::Expr> = {
```

#### Frontend

The final step is to add literal support in the typechecker frontend. 

```diff
             check_expr(engine, bindings, rest_expr)
         }),
-        Literal(val) => {
+        Literal(type_, code) => {
             use ast::Literal::*;
-            Ok(match val {
-                Bool(_) => engine.bool(),
+            Ok(match type_ {
+                Bool => engine.bool(),
+                Float => engine.float(),
+                Int => engine.int(),
+                Str => engine.str(),
             })
         }
         Match(match_expr, cases) => {
```

### Operators

We now have integer, floating point, and string literals in the language, but nothing to do with them. It's time to add some operators. Recall that we will be adding `+`, `-`, `*`, and `/` operators for integer math and `<`, `<=`, `>`, and `>=` for integer comparisons. For floating point numbers, we follow Ocaml's playbook and use a different set of operators with everything suffixed by `.` (`+.`, `*.`, `>=.` etc.). Lastly, we have the string concatenation operator `^` and the generic equality operators `==` and `!=`.
 

As usual, the first step is extending the AST.

```diff
     Str,
 }
 
+#[derive(Debug)]
+pub enum Op {
+    Add,
+    Sub,
+    Mult,
+    Div,
+
+    Lt,
+    Lte,
+    Gt,
+    Gte,
+
+    Eq,
+    Neq,
+}
+
+#[derive(Debug)]
+pub enum OpType {
+    IntOp,
+    FloatOp,
+    StrOp,
+
+    IntCmp,
+    FloatCmp,
+    AnyCmp,
+}
+
 type VarDefinition = (String, Box<Expr>);
 type CaseMatchPattern = (String, String);
 
 #[derive(Debug)]
 pub enum Expr {
+    BinOp(Box<Expr>, Box<Expr>, OpType, Op),
     Call(Box<Expr>, Box<Expr>),
     Case(String, Box<Expr>),
     FieldAccess(Box<Expr>, String),
```

The new `BinOp` AST node type has two extra fields - `OpType` and `Op`. `OpType` provides the type signature of the operation while `Op` tracks which operation it is, ignoring types. Splitting things up like this is convenient, since the typechecker only needs the former and codegen only needs to worry about the later.

Next, we add the new operators to the language grammar.

```diff
+MultOp: Box<ast::Expr> = {
+    <MultExpr> "*" <CallExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::IntOp, ast::Op::Mult)),
+    <MultExpr> "/" <CallExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::IntOp, ast::Op::Div)),
+    <MultExpr> "*." <CallExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::FloatOp, ast::Op::Mult)),
+    <MultExpr> "/." <CallExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::FloatOp, ast::Op::Div)),
+}
+AddOp: Box<ast::Expr> = {
+    <AddExpr> "+" <MultExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::IntOp, ast::Op::Add)),
+    <AddExpr> "-" <MultExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::IntOp, ast::Op::Sub)),
+    <AddExpr> "+." <MultExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::FloatOp, ast::Op::Add)),
+    <AddExpr> "-." <MultExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::FloatOp, ast::Op::Sub)),
+    <AddExpr> "^" <MultExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::StrOp, ast::Op::Add)),
+}
+CmpOp: Box<ast::Expr> = {
+    <AddExpr> "<" <AddExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::IntCmp, ast::Op::Lt)),
+    <AddExpr> "<=" <AddExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::IntCmp, ast::Op::Lte)),
+    <AddExpr> ">" <AddExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::IntCmp, ast::Op::Gt)),
+    <AddExpr> ">=" <AddExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::IntCmp, ast::Op::Gte)),
+
+    <AddExpr> "<." <AddExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::FloatCmp, ast::Op::Lt)),
+    <AddExpr> "<=." <AddExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::FloatCmp, ast::Op::Lte)),
+    <AddExpr> ">." <AddExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::FloatCmp, ast::Op::Gt)),
+    <AddExpr> ">=." <AddExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::FloatCmp, ast::Op::Gte)),
+
+    <AddExpr> "==" <AddExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::AnyCmp, ast::Op::Eq)),
+    <AddExpr> "!=" <AddExpr> => Box::new(ast::Expr::BinOp(<>, ast::OpType::AnyCmp, ast::Op::Neq)),
+}
```

The operators are split into three sections - multiplicative, additive, and comparison operators. This allows us to encode the correct precedence rules into the grammar. Equality operators are traditionally given lower precedence than relational operators (`<`, `>=.`, etc.) but Ocaml gives them the same precedence, so I decided to do so as well to save time and simplify the grammar. 

We do however depart from the practice of most languages by making the comparison operators non-associative. (Note that both operands of the `CmpOp` rule above are `AddOp`s, meaning it is impossible to compare the result of a comparison.) In languages like Javascript and Ocaml, `a < b < c` is valid syntax which gets parsed as `(a < b) < c`, but such code is nonsensical, so it is not allowed in cubiml. 

```diff
     CaseExpr,
     Call,
 }
-Expr = {
+MultExpr = {
     CallExpr,
+    MultOp,
+}
+AddExpr = {
+    MultExpr,
+    AddOp,
+}
+CompareExpr = {
+    AddExpr,
+    CmpOp,
+}
+Expr = {
+    CompareExpr,
     FuncDef,
     If,
     Let,
```

Lastly, we need to add support for `BinOp` nodes to the typechecker frontend. This is pretty straightforward as well.

```rust
BinOp(lhs_expr, rhs_expr, op_type, op) => {
    use ast::OpType::*;

    let lhs_type = check_expr(engine, bindings, lhs_expr)?;
    let rhs_type = check_expr(engine, bindings, rhs_expr)?;

    Ok(match op_type {
        IntOp => {
            let bound = engine.int_use();
            engine.flow(lhs_type, bound)?;
            engine.flow(rhs_type, bound)?;
            engine.int()
        }
        FloatOp => {
            let bound = engine.float_use();
            engine.flow(lhs_type, bound)?;
            engine.flow(rhs_type, bound)?;
            engine.float()
        }
        StrOp => {
            let bound = engine.str_use();
            engine.flow(lhs_type, bound)?;
            engine.flow(rhs_type, bound)?;
            engine.str()
        }
        IntCmp => {
            let bound = engine.int_use();
            engine.flow(lhs_type, bound)?;
            engine.flow(rhs_type, bound)?;
            engine.bool()
        }
        FloatCmp => {
            let bound = engine.float_use();
            engine.flow(lhs_type, bound)?;
            engine.flow(rhs_type, bound)?;
            engine.bool()
        }
        AnyCmp => engine.bool(),
    })
}
```

## Demo

Now that we've added numbers and basic math to cubiml, the language is much more useful. We can finally try out things like the fibonacci example from the first post. 

The demo has a regular editor pane as well as a REPL prompt. You can either enter your code into the window on the left and hit `Compile and run`, or enter it on the right and press enter. Note that `Compile and run` also clears the history of the repl. If there's an issue and you need to reset the demo completely, just refresh the page.

<script src="/demos/cubiml/p6/main.js"></script>
<noscript><em><strong>Error: This demo requires Javascript to run.</strong></em></noscript>
<cubiml-demo></cubiml-demo>

### Error messages

Up until now, we haven't worried about compiler error messages. Currently, the compiler error messages are generally unhelpful, just saying "unexpected types" in the event of a type error. Next week, we will see how to implement much better error messages.


{{series_footer}}
