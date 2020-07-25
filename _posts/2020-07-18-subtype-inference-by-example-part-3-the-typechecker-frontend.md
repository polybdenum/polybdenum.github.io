---
layout: post
title: 'Subtype Inference by Example Part 3: The Typechecker Frontend'
series: cubiml
series-num: 3
date: 2020-07-18 08:50 -0700
---
{% include series-util.html %}
{{series_header}}

[Last week]({{prev_url}}), we covered the high level theory behind cubiml's typechecker frontend, the part of the typechecker responsible for translating the abstract syntax tree into biunification types and constraints. Today we'll go through the actual implementation of the frontend.

### Error handling

Last time, we saw that the typechecker core returns a `TypeError` if it detects a mistake in the program. However, there are some conditions where the compiler needs to return an error which are not type-related, such as references to an undefined variable. You may want to handle those in a separate pass, but to keep the initial version of cubiml simple, we'll be handling those in the typechecker frontend in a single pass. Therefore, we start by defining a new error type for syntax errors.

```rust
#[derive(Debug)]
pub struct SyntaxError(String);
impl fmt::Display for SyntaxError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.write_str(&self.0)
    }
}
impl error::Error for SyntaxError {}
```

Unfortunately, error types in Rust require a fair bit of boilerplate, but you can pretty much ignore all that code. All it does is define a new error type named `SyntaxError` which takes in and prints a string error message.

> __Update:__ A helpful reader called my attention to the [thiserror library](https://github.com/dtolnay/thiserror), which greatly reduces the boilerplate required to define basic error types like this. There is also a library, [anyhow](https://github.com/dtolnay/anyhow), which provides a predefined equivalent of our `Result<T, Box<dyn error::Error>>` definition below.


The frontend can return both `SyntaxError`s as well as `TypeError`s, so we need a return type that includes both. For simplicity, we'll use `Box<dyn error::Error>`, which just means a virtual pointer to any object implementing the error interface, much like you would do in Java, Go, etc. The "proper" way to combine multiple error types in Rust is by defining an enum (sum type) that includes variants for each, but doing so requires a massive amount of boilerplate.

```rust
type Result<T> = std::result::Result<T, Box<dyn error::Error>>;
```

`Result<T, E>` is the return type used in Rust for functions that return a `T` on success or an error `E` on failure. Since we'll be using `Box<dyn error::Error>` as the error type throughout the file, we define a type alias so we can just say `Result<T>` instead of `Result<T, Box<dyn error::Error>>` everywhere.

### Bindings

Next we have a class to keep track of the inferred types of variable bindings visible in the current scope as we walk the abstract syntax tree. 

```rust
struct Bindings {
    m: HashMap<String, Value>,
}
impl Bindings {
    fn new() -> Self {
        Self { m: HashMap::new() }
    }

    fn get(&self, k: &str) -> Option<Value> {
        self.m.get(k).copied()
    }

    fn insert(&mut self, k: String, v: Value) {
        self.m.insert(k.clone(), v);
    }
}
```

Recall that `Value` is the type defined in the core to represent cubiml type nodes for types of program expressions. Therefore `HashMap<String, Value>` is just a hashtable that associates a type (`Value`) to each variable name (`String`). Our `Bindings` class wraps this hashtable and provides `get` and `insert` methods for looking up variables and setting new variable bindings respectively. The wrapper might seem pointless now, but it will prove useful later.

```rust
impl Bindings {
    fn in_child_scope<T>(&mut self, cb: impl FnOnce(&mut Self) -> T) -> T {
        let mut child_scope = Bindings { m: self.m.clone() };
        cb(&mut child_scope)
    }
}
```

One method bears special mention: `in_child_scope`. This is used to handle descent into a new scope that is a child of the current scope, and takes as argument a callback to execute within the child scope. In a child scope, all bindings of the parent scope are visible unless shadowed in the child scope, but bindings defined in the child scope are not visible in the parent scope. Therefore, we need to copy the internal hashmap to prevent changes from affecting the parent scope. For now, we just create a temporary new `Bindings` instance with a copy of the current hashmap, pass that to the callback, and then return the result of calling the callback.


### Expression checking

With our helper classes out of the way, it's time for the main function of the frontend, `check_expr`.

```rust
fn check_expr(engine: &mut TypeCheckerCore, bindings: &mut Bindings, expr: &ast::Expr) -> Result<Value> {
    use ast::Expr::*;
    match expr {    
```

This function takes in an instance of the typechecker core, the bindings class we defined above, and an AST expression node to be processed, and returns the inferred type of the expression (or a syntax or type error if applicable). We begin by matching on `expr`. Recall that `ast::Expr` is an enum with a variant for each kind of expression in the language grammar (function definitions, function calls, records, field accesses, let bindings, etc.), so we need to provide code to handle each variant and infer the type of that kind of expression.

Recall that `TypeCheckerCore` has the following interface.

```rust
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

Most of core's methods are for constructing types. For each kind of type, boolean, function, record (called `obj` here for object), and case types, there is a corresponding pair of constructor methods to create value types and usage types of that kind. The `var` method creates a _type variable_ used for representing intermediate states in the program flow. Lastly, there is the `flow` method, which creates subtype constraints between the type nodes we just constructed. `flow` takes in a _value type_ and a _use type_, and represents the constraint that that value _flows to_ the usage, and hence must be compatible with that usage. It returns a type error if the types passed are not compatible, and returns nothing on success. 

We begin with the simplest cases of `check_expr` - variables and literals.

#### Variables and literals
```rust
Literal(val) => {
    use ast::Literal::*;
    Ok(match val {
        Bool(_) => engine.bool(),
    })
}
Variable(name) => bindings
    .get(name.as_str())
    .ok_or_else(|| SyntaxError(format!("Undefined variable {}", name)).into()),
```
The literal case just matches on the kind of literal and returns the appropriate type. We currently only have one type of literal - booleans. To create a boolean value type, we call the `bool` method on the type checker core instance, which is here passed as the variable `engine` in order to avoid confusion with the _module_ `core` where the class`TypeCheckerCore` is defined.

The variable case simply looks up the variable name in the current scope's bindings and returns the associated type, or returns an "undefined variable" syntax error if that name is not defined in the currently visible bindings.

#### Record and case literals
```rust
Record(fields) => {
    let mut field_names = HashSet::with_capacity(fields.len());
    let mut field_type_pairs = Vec::with_capacity(fields.len());
    for (name, expr) in fields {
        if !field_names.insert(&*name) {
            return Err(SyntaxError(format!("Repeated field name {}", name)).into());
        }

        let t = check_expr(engine, bindings, expr)?;
        field_type_pairs.push((name.clone(), t));
    }
    Ok(engine.obj(field_type_pairs))
}
Case(tag, val_expr) => {
    let val_type = check_expr(engine, bindings, val_expr)?;
    Ok(engine.case((tag.clone(), val_type)))
}       
```

A record literal expression defines a new object wrapping any number of subexpressions as fields. Each record node in the AST contains a `Vec` (list) of (name, expr) pairs given the name and expression node for each of its fields. Likewise, in order to create a record value type, we need to assemble a list of (name, value type) pairs to pass to the record type constructor method.

The logic of the record case is simple: For each field, call `check_expr` on the subexpression to get its type, then pass the resulting list of (name, type) pairs to `engine.obj()` to create a record type and return that. We also maintain a set of previously seen field names, so we can detect if a field name is repeated and return a syntax error instead in that case.

The logic for case literals is very similar except that it is even simpler since a case literal expression only wraps a single expression. 

#### If expressions
```rust
If(cond_expr, then_expr, else_expr) => {
    let cond_type = check_expr(engine, bindings, cond_expr)?;
    let bound = engine.bool_use();
    engine.flow(cond_type, bound)?;

    let then_type = check_expr(engine, bindings, then_expr)?;
    let else_type = check_expr(engine, bindings, else_expr)?;

    let (merged, merged_bound) = engine.var();
    engine.flow(then_type, merged_bound)?;
    engine.flow(else_type, merged_bound)?;
    Ok(merged)
}
```

An if expression node has three subexpressions: the condition, the then branch, and the else branch. First off, we require that the condition have a boolean type. To do this, we first call `check_expr` on the subexpression as before to get its type. Then we call `engine.bool_use()` to create a boolean _usage type_ and then call `engine.flow()` to say that the type of the condition _flows_ to the boolean usage.

Assuming that works out, we now turn to handling the branches. At runtime, the if expression will evaluate to the value of one of its branch subexpressions, but we aren't sure which. Therefore, in a sense, the type of the if expression might be the type of _either_ of its branch subexpressions. However, we can only infer a single type for each expression, so we need a way to merge or union together the types of the subexpressions.

In biunfication, union value types are not represented explicitly. Instead, they are implicit in the flow graph. To do this we create an intermediate _type variable_ node using `engine.var()`, add flow edges from the type of each subexpression to the variable, and then return the variable as the type of the entire if expression. Since the flow relation is transitive, any usage that the type of the if expression flows to will also have the types of each subexpression flow to it, thus ensuring the desired constraints.

#### Field access
```rust
FieldAccess(lhs_expr, name) => {
    let lhs_type = check_expr(engine, bindings, lhs_expr)?;

    let (field_type, field_bound) = engine.var();
    let bound = engine.obj_use((name.clone(), field_bound));
    engine.flow(lhs_type, bound)?;
    Ok(field_type)
}
```
The field access logic is a bit of a combination of all of the previous cases. When you do `a.foo`, that is a _record usage_ of `a`. Unlike boolean usages, but just like record value types, record usage types have a child type, and in particular, the child is a (field name, usage type) pair. 

The tricky part is which type to provide to the constructor as the field's usage type. We actually use a temporary variable here. Recall that a variable consists of two halves, the usage and the value. Suppose our new variable has value `v` and usage `u` and we're processing the expression `a.foo` where the subexpression `a` has type `t`. 

We pass the list `[("foo", u)]` to the record usage constructor method `engine.obj_use()` to create the record usage type `{foo=u}`. Then we create a flow constraint from `t` to `{foo=u}` and we return `v` as the type for the entire expression `a.foo`. Therefore, if the type `v` of `a.foo` flows to some usage `u'`, the constraints that `u'` represents will propagate backwards from `v` to `u`, and thence to whatever the `foo` field of `t` is. 

The exact mechanics of how the extra flow edges for child components of structural types are added will be covered later when we implement the typechecker core. For now, it suffices to know that whenever a record value type `{foo=v}` flows to a record usage type `{foo=u}`, the type checker will insert a flow edge from `v` to `u`, and similarly for the subcomponents of function and case types.

#### Match expressions
```rust
Match(match_expr, cases) => {
    let match_type = check_expr(engine, bindings, match_expr)?;
    let (result_type, result_bound) = engine.var();

    let mut case_names = HashSet::with_capacity(cases.len());
    let mut case_type_pairs = Vec::with_capacity(cases.len());
    for ((tag, name), rhs_expr) in cases {
        if !case_names.insert(&*name) {
            return Err(SyntaxError(format!("Repeated match case {}", name)).into());
        }

        let (wrapped_type, wrapped_bound) = engine.var();
        case_type_pairs.push((tag.clone(), wrapped_bound));

        let rhs_type = bindings.in_child_scope(|bindings| {
            bindings.insert(name.clone(), wrapped_type);
            check_expr(engine, bindings, rhs_expr)
        })?;
        engine.flow(rhs_type, result_bound)?;
    }

    let bound = engine.case_use(case_type_pairs);
    engine.flow(match_type, bound)?;

    Ok(result_type)
}
```
This might look intimidating, but it's actually mostly similar to the previous cases. The main difference is that we now also have to deal with variable bindings and scopes.

Recall that a match expression looks something like this:

```ocaml
let calculate_area = fun shape ->
    match shape with
          `Circle circle_val -> circle_val.rad *. circle_val.rad *. 3.1415926
        | `Rectangle rect_val -> rect_val.length *. rect_val.height

calculate_area `Circle {rad=6.7}
calculate_area `Rectangle {height=1.1; length=2.2}
```

This match expression has two branches, for the cases `Circle` and `Rectangle` respectively. Each branch of the match expression consists of a tag, a variable name, `->`, and then a _body_. The body is an expression which contains the code that will be executed when that branch of the match is chosen, and the value of that expression is the value that the match expression as a whole will evaluate to in that case.

Crucially, within the body of a match branch, a new variable binding is available with the name given on the left-hand side of the branch and a value equal to the value wrapped by the original case object. For example, when we call ``calculate_area `Circle {rad=6.7}``, the `Circle` branch of the match expression will be taken. This results in executing the expression `circle_val.rad *. circle_val.rad *. 3.1415926` in a special scope where the variable `circle_val` has the value `{rad=6.7}`. Likewise, taking the `Rectangle` branch would execute the body of that branch in a scope with the variable `rect_val` and so on. 

```rust
let rhs_type = bindings.in_child_scope(|bindings| {
    bindings.insert(name.clone(), wrapped_type);
    check_expr(engine, bindings, rhs_expr)
})?;
```
In order to implement variable scoping, we use `Binding`'s `in_child_scope` method as described previously. So the above code calls `in_child_scope`, passing a callback to be executed in that scope (everything in the indented block above). Within that scope, we first insert the new binding, with name `name` and type `wrapped_type`. Since the `bindings.insert` call happens within the body of the callback, it sees the child scope `Bindings` object, which contains a copy of the original bindings map. Since the insertion is performed on a copy of the bindings, the change will go away after the call to `in_child_scope` completes and won't affect the bindings in the parent scope.

Finally, the callback calls `check_expr` recursively on the expression representing the body of that match branch and returns the result. This result then gets returned by `bindings.in_child_scope()` itself and the resulting value type is assigned to the variable `rhs_type`.

With the exception of the scope trickery, the code for the `Match` handler is similar to the previous cases, but it's still a bit complicated, so I'll go through it again step by step.

```rust
let match_type = check_expr(engine, bindings, match_expr)?;
```

First, we get the type of the subexpression that is input to the match expression. This is the value that will be matched at runtime, and it's type will flow to the giant case usage type we will be constructing here. In the match example below, this subexpression would be the `shape` variable.

 ```ocaml
match shape with
      `Circle circle_val -> circle_val.rad *. circle_val.rad *. 3.1415926
    | `Rectangle rect_val -> rect_val.length *. rect_val.height
```

```rust
let (result_type, result_bound) = engine.var();
```
Next we create a temporary variable for the result of the match expression. `result_type` will be the type of the match expression as a whole, while `result_bound` will be the usage that the type of each body of each match branch will flow to. Basically, we're taking the union of the type of each match branch, just like with the previous if expression example earlier.


```rust
let mut case_names = HashSet::with_capacity(cases.len());
let mut case_type_pairs = Vec::with_capacity(cases.len());
for ((tag, name), rhs_expr) in cases {
    if !case_names.insert(&*name) {
        return Err(SyntaxError(format!("Repeated match case {}", name)).into());
    }
```
As with the previous record and case examples, the core's `case_usage` constructor method takes in a list of `(tag, usage)` pairs. `case_type_pairs` is the list of these pairs we will be creating, while `case_names` is an extra set used to keep track of the tags we've seen so that we can return a syntax error in the case were a tag name is repeated within a match expression, just like how we handled duplicate field names within a record literal before.


```rust
let (wrapped_type, wrapped_bound) = engine.var();
case_type_pairs.push((tag.clone(), wrapped_bound));
```
For each branch, we create another temporary variable, `(wrapped_type, wrapped_bound)`. `wrapped_bound` is the usage added to the list of `(tag, usage)` pairs that will be passed to the big `case_usage` constructor, while `wrapped_type` is the corresponding value type that represents the type of the input's wrapped value when type checking the body of the match branch. This is similar to the `a.foo` example, except that we have a separate variable for each match branch, and the resulting value type is passed to the match branch's body instead of being returned directly as the type of the entire expression.

```rust
let rhs_type = bindings.in_child_scope(|bindings| {
    bindings.insert(name.clone(), wrapped_type);
    check_expr(engine, bindings, rhs_expr)
})?;
engine.flow(rhs_type, result_bound)?;
```
As described previously, we infer the type of the body's subexpression in a child scope where a variable with name `name` and type `wrapped_type` exists. Lastly, we add a flow edge from the type of the body to the result variable. (Remember, this is how we are union-ing together the types of the bodies of all the match branches).

```rust
let bound = engine.case_use(case_type_pairs);
engine.flow(match_type, bound)?;
Ok(result_type)
```
Lastly, we pass the list of pairs we created to `engine.case_use` to create a giant case usage type, and add a flow constraint from the type of the input to that usage. Then we return `result_type` (the union of all the match branch body types) as the type of the entire match expression.

Whew! Luckily, if you managed to follow that, the remaining cases should be pretty simple. 

#### Function definitions and function calls
```rust
FuncDef(arg_name, body_expr) => {
    let (arg_type, arg_bound) = engine.var();
    let body_type = bindings.in_child_scope(|bindings| {
        bindings.insert(arg_name.clone(), arg_type);
        check_expr(engine, bindings, body_expr)
    })?;
    Ok(engine.func(arg_bound, body_type))
}
Call(func_expr, arg_expr) => {
    let func_type = check_expr(engine, bindings, func_expr)?;
    let arg_type = check_expr(engine, bindings, arg_expr)?;

    let (ret_type, ret_bound) = engine.var();
    let bound = engine.func_use(arg_type, ret_bound);
    engine.flow(func_type, bound)?;
    Ok(ret_type)
}        
```
Functions are handled pretty similarly to records and cases as seen previously. However, there is one twist - function arguments are _contravariant_, meaning that the argument type of a function value type is a _use type_ and the argument of a function use type is a _value type_.

For function definitions, we first create a temporary variable `(arg_type, arg_bound)` which represents the function argument. Then we typecheck the function body within a child scope which contains a binding with name `arg_name` and type `arg_type`. Lastly, we return the function value type `engine.func(arg_bound, body_type)`.

For function calls, we first get the types of the two subexpressions with `check_expr`. Then we create the temporary variable `(ret_type, ret_bound)` to represent the return type of the function call. Finally, we add a flow constraint from `func_type` to the usage `engine.func_use(arg_type, ret_bound)`, and return `ret_type` as the type of the entire call expression.

#### Let expressions
```rust
Let((name, var_expr), rest_expr) => {
    let var_type = check_expr(engine, bindings, var_expr)?;
    bindings.in_child_scope(|bindings| {
        bindings.insert(name.clone(), var_type);
        check_expr(engine, bindings, rest_expr)
    })
}
```
Let expressions are also straightforward. We just get the type of the variable's defining expression, then typecheck the body of the let expression in a child scope where that variable is defined with the resulting type.

> **Note:** The type checking algorithm presented here makes let expressions monomorphic. We'll cover how to implement let polymorphism in a later post. If you aren't familiar with let polymorphism, don't worry about it for now. All will be explained in good time.


#### Let rec expressions (single definition)

Recursive let expressions are more complicated because they can contain multiple variable definitions. Therefore, we'll first see how to handle a let-rec which only contains one variable definition.
```rust
LetRec(defs, rest_expr) => bindings.in_child_scope(|bindings| {
    let (ref name, ref expr) = defs[0]; // Only handling one variable definition for now.

    let (temp_type, temp_bound) = engine.var();
    bindings.insert(name.clone(), temp_type);

    let var_type = check_expr(engine, bindings, expr)?;
    engine.flow(var_type, temp_bound)?;

    check_expr(engine, bindings, rest_expr)
}),
```
Recursive let expressions with a single variable are just like regular let expressions, except that the definition of the variable can see its own binding. To handle this, we create a temporary type variable and add it to the bindings _before_ typechecking the let variable's definition. Once we have the type of the definition, we add a flow constraint from the variable's type to the temporary variable we created, thus ensuring they are the same. The rest (typechecking the body) proceeds the same way as before.

#### Let rec expressions (multiple definitions)
```rust
LetRec(defs, rest_expr) => bindings.in_child_scope(|bindings| {
    let mut temp_bounds = Vec::with_capacity(defs.len());
    for (name, _) in defs {
        let (temp_type, temp_bound) = engine.var();
        bindings.insert(name.clone(), temp_type);
        temp_bounds.push(temp_bound);
    }

    for ((_, expr), bound) in defs.iter().zip(temp_bounds) {
        let var_type = check_expr(engine, bindings, expr)?;
        engine.flow(var_type, bound)?;
    }

    check_expr(engine, bindings, rest_expr)
}),
```
The actual handler code for recursive let expressions is similar, but complicated by the need to handle multiple variables. We create a temporary type variable for each variable defined in the `let rec`. However, _every_ variable definition in a `let rec` gets to see _every_ other variable defined by that `let rec`. Therefore, we need to insert _all_ the temporary variables into the bindings before typechecking _any_ of the variable definitions, and hence we need to store a copy of the temporary variables in a list so that we can insert the flow edges to close the loops later. The rest is straightforward.

And that concludes the implementation of `check_expr`, the heart of the typechecker frontend. (Whew!) There are just a few details left to wrap up.

### Efficient Bindings

The `Bindings` implementation given above has a problem - copying the entire bindings map whenever we descend into a child scope is highly inefficient. Luckily, there's a much better solution. 

Since our code only accesses the bindings of a single scope at any given time, the only reason we needed to copy the bindings in the first place was to prevent changes made within a child scope from affecting the bindings in the parent scope. However, there is an alternative way to do that - keep track of the changes made in the child scope, and _undo_ them when leaving the child scope.

To do this, we maintain a stack of changes. Whenever a binding is inserted for a name that previously didn't exist in the map, we note the name so we can delete it upon exit. Whenever a binding is inserted with a name that already exists in the map, we note the name and the old value in the map that got overwritten by the newly inserted value, so we can add the old value back into the map under that name upon exit. Conveniently, the `insert` method of Rust's hashmap implementation returns the old value when inserting a key that already exists in the map, making this easy to do.

```rust
struct Bindings {
    m: HashMap<String, Value>,
    changes: Vec<(String, Option<Value>)>,
}
impl Bindings {
    fn new() -> Self {
        Self {
            m: HashMap::new(),
            changes: Vec::new(),
        }
    }

    fn get(&self, k: &str) -> Option<Value> {
        self.m.get(k).copied()
    }

    fn insert(&mut self, k: String, v: Value) {
        let old = self.m.insert(k.clone(), v);
        self.changes.push((k, old));
    }

    fn unwind(&mut self, n: usize) {
        while self.changes.len() > n {
            let (k, old) = self.changes.pop().unwrap();
            match old {
                Some(v) => self.m.insert(k, v),
                None => self.m.remove(&k),
            };
        }
    }

    fn in_child_scope<T>(&mut self, cb: impl FnOnce(&mut Self) -> T) -> T {
        let n = self.changes.len();
        let res = cb(self);
        self.unwind(n);
        res
    }
}
```
Above is the faster implementation for `Bindings`. We keep track of changes in a `Vec` (list, here used as a stack) called `changes`. The `get` method is unchanged, while the `insert` method adds the inserted key, and the old value, if applicable, to the change stack. 

The new `unwind` method undoes the changes up to the given point as described above. Lastly, the `in_child_scope` method now notes down the size of the change stack upon entry, and unwinds to that point after the callback returns before returning to the caller.

### Checking top level definitions

The `check_expr` function infers the type of _expressions_, but cubiml also allows _definitions_ at the top level of the code which are not expressions. Recall that a top level definition can either be an ordinary expression, or a `let` or `let rec` definition with no body (the `in <expr>` part). 

```rust
fn check_toplevel(engine: &mut TypeCheckerCore, bindings: &mut Bindings, def: &ast::TopLevel) -> Result<()> {
    use ast::TopLevel::*;
    match def {
        Expr(expr) => {
            check_expr(engine, bindings, expr)?;
        }
        LetDef((name, var_expr)) => {
            let var_type = check_expr(engine, bindings, var_expr)?;
            bindings.insert(name.clone(), var_type);
        }
        LetRecDef(defs) => {
            let mut temp_bounds = Vec::with_capacity(defs.len());
            for (name, _) in defs {
                let (temp_type, temp_bound) = engine.var();
                bindings.insert(name.clone(), temp_type);
                temp_bounds.push(temp_bound);
            }

            for ((_, expr), bound) in defs.iter().zip(temp_bounds) {
                let var_type = check_expr(engine, bindings, expr)?;
                engine.flow(var_type, bound)?;
            }
        }
    };
    Ok(())
}
```

`check_toplevel` is basically the same as the code we saw before except that variables defined in top level definitions are added to the global scope, rather than only being visible within the body of the definition. Therefore, there are no calls to `in_child_scope`. 

### TypeckState

Lastly, we have a wrapper class `TypeckState`, which encapsulates all the code we saw above and provides a more convenient interface to callers.

```rust
pub struct TypeckState {
    core: TypeCheckerCore,
    bindings: Bindings,
}
impl TypeckState {
    pub fn new() -> Self {
        Self {
            core: TypeCheckerCore::new(),
            bindings: Bindings::new(),
        }
    }

    pub fn check_script(&mut self, parsed: &[ast::TopLevel]) -> Result<()> {
        // Create temporary copy of the entire type state so we can roll
        // back all the changes if the script contains an error.
        let mut temp = self.core.clone();

        for item in parsed {
            if let Err(e) = check_toplevel(&mut self.core, &mut self.bindings, item) {
                // Roll back changes to the type state and bindings
                std::mem::swap(&mut self.core, &mut temp);
                self.bindings.unwind(0);
                return Err(e);
            }
        }

        // Now that script type-checked successfully, make the global definitions permanent
        // by removing them from the changes rollback list
        self.bindings.changes.clear();
        Ok(())
    }
}
```

There is one last subtlety here. When definitions are entered into the REPL, they may contain errors. Definitions that contain errors won't actually be executed, so any global variables they define shouldn't be made available to subsequent code. Therefore, we make a copy of all the state before we begin type checking, and undo everything if there was an error.

This concludes the implementation of cubiml's typechecker frontend. [Next week]({{next_url}}), we will begin the implementation of the typechecker core, so you can see what all those `engine.flow()` calls are actually doing under the hood.

{{series_footer}}
