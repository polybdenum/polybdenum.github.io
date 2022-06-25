---
layout: post
title: An Unfortunate Experience with Rust
date: 2022-06-25 14:18 -0700
---
<style>
/*pre {white-space: pre-wrap};*/
span.bold {font-weight: bold;}
span.red {color: red;}
span.green {color: green;}
span.blue {color: blue;}
span.cyan {color: cyan;}
</style>

I consider myself to be pretty experienced in Rust. I've been using Rust in personal projects since late 2016 and professionally since early 2021. I've prepared internal presentations to teach coworkers about borrow checking and about async programming. However, even I still occasionally run into issues fighting the Rust compiler, and the following is a series of particularly unfortunate issues I ran into at work this week.

### Background

> **Note:** The following code examples are simplified in order to demonstrate the essence of the problem. Obviously, our actual code is a lot more complicated.

We have an async trait `Foo` with a method `update_all` to process a list of items, which then calls the per-implementation `update` method on the trait.


```rust
#[async_trait(?Send)]
trait Foo {
    async fn update(&self, item: String) -> Result<String, Error>;

    async fn update_all(&self, items: Vec<String>) -> Result<Vec<String>, Error> {
        stream::iter(items)
            .map(move |item| async move { self.update(item).await })
            .buffered(3)
            .try_collect()
            .await
    }
}
``` 

We then have several implementations of `Foo`, here represented by `FooImpl`, and another type `FooWrapper` which makes use of a boxed `dyn Foo` to do various things.


```rust
struct FooImpl;
#[async_trait(?Send)]
impl Foo for FooImpl {
    async fn update(&self, item: String) -> Result<String, Error> {
        println!("{:?} Updating {}", time(), item);
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        Ok(item)
    }
}

struct FooWrapper {
    foo: Box<dyn Foo>,
}
impl FooWrapper {
    async fn do_all_the_things(&mut self) -> Result<(), Error> {
        let items = (0..10).into_iter().map(|i| format!("Item {}", i)).collect();
        self.foo.update_all(items).await?;
        Ok(())
    }
}
``` 

### The task

The change I needed to make was to call some extra logic in `FooWrapper` right before each item is processed in the loop inside `Foo::update_all`, which is here represented by the `Updates` struct and its `notify` method. Note that this is a *mutable* method.

```rust
struct Updates;
impl Updates {
    fn notify(&mut self, item: String) {
        println!("{:?} About to update {}", time(), item);
    }
}

struct FooWrapper {
    foo: Box<dyn Foo>,
    updates: Updates,
}
``` 

### Part 1: Adding a callback parameter

The obvious approach is to pass a callback into the `Foo::update_all` method, and call that before each update. Since `Foo` is a dyn trait, the callback needs to be dyn as well, and that usually means boxing, so I went ahead and added a boxed function parameter:

```diff
 trait Foo {
     async fn update(&self, item: String) -> Result<String, Error>;
 
-    async fn update_all(&self, items: Vec<String>) -> Result<Vec<String>, Error> {
+    async fn update_all(
+        &self,
+        items: Vec<String>,
+        cb: Box<dyn FnMut(String)>,
+    ) -> Result<Vec<String>, Error> {
         stream::iter(items)
             .map(move |item| async move { self.update(item).await })
             .buffered(3)
```            
```diff
 impl FooWrapper {
     async fn do_all_the_things(&mut self) -> Result<(), Error> {
         let items = (0..10).into_iter().map(|i| format!("Item {}", i)).collect();
-        self.foo.update_all(items).await?;
+        let mut cb = |item| self.updates.notify(item);
+        self.foo.update_all(items, Box::new(cb)).await?;
         Ok(())
     }
 }
```

This results in our first misleading lifetime error message:

<pre><span class="bold red">error</span><span class="bold">: lifetime may not live long enough
  </span><span class="bold blue">--&gt; </span>src/main.rs:60:36
   <span class="bold blue">|
57 | </span>    async fn do_all_the_things(&amp;mut self) -&gt; Result&lt;(), Error&gt; {
   <span class="bold blue">|                                - let's call the lifetime of this reference `'1`
...
60 | </span>        self.foo.update_all(items, Box::new(cb)).await?;
   <span class="bold blue">|                                    </span><span class="bold red">^^^^^^^^^^^^ cast requires that `'1` must outlive `'static`
   </span><span class="bold blue">|
</span><span class="bold cyan">help</span>: to allow this `impl Trait` to capture borrowed data with lifetime `'1`, add `'_` as a bound
   <span class="bold blue">|
57 | </span>    async fn do_all_the_things(&amp;mut self) -&gt; Result&lt;(), Error&gt;<span class="green"> + '_</span> {
   <span class="bold blue">|                                                                </span><span class="green">++++

</span></pre>


Most compiler errors in Rust are clear and easy to fix, but this one is different. This error points to *the completely wrong part of the code* and the suggested fix *isn't even valid Rust*, as we can confirm if we try to perform the suggested fix anyway:

<pre><span class="bold red">error[E0404]</span><span class="bold">: expected trait, found enum `Result`
  </span><span class="bold blue">--&gt; </span>src/main.rs:57:46
   <span class="bold blue">|
57 | </span>    async fn do_all_the_things(&amp;mut self) -&gt; Result&lt;(), Error&gt; + '_ {
   <span class="bold blue">|                                              </span><span class="bold red">^^^^^^^^^^^^^^^^^ not a trait
   </span><span class="bold blue">|
</span><span class="bold cyan">help</span>: `+` is used to constrain a "trait object" type with lifetimes or auto-traits; structs and enums can't be bound in that way
  <span class="bold blue">--&gt; </span>src/main.rs:57:66
   <span class="bold blue">|
57 | </span>    async fn do_all_the_things(&amp;mut self) -&gt; Result&lt;(), Error&gt; + '_ {
   <span class="bold blue">|                                              -----------------   </span><span class="bold cyan">^^ ...because of this bound
   </span><span class="bold blue">|                                              |
   |                                              expected this type to be a trait...
</span><span class="bold cyan">help</span>: if you meant to use a type and not a trait here, remove the bounds
   <span class="bold blue">|
57 </span><span class="red">- </span>    async fn do_all_the_things(&amp;mut self) -&gt; Result&lt;(), Error&gt;<span class="red"> + '_</span> {
<span class="bold blue">57 </span><span class="green">+ </span>    async fn do_all_the_things(&amp;mut self) -&gt; Result&lt;(), Error&gt; {
   <span class="bold blue">| 

</span><span class="bold red">error[E0782]</span><span class="bold">: trait objects must include the `dyn` keyword
  </span><span class="bold blue">--&gt; </span>src/main.rs:57:46
   <span class="bold blue">|
57 | </span>    async fn do_all_the_things(&amp;mut self) -&gt; Result&lt;(), Error&gt; + '_ {
   <span class="bold blue">|                                              </span><span class="bold red">^^^^^^^^^^^^^^^^^^^^^^
   </span><span class="bold blue">|
</span><span class="bold cyan">help</span>: add `dyn` keyword before this trait
   <span class="bold blue">|
57 </span><span class="red">- </span>    async fn do_all_the_things(&amp;mut self) -&gt; Result&lt;(), Error&gt; + '_ {
<span class="bold blue">57 </span><span class="green">+ </span>    async fn do_all_the_things(&amp;mut self) -&gt; <span class="green">dyn </span>Result&lt;(), Error&gt; + '_ {
   <span class="bold blue">| 

</span><span class="bold">Some errors have detailed explanations: E0404, E0782.
For more information about an error, try `rustc --explain E0404`.
</span></pre>


Now I should be clear - **Rust is my favorite language**. Rust really stands out for the high quality of its compiler error messages, which is why I was surprised to see such a broken error here. I'm pointing this out because I hold Rust to a higher standard, and so that people can fix this error and make it even better. In many programming languages, inscrutable and misleading compiler error messages are a routine fact of life, not something notable enough to be worth spending my whole Saturday writing a blog post about.


### 1b

Fortunately, this error is easily fixed, in spite of the broken error message. We know that we just added a boxed trait object to the signature of `update_all`, and that our callback captures a reference to `FooWrapper` and that we probably need to indicate that in its type somehow.

We need to add a lifetime bound which is tied to the future that `update_all` returns, but it wasn't clear to me how to do that, given that this is an async trait method. I decided to just add a `'_` to see what would happen.

```diff
     async fn update_all(
         &self,
         items: Vec<String>,
-        cb: Box<dyn FnMut(String)>,
+        cb: Box<dyn FnMut(String) + '_>,
     ) -> Result<Vec<String>, Error> {
         stream::iter(items)
             .map(move |item| async move { self.update(item).await })
```

Fortunately, this time, Rust tells us exactly what we need to do. Apparently, the `async_trait` macro generates a `'async_trait` lifetime that we can use.

<pre><span class="bold red">error[E0621]</span><span class="bold">: explicit lifetime required in the type of `cb`
  </span><span class="bold blue">--&gt; </span>src/main.rs:26:37
   <span class="bold blue">|
25 |   </span>        cb: Box&lt;dyn FnMut(String) + '_&gt;,
   <span class="bold blue">|               --------------------------- help: add explicit lifetime `'async_trait` to the type of `cb`: `Box&lt;(dyn FnMut(String) + 'async_trait)&gt;`
26 |   </span>    ) -&gt; Result&lt;Vec&lt;String&gt;, Error&gt; {
   <span class="bold blue">|  </span><span class="bold red">_____________________________________^
</span><span class="bold blue">27 | </span><span class="bold red">| </span>        stream::iter(items)
<span class="bold blue">28 | </span><span class="bold red">| </span>            .map(move |item| async move { self.update(item).await })
<span class="bold blue">29 | </span><span class="bold red">| </span>            .buffered(3)
<span class="bold blue">30 | </span><span class="bold red">| </span>            .try_collect()
<span class="bold blue">31 | </span><span class="bold red">| </span>            .await
<span class="bold blue">32 | </span><span class="bold red">| </span>    }
   <span class="bold blue">| </span><span class="bold red">|_____^ lifetime `'async_trait` required

</span><span class="bold">For more information about this error, try `rustc --explain E0621`.
</span></pre>


### 1c

I later realized that the boxing isn't necessary in the first place. Boxing is a Rustacean's first instinct for passing around `dyn Trait` objects, but in this case, it makes more sense to pass the callback by mutable reference instead. In fact, the `Box` doesn't actually add anything here since the closure is not `'static` anyway - the closure is effectively just a `&mut Updates` pointing into the parent `FooWrapper`.



```diff
     async fn update_all(
         &self,
         items: Vec<String>,
-        cb: Box<dyn FnMut(String) + '_>,
+        cb: &mut dyn FnMut(String),
     ) -> Result<Vec<String>, Error> {
         stream::iter(items)
             .map(move |item| async move { self.update(item).await })

     async fn do_all_the_things(&mut self) -> Result<(), Error> {
         let items = (0..10).into_iter().map(|i| format!("Item {}", i)).collect();
         let mut cb = |item| self.updates.notify(item);
-        self.foo.update_all(items, Box::new(cb)).await?;
+        self.foo.update_all(items, &mut cb).await?;
         Ok(())
     }
 }

``` 


Switching to `&mut` dodges the lifetime issues we had with the `Box` approach above. If I'd thought of that the first time around, it would have saved a lot of trouble. On the other hand, this way I discovered a broken error message to report, so perhaps it was for the best.

## Part 2: Calling the callback

Now comes the *hard* part - actually calling the callback parameter that we added to `update_all`.

```diff
     ) -> Result<Vec<String>, Error> {
         stream::iter(items)
-            .map(move |item| async move { self.update(item).await })
+            .map(move |item| async move {
+                cb(item.clone());
+                self.update(item).await
+            })
             .buffered(3)
             .try_collect()
```

The naive approach predictably fails:

<pre><span class="bold red">error[E0507]</span><span class="bold">: cannot move out of `cb`, a captured variable in an `FnMut` closure
  </span><span class="bold blue">--&gt; </span>src/main.rs:28:41
   <span class="bold blue">|
25 |    </span>        cb: &amp;mut dyn FnMut(String),
   <span class="bold blue">|            -- captured outer variable
...
28 |    </span>            .map(move |item| async move {
   <span class="bold blue">|  </span><span class="bold red">___________________</span><span class="bold blue">-</span><span class="bold red">______________________^
   </span><span class="bold blue">| </span><span class="bold red">| </span><span class="bold blue">__________________|
   | </span><span class="bold red">|</span><span class="bold blue">|
29 | </span><span class="bold red">|</span><span class="bold blue">| </span>                cb(item.clone());
   <span class="bold blue">| </span><span class="bold red">|</span><span class="bold blue">|                 -- move occurs because `cb` has type `&amp;mut dyn FnMut(String)`, which does not implement the `Copy` trait
30 | </span><span class="bold red">|</span><span class="bold blue">| </span>                self.update(item).await
<span class="bold blue">31 | </span><span class="bold red">|</span><span class="bold blue">| </span>            })
   <span class="bold blue">| </span><span class="bold red">|</span><span class="bold blue">|             </span><span class="bold red">^
   </span><span class="bold blue">| </span><span class="bold red">|</span><span class="bold blue">|_____________</span><span class="bold red">|
   </span><span class="bold blue">| </span><span class="bold red">|______________</span><span class="bold blue">captured by this `FnMut` closure
   |                </span><span class="bold red">move out of `cb` occurs here

</span><span class="bold">For more information about this error, try `rustc --explain E0507`.
</span></pre>


Unfortunately, the *non-naive* approaches also all fail here. There's just no way to do what we want to do here in Rust. The problem is that we're creating a bunch of futures, and in order to call the callback, Rust requires them to *each* have a reference to `cb` that is exclusive for the *entire* duration of the stream. 

Usually when you run into an intractable borrow problem in Rust, it means that either a) there's a bug in your code or b) you need a self-referential type, which requires unsafe code. (There are a number of libraries that aim to fill that gap, such as `owning_ref` and `ouroboros`, but [their soundness is rather dubious](https://github.com/noamtashma/owning-ref-unsoundness)). 

Here, on the other hand, we have a "type system false positive" of a different sort. Our callback is synchronous, and the `update_all` future can only ever poll a single child future at once, so the callback can only ever be called once at a time. What we need is a reference that is only exclusive *while the future is being polled*, but Rust provides no facility for this.

The usual approach to solve this in Rust is to just have a *single* exclusive (i.e. `&mut`) reference that we thread through the stream and pass into each future just while it is being polled (or pass around a `GhostCell` token if passing the data itself around is too cumbersome for some reason). Unfortunately, `Future` and `Stream` have fixed interfaces and there is no way to pass extra data through them.


### 2b

Given that there is no "proper" way to solve this in Rust, we just have to sigh and go with an imperfect solution. We can work around the issue by wrapping the callback in an unnecessary `RefCell`:


```diff
         items: Vec<String>,
         cb: &mut dyn FnMut(String),
     ) -> Result<Vec<String>, Error> {
+        let cb = RefCell::new(cb);
         stream::iter(items)
             .map(move |item| async move {
-                cb(item.clone());
+                cb.borrow_mut()(item.clone());
                 self.update(item).await
             })
             .buffered(3)
``` 

Since our `map` closure is `move`, we also need to store a (shared) reference in a local variable so it can be moved into the closure. Note that in this example, there's no particular reason for the closure to be `move`, but the real world code which inspired this post had other stuff going on which required it.

```diff
         cb: &mut dyn FnMut(String),
     ) -> Result<Vec<String>, Error> {
         let cb = RefCell::new(cb);
+        let cb = &cb;
         stream::iter(items)
             .map(move |item| async move {
                 cb.borrow_mut()(item.clone());
``` 

... and it works. Yay!

```
381ns About to update Item 0
10.431µs Updating Item 0
31.824µs About to update Item 1
36.807µs Updating Item 1
49.812µs About to update Item 2
54.461µs Updating Item 2
101.421368ms About to update Item 3
101.444199ms Updating Item 3
101.477413ms About to update Item 4
101.494382ms Updating Item 4
101.513491ms About to update Item 5
101.522133ms Updating Item 5
202.929102ms About to update Item 6
202.946752ms Updating Item 6
202.972324ms About to update Item 7
202.97918ms Updating Item 7
202.992133ms About to update Item 8
203.004573ms Updating Item 8
304.513564ms About to update Item 9
304.544859ms Updating Item 9

```

### 2c

Again, it should be noted that as much as I complain about having to add an unnecessary `RefCell` here, I think this is really a testament to Rust and how far it can be pushed. Rust makes it easy to track ownership and aliasing invariants through many layers of abstraction and across large codebases, to the point where people get upset in the rare cases where this *isn't* possible. Meanwhile, in other languages programmers slather the code with defensive copies and refcounts and gratuitous runtime checks for far less than this (and in the case of C++, almost certainly *still* get it wrong and have tons of mysterious crashes).


## Part 3: Making it optional

The previous code works, but it has the problem that *every* caller of `update_all` must now provide a callback. Let's try to make the callback parameter optional instead. 


```diff
     async fn update_all(
         &self,
         items: Vec<String>,
-        cb: &mut dyn FnMut(String),
+        cb: Option<&mut dyn FnMut(String)>,
     ) -> Result<Vec<String>, Error> {
         let cb = RefCell::new(cb);
         let cb = &cb;
``` 

```diff
     async fn do_all_the_things(&mut self) -> Result<(), Error> {
         let items = (0..10).into_iter().map(|i| format!("Item {}", i)).collect();
         let mut cb = |item| self.updates.notify(item);
-        self.foo.update_all(items, &mut cb).await?;
+        self.foo.update_all(items, Some(&mut cb)).await?;
         Ok(())
     }
 }
``` 

Now, how do we actually make this work inside `update_all`? The natural approach is to just use a default no-op callback if one isn't provided.


```diff
         items: Vec<String>,
         cb: Option<&mut dyn FnMut(String)>,
     ) -> Result<Vec<String>, Error> {
+        let cb = cb.unwrap_or(&mut |_| ());
         let cb = RefCell::new(cb);
         let cb = &cb;
         stream::iter(items)
``` 

Unfortunately, this doesn't work:

<pre><span class="bold red">error[E0716]</span><span class="bold">: temporary value dropped while borrowed
  </span><span class="bold blue">--&gt; </span>src/main.rs:27:36
   <span class="bold blue">|
27 | </span>        let cb = cb.unwrap_or(&amp;mut |_| ());
   <span class="bold blue">|                                    </span><span class="bold red">^^^^^^ </span><span class="bold blue">- temporary value is freed at the end of this statement
   |                                    </span><span class="bold red">|
   </span><span class="bold blue">|                                    </span><span class="bold red">creates a temporary which is freed while still in use
</span><span class="bold blue">28 | </span>        let cb = RefCell::new(cb);
   <span class="bold blue">|                               -- borrow later used here
   |
   = </span><span class="bold">note</span>: consider using a `let` binding to create a longer lived value

<span class="bold">For more information about this error, try `rustc --explain E0716`.
</span></pre>

I thought the problem might have to do with it being a closure, so I tried converting it to a regular function. 


```diff
         items: Vec<String>,
         cb: Option<&mut dyn FnMut(String)>,
     ) -> Result<Vec<String>, Error> {
+        fn default_cb(_: String) {}
+        let cb = cb.unwrap_or(&mut default_cb);
         let cb = RefCell::new(cb);
         let cb = &cb;
         stream::iter(items)
``` 

Surely taking a reference to a plain function would work. After all, functions are stateless and static - there's no way this could fail a borrow check...

<pre><span class="bold red">error[E0716]</span><span class="bold">: temporary value dropped while borrowed
  </span><span class="bold blue">--&gt; </span>src/main.rs:28:36
   <span class="bold blue">|
28 | </span>        let cb = cb.unwrap_or(&amp;mut default_cb);
   <span class="bold blue">|                                    </span><span class="bold red">^^^^^^^^^^ </span><span class="bold blue">- temporary value is freed at the end of this statement
   |                                    </span><span class="bold red">|
   </span><span class="bold blue">|                                    </span><span class="bold red">creates a temporary which is freed while still in use
</span><span class="bold blue">29 | </span>        let cb = RefCell::new(cb);
   <span class="bold blue">|                               -- borrow later used here
   |
   = </span><span class="bold">note</span>: consider using a `let` binding to create a longer lived value

<span class="bold">For more information about this error, try `rustc --explain E0716`.
</span></pre>


### 3b

To be honest, I'm still not sure why that didn't work. Fortunately, there's a plan B - we can just keep the `Option` inside the `RefCell` and check whether the callback exists in the inner loop every time we call it, which is probably the cleaner and more principled approach anyway.

It's hard to keep track of the billions of helper methods on `Option` and `Result`, but this is a pretty simple case. We just want to run some code on the contained value (i.e. callback) if present, and do nothing if not present, which is normally done via `Option::map`.


```diff
         let cb = &cb;
         stream::iter(items)
             .map(move |item| async move {
-                cb.borrow_mut()(item.clone());
+                cb.borrow_mut().map(|cb| cb(item.clone()));
                 self.update(item).await
             })
             .buffered(3)
``` 

Unfortunately, this results in the *second* broken error message I ran into.

<pre><span class="bold red">error[E0507]</span><span class="bold">: cannot move out of dereference of `RefMut&lt;'_, Option&lt;&amp;mut dyn FnMut(String)&gt;&gt;`
  </span><span class="bold blue">--&gt; </span>src/main.rs:31:17
   <span class="bold blue">|
31 | </span>                cb.borrow_mut().map(|cb| cb(item.clone()));
   <span class="bold blue">|                 </span><span class="bold red">^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ move occurs because value has type `Option&lt;&amp;mut dyn FnMut(String)&gt;`, which does not implement the `Copy` trait
   </span><span class="bold blue">|
</span><span class="bold cyan">help</span>: consider borrowing the `Option`'s content
   <span class="bold blue">|
31 | </span>                cb.borrow_mut().map(|cb| cb(item.clone()))<span class="green">.as_ref()</span>;
   <span class="bold blue">|                                                           </span><span class="green">+++++++++

</span><span class="bold">For more information about this error, try `rustc --explain E0507`.
</span></pre>


This error message is clearly nonsense, because our callback returns `()`, i.e. nothing, and there is no reason you would ever want to call `.as_ref()` on an optional *nothing* - there's no lifetimes contained in the result to dodge in the first place!

If we humor the Rust compiler anyway, it just repeats the same nonsense suggestion in an infinite loop:

<pre><span class="bold red">error[E0507]</span><span class="bold">: cannot move out of dereference of `RefMut&lt;'_, Option&lt;&amp;mut dyn FnMut(String)&gt;&gt;`
  </span><span class="bold blue">--&gt; </span>src/main.rs:31:17
   <span class="bold blue">|
31 | </span>                cb.borrow_mut().map(|cb| cb(item.clone())).as_ref();
   <span class="bold blue">|                 </span><span class="bold red">^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ move occurs because value has type `Option&lt;&amp;mut dyn FnMut(String)&gt;`, which does not implement the `Copy` trait
   </span><span class="bold blue">|
</span><span class="bold cyan">help</span>: consider borrowing the `Option`'s content
   <span class="bold blue">|
31 | </span>                cb.borrow_mut().map(|cb| cb(item.clone()))<span class="green">.as_ref()</span>.as_ref();
   <span class="bold blue">|                                                           </span><span class="green">+++++++++

</span><span class="bold">For more information about this error, try `rustc --explain E0507`.
</span></pre>


This error took quite a bit of trial and error, and some red herrings, to resolve. I noticed that `RefMut` (the type of the lock guard) has its own `map` method and thought it might be calling the wrong one, so I tried using [UFCS](https://web.mit.edu/rust-lang_v1.25/arch/amd64_ubuntu1404/share/doc/rust/html/book/first-edition/ufcs.html) to call `Option::map` explicitly, but that didn't work.

I ended up having to split the line up so that each call was a separate variable on a separate line, and then added explicit type annotations to each one (which also required constantly adding and removing imports to the top of the file) in order to narrow down the source of the error. In retrospect, my mistake was obvious, but I'm disappointed that the Rust compiler provided little assistance in discovering it.

The problem is that our refcell has type `RefCell<Option<T>>` (where `T` is `&mut dyn FnMut(String)`). This means that borrowing it results in a guard which derefs to `&mut Option<T>`. However, what we *want* is an `Option<&mut T>`, so that we can then unwrap it and call the contained callback. Therefore, the solution is to just add an `as_mut` call:


```diff
         let cb = &cb;
         stream::iter(items)
             .map(move |item| async move {
-                cb.borrow_mut().map(|cb| cb(item.clone()));
+                cb.borrow_mut().as_mut().map(|cb| cb(item.clone()));
                 self.update(item).await
             })
             .buffered(3)
``` 

## Conclusion

...and that's how what I expected to be a simple change ended up taking the better part of two days. Even as a long-time user of Rust, I still sometimes get frustrated by errors, and sometimes quite frustrated indeed. However, I think this also shows how far Rust has come, in that such cases are the exception rather than the norm, and I hope by highlighting these issues that it will continue to improve.

