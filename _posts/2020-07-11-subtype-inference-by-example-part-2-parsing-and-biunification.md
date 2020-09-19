---
layout: post
title: 'Subtype Inference by Example Part 2: Parsing and Biunification'
date: 2020-07-11 07:54 -0700
series: cubiml
series-num: 2
---
{% include series-util.html %}
{{series_header}}

In [last week's post]({{prev_url}}), we discussed a new approach to type inference called _cubic biunification_ and introduced [cubiml](https://github.com/Storyyeller/cubiml-demo), a simple ML-like language written in Rust that demonstrates cubic biunification. This week, we will cover the first steps towards implementing cubiml, as well as a high level overview of biunification.

## Parsing

The first step in a compiler is parsing the input source code and converting it from plain text to an [abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) (AST). I strongly recommend using a parser generator for this step. A parser generator is a tool that takes in a declarative, high level description of your language's syntax and automatically generates code to parse it. 

Some popular programming languages instead use hand-written parsers, which allow more fine grained control over things like compiler error messages at the expense of a massively increased maintenance burden. However, if you're working on a hobby programming language, your time is at a premium, so it's important to improve maintainability wherever you can. If your language ever becomes successful, you can worry about writing a custom parser later, aided by the volunteer efforts of your legions of adoring fans. 

Furthermore, using a parser generator allows you to easily experiment with changes to the language syntax, something that is extremely important for nascent programming languages and largely irrelevant to languages that actually have users. With a parser generator, making a change to the language syntax is almost as easy as simply describing that change, since the generator does all the heavy lifting for you.

In the case of cubiml, I am using the parser generator [LALRPOP](https://github.com/lalrpop/lalrpop), which takes in a description of the language grammar in a format like that below.

```
use super::ast; // super instead of self because lalrpop wraps this in an internal module


grammar;

Ident: String = <r"[a-z_]\w*"> => String::from(<>);
Tag: String = <r"`[A-Z]\w*"> => String::from(<>);

// make sure __proto__ is not considered a valid identifier
Illegal = "__proto__";

SepList<T, Sep>: Vec<T> = {
    <v:(<T> Sep)*> <e:T> => {
        let mut v = v;
        v.push(e);
        v
    }
};
SepListOpt<T, Sep>: Vec<T> = {
    SepList<T, Sep>,
    => Vec::new(),
};

VarOrLiteral: Box<ast::Expr> = {
    Ident => Box::new(
        match <>.as_str() {
            "true" => ast::Expr::Literal(ast::Literal::Bool(true)),
            "false" => ast::Expr::Literal(ast::Literal::Bool(false)),
            _ => ast::Expr::Variable(<>)
        }
    ),
}

If: Box<ast::Expr> = {
    "if" <Expr> "then" <Expr> "else" <Expr> => Box::new(ast::Expr::If(<>)),
}

FuncDef: Box<ast::Expr> = {
    "fun" <Ident> "->" <Expr> => Box::new(ast::Expr::FuncDef(<>)),
}
Call: Box<ast::Expr> = {
    CallExpr CaseExpr => Box::new(ast::Expr::Call(<>)),
}


KeyPairExpr = {
    <Ident> "=" <Expr>,
}
Record: Box<ast::Expr> = {
    "{" <SepListOpt<KeyPairExpr, ";">> "}" => Box::new(ast::Expr::Record(<>)),
}
FieldAccess: Box<ast::Expr> = {
    <SimpleExpr> "." <Ident> => Box::new(ast::Expr::FieldAccess(<>)),
}

Case: Box<ast::Expr> = {
    <Tag> <CaseExpr> => Box::new(ast::Expr::Case(<>)),
}

CaseMatchPattern = {
    Tag Ident,
}
MatchArm = {
    <CaseMatchPattern> "->" <CallExpr>,
}
Match: Box<ast::Expr> = {
    "match" <Expr> "with" <SepList<MatchArm, "|">> => Box::new(ast::Expr::Match(<>)),
}

LetLHS = {
    "let" <Ident> "=" <Expr>,
}
LetRHS = {
    "in" <Expr>,
}
Let: Box<ast::Expr> = {
    <LetLHS> <LetRHS> => Box::new(ast::Expr::Let(<>)),
}


LetRecDef = {
    <Ident> "=" <FuncDef>,
}
LetRecLHS = {
    "let" "rec" <SepList<LetRecDef, "and">>,
}
LetRec: Box<ast::Expr> = {
     <LetRecLHS> <LetRHS> => Box::new(ast::Expr::LetRec(<>)),
}


SimpleExpr = {
    FieldAccess,
    Record,
    VarOrLiteral,
    "(" <Expr> ")",
}
CaseExpr = {
    SimpleExpr,
    Case,
}
CallExpr = {
    CaseExpr,
    Call,
}
Expr = {
    CallExpr,
    FuncDef,
    If,
    Let,
    LetRec,
    Match,
}

TopLevelItem: ast::TopLevel = {
    <LetLHS> => ast::TopLevel::LetDef(<>),
    <LetRecLHS> => ast::TopLevel::LetRecDef(<>),
    <Expr> => ast::TopLevel::Expr(*<>),
}

pub Script = {
   <SepList<TopLevelItem, ";">>
}

```

The output of the parser is an abstract syntax tree, a tree of nodes representing the expressions and other bits of syntax in the input source code. Since Rust is statically typed, we have to define types for the AST.

First, we have a type for literals. `enum` is Rust's form of sum types. An enum type declaration gives a list of named variants and the data associated with each one. In this case, we only have one type of literal - booleans, but we'll be adding more later. The tag is `Bool` and the associated data is just a `bool` value giving the value of the parsed literal.

```rust
#[derive(Debug)]
pub enum Literal {
    Bool(bool),
}
```

The main type for the AST is `Expr`, representing a cubiml expression. It has variants for function calls, case objects, field access, function definitions, etc.

```rust
type VarDefinition = (String, Box<Expr>);
type CaseMatchPattern = (String, String);

#[derive(Debug)]
pub enum Expr {
    Call(Box<Expr>, Box<Expr>),
    Case(String, Box<Expr>),
    FieldAccess(Box<Expr>, String),
    FuncDef(String, Box<Expr>),
    If(Box<Expr>, Box<Expr>, Box<Expr>),
    Let(VarDefinition, Box<Expr>),
    LetRec(Vec<VarDefinition>, Box<Expr>),
    Literal(Literal),
    Match(Box<Expr>, Vec<(CaseMatchPattern, Box<Expr>)>),
    Record(Vec<(String, Box<Expr>)>),
    Variable(String),
}
```

Since expressions can contain other expressions recursively, we have to box them. In Rust, by default everything is included in structs or enums _by value_ (rather than by pointer as in Java, Python, etc.), so a struct or enum that recrusively contains values of its own type would have to be infinitely big, and thus the compiler does not allow that. To break the cycle, we instead use `Box<Expr>` everywhere, which is a pointer to a heap-allocated `Expr`.

Cubiml has been written with an emphasis on simplicity and code clarity over performance. For example, every single node in the AST will result in a separate allocation. In practice, a Rust project would likely consider allocating the tree nodes in an arena for efficiency, but doing so would add noise and confusion to the code which detracts from the goal of explaining how to implement type inference. Likewise, cubiml uses `String`, a pointer to a separately allocated string on the heap, to refer to identifiers and tags in the source code, rather than simply storing pointers into the input source code buffer like a typical Rust project would. 

Lastly, we have an AST node type for top level definitions. This can be either an ordinary expression, or a `let` or `let rec` definition that it does not have a right-hand side (the `in <expr>` part).

```rust
#[derive(Debug)]
pub enum TopLevel {
    Expr(Expr),
    LetDef(VarDefinition),
    LetRecDef(Vec<VarDefinition>),
}
```

## The typechecker core interface

Now that we have an AST, the next step is to typecheck it. In cubiml, the typechecker is divided into the frontend and the core. The frontend handles syntax specific details of the language and converts each expression into internal types and issues calls to the typechecker core. The core then processes these calls and returns a type error if there is an inconsistency.

We'll be covering the implementation of the typechecker core later, but for now, you just need to know the interface that the frontend will be calling. It looks like this:

```rust
pub struct Value;
pub struct Use;

impl TypeCheckerCore {
    pub fn var(&mut self) -> (Value, Use);

    pub fn bool(&mut self) -> Value;
    pub fn bool_use(&mut self) -> Use;

    pub fn func(&mut self, arg: Use, ret: Value) -> Value;
    pub fn func_use(&mut self, arg: Value, ret: Use) -> Use;

    pub fn obj(&mut self, fields: Vec<(String, Value)>) -> Value;
    pub fn obj_use(&mut self, field: (String, Use)) -> Use;

    pub fn case(&mut self, case: (String, Value)) -> Value;
    pub fn case_use(&mut self, cases: Vec<(String, Use)>) -> Use;

    pub fn flow(&mut self, lhs: Value, rhs: Use) -> Result<(), TypeError>;
}
```

This requires a bit of explanation. In cubiml, there are two different kinds of types - `Value` and `Use`. The former is for the types of program values, and the later is for the types of value _usages_, that is the constraints that a given expression places on its operands.

### Biunification

Traditional Hindley-Milner type inference is based on _unification_, the process of successively forcing two unknown types to be _equal_ until either a contradiction is reached or all program constraints are satisfied. One of the reasons that subtype inference has historically been so challenging is the [Semi-unification Theorem](https://www.sciencedirect.com/science/article/pii/S0890540183710035), which, very loosely speaking, states that solving an arbitrary system of equality and subtype constraints is undecidable. In _Algebraic Subtyping_, Dolan introduced a process he called _biunification_, which, again very loosely speaking, solved the undecidability problem by _only_ having subtype constraints and not allowing equality constraints.

However this, by itself, is not sufficient to make type inference decidable, since you can simulate an equality constraint `a = b` using the pair of subtyping constraints `a <= b` and `b <= a`. The other key part of biunification is the _polarized_ type system. Polarization means that types are divided into two kinds, traditionally called positive and negative, but which I here call _values_ and _uses_ to make things easier to understand. In order to avoid the infinite loops that make semi-unification undecidable, biunification restricts all subtype constraints to be of the form `v <= u` where v is a value type and u is a use type. These constraints can be naturally interpreted as requiring that a program value be compatible with the way it is used.

### Type variables

The basics of type checking under this system are fairly simple. Create a value type for each expression, a use type for each expression operand, and a subtype constraint between each value type and each context in which it is used to ensure consistency. We refer to these constraints `v <= u` as a value _flowing_ to its usage, and they are created with the `flow` method on `TypeCheckerCore`. 

However, there is one more wrinkle in the system - variables. Under biunification, variables are represented by a _pair_ of types - a value type and a use type. This is why `TypeCheckerCore`'s `var` method above returns the pair `(Value, Use)`. Conceptually, the value type represents the type _read_ from the variable, while the use type represents types _assigned_ to that variable. Naturally, we need the constraint `u <= v`, that is, every write to the variable is compatible with every read from that variable. However, this type of constraint is not allowed, since it could create infinite loops in the type checker when combined with `v <= u` constraints. 

The solution is that instead of representing this constraint directly, we instead just ensure transitivity of the _flows_ relation. For each variable `(v1, u1)`, and each value type `v2` that flows to `u1` and each use type `u2` that `v1` flows to, we add the constraint that `v2` flows to `u2`. Essentially, variables behave like little tunnels or wormholes in the type graph. Whatever goes in one end comes out the other.

With the theory out of the way, the actual implementation of the typechecker frontend is fairly straightforward. However, there's still a fair bit of code to go through, so I'll be covering that in [next week's post]({{next_url}}).

### Aside: type printing and simplification

The eagle-eyed among you may have noticed that the typechecker core interface above doesn't have any way to print out or display types. It just returns either a `TypeError` or returns nothing on success. This is deliberate. While it is possible to modify the system to print out types, I don't think this is useful except for debugging the typechecker. 

In explicitly typed systems, types are short and memorable because humans have to write them constantly, and thus they are naturally kept short one way or another (C++ template explosions notwithstanding). However, with large scale type inference, types are instead an automatically generated summary of the information needed to ensure program consistency, with no selection pressure to keep type descriptions concise, and hence tend to be very large and not suitable for human consumption. In a sense, inferred types are a _byproduct_ of the process of detecting bugs in a program, rather than a _product_. This means that it is generally not useful to explicitly display inferred types.

Existing type-inferred languages such as Haskell and OCaml already have this problem to some extent, but it is mitigated by the fact that real world code tends to make heavy use of explicit type annotations. Furthermore, traditional unification based inference tends to result in much smaller inferred types because type variables are artificially constrained to be _equal_ and can thus be identified and simplified. With subtyping however, the inferred types are more general, and hence much larger and harder to understand.

It is natural to try to simplify types, or convert them to a smaller equivalent representation, both to make them easier to read when printed out, as well as during normal operation of the typechecker in order to reduce the size of the types being operated on and hence improve performance. However, when doing so, you have to be extremely careful that your simplification pass isn't slower than the type checking itself! There's no sense in using a `O(n^4)` simplification algorithm to speed up a `O(n^3)` type inference algorithm.

In particular, the main simplification algorithm described in _Algebraic Subtyping_ actually has _exponential_ worst case complexity, and the pathological cases often occur in practice as well as in theory. In fact, one of the reasons cubiml is faster than Algebraic Subtyping is that does _not_ do any simplification. 

Simplification cannot improve the worst case complexity of cubic biunification, because the pathological cases can't be simplified anyway. However, real world code tends to contain lots of repetitive code constructs which can easily be simplified away, so simplification can potentially improve typechecking performance for real world code. Coming up with simplification passes that are both fast and practically useful is a challenge, but I think this is a worthy avenue for exploration.

Anyway, with that digression/rant out of the way, it's time to continue with the tutorial. In the [next post]({{next_url}}), we will cover the implementation of cubiml's typechecker frontend.

{{series_footer}}
