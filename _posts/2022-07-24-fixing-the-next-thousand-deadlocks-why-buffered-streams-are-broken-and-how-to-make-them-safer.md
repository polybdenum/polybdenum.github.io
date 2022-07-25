---
layout: post
title: 'Fixing the Next Thousand Deadlocks: Why Buffered Streams Are Broken and How
  To Make Them Safer'
date: 2022-07-24 16:52 -0700
---

I am fortunate enough to work on a production Rust service (a real one, not cryptocurrency nonsense). Rust virtually eliminates the kinds of stupid bugs and gotchas that are endemic in other languages, making it much easier to develop and maintain our project. Unfortunately, Rust is substantially less capable when it comes to preventing the common issues involved in async programming. In fact, async programming is substantially *harder* to get right in Rust than in something like Javascript, due to the decision to make task spawning explicit for performance reasons.

Last month, our service was brought down for days by a nasty deadlock bug, and this isn't the first deadlock we've seen - it's at least the fourth. And just last week, we saw yet another deadlock-induced outage. Fortunately, four of the five deadlocks (including the most recent two) have the same root cause - **`futures::stream::Buffered` is inherently prone to deadlocks**. In this post, I will explain the issue and explore ways to prevent this from happening again. The transition won't be easy, but I think it will pay off for the ecosystem in the long run.

## Why do these deadlocks keep happening?

Here is a recipe for deadlock:

1. Have two futures, A and B, where A cannot make progress until B does. The exact reason for the dependence here doesn't matter - perhaps B is holding a shared semaphore, or they're sending to each other over a shared channel.
2. Poll A and never poll B.

Part 1 is nearly impossible to avoid. No matter how careful you are, any sufficiently complex codebase will end up having unforseen dependencies between futures sooner or later. Part 2 on the other hand, is an issue unique to Rust. In a high level language like Javascript, futures are spawned automatically, meaning that they will execute even if you don't poll them. This means that you'll never get into the situation where your code is blocked on a future that isn't running due to not being polled. 

Of course, Rust does this for a good reason. It is part of the "only pay for what you use" zero-cost abstraction philosophy and is also required in order to avoid enshrining a particular async executor design into the language. However, it does mean that async code in Rust does not follow the intuitive mental model where futures just execute in the background. Therefore, we need to carefully design APIs in order to avoid the resulting bugs.

Fortunately, this is already mostly the case in Rust. Most async-related APIs already poll all their constituent futures when polled, which means that you can just program like you normally would and ignore the fact that the futures aren't *actually* scheduled independently in the executor. There is one very common exception however, and that is `stream::Buffered` (and its cousins `stream::BufferUnordered`, `stream::TryBuffered`, and `stream::TryBufferUnordered` - I'm treating all four as a single API for the purpose of this post, since the issues involved are the same). 

**Update**: At first, I thought the issue was just `Buffered`, but in the process of writing up this post, I realized that `stream::Zip` can potentially suffer from similar issues, and there are likely other similarly afflicted APIs. `Buffered` and its ilk seem to be the most common source of problems in practice, but any comprehensive solution would have to audit the other APIs and make similar changes where applicable.


## How do buffered streams currently work?

Here is a psuedocode version of [the Buffered implementation](https://github.com/rust-lang/futures-rs/blob/183f8c61371d4c3891683ca51c72e579891bfa79/futures-util/src/stream/stream/buffered.rs):

```rust
struct Buffered {
  wrapped_stream: impl Stream,
  in_progress_queue: FuturesOrdered,
  max_buffer_size: usize,
}
impl Buffered {
  fn poll_next(&mut self) -> Poll<Option<Item>> {
    while self.in_progress_queue.len() < max_buffer_size {
      if let Ready(Some(fut)) = self.wrapped_stream.poll_next() {
        self.in_progress_queue.push(fut);
      } else {
        break;
      }
    }

    match self.in_progress_queue.poll_next() {
      Pending => Pending,
      Ready(Some(val)) => Ready(Some(val)),
      Ready(None) => {
        // if we get here, in_progress_queue is empty. check if wrapped_stream has anything left
        if self.wrapped_stream.is_done() {
          Ready(None)
        } else {
          Pending 
        }
      }
    }
  }
}
```

Basically, `Buffered` is a stream implementation that wraps another stream (here called `wrapped_stream`) and buffers up to `max_buffer_size` futures into a queue where they are executed concurrently. 

When `Buffered` is polled, it first checks whether the `in_progress_queue` is less than `max_buffer_size` and takes new futures from the wrapped stream and adds them into the progress queue as long as a) `in_progress_queue` is less than the maximum size and b) the wrapped stream has futures ready to be added.

Once `in_progress_queue` is at its maximum size (or `wrapped_stream` has no new items ready), it just polls `in_progress_queue` and returns the next item from the queue if it is ready. 


At first glance, this seems like a reasonable implementation. However, it has a crucial flaw: **as long as `in_progress_queue` is full, `wrapped_stream` will never be polled**. This means that if you have futures `A` and `B` from the previous section where `A` depends on `B` and `A` is in `in_progress_queue` while `B` is contained within `wrapped_stream`, the stream will immediately deadlock.

Now that we know the problem, how do we fix it?

## JuSt Be CaReFuL

If there's one lesson from decades of software engineering, it is the failure of "just be careful" as a strategy. C/C++ programmers still experience memory corruption constantly, no matter how careful they are. Java programmers still frequently see `NullPointerException`s, no matter how careful they are. And so on. One of the reasons that Rust is so successful is that it adds automated checks to prevent many common mistakes. 

As shown by the fact that we keep seeing new deadlock bugs, despite our best efforts to avoid them, "just be careful" is not a strategy that can avoid this kind of bug in nontrivial codebases. We need some way to statically eliminate the issue. 

## Making the world safe for unspawned futures

Before we get into the details of the proposal, I want to be clear about what is and isn't the goal here. **The goal of this proposal is to eliminate deadlocks that arise from the unspawned nature of Rust futures** - i.e. where the equivalent code would not deadlock if all futures were magically spawned. 

Eliminating *all* deadlocks is out of scope for this proposal. After all, there's nothing stopping programmers from say, acquiring two locks in an inconsistent order, or re-entrantly trying to acquire a lock, etc. You don't even need futures to cause a deadlock, let alone buffered streams. Preventing *all* deadlocks would require a language that is extremely limited in what it can do or that requires programmers to write Coq-like proofs all the time, and that does not seem to be practical for the foreseeable future.

Additionally, *real-time guarantees* are also out of scope. [Deadlocks aren't the only thing that can go wrong in asynchronous code](https://github.com/rust-lang/futures-rs/issues/2387). If you have a future that holds on to a database connection, and then it takes a long time before the future is polled again, the connection will time out, leading to an error. Unfortunately, there is no way to completely avoid this. After all, no matter how the libraries are designed, you can always write an async function that just takes a long time between awaits, thus causing other pending futures to time out. For that matter, you can't even make real-time gauarantees for single thread synchronous code, because it can always be preempted by the OS for arbitrary long. There's no 100% solution here, but running database code inside `spawn_blocking()` with a seperate executor would probably avoid most of the timeout issues here.



That being said, I think even this limited goal would be extraordinarily beneficial to the Rust ecosystem. Designing async libraries so that programmers don't have to think about the implementation details of the executor and can just use a simplified mental model based on higher level languages would make the language more approachable and relieve a great mental burden while writing async Rust. And empirically, this particular issue with buffered streams is the cause of the vast majority of outages in our experience.

## Towards a better future(s::stream::Buffered)

Unfortunately, there is no quick fix that can be slapped on without breaking backwards compatibility. Instead, my proposal is to replace the existing API with several new APIs that statically protect against deadlocks. This will involve a significant deprecation period and effort by users to migrate to the new APIs, but as they say, the journey of a thousand miles begins with a single step, and it will pay off in the long run.

In order to fix `Buffered`, we need to rule out the situation where you have two futures and only one of them is being polled. There are two main ways to do this, each with its pros and cons that make sense in certain situations and not others. Therefore, I propose adding both.

## Every day I'm pollin'

The first approach is rarely useful, but it is a lot simpler, so I'll cover it first. If the problem is that we might have futures hidden within `wrapped_stream` while we're not polling it, why not just *always poll `wrapped_stream`?*

More specifically, we don't *always* have to poll it. We just have to ensure that we poll `wrapped_stream` whenever `in_progress_queue` returns `Pending`, even if it is already at our `max_buffer_size`.

This approach has the advantage that it is incredibly simple to implement. It could be added to the `futures` library with just a couple lines of code without even changing any of the APIs. Unfortunately, it is only rarely the appropriate solution for users. In the common case where `wrapped_stream` is actually synchronous where `poll_next` never blocks (for example, if it came from a `stream::iter(...).map(...)` construction), this solution devolves into just an unbounded queue that eagerly evaluates the underlying stream. And that can cause problems such as running out of memory.

## If you buffered it, then you should have put a spawn() on it

If we can't just poll `wrapped_stream` all the time, the other way to eliminate the problem is to *change the type signature of `Buffered`* to prevent the wrapped stream from containing (non-ignorable) futures in the first place, so it doesn't matter if it never gets polled. 

Luckily, we don't have to prevent the stream from containing *all* futures. Some futures are ok to ignore, because they'll execute in the background even if not polled. In the case of `tokio`, this is done via the `task::spawn` call, which returns a `JoinHandle`. So if you have a `JoinHandle`, you know that it is safe to not poll it. Therefore, we just need to change the type signature of `Buffered` somehow to rule out streams which contain futures *that aren't `JoinHandle`s*.

Unfortunately, the `futures` library needs to be executor agnostic and every executor has slightly different ways of doing things. So the first step is to introduce a marker trait, which we'll call `SpawnedFuture` for the sake of argument, and then wait for all the executor libraries to implement that trait for their `JoinHandle` equivalents. 

With that out of the way, how do we actually fix the type signatures? In order to do this, we'll first have to be clear on what it means for a stream to "contain" a non-ignorable future in the first place. 

## Know your enemy: Item vs poll_next

Typically, if asked what a stream contains, you would think of the *values* the stream yields, i.e. `Stream::Item`. However, this is not what we are concerned about here, or at least not the only thing.

First off, a stream will typically not actually *contain* the values it yields. Normally the values are produced on the fly when the stream is polled! There are some cases where the stream could be considered to contain futures that it yields. For example, if you have a `Vec` of existing futures and you call `stream::iter` on it, the resulting stream will yield futures that *already* exist *before* `poll_next` is called. 

On the other hand, a more typical situation is that you call `stream::iter(vals).map(|v| async move {whatever})`, where `vals` is some iterator of plain non-future data, and the `map` callback constructs futures on the fly. In this case, there are no concerns with deadlocks because the futures don't exist until the stream is polled, and hence there is no way to be blocked on them. (Or if you do somehow get blocked on a non-existent future, your code would deadlock even in the JS everything-auto-spawned world as well, and is thus out of scope of this proposal as described previously.)

The other issue is that a stream may contain futures that are *not* part of the items it yields! In a simple case like `stream::iter`, the `poll_next` method will just always complete and return a value immediately. However, `poll_next` is asynchronous, and hence can depend on futures under the hood. You could have a stream where `Item=u8` or something perfectly innocous like that, and yet it still contains futures. The most obvious example of this is `Buffered` itself, but it could also happen if you have a custom `Stream` implementation (which is what led to last month's deadlock in our case).

Therefore, there are two different axis we have to worry about: 
1. Does the stream contain unspawned futures internally (such as to implement `poll_next`)?
2. Does it *yield* unspawned futures that pre-date the call to `poll_next`?

## Let the right stream in

So how do we statically determine whether a stream is safe to buffer or not? Unfortunately, there's no really good solution, as far as I know (suggestions are welcome). However, here is *a* possibility, which works at the cost of being overly conservative and ruling out some common code patterns.
async {
* Introduce a marker trait, perhaps called `SpawnedPollStream` for streams *whose `poll_next` implementation* does not depend on any non-spawned futures. Note that this trait places no requirements on the *items* yielded by the stream, even when those items are futures.
* `Iter` can implement `SpawnedPollStream` unconditionally. Most other stream combinators (such as `Fuse`) will implement it if the underlying stream does. 
* Change `Buffered` to require that the wrapped stream implement `SpawnedPollStream` *and* that its `Item` type implement `SpawnedFuture` as well.
* `Buffered` can also implement `SpawnedPollStream` unconditionally, but only because we're changing it to always be safe. The *current* version of `Buffered` would *not* be able to implement `SpawnedPollStream`!
* Change `Zip` to require that the underlying streams implement `SpawnedPollStream` as well. (No restrictions on `Item` are necessary in this case.)

## You only buffer once

The above scheme prevents deadlocks, but it is also highly conservative. In particular, it requires *any* futures that end up in a stream which is eventually buffered (or zipped) to be spawned. However, as mentioned previously, this is not actually necessary in the common case where 1) the futures are created on the fly and 2) the stream is only buffered/zipped/etc. once.

If you have something like `stream::iter(non_async_thing).map(|v| async {whatever}).buffered(42)`, that is perfectly safe as long as `whatever` is not sneaking in any pre-existing futures under the hood and as long as the stream is not buffered *a second time*. This is how streams are most commonly used in practice, so it would be nice if we could support it without modification somehow.

Unfortunately, supporting this case seems to be impossible. The problem is that `Map` only sees a `FnMut(T) -> impl Future`. There's no way to distinguish from the types alone between something safe like an ordinary inline `async` block and an evil function which is sneaking in futures from elsewhere.

In fact, it can't even be determined *syntactically* either. Even if you see innocuous looking code like `.map(|v| async move {foo(v).await})`, there's no way to know without checking the implementation of `foo` whether `foo` itself is smuggling in futures. Therefore, this problem seems intractable, although I am open to suggestions.


One possibility is to have an escape hatch where programmers can manually assert that their functions are well-behaved async blocks (on the pain of possible deadlocks if they get it wrong). For example, we could have some wrapper type, say `NewlyCreatedFuture<F: Future>(F)` where users are expected to (but not enforced to) only wrap around futures which were created on the fly. Then we could have `Buffered` accept streams where `Item = NewlyCreatedFuture` as well, but have the resulting buffered stream `!SpawnedPollStream` to prevent it from being buffered a second time. Under this system, most code can be used unmodified by just adding a `.map(NewlyCreatedFuture)` before the `.buffered()` for cases where programmers are confident that their functions are not vulnerable to deadlocks.


## Conclusion

Making these changes won't be easy, but that doesn't mean they shouldn't be done. Before Rust came along, achieving both memory safety and C++ levels of performance in a practical, easy-to-use language seemed impossible. And this change doesn't even require a new language! It's just a matter of redesigning a commonly used library to be less error-prone. Hopefully someday, deadlocks too will be an almost-unheard of class of bug. Even if this proposal isn't suitable for implementation as is, I hope this starts a conversation so we can find better ways to address the problem.

