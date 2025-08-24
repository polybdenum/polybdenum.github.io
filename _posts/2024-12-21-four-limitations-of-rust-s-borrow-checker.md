---
layout: post
title: Four limitations of Rust's borrow checker
date: 2024-12-21 13:57 -0800
---

I've been using Rust for hobby projects since 2016 and have been working professionally in Rust since 2021, so I tend to consider myself pretty knowledgeable about Rust. I'm already familiar with all the common limitations of Rust's type system and how to work around them, so it's pretty rare that I have to "fight the borrow checker" as new Rust users often struggle with. However, it does still happen on occasion.

In this post, I'll cover four surprising limitations of the borrow checker that I ran into in the course of my work.

Also note that when I say something can't be done, I mean that *it can't be done in a way that leverages Rust's type system*, i.e. with static type checking. You can trivially bypass any problem by using unsafe code or by using runtime checks (e.g. "just slap `Arc<Mutex<_>>` on everything.") However, having to resort to this still represents a limitation of the type system. It's never the case that you literally can't solve a problem at all, since there are always those escape hatches (and I'll even show examples of an escape hatch I used below), but it is impossible to solve the problem *in a way that makes Rust Rust*.


# 1. Checking does not take match and return into account

In this case, I actually had someone come to me for help with this problem. Then I forgot about it, only to run into the exact same wall later on in my own work, so this seems like an especially common problem.

This problem most often manifests when you want to look up a value in a hashmap, and do something different if it is not present. For the sake of example, let's suppose you want to look up one key in a hashmap, and if that is not present, to fall back to a second key. You can easily do that like this:


```rust
fn double_lookup(map: &HashMap<String, String>, mut k: String) -> Option<&String> {
    if let Some(v) = map.get(&k) {
        return Some(v);
    }

    k.push_str("-default");
    map.get(&k)
}
```

*Normally you'd return `&str` rather than `&String`, but I'm using `String` here for the sake of simplicity and clarity.*

One thing Rust discourages is doing unnecessary work such as multiple redundant lookups into a hashmap. Instead of first checking a value in the map and then accessing it (with an unnecessary second lookup), you instead call `get()`, which returns an `Option`, letting you do everything in one call.


At least, you can do that *most* of the time. Unfortunately, sometimes borrow checker limitations get in the way. Specifically, suppose we want to do the same thing as above but return an *exclusive* (`&mut`) reference rather than a shared (`&`) reference:


```rust
fn double_lookup_mut(map: &mut HashMap<String, String>, mut k: String) -> Option<&mut String> {
    if let Some(v) = map.get_mut(&k) {
        return Some(v);
    }

    k.push_str("-default");
    map.get_mut(&k)
}
```

Try to run this and the compiler will complain:

```
error[E0499]: cannot borrow `*map` as mutable more than once at a time
  --> src/main.rs:46:5
   |
40 | fn double_lookup_mut(map: &mut HashMap<String, String>, mut k: String) -> Option<&mut String> {
   |                        - let's call the lifetime of this reference `'1`
41 |    if let Some(v) = map.get_mut(&k) {
   |                    --- first mutable borrow occurs here
42 |        return Some(v);
   |                ------- returning this value requires that `*map` is borrowed for `'1`
...
46 |    map.get_mut(&k)
   |    ^^^ second mutable borrow occurs here

```

The first `get_mut` call borrows `map` and returns an `Option` potentially containing a borrowed reference. When it does, we return the value immediately, and so in the branch where we *don't* return, we're not actually using the borrow anymore. However, the borrow checker has limited flow analysis capabilities and does not currently reason about stuff like this.

Therefore, from the borrow checker's perspective, the first `get_mut` call results in `map` falsely being borrowed *for the entire rest of the function*, making it impossible to do anything else with it.

In order to work around this limitation, we have to do an unnecessary check-and-lookup like this:

```rust
fn double_lookup_mut2(map: &mut HashMap<String, String>, mut k: String) -> Option<&mut String> {
    // We look up k here:
    if map.contains_key(&k) {
        // and then look it up again here for no reason.
        return map.get_mut(&k);
    }

    k.push_str("-default");
    map.get_mut(&k)
}
```

# 2. Being async is suffering

Let's suppose you have a vec and you want to use *encapsulation* to prevent users from worrying about the inner details of the implementation. Therefore, you just provide a method which takes a user-provided callback and calls it on every element.


```rust
struct MyVec<T>(Vec<T>);
impl<T> MyVec<T> {
    pub fn for_all(&self, mut f: impl FnMut(&T)) {
        for v in self.0.iter() {
            f(v);
        }
    }
}
```

You can use it like this:

```rust
let mv = MyVec(vec![1,2,3]);
mv.for_all(|v| println!("{}", v));

let mut sum = 0;
// Can also capture values in the callback
mv.for_all(|v| sum += v);    
```

Pretty simple, right? Now suppose you want to allow *async* code. We want to be able to do something like this:


```rust
mv.async_for_all(|v| async move {println!("{}", v)}).await;
```

... yeah, good luck with that. I spent a while trying everything I could think of, but as far as I can tell, there is simply no way to express the required type signature in Rust right now. Rust recently added the `use<'a>` syntax, and less recently, Generic Associated Types, but even those don't seem to help. The problem is that the future type returned by the function has to depend on the lifetime of the argument, and Rust doesn't allow you to be generic over parameterized types.

I may be wrong about this, in which case, feel free to chime in. If there is a way to do this, I'd love to know.

# 3. FnMut does not allow reborrowing of captures

Ok, so it's not possible to take an async callback that takes in a reference. However, in the toy example above, we're just dealing with simple integers anyway. Let's get rid of the generic `<T>` and also pass everything by value instead of reference:


```rust
struct MyVec(Vec<u32>);
impl MyVec {
    pub fn for_all(&self, mut f: impl FnMut(u32)) {
        for v in self.0.iter().copied() {
            f(v);
        }
    }

    pub async fn async_for_all<Fut>(&self, mut f: impl FnMut(u32) -> Fut)
        where Fut: Future<Output = ()>,
    {
        for v in self.0.iter().copied() {
            f(v).await;
        }
    }
}
```

This actually does work for our first example. The following compiles just fine:

```rust
mv.async_for_all(|v| async move {println!("{}", v);}).await;
```

Unfortunately, this still doesn't work as soon as we try to pass in a callback that actually captures something:


```rust
let mut sum = 0;
let r = &mut sum;
mv.async_for_all(|v| async move {*r += v}).await;
```

```
error[E0507]: cannot move out of `r`, a captured variable in an `FnMut` closure
   --> src/main.rs:137:26
    |
136 |   let r = &mut sum;
    |       - captured outer variable
137 |   mv.async_for_all(|v| async move {*r += v}).await;
    |                   --- ^^^^^^^^^^  --
    |                   |   |           |
    |                   |   |           variable moved due to use in coroutine
    |                   |   |           move occurs because `r` has type `&mut u32`, which does not implement the `Copy` trait
    |                   |   `r` is moved here
    |                   captured by this `FnMut` closure

```

The problem here is that the signature of `async_for_all` above is not general enough.

What is the type of our closure? To understand the problem, let's try writing the closure by hand using explicit types. 

First off, we need to create a type for the future we're returning. In most cases, [it is impossible to write your own futures in safe Rust]({% post_url 2024-06-04-the-inconceivable-types-of-rust-how-to-make-self-borrows-safe %}), but in a simple case like this with no borrows, it actually *is* possible:



```rust
struct MyFut<'a>{
    r: &'a mut u32,
    v: u32,
}
impl<'a> Future for MyFut<'a> {
    type Output = ();

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        *self.r += self.v;
        Poll::Ready(())
    }    
}
```

Now we just need a type representing the closure itself:


```rust
struct SumCallback<'a> {
    r: &'a mut u32,
}
impl<'a> SumCallback<'a> {
    fn call_mut<'s>(&'s mut self, v: u32) -> MyFut<'s> {
        MyFut{r: &mut self.r, v}
    }
}
```

*Note: The `'s` lifetime can be elided, but I wrote it explicitly here for the sake of clarity.*

This code does compile. The problem is that the signature of the `call_mut` method we defined is not actually the same as the signature of the real `FnMut` trait. The real `FnMut` trait forces the output type to be independent of the `self` lifetime.

FnMut was presumably designed this way because a) Rust did not have generic associated types at launch and b) it's not clear what kind of shorthand syntax you'd use. You could try defining a magic `'self` type in the syntax, allowing you to write the type as `impl FnMut(u32) -> MyFut<'self>`, but that's a bit of a hack and doesn't work if you allow `impl FnMut`s to be nested. In any case, that's not how `FnMut` works today, and so we're once again stuck.

As an aside, Rust has three function traits, `Fn`, `FnMut`, and `FnOnce`, with method receivers of `&self`, `&mut self`, and `self` respectively. However, `FnMut` is the only one where the lack of a self lifetime is an issue. In the case of `Fn`, any reference to captured values must be a shared reference, and hence `Copy`, and so there is no problem returning a reference to the entire type. For `FnOnce`, you can't borrow the captured values in the first place.

The reason `FnMut` is unique is because `&mut` references are the only case where *reborrowing* is relevant. In our `call_mut` method, we don't return the captured `r` reference directly (which has lifetime `'a`). Instead, we return a temporary *sub-borrow* of that reference with lifetime `'s`. If `r` were a `&u32` rather than `&mut u32`, then it would be `Copy` and so we could just return the entire `'a` reference with no problems.


# 4. Send checker is not control flow aware

Here's a simplified version of some code I once wrote at work:

```rust
async fn update_value(foo: Arc<std::sync::Mutex<Foo>>, new_val: u32) {
    let mut locked_foo = foo.lock().unwrap();

    let old_val = locked_foo.val;
    if new_val == old_val {
        locked_foo.send_no_changes();
    } else {
        // Release the mutex so we don't hold it across an await point.
        std::mem::drop(locked_foo);
        // Now do some expensive work
        let changes = get_changes(old_val, new_val).await;
        // And send the result
        foo.lock().unwrap().send_changes(changes);
    }
}
```

We lock an object, and if the field hasn't changed, we take a fast path, otherwise, we drop the lock, do some processing, and then lock it again to send the updates.

As an aside, I'm sure someone will ask what happens if `foo.val` changes while the lock is dropped. In this case, this is the only task that writes to the field, so that can't happen (the only reason we needed the mutex is because there's another task that *reads* the field). Additionally, since we don't do anything expensive while holding the lock and don't expect any real contention, we just use a regular `std::sync::Mutex` rather than the more typical async-aware tokio `Mutex`, but that isn't relevant to the problem discussed here.


So what's the problem? There is no problem, *as long as it runs only in the root task*. With the usual multithreaded Tokio runtime, you can run one task on the main thread using `block_on`, and this future is not required to be `Send`. However, any *other* tasks you spawn do require that your futures are `Send`.

In order to increase parallelism and avoid blocking the main thread, I wanted to move this code off of the main thread and into a separate task. Unfortunately, the future above is not `Send` and hence can't be spawned as a task.

```
note: future is not `Send` as this value is used across an await
   --> src/main.rs:183:53
    |
175 |   let mut locked_foo = foo.lock().unwrap();
    |       -------------- has type `MutexGuard<'_, Foo>` which is not `Send`
...
183 |       let changes = get_changes(old_val, new_val).await;
    |                                                   ^^^^^ await occurs here, with `mut locked_foo` maybe used later
```

Now, this code *should* be `Send`. After all, it never *actually* holds the lock across an await point (which would risk deadlocks anyway). However, the compiler currently *doesn't do any control flow analysis* when deciding whether futures are `Send` or not, and hence it is flagged as a false positive.

As a workaround, I had to move the lock into an explicit scope, and then duplicate the if condition and move the else branch outside of the scope:

```rust
async fn update_value(foo: Arc<std::sync::Mutex<Foo>>, new_val: u32) {
    let old_val = {
        let mut locked_foo = foo.lock().unwrap();

        let old_val = locked_foo.val;
        if new_val == old_val {
            locked_foo.send_no_changes();
        }
        old_val
        // Drop the lock here, so the compiler understands this is Send
    };

    if new_val != old_val {
        let changes = get_changes(old_val, new_val).await;
        foo.lock().unwrap().send_changes(changes);
    }
}
```

# Conclusion

Rust's type system already works well in typical cases, but there are still occasional surprises. No static type system will ever allow *all* valid programs, due to [undecidability issues](https://en.wikipedia.org/wiki/Rice%27s_theorem), but programming languages can get good enough that it's rarely a practical problem. One of the challenges of programming language design is to figure out how to allow as many reasonable programs as you can within your complexity and performance budget (this includes not just the compiler implementation but the complexity of the language itself, and particularly the type system).

Out of the issues I've highlighted here, #1 and #4 in particular seem like obvious things to fix that would deliver a lot of value at minimal cost. #2 and #3 are trickier, because they require changes to type syntax and there's a high complexity cost there. However, it is still unfortunate how poorly async Rust works compared to classic straight-line Rust.




