---
layout: post
title: 'X Design Notes: Unifying OCaml Modules and Values'
date: 2025-08-18 18:25 -0700
series: xdesign
series-num: 1
---
{% include series-util.html %}
{{series_header}}

In 2020, I released [Cubiml](https://github.com/Storyyeller/cubiml-demo), showing how to combine full type inference with structural subtyping in an ML-like language, and earlier this year, I followed it up with [PolySubML](https://github.com/Storyyeller/polysubml-demo), extending it with higher rank types and existential types among other features. For my next language (which I'll call X here, since I haven't chosen a name yet), I set the ambitious goal of supporting *all* of OCaml's most notable functionality on top of everything PolySubML already supports. In this post, I will talk about the biggest OCaml feature that needs to be added, **modules**.

OCaml modules are not like the modules you might be used to in other languages. The basic idea is to be able to bundle data and types together and pass them around as record-like objects. They're a fairly unique feature, and there's considerable debate about whether they are worth it compared to simpler and easier-to-use systems like Haskell typeclasses. But the goal of X is to emulate the major features of OCaml, so that's what we're going to do.

OCaml syntax is almost like two languages in one. There's the ordinary language of types and values and functions, but then also the module system, which has a completely separate set of syntax and concepts - module types and module values and functors. People have often dreamt of unifying them, and the [1ML](https://people.mpi-sws.org/~rossberg/1ml/) project tried to do this back in 2015. 

Naturally, I wanted to unify them in X as well, and thus will be explaining in this post how to do this and what the difficulties are. As it turns out, they can *mostly* be unified, but there are some minor aspects that still require separate syntax. But first, some disclaimers:

### Disclaimers

X is still in the planning stages and currently exists only in my head. What is described here is the planned design for X, but it's always possible that unforeseen issues will come up that force design changes. It's also possible that I will make changes as a result of feedback from this post. 

Additionally, I am not an OCaml expert. I've done my best to research how everything works but it's possible that I've got some details wrong. And whenever I talk about OCaml, I'll be describing things from the perspective of how equivalent features would be implemented in X/PolySubML, even if OCaml itself sees things differently or uses different terminology (e.g. "type abbreviations" instead of "type aliases"). 

# I. Introduction to OCaml modules

Before we can worry about how to implement them, we first have to understand how OCaml modules actually work. Let's begin with a simple example:

```ocaml
module M: sig
    type t 
    val zero: t 
    val add: (t * t) -> t
end = struct
    type t = int
    let zero = 0
    let add (x, y) = x + y
end

(* Example usage of module M *)
let foo = M.zero
let bar = M.add (foo, foo)
let baz: M.t = M.add (foo, bar)

```

This defines a module `M` which contains a type `t` along with a value `zero` and function `add` that operate on that type. You can access them via `M.t`, `M.zero`, and `M.add`, as shown above.

Note that `M.t` is a *new* opaque type which is distinct from every other type. The underlying definition of `M.t` is `int`, but the use of the abstract `type t` in the signature hides that fact and just generates a new opaque type when the signature is applied. This means that attempting to mix `int` and `M.t` is a compile error:

```ocaml
(* Compile error *)
let x: int = M.zero
(* Compile error *) 
let y: M.t = M.add (1, 2)
```

Now let's look at what the closest equivalent is in the existing language PolySubML:

```ocaml
let {
    type t;
    zero: t;
    add: (t * t) -> t
} = {
    zero = 0;
    add = fun (x, y) -> x + y
};

let foo = zero;
let bar = add (foo, foo);
let baz: t = add (foo, bar);
```

This is already very similar to the OCaml module example. As with `M.t` above, `t` is a distinct opaque type which can't be mixed with `int`. Functionality-wise, this example is the same, but there are a few syntactic differences.

The first notable difference is the lack of a `type t = int` in the record literal. In PolySubML, existential type instantiations are fully inferrable, which means you don't need to explicitly write the types. However, you can still optionally write them out if you want to. The way to explicitly provide the type looks like this:

```ocaml
let {
    type t;
    zero: t;
    add: (t * t) -> t
} = {
    type t = int; (* <--- explicit type *)
    zero = 0;
    add = fun (x, y) -> x + y
};
```

There's also one much more significant difference. In the PolySubML example, the unpacked values and types are bound *directly* in the parent scope, rather than being wrapped with record-like syntax. That means you use `t`, `add`, and `zero` to access them rather than `M.t`, `M.zero`, and `M.add` as in the OCaml example.

For the *value* bindings, you can fix this by just wrapping them back up in another record like this:

```ocaml
let {
    type t;
    zero: t;
    add: (t * t) -> t
} = {
    zero = 0;
    add = fun (x, y) -> x + y
};
let M = {zero; add};

let foo = M.zero;
let bar = M.add (foo, foo);
let baz: t = M.add (foo, bar);
```

However, that doesn't work for the type `t`. What we'd *like* to be able to do is `let M = {type t=t; zero; add}` so that we can then refer to it as `M.t` rather than `t`, but that isn't supported in PolySubML. This is the first major gap we'll need to address in X. We need to support **type alias members in record types**.

Before we discuss that further, here's one more module example from OCaml:

```ocaml
module M = struct 
    type t = int 
end

(* M.t and int are interchangeable *)
let x: M.t = 42
let y: int = x
```

The first example used a signature to convert `t` to an abstract type, which is the *typical* usage of modules. However, OCaml also lets you use regular type aliases in modules with no abstraction as in this example. Here `M.t` is an *alias* to `int`. They're two different names for the *same* type and are completely interchangeable. This is another demonstration of why X needs to support type alias members in record types. 

# II. Alias members in record types

We saw above that X needs to allow type aliases within records. Now comes the question of how to actually *implement* that.

> Note: In order to fully emulate OCaml modules, we need both type aliases and type constructor aliases. I plan to cover type constructors in a later post, but for now, I'll just write "type alias" everywhere to refer to both regular type aliases and type constructor aliases in order to keep things simple.

Consider this function. How should `M.t` be handled in a function where we don't even know the type of `M`?

```ocaml
fun M -> (
    let x: M.t = M.zero;
    x
)
```


The natural way to implement alias members in records is to handle them the same way as ordinary record fields, complete with full type inference. More specifically, we want alias members to be *invariant*, which means they'll work similarly to mutable record fields (which are also invariant) rather than ordinary record fields (which are covariant). 

This means that in the above example, `M.t` will just be an inference variable (actually a pair of inference variables) and type inference will sort everything out, similar to how `M.zero` is handled.


## Alias member inference

Overall, this is straightforward, but there is one minor difference compared to record fields that is worth calling out. In order to make things more convenient, alias members can be omitted from record *literals* and are inferred as needed. 


That means that code like this will compile and typecheck just fine in X:

```ocaml
let M = {
    foo=4
};

let h: M.t = "hello!";
```

If an explicit alias member of that name is already present, it will be used instead. The following will result in a type error due to the `int`/`str` mismatch on `h`:


```ocaml
let M = {
    type t=int;
    foo=4
};

let h: M.t = "hello!";
```

However, alias members are not inferred for record *types*. If you explicitly specify the type of a record value, you also need to specify all the members in the type annotation. That means that the following will result in a type error due to the nonexistent `M.t` member:

```ocaml
let M: {
    foo: int
} = {
    foo=4
};

let h: M.t = "hello!";
```

You can fix this by specifying alias members explicitly in the type annotation:

```ocaml
let M: {
    type t: str;
    foo: int
} = {
    foo=4
};

let h: M.t = "hello!";
```

This behavior was *not* motivated by OCaml because OCaml doesn't do anything like this. Rather, this is done to match the existing behavior of PolySubML, and this aspect of PolySubML was in turn motivated by the desire to maintain the duality in the type system between universally quantified function types and existentially quantified record types. 

In OCaml, generic function type parameters are inferrable (and in fact there's no way to specify them explicitly) while module type members (the equivalent of records) *must* be specified explicitly. With PolySubML, I decided to handle both the same way - both are fully inferrable but you can also specify them explicitly if you want to.

Another thing worth noting is that data and type members have different namespaces. This means that `{type foo=int; foo="hello"}` works just fine. `M.foo` in a type annotation context refers to the type `int`, while `M.foo` in an expression context accesses the `"hello"` value. OCaml behaves similarly in this respect.

# III. Struct and sig syntax

OCaml uses different syntax for modules and ordinary values. In OCaml, you need to use `struct .. end` to define module values and `sig .. end` to define module types. 

In all the X code examples so far, I've been using ordinary record literal syntax in order to emphasize the fact that modules are just ordinary values. However, even with the unification, there are some cases where OCaml's `struct` syntax is more convenient, so X will support both syntaxes.

In `struct` syntax, you can put an arbitrary list of statements between the `struct` and `end`, and it is equivalent to a block expression that evaluates to a record with a field for each variable and type binding that was introduced within the block scope. 

For example, the following code:

```ocaml
let M = struct 
    type t = int;
    let x = 42;
    let y: t = x * 3;
    let x = 1;
    let z = x + y;
end;
```

Is [syntactic sugar](https://en.wikipedia.org/wiki/Syntactic_sugar) equivalent to the following using plain record syntax:

```ocaml
let M = (
    type t = int;
    let x = 42;
    let y: t = x * 3;
    let x = 1;
    let z = x + y;    
    {type t=t; x; y; z}
);
```

The `struct` version avoids the need to repeat all the variable names at the end.

`sig` syntax is similar, but for types rather than values. For example,

```ocaml
type S = sig
    type a;
    type b = int;
    
    val x: str;
    val y: b -> a;
    val z: a -> int;
end;
```

Is equivalent to this using plain record type syntax:

```ocaml
type S = {
    type a;
    type b = int;
    
    x: str;
    y: int -> a;
    z: a -> int
};
```

As you can see, unlike with `struct` syntax, the benefits of using `sig` syntax over plain record types are very minimal.




In X, `struct`/`sig` and plain record syntax are just alternate syntax forms for the same functionality and are completely interchangeable:


```ocaml
let M: {x: int} = struct
    let x = 4;
end;

let M2: sig 
    val x: int 
end = {x=5};
```

Note that ordinary record syntax is a *superset* of sig/struct syntax in functionality. Specifically, `struct`/`sig` syntax does not support mutable fields, as in OCaml, modules cannot contain mutable fields. If you want to use mutable fields in X, you need to drop back to plain record syntax.



# IV. Module opens and includes

OCaml also lets you *open* or *include* the contents of one module into another. `include` copies all the items of the referenced module into scope:

```ocaml
let M1 = {
    x=4;
};

let M2 = {
    include M1;
    y=7;
};

(* M2 = {x=4; y=7} *)
```

`open` is similar to `include` except that the new bindings are not re-exported. Instead, for each name, the last non-opened binding, if any, is exported:

```ocaml
module M = struct 
    let x = 1
    let y = 2
end

module M2 = struct 
    let x = 3

    open M
    let z = x * 10 + y
end

(* M2 = {x=3; z=12} *)
```

Implementing OCaml-style `open` and `include` in X *could* be done if you require the included value to have a non-inferred type (as OCaml modules always do). However, I'm going to be a bit controversial and say that **OCaml's behavior here is poor design which should *not* be emulated.**

Most languages allow you to choose between named and wildcard imports. For example, in Python, you can import specific members of a module via `from foo import bar, baz`, or you can just import (almost) *everything* via `from foo import *`. Likewise, Java allows you to choose between `import foo.Bar;` and `import foo.*;` Rust and other languages are similar. 

However, in every case, **use of wildcard imports is strongly discouraged**. All these languages *have* wildcard imports, but they always tell people not to *use* them, or perhaps use them only in very specific cases.

One issue is that wildcard imports make it impossible to tell (without IDE support) where any given identifier is defined. You might see a `foo` while browsing the source code but have no way to find where it is actually defined. Another, even bigger problem is that it pollutes the namespace unnecessarily and *unpredictably*.

What does the following OCaml code print?

```ocaml
let x = 1
open M
let _ = Printf.printf "x = %d\n" x
```

The answer is that you don't know! There's no way to tell without finding the definition of `M`, because `open M` *might* shadow `x` or it might not. 

I've long argued that **optional type annotations should never impact the observable behavior of code**. [While this principle is often violated by real-world languages]({% post_url 2022-04-24-when-type-annotations-are-code-too %}),  it is key to making X simple and easy to understand despite the use of advanced type system features and sophisticated global type inference. If you want to understand what code in X *does*, you can always just *ignore the type system* and look at the *code*. 

However, with OCaml-style `open`s, that is no longer the case. Consider this example:

```ocaml
module M: sig 
    (* val x: int  *)
end = struct 
    let x = 2
end



let x = 1
open M
let _ = Printf.printf "x = %d\n" x
```

This code prints `1`, but if you uncomment the `val x: int` part, it prints `2` instead. Changing a *type annotation* changes the *runtime behavior* of a different part of the code!

Finally, **wildcard imports are a nightmare for backwards compatibility and library versioning**. With wildcard imports, simply *adding* a new member to a module is suddenly a breaking change because it could unexpectedly shadow previous definitions and break previously-working code. [This Stack Overflow answer](https://stackoverflow.com/a/150315/1420279) shows an example of a breakage in Java 1.2 with the addition of `java.util.List` shadowing `java.awt.List` when both are imported via wildcard imports (as was common practice at the time).

## Explicit imports in structs

Clearly, we need the ability to open/include a specific set of named members, rather than indiscriminately dumping the entire module contents into the current scope. OCaml does not currently have *any* syntax to support this. 

We could make up new syntax (e.g. `open M{foo; bar; type t}` or something), but there's no need because we *already* have something that serves the same purpose. Since modules in X are just ordinary records, you can *already* just write `let {foo; bar; type t} = M;` to achieve the same effect.

However, there are a few minor notes. First, we need a way to distinguish between binding a type *alias* and pinning an existential type parameter. We'll use `type t` for the former and `newtype t` for the latter (since it introduces a new type).

Second, we need a way to mark bindings as non-exported, the way that `open` does in OCaml, in order to emulate the effect of `open`. To do this, we'll just add `private` in front of the `let`. Here's the `open` OCaml example from before, rewritten in X using `private let`:


```ocaml
let M = struct 
    let x = 1;
    let y = 2;
end;

let M2 = struct 
    let x = 3;
    private let {x; y} = M;
    let z = x * 10 + y;

    (* M2 = {x=3; z=12} *)
    (* The x and y bindings from M are not included because they're marked private *)
end;
```

## Sig includes

That addresses imports in `struct` syntax, but what about `sig` syntax?

With `struct` syntax, there's a clear benefit to supporting this, but in the case of `sig` syntax, there's a lot of open design questions, so I'd rather wait and get a better understanding of how people actually *use* signature extension in OCaml in order to determine what the best way to support those use cases in X would be. Therefore, for now I'm going to punt and not have *any* dedicated include/open syntax for `sig`s in X.

Even on the OCaml side, these things are very tricky and not necessarily fully settled either. For instance, [OCaml 4.08 made a bunch of backwards-incompatible changes to how module types work](https://blog.janestreet.com/plans-for-ocaml-408/#strengthening-the-module-system).

## Local opens

OCaml also allows *local opens* via `let open M in expr` or `M.(expr)`, where `M` is opened within the scope of `expr`. As explained above, supporting wildcard opens like this goes against the design principles of X and causes problems with unexpected shadowing.

However, you can achieve code that is almost as concise in X by assigning modules to shorter aliases instead. For example, instead of `LongModule.(add one zero)`, you could write `let M = LongModule in (M.add M.one M.zero)`. 

You can also use the "explicit import" style like `let {add; one; zero} = LongModule in (add one zero)`, which might be better if you're repeatedly referencing a small number of identifiers.


# V. Module extension

While supporting OCaml-style *full* wildcard imports has a lot of negative consequences, it would be nice if we could still support the most common use cases without any of the downsides. The most common use case for includes in OCaml seems to be *extending* a module by creating a new module that has all the previous members while also adding or overriding some members:


```ocaml
module M = struct 
    type t = int
    let x = 2
    let z = 3
end

module M2 = struct 
    include M
    let y: t = x + 1
    let z = 42 (* override M.z *)
end
```

Fortunately, this particular use case *is* possible to support while still adhering to good design principles, with a few restrictions. We'll use `extends` for this in X:

```ocaml
let M = struct 
    type t = int;
    let x = 2;
    let z = 3;
end;

let M2 = struct 
    extends M;
    let y: M.t = M.x + 1;
    let z = 42; (* override M.z *)
end;
```

The necessary rules are  
1) At most one `extends` per struct  
2) `extends` must appear at the top before any definitions  
3) `extends` adds the inherited bindings to the exported record, but *not* the scope of the `struct` block itself.  

These rules ensure that variable lookup is clear and unambiguous even without knowing the definition of the module being extended. Without these rules, variable lookup would be ambiguous.


```ocaml
struct 
    (* Which one do we look in for variable "foo"? *)
    extends M1;
    extends M2;
end;
```
If multiple `extends` were allowed, there'd be no way to know which one to use to lookup any given variable without knowing the definitions of the underlying modules.

```ocaml
struct 
    (* Which one do we look in for variable "foo"? *)
    let foo = 4;
    extends M;
end;
```

If definitions were allowed before the `extends`, there'd be no way to know whether they are shadowed or not without knowing the definition of the underlying module.

```ocaml
let foo = 4;

struct 
    extends M;
    let bar = foo; (* Which "foo" does this reference? *)
end;
```

Finally, if `extends` brought the inherited bindings into the scope of the `struct` block itself, there'd be no way to know whether bindings in the *parent* scope are shadowed or not without knowing the definition of the underlying module.

With these rules, we can safely allow extending a module with the contents of some arbitrary other value, which should support the most common reason why people might want this syntax in OCaml.

In addition to making code clearer, these rules have the side-benefit that it is possible to extend a module even without knowing what the type of that module is. In X, you can extend any value, even if it is say, a function parameter with an inferred type:

```ocaml
let f = fun M -> struct 
    extends M; (* Can extend M even though it doesn't have a known type *)
    let x = 42;
end;
```

There's not much point to this without row polymorphism, but it is something you *can* do if you want to for some reason.

## Record extension syntax

Now we just need to add this feature to plain record syntax as well. Since `struct` syntax is syntactic sugar for the special case of module-like records while ordinary record syntax has full generality, anything that can be done with `struct` syntax needs to be supported with plain record syntax as well.

Fortunately, OCaml already conveniently has syntax for this that we can copy. `with` syntax allows you to copy all the fields of an existing record while also adding or overriding new fields. (OCaml itself has nominally typed records, so you can *only* override existing fields, but X has structurally typed records which allow addition of new fields as well.) If you write `{foo with a=4}`, that means to copy all the existing fields from `foo` except with `a=4` added.

Using `with` syntax, we can write the "desugared" version of the previous `extends` example.

```ocaml
let M = struct 
    type t = int;
    let x = 2;
    let z = 3;
end;

let M2 = struct 
    extends M;
    let y: M.t = M.x + 1;
    let z = 42; (* override M.z *)
end;
```

Is desugared into

```ocaml
let M = (
    type t = int;
    let x = 2;
    let z = 3;
    {type t=t; x; z}
);

let M2 = (
    let y: M.t = M.x + 1;
    let z = 42; (* override M.z *)
    {M with y; z}
);
```

One other note: In X, I'm planning to define `extends`/`with` so that if there are no *data* members specified (i.e. you're only adding/overriding *type* members), then it evaluates to the *same* object rather than copying the values into a new object like normal. This is only relevant if the object you're extending has mutable fields:

```ocaml
let M = {mut x=4; y=7};

let M2 = struct
    extends M;
    (* no new data members, so M2 == M *)
    type t=int;
end;

let M3 = struct 
    extends M;
    (* new data members, so M3 != M *)
    let y = 1;
end;

M.x <- 9;

print M2.x; (* 9, because M2 is same object as M *)
print M3.x; (* 4, because M3 *copied* M *)
```

This does mean a minor inconsistency on one axis, but that seems like a necessary evil, because both behaviors are required in different cases. Users need a way to *reinterpret* a record value while adding/changing type alias members, and they also need a way to *copy* a record while adding/changing data fields, and this seems like the cleanest way to do it. 

Since OCaml modules don't allow mutability anyway, this will never be relevant for the "module" use case. But since ordinary record values *do* allow mutability, unifying modules and records as X does means that all "module" related functionality has to consider the possibility of mutable fields as well.




# VI. Abstraction and existential types

Using alias members in records is all fine and well, but it does mean that the full types are exposed to all users, which isn't necessarily desirable.

For example, suppose we're writing a module `IntList` that represents a singly-linked list of integers with `push` and `pop` methods:

```ocaml
let IntList = struct 
    type t = rec list = [`Some {val: int; tail: list} | `None any];

    let empty: t = `None 0;
    let push = fun {list: t; val: int} : t -> `Some {val; tail=list};
    let pop = fun (list: t): [`Some (int, t) | `None any] -> (
        match list with 
        | `Some {val; tail} -> (val, tail)
        | `None _ -> `None 0
    );
end;
```

You can create and work with lists using the provided functions in `IntList` as expected:

```ocaml
let list = IntList.empty;
let list = IntList.push {list; val=1};
let list = IntList.push {list; val=2};
let list = IntList.push {list; val=3};
print (IntList.pop list |> unwrap)._0; (* prints 3 *)
```

However, you can *also* create and manipulate your own objects, as long as they have the right type, and freely intermix them with the `IntList` methods:

```ocaml
(* Can create a list value without going through IntList *)
let list = `Some {val=11; tail=`Some {val=42; tail=`None {}}};

(* This is usable with IntList methods *)
let list = IntList.push {list; val=3};
let (_, list) = IntList.pop list |> unwrap;

(* Can also reach inside the list object directly *)
print (list |> unwrap).val (* prints 11 *)
```

This is often undesirable. The implementation details of the module are fully exposed, meaning that there is no way to maintain internal invariants and no way to *change* the implementation without potentially breaking users. There's also less type safety because any value which happens to have a compatible *structure* can be used as an `IntList` and vice versa, whether or not that was what the user intended.

Therefore, we normally want to use *abstraction*, where the actual implementation types are hidden from users. Instead, users only see an *opaque* type and methods to operate on values of that type. In order to do this, we use *existential types*.

## Existential types

In PolySubML and X, record types can optionally have *existential type parameters*, written as `type a`, e.g. `{type t; foo: t}`. Existential type parameters reflect that *for each* possible value, there is *some* type that makes the type signature work. 

For example:

```ocaml
let foo: {type t; zero: t; add: (t, t) -> t} = 
    if whatever then 
        {zero=0; add: fun (a, b) -> a + b}
    else 
        {zero=0.0; add: fun (a, b) -> a +. b}
;
```

This declares a variable `foo` of type `{type t; zero: t; add: (t, t) -> t}`. We know that there is *some* type t such that the value of `foo` is compatible with `{zero: t; add: (t, t) -> t}`, but we don't know anything about what that type could be. 

In this particular example, `foo` is defined with an `if` expression, meaning it could have one of two values chosen at runtime. If the first branch is taken, it will have the value `{zero=0; add: fun (a, b) -> a + b}` where `t = int`. If the second branch is taken, it will instead have the value `{zero=0.0; add: fun (a, b) -> a +. b}`, where `t = float`.

Since the types of the fields are unknown, there is no way to directly use the fields of an existential type. Instead, you have to *pin* the type by using a pattern match to replace the existential type parameters with fresh opaque types:

```ocaml
let {newtype t; zero: t; add: (t, t) -> t} = foo;

let a: t = zero;
let b: t = add (a, a);
```

This pattern match results in a new type `t` being generated which is opaque and distinct from all other types. The fields of `foo` can now be used, but since their types refer to the opaque type `t`, they can't be mixed with any other types. This ensures that the user code works regardless of what the original value and underlying type of `foo` actually was.

We can use existential types for abstraction in the original `IntList` example like this:

```ocaml
let {
    newtype t;
    empty: t;
    push: {list: t; val: int} -> t;
    pop: t -> [`Some (int, t) | `None any]
} = struct 
    type t = rec list = [`Some {val: int; tail: list} | `None any];

    let empty: t = `None 0;
    let push = fun {list: t; val: int} : t -> `Some {val; tail=list};
    let pop = fun (list: t): [`Some (int, t) | `None any] -> (
        match list with 
        | `Some {val; tail} -> (val, tail)
        | `None _ -> `None 0
    );
end;
```

This way, the actual implementation type is hidden from users, making it impossible to mix with external values that happen to have the same structure. There is now no way to create or work with the `t` values, except by going through the provided `empty`/`push`/`pop` methods:


```ocaml
let list = `Some {val=11; tail=`Some {val=42; tail=`None {}}};

(* Type error as list is a variant but push expects the opaque type t *)
let list = push {list; val=3};
let (_, list) = pop list |> unwrap;

(* Type error as list has opaque type t so we can't peek inside *)
print (list |> unwrap).val
```

As previously discussed in section I, this use of pattern matching is undesirable because it means the module fields are bound as `t`, `empty`, `push`, and `pop`, rather than being accessed as `IntList.t`, `Intlist.empty`, etc.

Thanks to the ability to add type aliases to records, we can fix this by wrapping everything back up into a record:

```ocaml
let {
    newtype t;
    empty: t;
    push: {list: t; val: int} -> t;
    pop: t -> [`Some (int, t) | `None any]
} = (* module implementation ... *);
let IntList = {type t=t; empty; push; pop};

(* Can now access as IntList.t, etc. *)
let list: IntList.t = IntList.empty;
```

We can further simplify this by using `struct` syntax to automatically wrap everything up into a record:

```ocaml
let IntList = struct
    let {
        newtype t;
        empty: t;
        push: {list: t; val: int} -> t;
        pop: t -> [`Some (int, t) | `None any]
    } = (* module implementation ... *);
end;

(* Can now access as IntList.t, etc. *)
let list: IntList.t = IntList.empty;
```

This *works*, but it's a bit verbose. Let's see if we can do better by introducing custom shorthand syntax.

## Mod syntax

The previously shown approach using pattern matching inside a `struct` has a few minor downsides. 

First off, it destructures and then creates a new object, which seems wasteful (and also loses mutable state) when all we really want to do is reinterpret the type of the object in place. 

Second, it requires a *pattern match*, which in turn requires explicitly listing out the matched type parameters and field types. This effectively takes the place of where the signature would go in an OCaml module, but it would be nice if we could use an *actual* type signature rather than a pattern match.

Therefore, we introduce `let mod` syntax, which solves both problems:

```ocaml
let mod IntList: sig
    type t;
    val empty: t;
    val push: {list: t; val: int} -> t;
    val pop: t -> [`Some (int, t) | `None any];
end = (* module implementation ... *);

(* Can now access as IntList.t, etc. *)
let list: IntList.t = IntList.empty;
```

`let mod` is basically syntactic sugar for the previous pattern match approach except that a) it replaces the object types *in place* rather than creating a new object and b) it uses an ordinary *type annotation* rather than a *pattern*.

As an aside, I had a bit of a debate about whether to use `mod` or something else (e.g. `pin`) instead. The *actual function* of the `mod` syntax is to replace existential type parameters with fresh types. If you're not using existential types, you don't need `mod` at all, even for module-like objects (e.g. record values containing type aliases). `pin` would better describe the underlying function, but I decided to use `mod` instead for now, since it makes things look more similar to OCaml and `mod` is already a keyword anyway. Hopefully this won't cause too much confusion.

Also note that this `mod` syntax modifies a variable *binding* in a pattern, not the `let` definition as a whole. You can nest `mod` within more complex patterns as well, e.g. `let {a; mod b; c; mod d} = ...`. 

Now, it's time to talk about *functors*.


# VII. Functors and functions and forward type propagation

*"What about functors?"*, you might be wondering at this point. Or if you're not an OCaml programmer, you might instead be wondering "WTF *are* functors?"

Functors sound complex, but at their heart, they're just *functions which operate on modules*. OCaml has a two-tier design with a strict separation between ordinary values, types, and functions on the one hand and module values, module types, and functors on the other, and thus needs a specific name for "functions over modules". However, in X, the equivalent of modules are just ordinary record values, and thus we can just use ordinary functions on them!

However, there's still a few aspects worth discussing. Let's look at a typical usage of functors in OCaml:

```ocaml
module IntSet = Set.Make (struct
  type t = int
  let compare x y = x - y
end)
```

`Set.Make` is a functor provided by the OCaml standard library. It takes in one module (the `struct ... end` part) as a parameter and returns a new module object (which is here bound to `IntSet`).

Notice that `IntSet` does not have an explicit type annotation here. When you define a functor, it needs to have a known type signature, and then when you *call* the functor, the return type of that signature is propagated to the callsite, avoiding the need for an explicit type annotation at the point of the call (as modules in OCaml must *always* have a known type).

By contrast, the version of `let mod` syntax for X shown in the previous section requires an explicit type annotation at the point where the module is bound.

```ocaml
let mod IntSet: (* type annotation here *) = Set.Make {
    compare=fun (x, y) -> x - y
};
```

It would be nice if we could avoid repeating the type signature like OCaml allows. The first question is whether we actually *need* the type signature in the first place. Can we just remove it and let type inference work its magic?

The problem is that `let mod` needs to know the type of the right hand side so that it knows which existential type parameters it is supposed to replace and where. You can *sort of* get away with inferring this, but it won't work in all cases.

Specifically, if the right hand side is the union of multiple distinct existential types (such as if it were defined directly or indirectly as an `if` or `match` expression), then in order to infer a type, we need to find a most general common supertype of the types of all the branches. And in the case of existential record types, there may not actually be a most general supertype.

This is a consequence of the fact that a) existential type parameters can be be forgotten (e.g. `{type t; foo: t}` is a subtype of `{}`) and that b) all type parameters share a single namespace, regardless of kind. To put this in OCaml terms, there's no way to merge a module type containing abstract `type t` with a module type containing `type 'a t` because they have the same name but different kinds. You have to pick one or the other to keep. That means there are two possible choices of common supertype, neither of which is more general than the other.

This means that it is impossible to have full type inference for `let mod`, so we need to require explicit type annotations. However, we'd still like to be able to omit the type annotation at the point of the module binding similar to the OCaml functor example. The solution is to add a *forward type propagation* system.

## Forward type propagation

We need to have an explicit type annotation *somewhere*, but it doesn't have to be directly on the module binding. Instead, we can add a simple set of rules to propagate types forward as much as possible without going through full type inference.

Instead of defining the rules of how types are propagated, it's easier to define when they *aren't*. Forward propagation stops in the following cases:

1. Expression was explicitly annotated with an inference variable (e.g. the `_` in `let x: _ = ...`) or a type that otherwise reduces to an inference variable.
2. Expression is a conditional (`if` or `match` expression). For simplicity, we don't bother with `loop` or field assignment expressions either.
3. Expression is a field expression (`foo.bar`) where `foo` is typed with an inference variable.
4. Expression is a call expression (`foo bar`) where `foo` is typed with an inference variable.

Roughly speaking, this is the type information that can be known in a single forward pass without running full type inference or performing any type unions. The exclusion of `if` and `match` means we never have to perform type unions under these rules, which avoids the problem that type unions are undefined for existential record types as explained in the previous section.

Then we just require that the right hand side of `let mod` to have a type known via forward propagation. This means that adding an explicit type signature always works, but the explicit type signature can be avoided in some cases, such as the functor example (assuming that the functor was defined with an explicit return type).

```ocaml
let mod IntSet = Set.Make {
    compare=fun (x, y) -> x - y
};
```

With that out of the way, there's one last issue with functors to bring up: *generativity*.

## Generative and applicative functors

OCaml lets you choose between *generative* and *applicative* functors. The names might sound scary, but the basic idea is that generative functors behave like ordinary functions while applicative functors behave like *memoized* functions.

Generative functors behave like ordinary functions. Every time you call it, you get a new result. That means that if the return signature has an abstract type, a fresh type will be generated on every call. This means that types `M1.t` and `M2.t` below are independent types that are not compatible:

```ocaml
module GenerativeFunctor () : sig 
    type t 
    val foo: t 
end = struct
    type t = int
    let foo = 42
end

module M1 = GenerativeFunctor ()
module M2 = GenerativeFunctor ()

(* Error: This expression has type M2.t but an expression was expected of type M1.t *)
let x: M1.t = M2.foo
```


By contrast, *applicative* functors behave like *memoized* functions. That is to say, calling it multiple times with the same argument returns the *same* result. In the below example, calling `ApplicativeFunctor` twice with `Arg` returns the *same* module, and thus `M1.t` and `M2.t` are the *same* type and can be freely mixed.


```ocaml
module ApplicativeFunctor (_: sig end) : sig 
    type t 
    val foo: t 
end = struct
    type t = int
    let foo = 42
end

module Arg = struct end

module M1 = ApplicativeFunctor (Arg)
module M2 = ApplicativeFunctor (Arg)

(* This is valid because both M1 and M2 have the same type `t` *)
let x: M1.t = M2.foo
```

This works due to the restricted nature of OCaml's functor syntax. In X however, functors are just ordinary functions and thus can have *arbitrary* code and are not guaranteed to be pure or deterministic. This means that all "functors" in X *must* be generative. 


# VIII. Conclusion

In this post, we saw how to unify the value and module level dialects of OCaml. If you already have structural typing and existential types as PolySubML does, then most of this comes for free, but there are a few minor new features needed. Most aspects of modules are fully inferrable, but explicit type annotations are still required when using abstraction in order to indicate how and when to generate new abstract types.

Unifying the value and module levels allows X to have the same expressivity while being much simpler, making it easier to develop and easier to learn. This is especially important for a one-person hobby language like X, but it could be useful for larger scale languages as well.

With modules out of the way, there are several other OCaml features left to integrate into X, notably **nominal types** (including records and variants) and **GADTs**, subjects I hope to address in subsequent blog posts about the planned design of X.


{{series_footer}}












