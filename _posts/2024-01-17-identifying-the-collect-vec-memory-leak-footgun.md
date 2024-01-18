---
layout: post
title: Identifying Rust's collect::<Vec<_>>() memory leak footgun
date: 2024-01-17 07:57 -0800
---

Over the weekend, I was working on a personal Rust project when I ran into an excessive memory usage problem. After an evening of trial and error, I found a workaround to fix the memory usage, but I still didn't understand how the issue was even possible, so I then spent another evening digging through the source code of the Rust standard library to understand the root cause. 

This is the story of how I identified the bug. (TLDR: `collect::<Vec<_>>()` will sometimes reuse allocations, resulting in `Vec`s with large excess capacity, even when the length is exactly known in advance, so you need to call `shrink_to_fit` if you want to free the extra memory.)


# Background

The project I'm working on involves building a sparse weighted graph and then doing various calculations on the graph. I finally finished the initial version of the code Monday afternoon and tried running it, only for it to exhaust my computer's 32gb of RAM before getting anywhere. Specifically, the final graph was supposed to have around three million nodes, but during graph construction, the process memory already shot up to over 18gb by the time it reached 300k nodes, and it would use up the entire RAM soon afterwards, slowing everything to a crawl and forcing me to kill the process.

At first, I assumed that the computations I was trying to do were just too big and my project was impossible, but I didn't give up just yet, and spent the rest of the evening trying to figure out which parts were using so much memory and whether there was any way to optimize them.

# Narrowing down the memory leak

There were several places in the code where I used [memoization](https://en.wikipedia.org/wiki/Memoization), so I initially suspected those of being the cause of the exploding memory usage. I modified the graph construction function to stop after 300k nodes (when memory usage reached 18gb as seen via `top`, large but not quite enough to kill the computer), and added `println!`s to log the estimated total sizes of the memoized results. However, they were only in the 100mb range, nowhere near enough to explain the observed memory usage.

Next I tried running graph construction *twice* (but with it set to stop early at 300k nodes each time) to try to narrow down the cause. My main function looked like this (with `denom` and `optimistic` being parameters for the algorithm).

```rust
let denom = 257;
let optimistic = false;
let graph = build_graph(denom, optimistic);
let graph = build_graph(denom, optimistic);
```

I carefully watched the process memory usage while this ran, to see if it would stop at 18gb or not. I thought that perhaps the memoization was using a lot more memory than expected due to memory fragmentation exploding the heap. 

Since the code is deterministic, calling `build_graph` twice won't result in any new results being memoized, and thus memory usage should stop at 18gb, even when it is run twice. Instead, memory usage continued to rapidly increase during the second `build_graph` call, which made no sense.

Fortunately, I then tried dropping `graph` in between:


```rust
let graph = build_graph(denom, optimistic);
std::mem::drop(graph);
let graph = build_graph(denom, optimistic);
```

Suddenly, this time process memory usage dropped from 18gb to ~500mb after the first `build_graph` call, before going back up to 18gb. Clearly, the memory was somehow being wasted by `graph` itself. As before, I tried printing out the size of the graph, but it was nowhere near enough to explain the memory usage.

However, my `graph` data structure consists of `Vec`s, and Vec can use more memory than the size would indicate since they preallocate a buffer with up to 2x capacity in order to make insertion amortized O(1) time. I changed it to log the total *capacity* rather than *length* and suddenly the estimated size of the graph was 18gb. Bingo! I added `shrink_to_fit()` calls (which remove the excess capacity) into the graph construction code and suddenly the memory problems disappeared.

# Wait, but why?

I'd finally identified the `shrink_to_fit` workaround late Monday night and planned to continue work on the project the following weekend. I mentioned my experience to my coworkers at work the following morning, as a PSA about the importance of `shrink_to_fit`, but they didn't believe me, and when I thought about it more, I couldn't believe it myself either.

First off, `Vec` only grows the buffer by 2x at a time, which means that (ignoring the initial allocation for small vecs), the capacity will always be at most double the length (assuming you don't remove elements), so the memory waste from excess capacity should always be at most 2x, but I was seeing over 200x.

Second, the memory leak was coming from the edge lists of the graph, which I was storing as `Vec<Vec<(u32, u32)>>` (a table with one `Vec` storing the edge list for each node). When I called `shrink_to_fit` on the edge lists before inserting them, the memory problem disappeared. However, the final step for producing the edge lists was a `vec.into_iter().map(..).collect()` call to convert them to the appropriate format. Since `collect` allocates a fresh vector and the length is exactly known, it only allocates exactly enough space for the elements and there should never be *any* excess capacity at all, let alone 200x excess capacity.

# The Vec source code

Clearly, my assumptions about the implementation of `Vec` were incorrect somehow, and so out of curiosity, after work Tuesday evening, I dug into the `Vec` source code to try to figure out what was going on. There are several layers of indirection and specialization, but it didn't take long to trace through all the relevant code (or so I thought).

When you call `collect()`, it calls `FromIterator::from_iter`. [`Vec`'s `FromIterator` impl](https://github.com/rust-lang/rust/blob/c58a5da7d48ff3887afe4c618dc04defdee3dab5/library/alloc/src/vec/mod.rs#L2791) in turn calls `SpecFromIter`, an internal trait.

[`SpecFromIter`](https://github.com/rust-lang/rust/blob/c58a5da7d48ff3887afe4c618dc04defdee3dab5/library/alloc/src/vec/spec_from_iter.rs) has a specialization for `IntoIter` (i.e. if you call `vec.into_iter().collect()` with no intervening iterator adapters, it will just return the original vec instead of creating a new one). Otherwise, it calls a second internal trait, `SpecFromIterNested`.

[`SpecFromIterNested`](https://github.com/rust-lang/rust/blob/c58a5da7d48ff3887afe4c618dc04defdee3dab5/library/alloc/src/vec/spec_from_iter_nested.rs) in turn has two implementations, one for general iterators and one for `TrustedLen` iterators (the relevant case here). However, the implementations are pretty much what you would expect. It just reserves a capacity equal to the iterator's `size_hint`, with no sign of anything that could result in excess capacity.

I also checked the Vec allocation code and confirmed that it only grows the buffer by 2x each time.

# Logging before and after

Having reached a dead end in the source code, I tried adding logging to my code (and commenting out the `shrink_to_fit` again) to see how bad the problem was. I logged the length and capacity of the edge lists before and after the final `into_iter().map().collect()` step, as well as a cumulative total of the length and capacity. (`get_cull_all` here is the function that calculates the edge lists, while `main_edges` is the final list of edge lists.)

```rust
let res = get_cull_all(ds, max_denom as u128, optimistic);
println!("precol {} {}", res.len(), res.capacity());

let mut res: Vec<_> = res
    .into_iter()
    .map(|(ds2, p)| (cull_map.get(ds2), p as u32))
    .collect();

main_len_tot += res.len();
main_cap_tot += res.capacity();
println!("{} {} tot {} {}", res.len(), res.capacity(), main_len_tot, main_cap_tot);
// res.shrink_to_fit();
assert!(main_edges.len() == id);
main_edges.push(res);
```

This produced output like

```
precol 46 11400
46 34200 tot 10410429 2330729253
precol 54 11340
54 34020 tot 10410483 2330763273
precol 2 5520
2 16560 tot 10410485 2330779833
```

The cumulative wasted space up to 300k nodes was 2330779833/10410485 or over **223x** wasted space. This also confirmed that the edge lists had significant excess capacity following the `collect()` calls. In fact, the capacity of the new vec produced by `collect()` was always exactly three times the capacity of the original vec, regardless of length. 




# Playground

Having confirmed that `collect()` was somehow producing vecs with excess capacity despite this seemingly being impossible per the source code, I next tried to reproduce the issue on the Rust playground. I wasn't able to reproduce the 3x increases that I experienced in my code, but I did notice something interesting.

```rust
let mut v = vec![1,2,3];
v.push(4);
println!("len {} cap {}", v.len(), v.capacity());
let v = v.into_iter().map(|x| x+1).collect::<Vec<_>>();
println!("len {} cap {}", v.len(), v.capacity());
let v = v.iter().copied().map(|x| x+1).collect::<Vec<_>>();
println!("len {} cap {}", v.len(), v.capacity());    
```

[Running this](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=547a67d6857b726120f73e03efd703ed) prints out

```
len 4 cap 6
len 4 cap 6
len 4 cap 4
```

So the vecs do have excess capacity here, even on the playground, although only a little bit. Furthermore, the excess capacity goes away if you use `iter().copied()` instead of `into_iter()`. Unfortunately, that part sidetracked me for a while, because I thought the `IntoIter` specialization of `SpecFromIter` might be related. It *shouldn't* be, because the iterator here is `Map<IntoIter>` rather than `IntoIter` itself, but I couldn't see anything else related and spent a long time staring at the source code, willing an answer to materialize.


Since the original issue didn't show up on the playground, I thought it might be version-specific. In my own code, I was using the nightly compiler so I could use `Vec::is_sorted`, but fortunately, I was just using that for a couple asserts, so after commenting those out, I was able to switch to the beta compiler (1.76), where the exact same behavior occurred. As for stable, I was unable to try stable (1.74) because of compiler errors due to an unrelated issue with `impl Trait`. (As it turned out, the issue is only present in beta and not stable, so this was an unfortunate miss.) I also confirmed that the issue reproduced in non-release builds, so it wasn't optimization related.

# Vec type changes

I continued attempting to narrow down and reproduce my issue on the playground. After some more trial and error, I discovered that mapping a vec to a *smaller* type resulted in excess capacity, even on the playground, but *only* on beta and nightly, not stable.

```rust
let mut v = vec![1,2,3,4];
v.push(1u128);
println!("len {} cap {} v={:?}", v.len(), v.capacity(), v);
let v = v.into_iter().map(|x| x as u64).collect::<Vec<_>>();
println!("len {} cap {} v={:?}", v.len(), v.capacity(), v);
let v = v.into_iter().map(|x| x as u32).collect::<Vec<_>>();
println!("len {} cap {} v={:?}", v.len(), v.capacity(), v);  
let v = v.into_iter().map(|x| x as u8).collect::<Vec<_>>();
println!("len {} cap {} v={:?}", v.len(), v.capacity(), v);  
let v = v.into_iter().map(|x| x as u16).collect::<Vec<_>>();
println!("len {} cap {} v={:?}", v.len(), v.capacity(), v);     
```

```
len 5 cap 8 v=[1, 2, 3, 4, 1]
len 5 cap 16 v=[1, 2, 3, 4, 1]
len 5 cap 32 v=[1, 2, 3, 4, 1]
len 5 cap 128 v=[1, 2, 3, 4, 1]
len 5 cap 5 v=[1, 2, 3, 4, 1]
```

Furthermore, the capacity increased proportionately to the type size reduction. In this example, going from `u128` to `u64` to `u32`, etc. doubles the capacity each time. On the other hand, *increasing* the type size as in the last example (`u8` -> `u16`) immediately removes the excess capacity.


# Allocation reuse

Since the capacity was increasing in proportion to the decrease in element size, that implied that the size of the backing array for the new vec was suspiciously the same as that of the old vec. I hypothesized that it was somehow reusing the memory from the old vec as an optimization. This also explains why it only happens with `into_iter()` and why using `iter().copied()` eliminates the excess capacity. When using `iter()`, the old vec isn't dropped, and so its memory can't be reused. In my code, the last step prior to insertion maps the edge lists from `(u64, u128)` to `(u32, u32)`, which is a third the size, hence why the capacity always increased by 3x after the conversion. 

The other thing this implied is that while `collect()` was tripling the capacity of the vec, the actual memory use was unchanged, which meant that `collect()` alone wasn't the cause of the memory leak. Rather, it was merely *failing to decrease* the existing memory usage. In order to understand how this could have exploded the process memory usage, a bit of explanation of my code is in order.

My edge list calculation logic internally uses `u128` for increased precision before truncating the weights to `u32` at the end. Furthermore, in some cases, it generates a list of potential edges and then filters out most of them prior to returning, which leads to a large amount of excess capacity. As an extreme example, the last iteration in the log output shown above had a length of 2 but a capacity of 5520.

Ordinarily, that wouldn't have been a problem, since the `into_iter().map().collect()` line used to pack them into `(u32, u32)`s would allocate a new vector with only the exact amount of space required. However, thanks to the allocation reuse optimization added in Rust 1.76\*, the new vec shared the backing store of the input vec, and hence had a capacity of 16560, meaning it was using 132480 bytes of memory to store only 16 bytes of data.

Since the edge list calculation logic is run for one node at a time in sequence, the fact that it temporarily uses 132kb of memory would normally not be a problem at all. However, the new `collect()` optimization meant that that internal storage was being preserved in the final vec which got inserted into the list of edge lists, thus keeping around that 132kb of obsolete memory forever. Multiply that by 300k nodes and suddenly you've leaked the computer's entire RAM.

\* *Technically, Rust will sometimes reuse the allocation even on stable, as shown by the initial len=4,cap=6 example on the playground. Rust 1.76 merely made the optimization smarter so it triggers in more cases.*

# The source code

Now that I knew I was looking specifically for a commit added in Rust 1.76, it wasn't hard to look through the recent changes to the `Vec` source code on Github and find [the likely culprit](https://github.com/rust-lang/rust/commit/13a843ebcbe536257a8442bf5c26b227d1c2f7c9). It turns out that there's [an entire 412 line file dedicated to implementing this optimization](https://github.com/rust-lang/rust/blob/c58a5da7d48ff3887afe4c618dc04defdee3dab5/library/alloc/src/vec/in_place_collect.rs) that I overlooked previously.

How was this possible? One of the more annoying features of Rust is that Trait impls can be added *anywhere in the same crate*, not just in the files where you would logically expect them to be, and there's no way to find hidden impls other than doing a full code search. 

In this case, the `SpecFromIter` trait was defined in [spec_from_iter.rs](https://github.com/rust-lang/rust/blob/c58a5da7d48ff3887afe4c618dc04defdee3dab5/library/alloc/src/vec/spec_from_iter.rs), along with two implementations of that trait, so I naturally assumed that that was all the implementations there were. I had no way to guess that there was actually a *third* implementation that was hidden in a completely different file (in_place_collect.rs).

Technically speaking, there was one slight hint. `spec_from_iter.rs` contains the following comment:

```rust
/// Specialization trait used for Vec::from_iter
///
/// ## The delegation graph:
///
/// ```text
/// +-------------+
/// |FromIterator |
/// +-+-----------+
///   |
///   v
/// +-+-------------------------------+  +---------------------+
/// |SpecFromIter                  +---->+SpecFromIterNested   |
/// |where I:                      |  |  |where I:             |
/// |  Iterator (default)----------+  |  |  Iterator (default) |
/// |  vec::IntoIter               |  |  |  TrustedLen         |
/// |  SourceIterMarker---fallback-+  |  +---------------------+
/// +---------------------------------+
/// ```
```

This comment lists the two impls found in the file as well as a seemingly missing third impl for "SourceIterMarker". I actually did try googling "SourceIterMarker" at one point, but the only thing that came up was *that same comment in spec_from_iter.rs*, and since there was no sign of a third impl in the file, I assumed that it was just a mistake or outdated comment. In retrospect, I should have done a full code search for "SourceIterMarker" on Github, just in case it had sneakily been hidden in a separate file.

# Box<[T]>

As mentioned previously, adding a call to `shrink_to_fit()` prior to storing the edge lists in the final graph eliminated the memory leak issue. This is fine as a quick hack, but it is not the proper solution. The *real* fix is to call `into_boxed_slice()` instead.

The basic problem is that `Vec`s are optimized for the case of a *mutable* list where you're planning to *add and remove* elements in the future. However, people also commonly use them for *fixed-length* list data, even though this is not what Vecs are designed for, simply because Vec is the easiest and most *intuitive* way to store list data in Rust. The *proper* data structure for fixed-length lists is `Box<[T]>` rather than `Vec<T>`, but it takes a lot of Rust experience to even *know* about that as an option, and the syntax looks weirder.

In Java, immutable strings are called `String` while mutable strings (the equivalent of Rust's `String`) are called `StringBuilder` instead. This nudges people towards the appropriate behavior because you would look really foolish if you stored something named "StringBuilder" in long-term immutable data structures. Meanwhile in Rust, almost nobody uses `Box<str>` over `String`.

Of course, I'm not saying that Rust should have called `Vec` "ListBuilder" or anything. Mutable array lists are an **extremely** commonly needed component of algorithms and data structures, so it's important to keep the name short and memorable. It's just a little unfortunate that a side effect of Rust's design nudges people towards *also* using `Vec` even for fixed-length data.

As it turns out, I actually was already using `Box<[T]>` for the saved results in one of the functions where I used memoization. My main motivation was to avoid wasting an extra word to store capacity on the *value* side, but as a side effect, this conveniently also made it immune to any potential excess capacity bugs. (The other place where I used memoization did just use `Vec`s out of laziness, but fortunately it didn't end up mattering much there.)

# Packed arrays

Another possible optimization which I plan to try out later is to avoid storing separate lists in the first place. Instead, have a single "arena" Vec and store the data for *all* the lists *continguously* in that Vec and just pass around an (index, length) pair into that vec instead of real `Vec`/`Box<[]>`, etc. 

This design is only sometimes usable (you can't free or pass around individual lists independently of the arena vec this way) and is much more intrusive in terms of code design (you have to somehow pass a reference to the arena vec through all your code). However, in addition to making you automatically immune to excess capacity bugs, it also avoids the potential memory fragmentation issue that having lots of little individually allocated lists could cause. Additionally, it lets you represent your lists as only `(u32, u32)` assuming the total length is less than 2³², a 2x saving on the value side as well, albeit at the cost of increased bounds checks.

This trick has limited applicability, but it is perfect for cases like memoization (where the results live forever and are stored in a single place) or the edge list of a graph data structure (where you can store the backing vec as part of the graph) assuming you don't need to add or remove edges after creation.

# Conclusion

This was a surprising and annoying bug to investigate, but at least I learned a lot about Rust in the process. I had no idea that the standard library was doing this kind of optimization under the hood (and since this is code-based, it happens even in debug builds). It's also an illustration of how an optimization in one place can lead to bugs downstream by violating programmers' expectations.

Anyway, I hope that writing about my experience can help other people avoid this footgun in the future, or at least teach people something interesting about Rust.

