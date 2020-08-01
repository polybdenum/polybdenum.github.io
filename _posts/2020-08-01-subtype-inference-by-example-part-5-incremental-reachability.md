---
layout: post
title: 'Subtype Inference by Example Part 5: Incremental Reachability'
series: cubiml
series-num: 5
date: 2020-08-01 07:23 -0700
---
{% include series-util.html %}
{{series_header}}

[Last week]({{prev_url}}), we covered the implementation of cubiml's typechecker core, the part of the typechecker that maintains the graph of program types and checks and propagates type constraints. However, there was one piece of the typechecker core, the flow checker, that we left for later. Today, we will be covering the implementation of the flow checker, the final piece of cubiml's type inference algorithm.

## The type graph

Recall that in cubiml, types are represented by pointers to nodes in a mutable, possibly cyclic, graph. There are two possible types of edges in the graph. The first is the edges representing the components of structural types. For example, if a node represents a function type, it will have edges pointing to the types of the corresponding argument and return types for that function. 

The second type of edge are _flow edges_, representing the constraint that a program value of the given value type flows to a usage of the given usage type, and thus the value type must be compatible with that usage type. Additionally, variables are represented as intermediate nodes in the graph, with the type inference algorithm responsible for ensuring that the flow relation is transitive.

The typechecker core is divided into two parts. The first part, covered in [last week's post]({{prev_url}}), includes information about the types each graph node represents and the relations from type constructor "heads" to their component types. The second part, covered today, is solely responsible for tracking the flow edges and maintaining transitivity of flow edges. It is encapsulated in a class called `Reachability` with the following public interface:

```rust
impl Reachability {
    pub fn add_node(&mut self) -> ID;
    pub fn add_edge(&mut self, lhs: ID, rhs: ID, out: &mut Vec<(ID, ID)>);
}
``` 

### Incremental reachability

The class is called `Reachability` because it solves _the (directed) incremental reachability problem_, a generic problem on graphs, which asks you to maintain _transitivity_, the property that for all edges `a -> b` and `b -> c` that there is also an edge `a -> c`, as edges are inserted by an outside source. 

## The naive algorithm

To start with, we'll try to come up with the simplest algorithm possible for the incremental reachability problem, regardless of speed. Whenever a new edge `A -> B` is inserted into the graph, we first check if the edge already exists (if it does, then obviously nothing needs to be done). If a new edge is inserted, we may need to insert additional edges to maintain transitivity. 

Specifically, for every node `C` with an edge `C -> A`, we need to insert the edge `C -> B`. Likewise, for every node `D` with the edge `B -> D`, we need to insert the edge `A -> D`. Finally, we need to insert all the edges of the form `C -> D`. In order to do this, we need a way to easily find all the nodes that a given node has edges to (called the _down set_) and all the nodes that have edges to a given node, the _up set_. This leads to a fairly simple algorithm.

```rust
type ID = usize;
#[derive(Debug, Default, Clone)]
pub struct Reachability {
    upsets: Vec<HashSet<ID>>,
    downsets: Vec<HashSet<ID>>,
}
```
To represent the state of the graph, we just store the upsets and downsets of each node directly as `HashSet`s. The `upsets` and `downsets` fields store lists of hashsets giving for each node index the upset or downset of that node respectively. 

```rust
pub fn add_node(&mut self) -> ID {
    let i = self.upsets.len();

    let mut set = HashSet::with_capacity(1);
    set.insert(i);

    self.upsets.push(set.clone());
    self.downsets.push(set);
    i
}
```
The `add_node` implementation is simple - just add a new set to each of the lists and return the new index. There is one minor complication. As originally stated, we have three types of edges to add: `C -> B`, `A -> D`, and `C -> D`, where `A -> B` is the original edge, `C` is any member of `A`'s upset, and `D` is any member of `B`'s downset. To simplify the algorithm, we store every node in its own upset and downset, and thus we only have to worry about one kind of edge, the `C -> D` edges. 


```rust
pub fn add_edge(&mut self, lhs: ID, rhs: ID, out: &mut Vec<(ID, ID)>) {
    if self.downsets[lhs].contains(&rhs) {
        return;
    }

    // Get all ancestors of lhs, including lhs itself
    let mut lhs_set: Vec<ID> = self.upsets[lhs].iter().cloned().collect();
    lhs_set.sort_unstable();

    // Get all descendents of rhs, including rhs itself
    let mut rhs_set: Vec<ID> = self.downsets[rhs].iter().cloned().collect();
    rhs_set.sort_unstable();

    for &lhs2 in &lhs_set {
        for &rhs2 in &rhs_set {
            if self.downsets[lhs2].insert(rhs2) {
                self.upsets[rhs2].insert(lhs2);
                out.push((lhs2, rhs2));
            }
        }
    }
}
```
Lastly, we have the `add_edge` implementation. This is pretty simple - to insert the edge `lhs -> rhs`, first check if the edge already exists. If it doesn't already exist, insert a new edge from every member of `upsets[lhs]` to every member of `downsets[rhs]`. 

The one thing of note is the calls to `sort_unstable`. Rust's `HashSet` is randomly ordered, which means that if we didn't sort the sets before iterating over them, we would insert the new edges in random order and return them in a random order to the caller. This isn't incorrect per se, but it has a number of undesirable effects. For example, if the input program happens to have _multiple_ type errors, then processing the flow edges in a random order will result in a random type error being detected and reported to the user. Different runs of the same compiler on the same code may have different results, which is obviously a bad idea. Ensuring our code is deterministic also has numerous other benefits, such as making it much easier to debug and ensuring more predictable performance.

### Complexity of the naive algorithm

The above code works, but it is slow and inefficient. If `n` is the number of nodes in the graph, then each upset and downset can potentially have a size of up to `n`, meaning that iterating over each pair in the upset and downset results in up to `n^2` pairs. Therefore, the worst case complexity of each individual edge insertion is `O(n^2)`. Since there can be up to `O(n^2)` edges, the overall complexity of the naive reachability algorithm is `O(n^4)`. 

This is similar to the `O(n^4)` complexity of the algorithm in [the original Algebraic Subtyping paper](https://www.cs.tufts.edu/~nr/cs257/archive/stephen-dolan/thesis.pdf) once the exponential parts of that algorithm (let polymorphism and simplification) are removed. Algebraic Subtyping does a number of things differently, so the two aren't directly comparable, but the `O(n^4)` slowness comes from a very similar issue. Luckily, in the case of cubic biunification, speeding up the typechecking algorithm is as simple as choosing a faster reachability algorithm.

## The spanning tree algorithm

The fastest published algorithm for the incremental reachability problem comes from a [1986 paper](https://core.ac.uk/download/pdf/82234237.pdf) and has worst case `O(n^3)` complexity, thus putting the "cubic" in cubic biunification. This algorithm is much more complicated, and involves representing the downset of each node as a spanning tree, rather than an ordinary hashset. Despite the fact that the paper is 34 years old, no faster algorithm is known. In fact, it seems likely that `O(n^3)` is the best possible for the problem, although proving unconditional lower bounds on complexity is notoriously difficult.

The original version of cubiml used this algorithm. However, in the course of writing this tutorial, I stumbled upon a better algorithm, in a [pointer alias analysis paper](https://arxiv.org/abs/2006.01491) of all things. ([Thanks Reddit!](https://www.reddit.com/r/ProgrammingLanguages/comments/gvzami/the_finegrained_complexity_of_andersens_pointer/)) This algorithm of course still requires `O(n^3)` time, but it is much simpler than the spanning tree algorithm, so it is the algorithm we will be using and going over today. (In case you're curious, you can see my original implementation of the spanning tree algorithm [here](https://github.com/Storyyeller/cubiml-demo/blob/bc573e6a11bea8beba2ae3f2dd8344e5aa10ef9a/src/reachability.rs
)).

## The final algorithm

This algorithm is basically the same as the naive algorithm, except that instead of inserting all the `C -> D` edges, and thus iterating over `O(n^2)` pairs per edge insertion, we instead just insert the `C -> B` and `A -> D` edges _recursively_. But before we get into that, we have a helper data structure to define.

### Ordered sets

Recall that Rust's `HashSet` is randomly ordered, so in order to maintain deterministic behavior in the naive algorithm, we sorted the sets before iterating over them. However, there is a much better solution. Instead of only using a `HashSet`, we instead maintain a set _and_ an ordered list. Whenever we insert an element, we insert it into the set _and_ append it to the list. Whenever we need to iterate over the values, we just iterate over the list, which is deterministically ordered. (We still need the set so we can check whether values are already present in constant time, but we no longer need to _iterate_ over the set). 

```rust
struct OrderedSet<T> {
    v: Vec<T>,
    s: HashSet<T>,
}
impl<T: Eq + std::hash::Hash + Clone> OrderedSet<T> {
    fn insert(&mut self, value: T) -> bool {
        if self.s.insert(value.clone()) {
            self.v.push(value);
            true
        } else {
            false
        }
    }

    fn iter(&self) -> std::slice::Iter<T> {
        self.v.iter()
    }
}
```

In fact, this pattern is useful enough that I've wrapped it in the `OrderedSet` class above. This lets us just use an `OrderedSet` instead of a `HashSet` everywhere and get deterministic behavior.

> **Note:** Many languages offer ordered sets out of the box. For example, Java has `LinkedHashSet`. In Javascript and Python 3.6+, the native set type is automatically ordered. The implementation of these is slightly different due to the need to handle set deletions, which, combined with the requirement to maintain insertion order, rather than any arbitrary deterministic order, means that the list used has to be a linked list rather than an array list (Vec). Using a linked list has the same asymptotic complexity, but is much slower in practice, i.e. has a higher constant factor, so it's best to avoid that if we can, as in this case.

### Cubic reachability

With that out of the way, the actual algorithm is surprisingly simple. To start with, the definition of `Reachability` and `add_node` is basically the same as before, except that we no longer add each node to its own upset and downset. Instead, the upsets and downsets start off empty. (`Default::default()` returns the default value for a type, which is an empty set in this case.)

```rust
pub struct Reachability {
    upsets: Vec<OrderedSet<ID>>,
    downsets: Vec<OrderedSet<ID>>,
}
impl Reachability {
    pub fn add_node(&mut self) -> ID {
        let i = self.upsets.len();
        self.upsets.push(Default::default());
        self.downsets.push(Default::default());
        i
    }
}
```
Conceptually, when inserting edge `A -> B`, we first check if the edge is already present. If not, we insert it, and then check the up and down sets. For each `C` in `A`'s upset, we recursively call `add_edge(C, B)`. For each `D` in `B`'s downset, we recursively call `add_edge(A, D)`. It's so simple that it is almost easier to describe in code than in prose.

The one complication is that our actual implementation is iterative rather than recursive. Instead of actually calling `add_edge` recursively, we just maintain a stack of edges to be inserted and then pop items from the stack and process them until the stack is empty.

```rust
pub fn add_edge(&mut self, lhs: ID, rhs: ID, out: &mut Vec<(ID, ID)>) {
    let mut work = vec![(lhs, rhs)];

    while let Some((lhs, rhs)) = work.pop() {
        // Insert returns false if the edge is already present
        if !self.downsets[lhs].insert(rhs) {
            continue;
        }
        self.upsets[rhs].insert(lhs);
        // Inform the caller that a new edge was added
        out.push((lhs, rhs));

        for &lhs2 in self.upsets[lhs].iter() {
            work.push((lhs2, rhs));
        }
        for &rhs2 in self.downsets[rhs].iter() {
            work.push((lhs, rhs2));
        }
    }
}
```

As far as the algorithm complexity goes, each time an edge is inserted, whether that edge comes from the external caller or our own recursive calls, we iterate over `upsets[lhs]` and `downsets[rhs]`, which have maximum size `O(n)`. Therefore, we do `O(n)` work per edge insertion. Since there are at most `O(n^2)` edges, this leads to an `O(n^3)` overall worst case complexity, thus giving cubic biunification its name.

## Code generation

With type checking done, the only remaining step in implementing a compiler is to actually generate code so the input program can be executed. Since this is complex and tedious and highly specific to the particular compiler you're implementing, I won't go over it here, but you can view the initial version of cubiml's codegen code [here](https://github.com/Storyyeller/cubiml-demo/blob/f8eaaf4d3e6f77aa887f06d829d1af49e385974a/src/codegen.rs) and [here](https://github.com/Storyyeller/cubiml-demo/blob/f8eaaf4d3e6f77aa887f06d829d1af49e385974a/src/js.rs).

We've now gone through a complete example of implementing cubic biunification to check types in a minimal programming language. However, right now the language isn't very useful. Next week, we will add int, float, and string literals and operators to the language.

{{series_footer}}
