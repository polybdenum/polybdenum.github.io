---
layout: post
title: 'Subtype Inference by Example Part 4: The Typechecker Core'
series: cubiml
series-num: 4
date: 2020-07-25 07:31 -0700
---
{% include series-util.html %}
{{series_header}}

[Last week]({{prev_url}}), we covered the implementation of cubiml's typechecker frontend, the part of the typechecker responsible for translating the abstract syntax tree into biunification types and constraints. Today we'll cover the _typechecker core_, the part responsible for actually creating these types and constraints and checking them for consistency.

## The type graph

Before we dive into the actual code, an overview of the design is in order.

Recall that cubiml's type system is _polarized_, that is divided into two kinds of types, _value types_ and _use types_. The former is for the types of program values, and the later is for the types of value _usages_, that is the constraints that a given expression places on its operands. 

### Type constructors

In addition to the polarization, we can categorize types by their _type constructors_. Type constructors allow you to build up complex types out of simpler types. For example, if you have types `T` and `U`, then the function type constructor defines the function type `T -> U` of functions that accept a `T` as argument and return a `U`. 

Type constructors can be thought of as functions that take some number of types as input and return a new type. A _base_ type such as booleans can be thought of as the result of a type constructor which takes no arguments. For the initial version of cubiml, our type system has four type constructors: booleans, functions, records, and case types. Booleans are a base type, while the function constructor has two parameters - the argument type and the return type. The record and case constructors take in a _map_ of component types, one for each field or case respectively.

### Recursive types

Traditionally, types are represented as a _tree_, where each node in the tree represents a type constructor and each child node the arguments to that type constructor, with the leaf nodes being variables or base types, i.e. type constructors with no arguments. However, in biunification, types are represented as nodes in a _graph_ which may contain cycles, enabling _recursive types_, or types that refer to themselves as subcomponents. 

Explicit type system _syntax_ naturally maps onto the tree based approach, with nodes corresponding to nodes in the abstract syntax tree of the parsed type syntax itself. This makes recursive types awkward to deal with syntax-wise, but luckily we don't have to worry about that for now, since we don't have any syntax for referring to types anyway. The graph based approach makes recursive types easy and natural to deal with when it comes to the actual algorithms, despite the difficulties of representing them syntactically.

In cubiml's representation, each node in the type graph contains information about which type constructor, if any, it was defined with, which we'll refer to as the _type head_. Additionally, heads may store pointers to other nodes in the graph, representing the subcomponents of that type.

Apart from the edges between nodes that represent head -> component relationships, the type graph contains an additional type of edge, _flow constraints_. Recall that a flow constraint represents the fact that a program value flows to a usage site in the input program, and imposes the constraint that the value's type must be compatible with the corresponding usage type. 

### Type variables

Recall that under biunification, type variables are represented by a _pair_ of types - a use type and a value type. Conceptually, the use type represents types _assigned_ to that variable, while the value type represents the type _read_ from the variable. Naturally, we need to ensure that the types assigned to a variable are compatible with (i.e. a subtype of) the types read from that variable. However, having subtype constraints of the form `v <= u` (the flows relation), along with constraints of the form `u <= v` (the variable integrity constraints) leads to cycles in the subtype constraints, making typechecking undecidable.

In cubic biunification, we solve this problem by not representing variable integrity constraints explicitly in the type graph. Instead, they are maintained implicitly by the action of the typechecking algorithm. The algorithm does this by ensuring transitivity of the _flows_ relation. For each variable `(u1, v1)`, and each value type `v2` that flows to `u1` and each use type `u2` that `v1` flows to, we add the constraint that `v2` flows to `u2`. Essentially, variables behave like little tunnels or wormholes in the type graph. Whatever goes in one end comes out the other.

> **Note:** This is not the only possible solution. Algebraic Subtyping, the paper that introduced the notion of biunification, actually takes the __opposite__ approach. Under algebraic subtyping, the variable integrity constraints (confusingly called flow constraints in the paper) are explicitly represented in the type graph, while what we call flow constraints are not explicitly represented in the type graph and are instead maintained implicitly by the action of the type checking algorithm. However, doing it our way results in a much simpler and easier to understand algorithm.

An advantage of our approach is that since variable integrity constraints are represented implicitly, the variable representation itself can be collapsed down to a single node in the graph. Instead of a pair of nodes, we just use a single node and determine from context which "side" of the variable is being referenced. When a variable node appears on the left side of a flow constraint, it is treated as a value type, and when it appears on the right side, it is treated as a use type.

## The type checking algorithm

With that out of the way, the core typechecking algorithm is surprisingly simple. There are just two parts - type checking head nodes (type constructors) and maintaining transitivity of the _flows_ relation, which we'll cover in [the following post]({{next_url}}). Type checking heads is just a matter of making sure that each side uses the same type constructor, and then inserting additional flow edges to recursively ensure the corresponding subcomponent types are also compatible.

For example, suppose you have the function value type `T1 -> U1` that flows to the function use type `T2 -> U2`. Since both heads are functions, that part checks out. We then insert the flow edges saying that `U1` flows to `U2` and `T2` flows to `T1`. This ensures that the return value of the function definition flows to the value returned at the call site and the argument passed at the call site flows to the argument in the function definition. 


## And now for some code

Before we get into the real code, we have some more error handling boilerplate to get out of the way. This defines the `TypeError` type that we will be returning when a type error is detected, just like with the definition of `SyntaxError` in the previous post.

```rust
#[derive(Debug)]
pub struct TypeError(String);
impl fmt::Display for TypeError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.write_str(&self.0)
    }
}
impl error::Error for TypeError {}
```

Next, we have types to represent types. Conceptually, the representation of each type is just a pointer to a node in a graph. However, working with graph pointers is inconvenient, so we instead just store each node in the graph in a giant list and use indexes into that list as "pointers". Therefore, we define the internal type `ID`, representing a reference to a node in the type graph, as an alias for `usize`, an unsigned integer.

```rust
type ID = usize;

#[derive(Copy, Clone, Debug)]
pub struct Value(ID);
#[derive(Copy, Clone, Debug)]
pub struct Use(ID);
```

To help prevent bugs in callers (i.e. the typechecker frontend), we wrap the `ID` type in two new types, `Value`, and `Use`, representing pointers to nodes interpreted as value and use types respectively. Within the underlying graph, nodes are just nodes, with the polarity maintained by context, but we wrap them in distinct types to prevent callers from mixing them up. This ensures that the frontend can't see the underlying ints and just has opaque values to pass around.

### Type heads

Next, we have definitions for the head types, i.e. type constructors. They are prefixed with V and U for value and use respectively to avoid name clashes.
```rust
#[derive(Debug, Clone)]
enum VTypeHead {
    VBool,
    VFunc { arg: Use, ret: Value },
    VObj { fields: HashMap<String, Value> },
    VCase { case: (String, Value) },
}
#[derive(Debug, Clone)]
enum UTypeHead {
    UBool,
    UFunc { arg: Value, ret: Use },
    UObj { field: (String, Use) },
    UCase { cases: HashMap<String, Use> },
}
```

Next, we have `check_heads`, the function for checking compatibility of head types.

```rust
fn check_heads(lhs: &VTypeHead, rhs: &UTypeHead, out: &mut Vec<(Value, Use)>) -> Result<(), TypeError> {
```

This function requires some explanation. `check_heads` is called whenever a _value_ type head flows to a _use_ type head, in order to ensure the types are compatible. These are passed as `lhs` and `rhs` respectively. Next, it can return a `TypeError` if there is a mismatch in the heads, so the return type of `check_heads` is `Result<(), TypeError>`. 

Lastly, the head checking process can introduce additional flows constraints, as described previously. To avoid unnecessary copies and allocations, we return the new flow edges via the _out parameter_, `out` instead of the function return type. The caller is expected to pass a pointer to a list that holds `(Value, Use)` pairs, and we append an entry to that list for each new flow edge that needs to be created.

```rust
use UTypeHead::*;
use VTypeHead::*;

match (lhs, rhs) {
    (&VBool, &UBool) => Ok(()),        
```
Next up, we match on the input type heads, to do different things depending on which type constructors we're dealing with. The first case is the simplest - when both sides are boolean, no further action is required.

```rust
(&VFunc { arg: arg1, ret: ret1 }, &UFunc { arg: arg2, ret: ret2 }) => {
    out.push((ret1, ret2));
    // flip the order since arguments are contravariant
    out.push((arg2, arg1));
    Ok(())
}
```
In the case of function types, we add a flow constraint from the left return type to the right return type and the _right_ argument type to the left argument type. The flow edge for the argument types is backwards because function arguments are _contravariant_. That might sound scary, but it makes sense when you think about the actual relationships needed. As described before, we need to ensure that the return value of the function definition flows to the value returned at the call site and the argument passed at the _call site_ flows to the argument in the _function definition_. 


```rust
(&VObj { fields: ref fields1 }, &UObj { field: (ref name, rhs2) }) => {
    // Check if the accessed field is defined
    match fields1.get(name) {
        Some(&lhs2) => {
            out.push((lhs2, rhs2));
            Ok(())
        }
        None => Err(TypeError(format!("Missing field {}", name))),
    }
}
```
For record types, we check that the field accessed on the right hand side is also present in the record literal represented by the left hand side. If so, we add a flow edge between the field types, otherwise we return a `TypeError` due to the attempt to access a nonexistent field.

```rust
(&VCase { case: (ref name, lhs2) }, &UCase { cases: ref cases2 }) => {
    // Check if the right case is handled
    match cases2.get(name) {
        Some(&rhs2) => {
            out.push((lhs2, rhs2));
            Ok(())
        }
        None => Err(TypeError(format!("Unhandled case {}", name))),
    }
}
```
Case types are the mirror image of record types, and handled similarly. This time, we are checking whether the case tag defined on the _left_ is present among the case tags handled by the match expression represented by _right_ side.

```rust
        _ => Err(TypeError("Unexpected types".to_string())),
    }
}
```
Finally, in all other cases, we return a `TypeError`. If this branch is reached, it means that the two heads used different type constructors. For example, we might have had a boolean on the left side and a function call on the right. For now, we just return a generic message which is not particularly useful. We'll cover adding better error messages in a later post.


### The type graph

```rust
#[derive(Debug, Clone)]
enum TypeNode {
    Var,
    Value(VTypeHead),
    Use(UTypeHead),
}

#[derive(Debug, Clone)]
pub struct TypeCheckerCore {
    r: reachability::Reachability,
    types: Vec<TypeNode>,
}
```

The implementation of the type graph is mostly straightforward, except for one detail. Recall that the type graph can have two different types of edges - flow edges and edges from a type head to its subcomponent types. To simplify things, tracking the flow edges is abstracted away into a separate class called `Reachability`. We'll cover its implementation in the next post, but for now, all you need to know is its public interface:

```rust
impl Reachability {
    pub fn add_node(&mut self) -> ID;
    pub fn add_edge(&mut self, lhs: ID, rhs: ID, out: &mut Vec<(ID, ID)>);
}
```

`Reachability` internally maintains a graph of nodes and edges to track the flow relations. As before, the nodes are stored in a list so we can use `ID` (an unsigned int) as a "pointer" to a node. `TypeCheckerCore` itself maintains a _separate_ graph of nodes and type head edges. To avoid the need to track separate "pointer" IDs for each half of the graph, we maintain the invariant that the two lists match 1:1 and each type node results in a node at the same position in the two lists, so we can freely mix the `ID`s between `TypeCheckerCore` and `Reachability`.

Adding a flow edge may result in adding additional flow edges in order to maintain transitivity, so the `add_edge` method takes as an additional parameter a list in which it will store all the edges that were added, similarly to the way `check_heads` "returns" additional edges above.

Next up, we have the public constructor methods, which are all straightforward.
```rust
impl TypeCheckerCore {
    pub fn new() -> Self {
        Self {
            r: Default::default(),
            types: Vec::new(),
        }
    }

    fn new_val(&mut self, val_type: VTypeHead) -> Value {
        let i = self.r.add_node();
        assert!(i == self.types.len());
        self.types.push(TypeNode::Value(val_type));
        Value(i)
    }

    fn new_use(&mut self, constraint: UTypeHead) -> Use {
        let i = self.r.add_node();
        assert!(i == self.types.len());
        self.types.push(TypeNode::Use(constraint));
        Use(i)
    }

    pub fn var(&mut self) -> (Value, Use) {
        let i = self.r.add_node();
        assert!(i == self.types.len());
        self.types.push(TypeNode::Var);
        (Value(i), Use(i))
    }

    pub fn bool(&mut self) -> Value {
        self.new_val(VTypeHead::VBool)
    }
    pub fn bool_use(&mut self) -> Use {
        self.new_use(UTypeHead::UBool)
    }

    pub fn func(&mut self, arg: Use, ret: Value) -> Value {
        self.new_val(VTypeHead::VFunc { arg, ret })
    }
    pub fn func_use(&mut self, arg: Value, ret: Use) -> Use {
        self.new_use(UTypeHead::UFunc { arg, ret })
    }

    pub fn obj(&mut self, fields: Vec<(String, Value)>) -> Value {
        let fields = fields.into_iter().collect();
        self.new_val(VTypeHead::VObj { fields })
    }
    pub fn obj_use(&mut self, field: (String, Use)) -> Use {
        self.new_use(UTypeHead::UObj { field })
    }

    pub fn case(&mut self, case: (String, Value)) -> Value {
        self.new_val(VTypeHead::VCase { case })
    }
    pub fn case_use(&mut self, cases: Vec<(String, Use)>) -> Use {
        let cases = cases.into_iter().collect();
        self.new_use(UTypeHead::UCase { cases })
    }
}
```
The one thing of note here is the line `let fields = fields.into_iter().collect();`, which converts the fields from a `Vec` to a `HashMap`, since the `obj` method takes in a _list_ of (name, type) field pairs, but the type head stores the fields as a _map_. Likewise, for the `case_use` method.

Lastly, we have the `flow` method, where all the magic happens.

```rust
pub fn flow(&mut self, lhs: Value, rhs: Use) -> Result<(), TypeError> {
    let mut pending_edges = vec![(lhs, rhs)];
    let mut type_pairs_to_check = Vec::new();
    while let Some((lhs, rhs)) = pending_edges.pop() {
        self.r.add_edge(lhs.0, rhs.0, &mut type_pairs_to_check);

        // Check if adding that edge resulted in any new type pairs needing to be checked
        while let Some((lhs, rhs)) = type_pairs_to_check.pop() {
            if let TypeNode::Value(lhs_head) = &self.types[lhs] {
                if let TypeNode::Use(rhs_head) = &self.types[rhs] {
                    check_heads(lhs_head, rhs_head, &mut pending_edges)?;
                }
            }
        }
    }
    assert!(pending_edges.is_empty() && type_pairs_to_check.is_empty());
    Ok(())
}
```

This method essentially just calls `add_edge` and `check_heads` in a loop until convergence. In order to add a flow edge, we call `add_edge`, which adds the edge, if not already present, and any extra edges needed to maintain flow transitivity. Whenever a flow edge is added, we also need to check the heads of those nodes for consistency. However, the head checking process can itself necessitate adding new flow edges.

Therefore, we maintain two work lists. `pending_edges` is the list of flow edges that need to be inserted in the reachability graph. `type_pairs_to_check` is the list of edges that were added and still need to be type checked. Initially, `type_pairs_to_check` is empty and `pending_edges` contains just the single pair given as input to the `flow` method. 

As long as `pending_edges` is nonempty, we pop an item from it and pass it to `add_edge`, which may insert pairs into `type_pairs_to_check`. As long as `type_pairs_to_check` is nonempty, we pop an item from it, check whether each end is a type head, and if so, call `check_heads` on them, which may in turn insert pairs into `pending_edges`. If `check_heads` returns a `TypeError`, we stop and return the error to the caller (that's what that little `?` at the end does), otherwise, we just keep looping until we've processed all the pending work.

We've now covered almost all the code required to implement subtype inference. In [the next post]({{next_url}}), we will cover the implementation of `Reachability`, the final piece of the puzzle.

{{series_footer}}
