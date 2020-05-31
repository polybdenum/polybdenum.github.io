---
layout:	post
title:	"Ref patterns, destructuring, and invisible borrows"
date:	2018-01-17
---

  *Note: The behavior of match patterns in Rust has been changed since this post was written, making it largely obsolete.*

Recently, I was puzzled when I came across some Rust code that looked like it couldn’t possibly compile, and yet it did. Here’s a short snippet that demonstrates the same problem as the original code I was reading:

```rust
let opt = Some("Hello".to_string());

match opt {
    Some(_) => println!("We have a string"),
    None => println!("We have None"),
}

match opt {
    Some(mut s) => {
        s.push_str(" world!");
        println!("{}", s);
    }
    None => {}
}
```
The usual rule in Rust is that if you see a variable without a & in front of it, that means that the value is being moved or copied. Here, opt appears twice, but it is not a copyable type. The first match expression should move opt, leading to an error in the second match expression, but this code compiles without errors. How is this possible?

After some experimentation, I discovered that replacing the `Some(_)` in the first match clause above with `Some(s)` does cause a “use of partially moved value” error as expected. Furthermore, the ever helpful compiler suggests changing it to `Some(ref s)`, which does compile without errors. Clearly, the _ is getting implicitly replaced by `ref s` rather than `s`, and this somehow causes the match expression to borrow opt rather than moving it.

However, this still leaves the question of why the match expression is borrowing opt when there is no &. If like me, you think of ref as something to sprinkle into all your match clauses until the compiler stops complaining, this may seem a bit magical, but it turns out to be a logical consequence of the way pattern matching works in Rust.

Like many languages, Rust offers destructuring, a shorthand syntax to split up complicated values. The simplest case is using destructing assignment to split up a tuple at the same time you assign new variables as shown below.

```rust
let (a, (b, c)) = (1, (2, 4));
// a = 1, b = 2, c = 4
```
In a language without destructuring assignment, you would have to access every part of the tuple separately, like this, which is much more verbose.
```rust
let temp = (1, (2, 4));
let a = temp.0;
let b = temp.1.0;
let c = temp.1.1;
```
The basic idea behind destructuring syntax is that the left hand side of the assignment looks the same as the right hand side you are trying to match against, which means that each bit of syntax on the left of the assignment does the opposite of what it would do in a normal expression. For example, adding parenthesis causes a tuple to be broken apart rather than creating a tuple like normal. The same applies for structs.

```rust
struct Foo {
    size: u32,
    name: &'static str,
}
let Foo{size: a, name: b} = Foo{size: 42, name: "Bob"};
// a = 42, b = "Bob"
```
However, Rust’s destructuring syntax is not limited to tuples and structs. You can also use it with references:

```rust
let &&&x = &&&42;
// x = 42
```
And of course, you don’t have to undo every level of references in the pattern. If you don’t, the resulting variable will be a reference.

```rust
let &&y = &&&42;
// y = &42
```
This syntax can also be combined with tuples and structs

```rust
let (x, &y) = (&32, &8);
// x = &32, y = 8
```
However, what if you had an existing reference to a tuple and you wanted to get references to the individual members of the tuple? Using & in a destructuring pattern will “undo” a reference but it can’t create one.

```rust
// What goes here ???
let &(???x, ???y) = &(4, 7);
```
The answer is `ref`. In a pattern, `ref` does the opposite of `&` — it creates a reference. This allows us to undo the original reference to the tuple, split it apart, and then take a reference to each individual member, all in one pattern:

```rust
let &(ref x, ref y) = &(4, 7);
```
You don’t have to use ref inside a tuple. You can also use it on a bare variable and combine it with &, although there’s no real reason to do so. Since & and ref are opposites, the following are equivalent:

```rust
let x = &42;
let &ref y = &42;
// x = &42, y = &42
```
However, we can also remove the & from both sides, meaning that the following must also be equivalent:

```rust
let ref z = 42;
// z = &42
```
But wait! We just borrowed a variable without using a & ! (Well, we actually borrowed a literal here for the sake of example, but you could just as easily put a variable in place of 42).

Far from being weird magic, borrowing the right hand side is the only logical way for a ref pattern to work! In the examples above, we’ve been doing the destructing inside an assignment, but it works the same way if you do it in the arms of a match expression instead:

```rust
match opt {
    // opt is borrowed because of the ref pattern
    // on the "left hand side" here
    Some(ref s) => println!("We have a string"),
    None => println!("We have None"),
}
```
So the lesson is that when destructuring is involved, it’s not enough to look for & to find the borrows of a given variable. You need to check whether the destructuring pattern contains ref, (and if so, whether there are more levels of & then refs.)

As for why _ turned into ref s rather than s, this is presumably just the Rust compiler being helpful and choosing the least restrictive form of reference, much like it does for closures. Since the string isn’t actually used in the first match expression, we might as well just borrow it, which places the fewest restrictions on the surrounding code.

**Update**: mutabah pointed out in the comments that _ doesn’t actually get turned into a ref pattern. It acts like it did in terms of the fact that opt doesn’t get moved, but it is actually even weaker because it doesn’t borrow opt either. You can see the difference if you try something like this:

```rust
match opt {
    Some(_) => drop(opt),
    None => println!("We have None"),
}
```
The match opt part doesn’t hold on to opt at all, meaning we are free to move it within the match statement (in this case, passing it to drop). If the _ were replaced by ref s, this would be invalid because we would be trying to drop the string while simultaneously borrowing it.

