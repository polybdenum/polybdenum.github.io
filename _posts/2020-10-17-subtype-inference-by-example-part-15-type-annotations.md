---
layout: post
title: 'Subtype Inference by Example Part 15: Monomorphic Type Annotations'
series: cubiml
series-num: 15
date: 2020-10-17 07:25 -0700
---
{% include series-util.html %}
{{series_header}}

[Last week]({{prev_url}}), we discussed the theory behind static type annotations. This week, we will cover their actual implementation in cubiml.

## Type annotation design

In Ocaml, you can annotate the type of an expression by writing `(expr : type)`, e.g. ``(foo.bar : string)`` or `(fun x -> x : int -> int)`. However, while the syntax we'll be using in cubiml is similar, the introduction of subtyping and the polarized type system makes the actual design of type annotations a bit more complicated.

Recall from [last week]({{prev_url}}) that type annotations in cubiml serve two purposes: [increasing the number of compiler errors]({{prev_url}}#increasing-the-number-of-compiler-errors) and [improving performance and error messages]({{prev_url}}#improving-performance-and-error-messages). If we only cared about the first goal, we could just parse `type` as a value type and union it with the inferred type of `expr`. This is easy to implement and trivially sound and fulfills the goal of type widening, i.e. increasing the number of compiler errors. Note that under this system, the type annotation doesn't have to "match". It just gets "added" to the inferred type. For example, `(42 : string)` would just result in the type `int | string`. 

However, meeting the second goal is trickier, since it requires us to _replace_ the inferred type rather than just adding to it. The trick here is to parse the type annotation to create both a value type _and_ a use type, then add a flow constraint from the inferred (value) type to the explicit use type and return the explicit value type as the type of the expression as a whole.

Suppose we had some sequence of flow constraints like the following without type annotations:

```
int_v -> var1 -> var2 -> var3 -> var4 -> var5 -> var6 -> bool_u
```

This will result in a type error, since an int value type is not compatible with a bool use type. However, the compiler doesn't know which point in the chain might represent the actual mistake by the programmer, leading to non-specific error messages and possibly poor typechecking performance.

Now suppose the programmer adds an explicit type annotation to `var3` saying that it is intended to be an int. We now create a use and value type from the explicit type annotation and use them to "break the chain" somewhat like this.

```
int_v -> var1 -> var2 -> int_u XXX int_v -> var4 -> var5 -> var6 -> bool_u
```

Now, instead of one long chain, we have two shorter chains. The programmer's mistake can now be localized to the `int_v -> var4 -> var5 -> var6 -> bool_u` part, leading to more specific error messages. 

This means that when parsing a type annotation, we need to produce a (use type, value type) pair, where the former is a subtype of the latter. Effectively, this means our type annotations are restricted to types that can be mapped to _both_ polarities. Luckily, this isn't much of a restriction in practice.

## Typed expressions

To start with, we'll add the grammar rule and AST type for typed expressions, `(expr: type)`.

```diff
 SimpleExpr = {
     FieldAccess,
     Record,
     VarOrLiteral,
     "(" <Expr> ")",
+    "(" <Expr> ":" <Type> ")" => Box::new(ast::Expr::Typed(<>)),
 }
 RefExpr = {
     SimpleExpr,
@@ -60,9 +60,27 @@ pub enum Expr {
     Record(Option<Box<Expr>>, Vec<(Spanned<String>, Box<Expr>)>, Span),
     RefGet(Spanned<Box<Expr>>),
     RefSet(Spanned<Box<Expr>>, Box<Expr>),
+    Typed(Box<Expr>, Box<TypeExpr>),
     Variable(Spanned<String>),
 }
```

The typechecker implementation is straightforward: we just parse the `TypeExpr` to get a `(Value, Use)` type pair, then add a flow constraint from the inferred type to the parsed use type and return the parsed value type as the type of the expression as a whole. All the interesting parts are in `TypeExpr` and the new `parse_type_signature` function, which we'll cover next.
```rust
Typed(expr, sig) => {
    let expr_type = check_expr(engine, bindings, expr)?;
    let sig_type = parse_type_signature(engine, sig)?;
    engine.flow(expr_type, sig_type.1)?;
    Ok(sig_type.0)
}
```

## Type annotations

Next up, we have to implement the type annotations themselves. Here's the complete code as a bit of a preview, but I'll be going through it step by step later.

#### Grammar
```
RecordTypeExtension = <Type> "with";
KeyPairType = {
    <Spanned<Ident>> ":" <Type>,
}
RecordTypeSub = "{" <RecordTypeExtension?> <SepList<KeyPairType, ";">> "}";
RecordType: Box<ast::TypeExpr> = {
    Spanned<RecordTypeSub> => {
        let ((ext, fields), span) = <>;
        Box::new(ast::TypeExpr::Record(ext, fields, span))
    }
}

CaseTypeExtension = <Type> "|";
VariantType = <Spanned<Tag>> "of" <NoFunType>;
CaseTypeSub = "[" <CaseTypeExtension?> <SepList<VariantType, "|">> "]";
CaseType: Box<ast::TypeExpr> = {
    Spanned<CaseTypeSub> => {
        let ((ext, cases), span) = <>;
        Box::new(ast::TypeExpr::Case(ext, cases, span))
    }
}
FuncTypeSub = <NoFunType> "->" <Type>;
FuncType: Box<ast::TypeExpr> = {
    Spanned<FuncTypeSub> => Box::new(ast::TypeExpr::Func(<>)),
}
RefReadability: ast::Readability = {
    "readonly" "ref" => ast::Readability::ReadOnly,
    "writeonly" "ref" => ast::Readability::WriteOnly,
    "ref" => ast::Readability::ReadWrite,
}
RefType: Box<ast::TypeExpr> = {
    NoFunType Spanned<RefReadability> => Box::new(ast::TypeExpr::Ref(<>)),
}
QMark: spans::Span = Spanned<"?"> => <>.1;
NullableType: Box<ast::TypeExpr> = {
    NoFunType QMark => Box::new(ast::TypeExpr::Nullable(<>)),
}

TypeVar = "'" <Ident>;

NoFunType: Box<ast::TypeExpr> = {
    Spanned<Ident> => Box::new(ast::TypeExpr::Ident(<>)),
    <NoFunType> "as" <Spanned<TypeVar>> => Box::new(ast::TypeExpr::Alias(<>)),
    Spanned<TypeVar> => Box::new(ast::TypeExpr::TypeVar(<>)),

    RecordType,
    CaseType,
    RefType,
    NullableType,
    "(" <Type> ")",
}
Type: Box<ast::TypeExpr> = {
    NoFunType,
    FuncType,
}
```

#### AST
```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Readability {
    ReadWrite,
    ReadOnly,
    WriteOnly,
}

#[derive(Debug, Clone)]
pub enum TypeExpr {
    Alias(Box<TypeExpr>, Spanned<String>),
    Case(Option<Box<TypeExpr>>, Vec<(Spanned<String>, Box<TypeExpr>)>, Span),
    Func(Spanned<(Box<TypeExpr>, Box<TypeExpr>)>),
    Ident(Spanned<String>),
    Nullable(Box<TypeExpr>, Span),
    Record(Option<Box<TypeExpr>>, Vec<(Spanned<String>, Box<TypeExpr>)>, Span),
    Ref(Box<TypeExpr>, Spanned<Readability>),
    TypeVar(Spanned<String>),
}
```

#### Typechecker
```rust
fn parse_type(
    engine: &mut TypeCheckerCore,
    bindings: &mut HashMap<String, ((Value, Use), Span)>,
    tyexpr: &ast::TypeExpr,
) -> Result<(Value, Use)> {
    use ast::TypeExpr::*;
    match tyexpr {
        Alias(lhs, (name, span)) => {
            let (utype_value, utype) = engine.var();
            let (vtype, vtype_bound) = engine.var();

            let old = bindings.insert(name.to_string(), ((utype_value, vtype_bound), *span));
            if let Some((_, old_span)) = old {
                return Err(SyntaxError::new2(
                    format!("SyntaxError: Redefinition of type variable '{}", name),
                    *span,
                    "Note: Type variable was already defined here",
                    old_span,
                ));
            }

            let lhs_type = parse_type(engine, bindings, lhs)?;
            engine.flow(lhs_type.0, vtype_bound)?;
            engine.flow(utype_value, lhs_type.1)?;
            Ok((vtype, utype))
        }
        Case(ext, cases, span) => {
            // Create a dummy variable to use as the lazy flow values
            let dummy = engine.var();
            let (vtype, vtype_bound) = engine.var();

            let utype_wildcard = if let Some(ext) = ext {
                let ext_type = parse_type(engine, bindings, ext)?;
                engine.flow(ext_type.0, vtype_bound)?;
                Some((ext_type.1, dummy))
            } else {
                None
            };

            let mut utype_case_arms = Vec::new();
            for ((tag, tag_span), wrapped_expr) in cases {
                let wrapped_type = parse_type(engine, bindings, wrapped_expr)?;

                let case_value = engine.case((tag.clone(), wrapped_type.0), *tag_span);
                engine.flow(case_value, vtype_bound)?;
                utype_case_arms.push((tag.clone(), (wrapped_type.1, dummy)));
            }

            let utype = engine.case_use(utype_case_arms, utype_wildcard, *span);
            Ok((vtype, utype))
        }
        Func(((lhs, rhs), span)) => {
            let lhs_type = parse_type(engine, bindings, lhs)?;
            let rhs_type = parse_type(engine, bindings, rhs)?;

            let utype = engine.func_use(lhs_type.0, rhs_type.1, *span);
            let vtype = engine.func(lhs_type.1, rhs_type.0, *span);
            Ok((vtype, utype))
        }
        Ident((s, span)) => match s.as_str() {
            "bool" => Ok((engine.bool(*span), engine.bool_use(*span))),
            "float" => Ok((engine.float(*span), engine.float_use(*span))),
            "int" => Ok((engine.int(*span), engine.int_use(*span))),
            "null" => Ok((engine.null(*span), engine.null_use(*span))),
            "str" => Ok((engine.str(*span), engine.str_use(*span))),
            "number" => {
                let (vtype, vtype_bound) = engine.var();
                let float_lit = engine.float(*span);
                let int_lit = engine.int(*span);
                engine.flow(float_lit, vtype_bound)?;
                engine.flow(int_lit, vtype_bound)?;
                Ok((vtype, engine.int_or_float_use(*span)))
            }
            "top" => {
                let (_, utype) = engine.var();
                let (vtype, vtype_bound) = engine.var();
                let float_lit = engine.float(*span);
                let bool_lit = engine.bool(*span);
                engine.flow(float_lit, vtype_bound)?;
                engine.flow(bool_lit, vtype_bound)?;
                Ok((vtype, utype))
            }
            "bot" => {
                let (vtype, _) = engine.var();
                let (utype_value, utype) = engine.var();
                let float_lit = engine.float_use(*span);
                let bool_lit = engine.bool_use(*span);
                engine.flow(utype_value, float_lit)?;
                engine.flow(utype_value, bool_lit)?;
                Ok((vtype, utype))
            }
            "_" => Ok(engine.var()),
            _ => Err(SyntaxError::new1(
                "SyntaxError: Unrecognized simple type (choices are bool, float, int, str, number, null, top, bot, or _)",
                *span,
            )),
        },
        Nullable(lhs, span) => {
            let lhs_type = parse_type(engine, bindings, lhs)?;
            let utype = engine.null_check_use(lhs_type.1, *span);

            let (vtype, vtype_bound) = engine.var();
            let null_lit = engine.null(*span);
            engine.flow(lhs_type.0, vtype_bound)?;
            engine.flow(null_lit, vtype_bound)?;
            Ok((vtype, utype))
        }
        Record(ext, fields, span) => {
            let (utype_value, utype) = engine.var();

            let vtype_wildcard = if let Some(ext) = ext {
                let ext_type = parse_type(engine, bindings, ext)?;
                engine.flow(utype_value, ext_type.1)?;
                Some(ext_type.0)
            } else {
                None
            };

            let mut vtype_fields = Vec::new();

            for ((name, name_span), wrapped_expr) in fields {
                let wrapped_type = parse_type(engine, bindings, wrapped_expr)?;

                let obj_use = engine.obj_use((name.clone(), wrapped_type.1), *name_span);
                engine.flow(utype_value, obj_use)?;
                vtype_fields.push((name.clone(), wrapped_type.0));
            }

            let vtype = engine.obj(vtype_fields, vtype_wildcard, *span);
            Ok((vtype, utype))
        }
        Ref(lhs, (rw, span)) => {
            use ast::Readability::*;
            let lhs_type = parse_type(engine, bindings, lhs)?;

            let write = if *rw == ReadOnly {
                (None, None)
            } else {
                (Some(lhs_type.1), Some(lhs_type.0))
            };
            let read = if *rw == WriteOnly {
                (None, None)
            } else {
                (Some(lhs_type.0), Some(lhs_type.1))
            };

            let vtype = engine.reference(write.0, read.0, *span);
            let utype = engine.reference_use(write.1, read.1, *span);
            Ok((vtype, utype))
        }
        TypeVar((name, span)) => {
            if let Some((res, _)) = bindings.get(name.as_str()) {
                Ok(*res)
            } else {
                Err(SyntaxError::new1(
                    format!("SyntaxError: Undefined type variable {}", name),
                    *span,
                ))
            }
        }
    }
}

fn parse_type_signature(engine: &mut TypeCheckerCore, tyexpr: &ast::TypeExpr) -> Result<(Value, Use)> {
    let mut bindings = HashMap::new();
    parse_type(engine, &mut bindings, tyexpr)
}
```

## Type annotations in detail

Recall that parsing a type signature needs to produce a value type _and_ a use type. The most obvious approach is to have separate syntax for use type and value type annotations and define the type signature syntax as a pair of the two. However, this is very verbose and is confusing to users used to languages with non-polarized type systems, and it is not actually necessary anyway. Pretty much anything the programmer would normally think of as a type (`int`, `{a: string; b: float}`, `bool -> int -> int`, etc.) is interpretable as both a use type and a value type in our system anyway.

Therefore, our type annotation syntax covers only types that correspond to both a valid use and value type, which is basically everything in our type system except for union and intersection types. Luckily, this is not actually a restriction when working with monotypes (it is more significant when dealing with type subsumption and polymorphic type signatures, but that's a huge can of worms that I don't plan to cover).

### Base types

To start with, we have the primitive types: `bool`, `float`, `int`, `str`, and `null`. These are just represented by their name in the syntax. In order to avoid making those type names into keywords (and make the syntax more future proof for user-defined types), the grammar just accepts any identifier and stores it in a `TypeExpr::Ident` node, with the checking done later.

```
Spanned<Ident> => Box::new(ast::TypeExpr::Ident(<>)),
```

Once inside `parse_type_signature`, when matching an `Ident` node, we just match against the type and return the appropriate type pair, or a syntax error if the identifier wasn't a valid base type name. In addition to `bool`, `float`, `int`, `str`, and `null`, there's also `bot`, `top`, `number` and `_` which we'll get to later.

```rust
Ident((s, span)) => match s.as_str() {
    "bool" => Ok((engine.bool(*span), engine.bool_use(*span))),
    "float" => Ok((engine.float(*span), engine.float_use(*span))),
    "int" => Ok((engine.int(*span), engine.int_use(*span))),
    "null" => Ok((engine.null(*span), engine.null_use(*span))),
    "str" => Ok((engine.str(*span), engine.str_use(*span))),
    "number" => // todo
    "top" => // todo
    "bot" => // todo
    "_" => // todo
    _ => Err(SyntaxError::new1(
        "SyntaxError: Unrecognized simple type (choices are bool, float, int, str, number, null, top, bot, or _)",
        *span,
    )),
},
```

`parse_type_signature` returns a `(Value, Use)` pair. For primitive types this is trivial - just call the corresponding constructor functions in the typechecker core. For example for `bool`, we just do `(engine.bool(*span), engine.bool_use(*span))`. 

However, there is one complication - previously, we did not bother creating a null use type, since there was no need. Without type annotations, there's no way to make use of the fact that a value is guaranteed to be null. However, now things are different. The programmer might want to annotate a value as being null (only) and in order to "break the chain" as discussed above, we need both a value and a use type. Therefore, we need to quickly go in and add a null use type, following the usual pattern:

```diff
@@ -42,6 +42,7 @@ enum UTypeHead {
     UBool,
     UFloat,
     UInt,
+    UNull,
     UStr,
     UIntOrFloat,
     UFunc {
@@ -78,6 +79,7 @@ fn check_heads(
         (&VBool, &UBool) => Ok(()),
         (&VFloat, &UFloat) => Ok(()),
         (&VInt, &UInt) => Ok(()),
+        (&VNull, &UNull) => Ok(()),
         (&VStr, &UStr) => Ok(()),
         (&VInt, &UIntOrFloat) => Ok(()),
         (&VFloat, &UIntOrFloat) => Ok(()),
@@ -188,6 +190,7 @@ fn check_heads(
                 UBool => "boolean",
                 UFloat => "float",
                 UInt => "integer",
+                UNull => "null",
                 UStr => "string",
                 UIntOrFloat => "float or integer",
                 UFunc { .. } => "function",
@@ -291,6 +294,9 @@ impl TypeCheckerCore {
     pub fn int_use(&mut self, span: Span) -> Use {
         self.new_use(UTypeHead::UInt, span)
     }
+    pub fn null_use(&mut self, span: Span) -> Use {
+        self.new_use(UTypeHead::UNull, span)
+    }
     pub fn str_use(&mut self, span: Span) -> Use {
         self.new_use(UTypeHead::UStr, span)
     }
```

### Number

Recall that our ordered comparison operators (<, >, <=, and >=) compare values of type `int | float`, i.e. they accept both integers _and_ floating point numbers. Although it's uncommon, code which uses inputs only for comparison would want to use this type and hence, we need to expose it in the type system. For example, consider the following function:

```ocaml
let compare = fun args -> 
    if args.x < args.y then
        -1
    else if args.x == args.y then
        0
    else
        1;
```

Such a function should have the type signature `{x: number; y: number} -> int`, where `number` is shorthand for `int | float`. I went back and forth on whether to call this type `comparable`, which reflects what it really means (types that can be compared) or `number`, which reflects what types happen to implement it in cubiml, but ultimately decided the later would be less confusing. However, this is just for the sake of illustration - you'll probably do things differently depending on the precise details of the type system you choose for your own language.

Anyway, syntax-wise this just uses the `Ident` node like the previous base types above. The only difference is in `parse_type_signature`.

```rust
"number" => {
    // form the union vtype = float | int
    let (vtype, vtype_bound) = engine.var();
    let float_lit = engine.float(*span);
    let int_lit = engine.int(*span);
    engine.flow(float_lit, vtype_bound)?;
    engine.flow(int_lit, vtype_bound)?;
    Ok((vtype, engine.int_or_float_use(*span)))
}
```

For the use type, we just return `engine.int_or_float_use()`. However, there's no such thing as an `int_or_float` value type in our typesystem. Instead, we just take the union of the regular value types for int and float (the `engine.int()` and `engine.float()` respectively). Recall that to take the union of two value types, we just create a temporary type variable and then add flow constraints from each type to that variable. (We can also take the intersection of use types through the same process, just with the edges reversed).

### Placeholders

Sometimes, it is useful to be able to only specify _part_ of the type. To this end, we support placeholder types, written `_`. For example, if you have a function `f` and want to specify that it takes an `int` as argument but don't want to specify anything about the return type, you can just write `(f : int -> _)`. 

Placeholders effectively get filled in by the corresponding part of the inferred type. This means that the type annotation no longer "breaks the chain" completely when placeholders are used. It only breaks the chain with respect to the parts of the type that are explicitly specified. In fact, writing `(e : _)` is equivalent to just `e` without a type annotation at all. 

Anyway, implementation-wise, this is the easiest type of all to implement. We just create a fresh type variable and return that. This will result in an extra link in the chain but otherwise behave as if there was no type annotation at all.

```rust
"_" => Ok(engine.var()),
```

### Nullable types

Next up, we have nullable types, i.e. types of values that could be null or some non-null value. This uses the syntax `T?` where `T` is another type. For example `string?` means `string | null`, while `number?` means `int | float | null`.

```
QMark: spans::Span = Spanned<"?"> => <>.1;
NullableType: Box<ast::TypeExpr> = {
    NoFunType QMark => Box::new(ast::TypeExpr::Nullable(<>)),
}
```

Typechecking-wise, nullable types are similar to `number`. However, the `Nullable` node in the AST contains another type signature (the `T` in `T?`). We therefore start by parsing the child type signature to create a type pair for the child. For the use type, we wrap the child use type in `null_check_use` and return it. For the value type, we form the union `T | null` where T is the child value type, similarly to the `number` example previously.

```rust
Nullable(lhs, span) => {
    let lhs_type = parse_type(engine, bindings, lhs)?;
    let utype = engine.null_check_use(lhs_type.1, *span);

    // form the union vtype = lhs_type.0 | null
    let (vtype, vtype_bound) = engine.var();
    let null_lit = engine.null(*span);
    engine.flow(lhs_type.0, vtype_bound)?;
    engine.flow(null_lit, vtype_bound)?;
    Ok((vtype, utype))
}
```

### Function types

Function types use the syntax `T1 -> T2` where `T1` is the argument type and `T2` is the return type.

```
FuncTypeSub = <NoFunType> "->" <Type>;
FuncType: Box<ast::TypeExpr> = {
    Spanned<FuncTypeSub> => Box::new(ast::TypeExpr::Func(<>)),
}
```

Typechecking is straightforward - just parse the child type signatures and create a function use and value type from them. The only slightly tricky part is that function arguments are contravariant, so we need to reverse the order for the argument type.

```rust
Func(((lhs, rhs), span)) => {
    let lhs_type = parse_type(engine, bindings, lhs)?;
    let rhs_type = parse_type(engine, bindings, rhs)?;

    let utype = engine.func_use(lhs_type.0, rhs_type.1, *span);
    let vtype = engine.func(lhs_type.1, rhs_type.0, *span);
    Ok((vtype, utype))
}
```

### Reference types

Here the interesting part is actually the syntax. Recall that when adding reference types to cubiml, we left space in the type system to support read-only and write-only references, even though the language defined no means to actually create them. Apart from consistency in the type system, the main reason was because once type annotations are added, you might want to be able to explicitly _widen_ a reference to a read-only or write-only type. Well now it's the time to do this.

In Ocaml, references are always read-write and use the syntax `T ref`. For some reason (apparently dating back to notational conventions in CS papers from the 70s), generic type parameters are _backwards_ in Ocaml, i.e. a reference _value_ is written `ref 1`, but a reference _type_ is written `int ref`. 

Since Ocaml doesn't support read-only or write-only references, we have to make up our own syntax for them here. I went with `T ref` for read-write references and `T readonly ref` and `T writeonly ref` for read-only and write-only references respectively.

```
RefReadability: ast::Readability = {
    "readonly" "ref" => ast::Readability::ReadOnly,
    "writeonly" "ref" => ast::Readability::WriteOnly,
    "ref" => ast::Readability::ReadWrite,
}
RefType: Box<ast::TypeExpr> = {
    NoFunType Spanned<RefReadability> => Box::new(ast::TypeExpr::Ref(<>)),
}
```

We also have a separate enum in the AST to store the readability status of a reference type signature.
```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Readability {
    ReadWrite,
    ReadOnly,
    WriteOnly,
}
```

Now comes the typechecker part. The basic idea is simple - just parse the child type signature and pass it to the reference type constructors. The only complicated bit is that the read and write parameters of the reference type constructors are optional. When the ref type is read-only, we pass `None` for the write parameter, otherwise we pass `Some(lhs_type)` as usual, and likewise for write-only references.

```rust
Ref(lhs, (rw, span)) => {
    use ast::Readability::*;
    let lhs_type = parse_type(engine, bindings, lhs)?;

    let write = if *rw == ReadOnly {
        (None, None)
    } else {
        (Some(lhs_type.1), Some(lhs_type.0))
    };
    let read = if *rw == WriteOnly {
        (None, None)
    } else {
        (Some(lhs_type.0), Some(lhs_type.1))
    };

    let vtype = engine.reference(write.0, read.0, *span);
    let utype = engine.reference_use(write.1, read.1, *span);
    Ok((vtype, utype))
}
```

Note that readability is a property of a particular reference (or rather its static type), not a storage location. Having a read-only reference still allows the possibility that other writable references to that location exist and vice versa. For example, consider the following code with an `add` function that "returns" its answer via an output pointer as is common in C code.

```ocaml
let add = (
    (* the type annotation ensures that this function does not read from args.out *)
    fun args -> 
        args.out := args.x + args.y
    : {x: int; y: int; out: int writeonly ref} -> _);

let r = ref 0;
add {x=91; y=101; out=r};

(* let's check what answer we got *) 
!r
```

We put a `writeonly` annotation on the output pointer to ensure that the `add` function does not try to read from it and access uninitialized data. Trying to do so results in a type error as expected:

```
TypeError: Reference is not readable.
Note: Ref is made write-only here
        let _ = !args.out in
        args.out := args.x + args.y
    : {x: int; y: int; out: int writeonly ref} -> _);
                                ^~~~~~~~~~~~~        

let r = ref 0;
But is read here.
    (* the type annotation ensures that this function does not read from args.out *)
    fun args -> 
        let _ = !args.out in
                 ^~~~~~~~   
        args.out := args.x + args.y
    : {x: int; y: int; out: int writeonly ref} -> _);
```

However, we can still read from `r` later to see the output of `add`, even though it points to the same location as `args.out`. In particular, this means that holding a reference with `readonly` type does not guarantee that successive reads return the same value, due to the possibility of aliasing. If you wanted to make that guarantee, you'd need a Rust-style ownership system with affine types and borrowing.

### Record types

Record types are similar to record values, except that field names are separated by `:` instead of `=`. For example, a record type with an int field named `a` and a nullable string field named `b` would be `{a: int; b: string?}`.

However, there are two other wrinkles. First off, we require the list of fields to be non-empty. If you want to type an empty record (`{}`), you need to write `top` instead for reasons I'll explain later.

Second, we use an analogue of the record extension syntax to support row polymorphism. Recall that the placeholder type `_` allows you to specify only part of a type. For example, the type signature `{a: int; b: _}` ensures that `a` is an `int` while placing no restrictions on the type of field `b`. 

However, the list of field names is still completely specified. If you want to specify the type for a single field while not placing any restrictions on any other fields that may or may not be present, you can instead write `{_ with a: int}`, similarly to the record extension syntax `{foo with a=4}`.

> **Note:** [Previously]({% post_url 2020-08-29-subtype-inference-by-example-part-9-nonexhaustive-matching-record-extensions-and-row-polymorphism %}#record-extension), I thought that Ocaml does not support record extension, so I used Elm-like syntax instead. However, it turns out that while Ocaml does not support record extension, it does have a similar feature called functional updates which uses the syntax `{old_record with foo=new_val}`. Ocaml's version is much more limited - it can only change the value of existing fields, not shadow or add new fields, but it is similar enough that I decided to switch cubiml to using `with` for record extension instead of `|`.

Note that the record type extension syntax only really makes sense when the left hand side is a placeholder type. For example, there's no reason to write a type signature like `{ {a: int} with b: bool }` because you could just as easily write `{a:int; b: bool}` instead. However, we still allow the left hand side to be an arbitrary type signature in order to keep the grammar simple, since that's easier than trying to restrict it to placeholders. Likewise, the `T` in `T?` can be any type, allowing redundant type signatures like `string??` or even `null?`, since that keeps the syntax simple.

```
RecordTypeExtension = <Type> "with";
KeyPairType = {
    <Spanned<Ident>> ":" <Type>,
}
RecordTypeSub = "{" <RecordTypeExtension?> <SepList<KeyPairType, ";">> "}";
RecordType: Box<ast::TypeExpr> = {
    Spanned<RecordTypeSub> => {
        let ((ext, fields), span) = <>;
        Box::new(ast::TypeExpr::Record(ext, fields, span))
    }
}
```

In the typechecker, we parse the child type signatures for each field (and the wildcard, if present) as usual and create a record value type from them to return. The use type side is more complicated - for each (field, type signature) pair, we create a record use type with that field and the parsed use type and then take the intersection of all these use types and return that. 

If a wildcard is present, we add its use type to the intersection as well. E.g. in a type annotation like `(expr: {T with foo: int; bar: bool})`, where `T` is parsed to produce the type pair `(V, U)`, we add a flow constraint from the inferred type of `expr` to `U` as well as to `{foo: int}` and `{bar: bool}`. (Or more specifically, we create the intersection type `U & {foo: int} & {bar: bool}` and then add a flow constraint to it.

```rust
Record(ext, fields, span) => {
    let (utype_value, utype) = engine.var();

    let vtype_wildcard = if let Some(ext) = ext {
        let ext_type = parse_type(engine, bindings, ext)?;
        engine.flow(utype_value, ext_type.1)?;
        Some(ext_type.0)
    } else {
        None
    };

    let mut vtype_fields = Vec::new();

    for ((name, name_span), wrapped_expr) in fields {
        let wrapped_type = parse_type(engine, bindings, wrapped_expr)?;

        let obj_use = engine.obj_use((name.clone(), wrapped_type.1), *name_span);
        engine.flow(utype_value, obj_use)?;
        vtype_fields.push((name.clone(), wrapped_type.0));
    }

    let vtype = engine.obj(vtype_fields, vtype_wildcard, *span);
    Ok((vtype, utype))
}
```

### Top and bottom types

As mentioned before, our type annotation syntax is restricted to types that can be mapped to both a value type and a use type, in order to reduce verbosity and avoid programmer confusion. The main effect of this is that union and intersection types are not allowed in type signatures, with a handful of specific exceptions (`number = int | float`, `T? = T | null`, etc.)

At first glance, this may seem like a serious limitation. For example, suppose you have a function that could return an `int` _or_ a `bool`. How would you give it a type annotation when `int | bool` isn't allowed? The crucial insight is that while the compiler internally tracks the fact that this value could be an int or a bool, there is no way for the programmer to actually observe this. From a programmer perspective, _the only value types that matter are those distinguishable by some use type_ and vice versa.

For example, if you take that `int | bool` value and try to use it, you'll find that you can't actually do anything with it except for things that can be done with any value regardless of type. If you try to add it, you'll get an error because bools can't be added. If you try to use it as an `if` condition, you'll get an error because int's aren't a valid condition, only bools are.

From a programmer perspective, there's no way to distinguish this value's type from that of say, a value of type `string | float`, or even `{a:int} | (bool -> bool)`. All they know is that they have a value which has no permissible type specific operations. (Well ok, the error messages will obviously be different, but the actual set of programs that they can be used in is the same. They are _contextually equivalent_.)

Incidentally, this is the reason that we had to define the `number` and `T?` types previously. A value of type `int | float` _can_ be distinguished, because you are allowed to use it with a comparison operator (`a < b`), unlike say, a value of type `int | bool`. Needless to say, this depends a lot on the details of the type system you implement. If you add some use type that accepts both ints and bools (perhaps you like using ints as if conditions, C-style), then suddenly `int | bool` is distinguishable and you need to handle it in the type annotation syntax.

Therefore, we don't need to support union and intersection types in the annotation syntax aside from the special cases already discussed. However, we still need _some_ way to annotate the type of an expression that has an unusable type like `int | bool`. The answer is that we add two special new base types: `top` and `bot`.

`top` is the supertype of all types. It represents a value that can be any type, and hence has no supported operations (other than operations like `==` that accept any type). 

`bot` is the opposite— the _subtype_ of all types. It represents a value that is _every_ type, and hence usable in _any_ operation. Since no value has every type, this means it is impossible to actually construct a value of `bot` type. `bot` is useful mainly to represent the argument type of functions which are impossible to call (since it's impossible to produce a `bot` value to call them with) or the return type of functions that never return.

This is also why you need to use `top` to type empty records as mentioned previously. A record with fields can be distinguished by accessing those fields, but (in the current implementation of cubiml) there's nothing you can actually do with an empty record just based on the fact that it is a record. There's no use type that cares about records independent of their fields. An empty record may as well be an `int | bool` from the programmer's perspective.

### Case types

As usual, case types are the dual of records - they're very similar, just with the polarities reversed. However, there are two notable differences - first the syntax is obviously different, and second, our case types now support conditional flow, which has no equivalent in our record types.

First, the syntax. Following Ocaml, case types are written like ``[`Tag1 of int | `Tag2 of bool]`` for a fixed list of possible tags. If you want to include some tags, plus possibly any number of tags not mentioned, you can instead write ``[_ | `Tag1 of int | `Tag2 of bool]``. As with record wildcards, the `_` at the beginning can be any type, syntax-wise, but it only makes sense when it is a placeholder.

```
CaseTypeExtension = <Type> "|";
VariantType = <Spanned<Tag>> "of" <NoFunType>;
CaseTypeSub = "[" <CaseTypeExtension?> <SepList<VariantType, "|">> "]";
CaseType: Box<ast::TypeExpr> = {
    Spanned<CaseTypeSub> => {
        let ((ext, cases), span) = <>;
        Box::new(ast::TypeExpr::Case(ext, cases, span))
    }
}
```

Next, there's the matter of how to handle conditional flow. Recall that conditional flow enables _presence polymorphism_, types that are polymorphic in the presence or absence of a type. However, in monomorphic code, conditional flow doesn't actually do anything useful, since you can just delete the dead code to achieve the same effect.

Luckily, our type annotations only handle monomorphic types, so we don't need to worry about presence polymorphism at all. The type constructor still requires us to supply a type pair for the conditional flow, so we just create a dummy variable for this purpose. The code is otherwise the same as for record types, just with the polarities reversed.

```rust
Case(ext, cases, span) => {
    // Create a dummy variable to use as the lazy flow values
    let dummy = engine.var();
    let (vtype, vtype_bound) = engine.var();

    let utype_wildcard = if let Some(ext) = ext {
        let ext_type = parse_type(engine, bindings, ext)?;
        engine.flow(ext_type.0, vtype_bound)?;
        Some((ext_type.1, dummy))
    } else {
        None
    };

    let mut utype_case_arms = Vec::new();
    for ((tag, tag_span), wrapped_expr) in cases {
        let wrapped_type = parse_type(engine, bindings, wrapped_expr)?;

        let case_value = engine.case((tag.clone(), wrapped_type.0), *tag_span);
        engine.flow(case_value, vtype_bound)?;
        utype_case_arms.push((tag.clone(), (wrapped_type.1, dummy)));
    }

    let utype = engine.case_use(utype_case_arms, utype_wildcard, *span);
    Ok((vtype, utype))
}
```

### Recursive types

Our type annotations are mostly complete, but there's still one more case we need to handle— recursive types. Sometimes, it's useful to define types in terms of themselves. For example, consider the following code that creates a simple recursive linked list.

```ocaml
let rec build_list = fun n ->
    if n < 0 then
        null
    else
        {val=n; next=build_list (n - 1)};

let list = (build_list 4 : (* what goes here??? *))
```

As it turns out, it is impossible to type this expression with the syntax we've defined so far. The `build_list` function returns either `null` or a list node that contains an int value and a pointer to another list node (possibly null). In pseudocode, we could define it as something like `type list = null | {val: int; next=list}`, where the `list` type is defined in terms of itself.

The actual syntax for recursive types is similar but works slightly differently. It consists of two parts. First, you can _alias_ a type by writing `T as 'name`, which defines a type variable `'name` equal to `T`. You can then use the _type variable_ by name, e.g. write `'name`. Using this syntax, we can now type the list example above like this:

```ocaml
let list = (build_list 4 : {val: int; next: 'list}? as 'list)
```

As usual, we start with the syntax grammar. In this case, it's just two simple rules:

```
<NoFunType> "as" <Spanned<TypeVar>> => Box::new(ast::TypeExpr::Alias(<>)),
Spanned<TypeVar> => Box::new(ast::TypeExpr::TypeVar(<>)),
```

Adding it to the typechecker however requires a larger rework. The eagle-eyed among you may have noticed that I previously defined the type parsing function as `parse_type_signature`, but whenever a type signature needed to recursively parse another type, it instead called `parse_type` and with a mysterious `bindings` parameter added as well.

The reason for this is because type parsing now needs to keep track of the defined set of type variables and their corresponding type pairs. In order to simplify things, we prohibit shadowing or redefinition of type variables, so we can use a simple `HashMap` to track this.

`parse_type_signature` is the top level function for parsing a type signature. It creates an empty map of type variable bindings and then calls `parse_type` with it. 

```rust
fn parse_type_signature(engine: &mut TypeCheckerCore, tyexpr: &ast::TypeExpr) -> Result<(Value, Use)> {
    let mut bindings = HashMap::new();
    parse_type(engine, &mut bindings, tyexpr)
}
```

`parse_type` is in turn the recursive function where all the code we previously discussed is actually located.

```rust
fn parse_type(
    engine: &mut TypeCheckerCore,
    bindings: &mut HashMap<String, ((Value, Use), Span)>,
    tyexpr: &ast::TypeExpr,
) -> Result<(Value, Use)> {
    use ast::TypeExpr::*;
    match tyexpr {
        Alias(lhs, (name, span)) => // ...
        Case(ext, cases, span) => // ...
        Func(((lhs, rhs), span)) => // ...
        Ident((s, span)) => // ...
        Nullable(lhs, span) => // ...
        Record(ext, fields, span) => // ...
        Ref(lhs, (rw, span)) => // ...
        TypeVar((name, span)) => // ...
    }
}
```

With the `bindings` parameter now threaded through, we just need to define the parsing code for `Alias` and `TypeVar`. We'll start with the later:

```rust
TypeVar((name, span)) => {
    if let Some((res, _)) = bindings.get(name.as_str()) {
        Ok(*res)
    } else {
        Err(SyntaxError::new1(
            format!("SyntaxError: Undefined type variable {}", name),
            *span,
        ))
    }
}
```

We just look up the variable name in the `bindings` map and return its corresponding type pair, or return an error if the variable is not defined. Pretty standard. 

Next up, we have the `Alias` case.

```rust
Alias(lhs, (name, span)) => {
    let (utype_value, utype) = engine.var();
    let (vtype, vtype_bound) = engine.var();

    let old = bindings.insert(name.to_string(), ((utype_value, vtype_bound), *span));
    if let Some((_, old_span)) = old {
        return Err(SyntaxError::new2(
            format!("SyntaxError: Redefinition of type variable '{}", name),
            *span,
            "Note: Type variable was already defined here",
            old_span,
        ));
    }

    let lhs_type = parse_type(engine, bindings, lhs)?;
    engine.flow(lhs_type.0, vtype_bound)?;
    engine.flow(utype_value, lhs_type.1)?;
    Ok((vtype, utype))
}
```

Since the entire purpose of the aliases and type variables is to enable recursive types, we need to allow usage of a type variable before we know the complete type of the corresponding alias. We handle this roughly the same way we handled typechecking `let rec` expressions previously. When entering the alias type, we create a temporary variable pair to store in the bindings map for that variable name _before_ evaluating the _body_ of the alias type. Then _after_ we've evaluated the body and gotten back a type pair, we add a flow edge from that to the temporary variables defined previously to close the loop.

Lastly, we also return an error if the variable is already defined in `bindings`. For that purpose, we store a `Span` in the bindings for each variable along with its `(Value, Use)` type pair so that we have a span to point to the previous definition if we need to display an error message.

Note that unlike with program expressions, our type variables have no scoping in order to keep things simple (or more accurately, they are scoped to the type annotation in which they appear). Type annotations are generally much simpler and smaller than programs, so the lack of scoping is unlikely to be an issue. If you do find yourself dealing with giant type annotations, you should probably add some sort of reusable type declaration syntax, in which case you're making much larger changes to the design anyway.

Anyway, we've now finished implementing type annotations in cubiml! Hooray! At least for monomorphic types anyway...

## Polymorphic type annotations

Up until now, we've been focused on type annotations for _monomorphic_ types. However, with let polymorphism, variables may be typed with a polymorphic _type scheme_, and it would be nice if we had a way to manually annotate type schemes as well. Unfortunately there are multiple issues with this.

First off is the syntax. For monomorphic types, there's no need to support explicit union or intersection types, because they can always be simplified away, but this is not the case for polymorphic types, so you need to support them in some manner. 

Rather than support explicit intersections and unions, you may want to consider hiding them behind a constraint syntax. For example, instead of syntax like `forall T => (T & {x: int}) -> T`, you can instead use syntax like `forall T => T -> T where T <: {x: int}`, which is equivalent from a type perspective but is likely to be more intuitive to users.

A much more serious issue however is the implementation complexity, in both senses of the word. With monomorphic types, we can get away with treating each type annotation as a `(Value, Use)` pair and just adding a `v < u` constraint to verify the type, which is already supported by the type system. However, there's no such thing as flow constraints between type _schemes_.

When it comes to type schemes, instead of just adding a flow constraint, we have to decide _type subsumption_, which is much more involved. Basically, type subsumption means looking at two polymorphic (value) type schemes and determining whether one _subsumes_ the other, i.e. whether one is a subtype of the other for any possible instantiation of the bound type variables in the later.

Since our types are represented as (possibly cyclic) _graphs_, checking subsumption involves converting each type graph to a canonical form and then trying to find a mapping between variables in the canonical graphs and checking subtyping between each pair of nodes in the corresponding graphs. 

Unfortunately, the canonical form can be exponentially large in the worst case, meaning that checking type subsumption requires exponential time. And even if it weren't for the time complexity, the _code_ complexity is also pretty horrendous - it would likely take me several weeks to cover all the code changes required to implement this. Therefore, I do not plan to cover type subsumption checking in cubiml.

## Conclusion

This marks the end of the topics I had planned for cubiml. If you have anything else you want me to cover, feel free to comment on Reddit. Otherwise, this will be the final post in the series. I hope it has proven helpful in demonstrating how to implement type inference in a new language and some of the possibilities that subtype inference opens up in programming and language design.


{{series_footer}}
