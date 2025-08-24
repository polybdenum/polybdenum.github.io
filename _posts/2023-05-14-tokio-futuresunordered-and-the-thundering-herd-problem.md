---
layout: post
title: Tokio, FuturesUnordered, and the Thundering Herd Problem
date: 2023-05-14 19:08 -0700
---

I work on a team that runs a Rust service using Tokio in production. I've been coding Rust for many years, have written or rewritten most of our code, [have been burned]({% post_url 2022-07-24-fixing-the-next-thousand-deadlocks-why-buffered-streams-are-broken-and-how-to-make-them-safer %}) by many of the rough edges of async Rust, and have even written a presentation to introduce async Rust to new people, so I consider myself pretty knowledgeable about the topic. Nevertheless, I ran into a surprising async bug this week. Here is my story:

## Background

In the relevant part of the code, we have an `async` function, here called `process`, which we want to potentially run on multiple items concurrently. This is a very simplified version of our actual code, and all the names have been changed, but here's an example which demonstrates the basic structure of the problem:

```rust
type Request = u32;
struct Response;

async fn check_cache(req: Request) -> bool {false}
async fn prefetch_data(req: Request) {}
async fn perform_update(req: Request) {}

async fn process(req: Request) -> Response {
    println!("{:?} processing {}", time(), req);
    if check_cache(req).await {
        return Response;
    }

    prefetch_data(req).await;
    perform_update(req).await;
    Response
}
```

In our actual code, we're using a manual `FuturesUnordered` to run the futures so that we can dynamically add items based on external events, but for the sake of simplicity, we'll just use `StreamExt.buffer_unordered`, (which uses `FuturesUnordered` under the hood) with a fixed list of items in our example code to demonstrate the same issue. We can just create a list of items, put it into a stream, and run them concurrently:

```rust
#[tokio::main]
async fn main() {
    stream::iter((0..10)).map(|i| async move {
        process(i).await
    }).buffer_unordered(5).collect::<Vec<_>>().await;
}
```

This results in something like this:

```
420ns processing 0
13.545µs processing 1
18.035µs processing 2
21.564µs processing 3
25.035µs processing 4
29.47µs processing 5
35.005µs processing 6
39.047µs processing 7
42.92µs processing 8
46.921µs processing 9
```

Thanks to [a longstanding Rust compiler bug](https://github.com/rust-lang/rust/issues/102211), one of our dependencies is incorrectly inferred to be non-`Send`, and thus we unfortunately have to run everything in the top level task (using `runtime.block_on`) and we can't actually spawn the futures to run them in parallel. However, running everything within a single task is almost as good, since it still lets us execute different futures while they're blocked on external calls.


## The change

In order to future-proof the code (no pun intended), we recently decided to modify it to add support for running on multiple servers, and that meant integrating a distributed locking service. Our distributed locks have an API that looks somewhat like this:

```rust
struct DistributedLock;
impl DistributedLock {
    async fn release(self) {}
}

struct DistributedLockManager;
impl DistributedLockManager {
    async fn try_acquire_distributed_lock(&mut self, req: Request) -> Result<DistributedLock, Error> {
        tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
        Ok(DistributedLock)
    }
}
```

In order to acquire the locks, I wrote a helper method somewhat like this:

```rust
async fn try_lock(lock_manager: &RefCell<DistributedLockManager>, req: Request) -> Result<DistributedLock, Error> {
    println!("{:?} acquiring refcell {}", time(), req);
    let mut guard = lock_manager.try_borrow_mut()?;
    println!("{:?} acquired refcell {}", time(), req);
    let lock = guard.try_acquire_distributed_lock(req).await?;
    println!("{:?} acquired lock {}", time(), req);
    Ok(lock)
}

async fn acquire_lock(lock_manager: &RefCell<DistributedLockManager>, req: Request) -> DistributedLock {
    loop {
        if let Ok(lock) = try_lock(lock_manager, req).await {
            return lock;
        }

        println!("{:?} Failed to acquire lock {}, sleeping for 10 seconds", time(), req);
        tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;
    }
}
```

We can then modify `process` to acquire the locks before `perform_update` like this:

```rust
async fn process2(lock_manager: Rc<RefCell<DistributedLockManager>>, req: Request) -> Response {
    println!("{:?} processing {}", time(), req);
    if check_cache(req).await {
        return Response;
    }

    prefetch_data(req).await;
    let lock = acquire_lock(&lock_manager, req).await;
    perform_update(req).await;
    lock.release().await;
    Response
}
```

and call it like this:

```rust
#[tokio::main]
async fn main() {
    let lock_manager = Rc::new(RefCell::new(DistributedLockManager));
    let lock_manager = &lock_manager;
    stream::iter((0..10)).map(|i| async move {
        process2(lock_manager.clone(), i).await
    }).buffer_unordered(5).collect::<Vec<_>>().await;
}
```

## The problem

If we fail to acquire the distributed lock (because the other server is currently holding it), we just try again in 10 seconds in a loop until we successfully acquire it. However, that isn't the only way that `try_lock` can fail.

In order to share the `DistributedLockManager` between different futures, I passed it around as `Rc<RefCell<DistributedLockManager>>`. (Remember, `rustc` won't let us mark the futures as `Send` anyway, so we might as well use `Rc`s, although this isn't actually relevant to the problem I encountered - the same thing would have happened with `Arc<Mutex>`.) In order to call `try_lock` on the `lock_manager`, we first call `try_borrow_mut` on the `RefCell`, and fail if the RefCell is currently locked by another future.

Since we only hold the RefCell guard while calling `DistributedLockManager.try_acquire_distributed_lock()` (*not* while the `DistributedLock` itself is locked), and `try_acquire_distributed_lock()` is a fast operation, I didn't expect the service to ever actually run into this condition, or maybe only once in a blue moon, and retrying in 10 seconds in very rare cases didn't seem like a big deal.

Unfortunately, when my teammate tried manually running the code in order to test it prior to deployment, that isn't what he saw. He saw it *consistently* and *repeatedly* failing to acquire the RefCell. If we run the example code I posted above, the same thing happens:

```
438ns processing 0
11.35µs acquiring refcell 0
15.094µs acquired refcell 0
39.697µs processing 1
45.448µs acquiring refcell 1
50.752µs Failed to acquire lock 1, sleeping for 10 seconds
63.077µs processing 2
68.691µs acquiring refcell 2
71.925µs Failed to acquire lock 2, sleeping for 10 seconds
80.604µs processing 3
83.168µs acquiring refcell 3
87.124µs Failed to acquire lock 3, sleeping for 10 seconds
96.29µs processing 4
101.317µs acquiring refcell 4
105.712µs Failed to acquire lock 4, sleeping for 10 seconds
11.191669ms acquired lock 0
11.213052ms processing 5
11.216226ms acquiring refcell 5
11.219453ms acquired refcell 5
22.408349ms acquired lock 5
22.426989ms processing 6
22.430546ms acquiring refcell 6
22.432778ms acquired refcell 6
33.629489ms acquired lock 6
33.648115ms processing 7
33.651487ms acquiring refcell 7
33.653694ms acquired refcell 7
44.797188ms acquired lock 7
44.820335ms processing 8
44.82391ms acquiring refcell 8
44.827705ms acquired refcell 8
56.021801ms acquired lock 8
56.040478ms processing 9
56.043843ms acquiring refcell 9
56.046066ms acquired refcell 9
67.349157ms acquired lock 9
10.001591963s acquiring refcell 1
10.001607538s acquired refcell 1
10.001629928s acquiring refcell 2
10.001637161s Failed to acquire lock 2, sleeping for 10 seconds
10.001647381s acquiring refcell 3
10.001651111s Failed to acquire lock 3, sleeping for 10 seconds
10.001664599s acquiring refcell 4
10.001668651s Failed to acquire lock 4, sleeping for 10 seconds
10.012839752s acquired lock 1
20.003216329s acquiring refcell 2
20.003236367s acquired refcell 2
20.003268547s acquiring refcell 3
20.003278317s Failed to acquire lock 3, sleeping for 10 seconds
20.003299867s acquiring refcell 4
20.003305762s Failed to acquire lock 4, sleeping for 10 seconds
20.014485667s acquired lock 2
30.00398334s acquiring refcell 3
30.004018711s acquired refcell 3
30.004079751s acquiring refcell 4
30.004101231s Failed to acquire lock 4, sleeping for 10 seconds
30.015406338s acquired lock 3
40.004784703s acquiring refcell 4
40.004800233s acquired refcell 4
40.016003298s acquired lock 4
```

## What happened?

My reasoning *would* have been correct *if the futures were spawned* in separate tasks (yes Clippy, holding a guard across await is a legitimate use-case, even the Tokio docs say so, so please shut up). What I didn't count on is that the nature of having multiple futures in the same task makes *any* await, even a fast one, problematic.

Here is our `process2` code again:

```rust
async fn process2(lock_manager: Rc<RefCell<DistributedLockManager>>, req: Request) -> Response {
    println!("{:?} processing {}", time(), req);
    if check_cache(req).await {
        return Response;
    }

    prefetch_data(req).await;
    let lock = acquire_lock(&lock_manager, req).await;
    perform_update(req).await;
    lock.release().await;
    Response
}
```

Under normal circumstances, we would almost never get to the `acquire_lock` step in the first place, because `check_cache` will nearly always return true. Additionally, the `check_cache` step would block on network calls for a semi-random amount of time, so multiple futures would not reach the main body at the same time. However, while testing the code, my teammate ran with the `check_cache` step disabled. Furthermore, the `prefetch_data` step caches data on disk (using *synchronous* file operations due to API limitations) and only `await`s if the data is not already present.

Since nothing in the function actually blocked on external operations, this meant that when executing the future, it would *immediately* go straight to the `acquire_lock` step without any intermediate `await`s. Then it would lock the `RefCell` and call `try_acquire_distributed_lock`. Since the distributed locking system *wasn't* mocked out, this actually *did* block. Although the distributed locking operation is fast, it isn't instant, and that gave `FuturesUnordered` the opportunity to try polling the *other* futures it was managing *while the RefCell was still locked*.

When the *second* future is polled, it again immediately goes to the `acquire_lock` step, but this time, it fails to lock the `RefCell` because the `RefCell` is still being held by the first future, so it sleeps for 10 seconds before trying again. This then happens to *every* other future in the `FuturesUnordered` pool as well. No matter how many futures are in the pool only the first one will actually run successfully. Even worse, the failed futures all sleep for exactly 10 seconds, so when they wake up, *the same thing happens again*.

Here is the output from our example program again:

```
438ns processing 0
11.35µs acquiring refcell 0
15.094µs acquired refcell 0
39.697µs processing 1
45.448µs acquiring refcell 1
50.752µs Failed to acquire lock 1, sleeping for 10 seconds
63.077µs processing 2
68.691µs acquiring refcell 2
71.925µs Failed to acquire lock 2, sleeping for 10 seconds
80.604µs processing 3
83.168µs acquiring refcell 3
87.124µs Failed to acquire lock 3, sleeping for 10 seconds
96.29µs processing 4
101.317µs acquiring refcell 4
105.712µs Failed to acquire lock 4, sleeping for 10 seconds
11.191669ms acquired lock 0
11.213052ms processing 5
11.216226ms acquiring refcell 5
11.219453ms acquired refcell 5
22.408349ms acquired lock 5
22.426989ms processing 6
22.430546ms acquiring refcell 6
22.432778ms acquired refcell 6
33.629489ms acquired lock 6
33.648115ms processing 7
33.651487ms acquiring refcell 7
33.653694ms acquired refcell 7
44.797188ms acquired lock 7
44.820335ms processing 8
44.82391ms acquiring refcell 8
44.827705ms acquired refcell 8
56.021801ms acquired lock 8
56.040478ms processing 9
56.043843ms acquiring refcell 9
56.046066ms acquired refcell 9
67.349157ms acquired lock 9
10.001591963s acquiring refcell 1
10.001607538s acquired refcell 1
10.001629928s acquiring refcell 2
10.001637161s Failed to acquire lock 2, sleeping for 10 seconds
10.001647381s acquiring refcell 3
10.001651111s Failed to acquire lock 3, sleeping for 10 seconds
10.001664599s acquiring refcell 4
10.001668651s Failed to acquire lock 4, sleeping for 10 seconds
10.012839752s acquired lock 1
20.003216329s acquiring refcell 2
20.003236367s acquired refcell 2
20.003268547s acquiring refcell 3
20.003278317s Failed to acquire lock 3, sleeping for 10 seconds
20.003299867s acquiring refcell 4
20.003305762s Failed to acquire lock 4, sleeping for 10 seconds
20.014485667s acquired lock 2
30.00398334s acquiring refcell 3
30.004018711s acquired refcell 3
30.004079751s acquiring refcell 4
30.004101231s Failed to acquire lock 4, sleeping for 10 seconds
30.015406338s acquired lock 3
40.004784703s acquiring refcell 4
40.004800233s acquired refcell 4
40.016003298s acquired lock 4
```

Since we called `buffered_unordered(5)`, there are five futures in the `FuturesUnordered` pool. Notice that the first future (`0`) successfully runs, but the other four `1-4` all fail to acquire the lock and start sleeping. Then 10 seconds later, futures `1-4` wake up, future `1` successfully acquires the lock, and `2-4` all fail and start sleeping again. Then the next time, future `2` succeeds while `3` and `4` fail again, etc. It takes a total of five iterations before all the futures manage to run successfully.

In this toy example, it still doesn't take that long to complete, and it is obvious from the logs that the number of failures is decreasing after each iteration. However, in our actual test code, we were running with *32* futures in the pool, and the sleep time increases after each failure, meaning that it would have taken effectively forever for everything to get unstuck.

## The solution

So what's the solution? One obvious tactic is to *randomize* the amount of time each future sleeps. This is useful in some cases, and would have prevented the *repeated* failures, but it doesn't stop all the futures from failing the *first* time.

Additionally, **this problem is not specific to RefCell**. We were using `Rc<RefCell>` because the compiler thought the code was not-`Send` anyway, so there was no reason not to. However, *the exact same thing* would have happened using `std::sync::Mutex`. Or rather, the same thing would have happened if you use `Mutex.try_lock`. If you use regular `Mutex.lock`, then instead of the pointless thrashing we got, you would instead get an outright **deadlock**.

The correct solution is to use [Tokio's Mutex type](https://docs.rs/tokio/latest/tokio/sync/struct.Mutex.html), which has an *async* `lock()` method designed specifically for situations like this. Fortunately, it's an easy fix, but the fact that this could happen at all was an unpleasant surprise.

## Conclusion

Unlike most languages with `async`, Rust does not automatically spawn futures into separate tasks. Spawning everything vastly reduces the potential for bugs, but it comes at the cost of performance and flexibility, so Rust doesn't do it by default. In our case, our code wouldn't have even been possible at all without the ability to run non-spawned futures, since rustc incorrectly thinks the code is not `Send`. 

While this ability is invaluable, [it is also *extremely* error-prone]({% post_url 2022-07-24-fixing-the-next-thousand-deadlocks-why-buffered-streams-are-broken-and-how-to-make-them-safer %}). Even when you think you're being careful, you're not being careful enough. Fortunately, in this case, the bug was ultimately harmless and easily fixed, but it was still a great lesson in how unintuitive async Rust can be. Hopefully now that you've read this, you'll be able to prevent such issues *before* you have to learn this lesson the hard way.
