---
layout: post
title: What are GADTs and why do they make type inference sad?
date: 2024-03-03 14:01 -0800
---

[Back in 2020]({{site.baseurl}}/2020/07/04/subtype-inference-by-example-part-1-introducing-cubiml.html), I created [Cubiml](https://github.com/Storyyeller/cubiml-demo), a simple ML-like language that demonstrated how to extend the usual Hindley–Milner type system with subtyping while still having decidable full type inference. One question I got was whether it would be possible to support generalized algebraic data types (GADTs) in Cubiml. I had heard that GADTs break type inference and didn't see the point, so I didn't think much of it at the time. 

However, I recently got curious and researched GADTs again to figure out what they're actually used for and to what extent are they compatible with type inference. As it turns out, my initial assumption wasn't *quite* right. Strictly speaking, GADTs themselves don't break type inference, but rather are only *useful* when combined with features (polymorphic recursion, existential types) that break type inference. For a language like Cubiml which has full type inference and hence can not support polymorphic recursion or existential types, it turns out that GADTs *don't actually add any power*. Any program that could be typed in Cubiml with GADTs will *also* typecheck *without* GADTs.

In this post, I'll go over some examples from Real World OCaml to show how GADTs work and how they compare to Cubiml.

# But what are GADTs, anyway?

The term "algebraic data type" (ADT) refers to the ability to compose types to form new types. One operation is the *product type*, where given types `A` and `B`, you form a new type that contains an `A` *and* a `B`. These are typically called "structs", "records", "tuples", "objects" or the like, and are present in basically every programming language ever, even C.

The other operation is the *sum type*, where you can form a type that contains an `A` *or* a `B`. These are typically called "tagged unions", "enums", or "variants", but many older languages don't have sum types at all. Since every language has product types but not every language has sum types, sum types are what people are referring to in practice when they talk about algebraic data types.

For example, in Rust, where sum types are called "enums", you can define a type that contains a `String` *or* a 32 bit int (`u32)` like this:

```rust
enum MyEnum {
    Foo(String),
    Bar(u32),
}
```

This type has two *variants*, `Foo` and `Bar`, and values of the type can store either one with a special tag determining which one any given value holds at runtime. You can construct a value of type `MyEnum` using either variant, e.g. `MyEnum::Foo("hello".to_owned())` or `MyEnum::Bar(1234)`. 

You can also define a *generic* enum type. For example, suppose you wanted a `MyEnum<T>` that stores either one or two `T`s for any type `T`. In Rust you would write this as


```rust
enum MyEnum<T> {
    Foo(T),
    Bar(T, T),
}
```

In OCaml, this would be written as follows. Type parameters in OCaml are backwards compared to most languages, but the syntax is otherwise pretty similar.


```ocaml
type 'a myenum =
| Foo of 'a
| Bar of 'a * 'a
```

And you can construct them via `Foo 5`, `Bar (5, 6)`, etc.

## Generalized algebraic data types

So what's the difference between GADTs and regular ADTs?

Remember how you construct an enum value by naming the variant and then the data? It looks a lot like a function. In Rust, enum variants are a language primitive rather than true functions, but it's easy to imagine them being like functions. If you wanted to have explicit wrapper functions, you could write something like this:

```rust
fn foo<T>(v: T) -> MyEnum<T> {
    MyEnum::Foo(v)
}

fn bar<T>(v1: T, v2: T) -> MyEnum<T> {
    MyEnum::Bar(v1, v2)
}
```

Notice that in both cases, the return type is `MyEnum<T>`. But what if you wanted the return type to be something different? For example, what if you wanted the `Foo` variant to only be usable if `T` is copyable? With the wrapper functions, you could do it like this:

```rust
fn foo<T: Copy>(v: T) -> MyEnum<T> {
    MyEnum::Foo(v)
}
```

You could even bound `T` to be a specific type. For example, you could make `bar` only usable for ints like this:

```rust
fn bar(v1: u32, v2: u32) -> MyEnum<u32> {
    MyEnum::Bar(v1, v2)
}
```

However, in this case, we only changed the signature of the *wrapper functions*. The underlying enum constructors have no such restrictions. For example, you can still write `Bar("hello", "world")` if you want to, and the Rust compiler won't stop you because the `Bar` variant itself still accepts arbitrary types. Only the `bar` wrapper function was restricted to ints.

In Rust, there is no way to apply a custom function signature to the underlying enum constructors, but in OCaml, *you can*. And *that* is what GADTs are! Here's how you would modify the OCaml example so that `Bar` only accepts ints:

```ocaml
type 'a myenum =
| Foo of 'a
| Bar : int * int -> int myenum
```

Additionally, the compiler knows that the only way to construct an enum is via one of the constructors, and thus the invariants established by the constructor signatures are considered part of the type itself, and can be assumed to hold when you match on the resulting value later. It's a convenient way to compress what could be very complicated invariants into a single type name.

So what are GADTs actually used for, and how do they compare to what is possible in Cubiml? Let's look at some examples from [Real World OCaml](https://dev.realworldocaml.org/gadts.html).


# Example 1: Associated types

We'll start with the easiest example, faking associated types.

Suppose you want to have a function that searches a list, but where the user can customize the behavior when the element is not found. Specifically, you may want it to either a) throw an exception, b) return an option, or c) return a default value. In Rust, this is idiomatically handled by returning `Option` and letting the caller call `unwrap` or `unwrap_or` on it if they want to, but if you were to cram this all into a single function for some reason, you'd probably do it using associated types. However, OCaml doesn't have Rust's trait system, so instead they use GADTs to simulate associated types.

Here's the example code. First, they define a GADT with three variants and two type parameters. The first type parameter is just the element type of the list, but the second type parameter is a dummy type parameter that will be used to control the return type of the find function, much like an associated type.


```ocaml
module If_not_found = struct
  type (_, _) t =
    | Raise : ('a, 'a) t
    | Return_none : ('a, 'a option) t
    | Default_to : 'a -> ('a, 'a) t
end
```

And here's the `flexible_find` function, which takes in an instance of `If_not_found.t` to control the return behavior:

```ocaml
let rec flexible_find
 : type a b. f:(a -> bool) -> a list -> (a, b) If_not_found.t -> b =
 fun ~f list if_not_found ->
  match list with
  | [] ->
    (match if_not_found with
    | Raise -> failwith "No matching item found"
    | Return_none -> None
    | Default_to x -> x)
  | hd :: tl ->
    if f hd
    then (
      match if_not_found with
      | Raise -> hd
      | Return_none -> Some hd
      | Default_to _ -> hd)
    else flexible_find ~f tl if_not_found
```

And here are the examples of calling it:
```ocaml
flexible_find ~f:(fun x -> x > 10) [1;2;5] Return_none;;
- : int option = Base.Option.None
flexible_find ~f:(fun x -> x > 10) [1;2;5] (Default_to 10);;
- : int = 10
flexible_find ~f:(fun x -> x > 10) [1;2;5] Raise;;
Exception: (Failure "No matching item found").
flexible_find ~f:(fun x -> x > 10) [1;2;20] Raise;;
- : int = 20
```

## What about Cubiml?

Cubiml doesn't have exceptions, so we can't translate the "Raise" variant for reasons unrelated to the type system. However, we can still have a function that either returns an option or default value. Here's the same code, translated into Cubiml:


```ocaml
let rec flexible_find = fun {f; list; not_found} ->
    if list == null then
        match not_found with
        | `Default_to x -> x
        | `Return_none _ -> `None {}
    else
        if f list.h then
            match not_found with
            | `Default_to x -> list.h
            | `Return_none _ -> `Some list.h
        else
            flexible_find {f; list=list.t; not_found}
```

And we can call it like this:

```ocaml
>> flexible_find {f=fun x -> x > 10; list={h=1; t={h=2; t={h=5; t=null}}}; not_found=`Return_none {}}
`None{}

>> flexible_find {f=fun x -> x > 10; list={h=1; t={h=2; t={h=5; t=null}}}; not_found=`Default_to 10}
10

>> flexible_find {f=fun x -> x > 10; list={h=1; t={h=2; t={h=20; t=null}}}; not_found=`Return_none {}}
`Some 20

>> flexible_find {f=fun x -> x > 10; list={h=1; t={h=2; t={h=20; t=null}}}; not_found=`Default_to 10}
20
```

Now let's try another example. 

# Example 2: Polymorphic AST evaluation

This is The Canonical Example Of GADTs. If you find any example of GADTs on the internet, there's a 90% chance that it will be exactly this example or a slight variation on it. 

So what is The Canonical Example Of GADTs? The challenge is that we have a simple expression tree that we want to build an evaluation function for. The trick however is that some subexpressions may evaluate to booleans while others may evaluate to integers.

Here's the OCaml approach without GADTs, just using ordinary enums:

```ocaml
type value =
  | Int of int
  | Bool of bool

type expr =
  | Value of value
  | Eq of expr * expr
  | Plus of expr * expr
  | If of expr * expr * expr

let rec eval expr =
  match expr with
  | Value v -> v
  | If (c, t, e) ->
    (match eval c with
     | Bool b -> if b then eval t else eval e
     | Int _ -> raise Ill_typed)
  | Eq (x, y) ->
    (match eval x, eval y with
     | Bool _, _ | _, Bool _ -> raise Ill_typed
     | Int f1, Int f2 -> Bool (f1 = f2))
  | Plus (x, y) ->
    (match eval x, eval y with
     | Bool _, _ | _, Bool _ -> raise Ill_typed
     | Int f1, Int f2 -> Int (f1 + f2))
```

The problem with this code is that `eval` just returns an enum (`value`) containing either an int or boolean. Even if you know for sure that your expression is an integer expression, the compiler won't know that and you'll have to do a runtime check to extract the int. Additionally, the eval function itself has a lot of runtime type checks. It would be nice if we could rule out invalid expressions at compile time instead.


The first problem can be solved by having a pair of mutually recursive functions, one for evaluating integer expressions (which will hence always return an int) and one for evaluating boolean expressions. Real World OCaml doesn't provide this version, but it isn't hard to write:


```ocaml
let 
    rec eval_i expr =
      match expr with
      | Value v -> (match v with
        | Int v -> v
        | Bool _ -> raise Ill_typed)
      | If (c, t, e) ->
        if eval_b c then eval_i t else eval_i e
      | Eq (x, y) ->
        raise Ill_typed
      | Plus (x, y) ->
        (eval_i x) + (eval_i y)

    and eval_b expr =
      match expr with
      | Value v -> (match v with
        | Bool v -> v
        | Int _ -> raise Ill_typed)
      | If (c, t, e) ->
        if eval_b c then eval_b t else eval_b e
      | Eq (x, y) -> 
        (eval_i x) = (eval_i y)
      | Plus (x, y) -> 
        raise Ill_typed

```

This is a lot better, but it still has runtime type checks and it also requires duplicating the logic for the `If` case. With GADTs, we can merge everything into a single polymorphic eval function while also improving type safety:


```ocaml
type _ expr =
  | Value : 'a -> 'a expr
  | Eq : int expr * int expr -> bool expr
  | Plus : int expr * int expr -> int expr
  | If : bool expr * 'a expr * 'a expr -> 'a expr

let rec eval : type a. a expr -> a = function
  | Value v -> v
  | If (c, t, e) -> if eval c then eval t else eval e
  | Eq (x, y) -> eval x = eval y
  | Plus (x, y) -> eval x + eval y
```

> Note: I modified this example from the version in Real World OCaml by removing the unnecessary value enum.

## Meanwhile in Cubiml

So what about Cubiml? We can translate the mutual recursion version into Cubiml as follows:


```ocaml
let
    rec eval_i = fun expr ->
      match expr with
      | `Value v -> v
      | `If v ->
        (if eval_b v.c then eval_i v.t else eval_i v.e)
      | `Plus v ->
        (eval_i v.x) + (eval_i v.y)

    and eval_b = fun expr ->
      match expr with
      | `Value v -> v
      | `If v ->
        (if eval_b v.c then eval_b v.t else eval_b v.e)
      | `Eq v ->
        (eval_i v.x) == (eval_i v.y)
```

This version still has to duplicate the `If` case, but it at least has no runtime type checks. Interestingly, the same example works with minor modifications in OCaml as well. As it turns out, you don't need GADTs to eliminate the runtime type checks here in the first place. That problem was self-inflicted all along!

However, the mutual recursion version still has one downside, which is that the `If` case has to be duplicated between the two functions. It would be nice if there were a way to merge these two functions into a single function and avoid the duplication. In this toy example where we only have ints and booleans, manually splitting the function into a separate copy per type is not that big a deal, but in a more realistic example where you want your AST to evaluate to *arbitrary* types, it is completely infeasible.

# Polymorphic Recursion

What we want is a single `eval` function that sometimes returns a bool and sometimes returns an int, and can call itself recursively, with the recursive calls possibly returning *different types*. This means that we need the eval function to not only be polymorphic at the top level, but to be *recursively* polymorphic, with every recursive call instantiating itself with new types. Unfortunately, there is no way to do this in Cubiml, because such polymorphic recursion makes type inference undecidable. 

Classic Hindley–Milner type inference uses *let polymorphism*, where let-bound variables are made polymorphic and will be duplicated with fresh type parameters every time they are referenced. However, within a recursive function definition, the recursive calls are just an ordinary monomorphic variable. The recursive definition *as a whole* is still polymorphic (i.e. duplicated for each *outside* caller), but within any given instance, the *recursive* calls have to all use a single type.

In the first example with `flexible_find`, the polymorphic choices (which type of list and which `not_found` behavior to use) were fixed at the top level. For any given call top-level call to `flexible_find`, all recursive calls would use the same types, and therefore it doesn't require polymorphic recursion.


While type inference with let polymorphism is technically decidable, it is already EXPTIME-complete, i.e. it requires exponential-worst case time to check. Roughly speaking, the reason for this is because it is possible to write functions which simulate a step of arbitrary computation *at the type level*. Let polymorphism then lets you instantiate and compose an exponential number of copies of the function and thus simulate an exponentially large number of steps of an arbitrary computation, and hence type inference inherently requires at least exponential time in the worst case.

However, if you allow recursive calls to also be polymorphic, then you can instantiate not just an exponentially large number of copies of the function but an *infinite* number of copies. And this means you can simulate *infinite* steps of arbitrary computation, and hence type inference is Turing Complete and thus undecidable.


If polymorphic recursion is undecidable, how does OCaml get away with it? The answer is that OCaml requires explicit type annotations. Recall the previous code example:

```ocaml
let rec eval : type a. a expr -> a = function
  | Value v -> v
  | If (c, t, e) -> if eval c then eval t else eval e
  | Eq (x, y) -> eval x = eval y
  | Plus (x, y) -> eval x + eval y
```

Notice the `: type a. a expr -> a` part. That's a mandatory type annotation. If you remove it, the code won't compile.

There are two ways to think about type annotations. One way to think about them as just optional weakenings or restatements of what the compiler could already infer by itself. Cubiml has full type inference, which means that type annotations are never necessary. Any code that compiles with type annotations will still compile *without* the type annotations.

However, full type inference is inherently limited to type systems where inference is decidable. As usual, there is no free lunch. The more powerful you make your type system, the more work it takes to infer. And in the real world, programmers often want to statically verify non-inferrable properties of their code, which means that real world programming languages invariably give up on full type inference.

The second way to look at type annotations is as a *load-bearing* part of the code, the compiler's way of getting assistance from the programmer. Rather than being optional hints, type annotations are required in order for the code to even compile. In exchange, the programmer can use non-inferrable features like polymorphic recursion because the compiler only has to be able to *check* the proofs of correctness (i.e types), rather than to *figure out* the proofs itself.

# Example 3: Existential types

So far, in all the examples we've seen, the enum type itself has been *more* polymorphic than the constructors. I.e. the constructors are used to implicitly *add constraints* to the enum. However, what happens if you do the opposite, where the type is *less* polymorphic than the constructors?

Suppose you want an enum that can store a value and a function to convert that value to a string. Going back to the GADT pseudo-Rust syntax used before, you might write something like this:

```rust
enum MyEnum<T, F> {
    Stringable(T, F),
}
fn stringable<T, F>(v: T, f: F) -> MyEnum<T, F>
where
    F: FnOnce(T) -> String,
{
    MyEnum::Stringable(v, f)
}
```

However, this has the problem that `MyEnum` is too polymorphic. For any given value of `T` and `F`, `MyEnum<T, F>` can only hold *one specific* element and function type. What we want is a *single* `MyEnum` type that can hold *any* stringable value. To do this, we need to erase the type and use runtime dispatch. In Rust, this is done using trait objects (written `dyn Trait`). We can fix the example by adding a wrapper trait object like this:

```rust
trait Stringable {
    fn to_string(self: Box<Self>) -> String;
}
impl<T, F> Stringable for (T, F)
where
    F: FnOnce(T) -> String,
{
    fn to_string(self: Box<Self>) -> String {
        self.1(self.0)
    }
}

enum MyEnum {
    Stringable(Box<dyn Stringable>),
}
fn stringable<T, F>(v: T, f: F) -> MyEnum
where
    T: 'static,
    F: (FnOnce(T) -> String) + 'static,
{
    MyEnum::Stringable(Box::new((v, f)))
}
```

Notice that our "constructor" function `stringable` is now polymorphic in its parameters but has a non-polymorphic return type (`MyEnum`). That's because it erases the input types and converts it to a vtable so that callers can look up the appropriate function at runtime later without knowing which concrete type any given instance of `MyEnum` contains. This is known as an *existential type*.

OCaml works similarly, except that existential types are a lot more flexible than in Rust. In particular, Rust has no way to express existential type constraints between multiple values, so we're forced to bind `T` and `F` together at the point of construction and only expose a pre-selected set of operations (`Stringable::to_string` in this case). However, OCaml does not have this limitation. In OCaml, callers can still access and manipulate the fields, even without knowing what types they are.


In OCaml, you can create existential types using GADTs like this:

```ocaml
type stringable =
  Stringable : { value: 'a; to_string: 'a -> string } -> stringable

let print_stringable (Stringable s) =
  Stdio.print_endline (s.to_string s.value)
```

There's no inherent reason for existential types to be tied to GADTs, but in OCaml they are, so people often think of them as part of the GADT package (you can also use existential types via objects or first class modules in OCaml).

## What about Cubiml?

Unfortunately, existential types *also* make type inference undecidable, so Cubiml doesn't have them either. This shouldn't be too surprising because existentially quantified types are the mirror image of universally quantified types (i.e. polymorphic types), and those also make type inference undecidable. (Technically, you can infer them for let-bound variables at the cost of exponential time as described above, but they aren't a first-class part of the type system and can't be used for regular variables.)

One way to understand why existential types are a problem for type inference is to consider the fact that in order to *use* a value with an existential type, your code has to be capable of working with any type that the value *could* be. That means that any code which uses the value has to be polymorphic, and thus any recursive function which needs to use a value of existential type will have the same problems with polymorphic recursion explained previously.

# Conclusion

In retrospect, it's not surprising that GADTs don't add any power to Cubiml. GADTs are just a way of supplying custom type annotations to enum constructors. However, *type annotations in general* don't add any power to Cubiml. Cubiml has full type inference, which means that the compiler will always infer the most general possible type and type annotations are never necessary. Anything you can do with type annotations in Cubiml can also be done *without* type annotations. Therefore, GADTs only make sense in a language like OCaml or Haskell that *doesn't* have full type inference.


