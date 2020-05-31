---
layout:	post
title:	"How copying an int made my code 11 times faster"
date:	2017-02-19
---

  Recently, after refactoring some Rust code, I noticed that it had suddenly become four times slower. However, the strange part is that I didn’t even touch the part of the code that became slower. Furthermore, it was still slower after commenting out the changes. Curious, I decided to investigate further.

The first step was to use git diff to display all changes since the previous commit, which was normal speed. Then I started removing them one by one, no matter how inconsequential, and testing to see if it was still slow after the change.

Eventually, I was left with a diff of just one print statement, added for unrelated debugging purposes, and sure enough, commenting out the print statement made the code fast again. Note that this print statement only executes once, and it isn’t even part of the code that was slow. The only thing I could think of was that it was somehow breaking the compiler’s optimizations, so I decided to try to reduce it down to a minimal example, in order to report it as a bug.

Eventually, I reduced the code down to the following:

```rust
fn main() {
    let size = 1usize << 25;
    // Adding this line causes program to go from 0.16 seconds to 1.7 seconds
    println!("{}", size);
    let mut ints = vec![0u32; size];
    for i in 0..size {
        for c in 0..8usize {
            ints[(i ^ c) % size] += 1;
        }
    }
}
```
Adding the print statement causes the code to go from 0.16 seconds to 1.7 seconds, an 11x slowdown (in release mode). Then, I posted it in the rustc IRC channel, where `eddyb` and `bluss` suggested a workaround and explained what was going on.

The fix was to the change the print line to the following, which does indeed fix the slowdown.

```rust
println!("{}", {size});
```

`{x}` declares a statement block which evaluates to the last expression, in this case x. This means that `{x}` is the same as x with an extra move/copy. Normally, this is only useful for [bypassing the implicit reborrow when passing mutable references](https://bluss.github.io/rust/fun/2015/10/11/stuff-the-identity-function-does/). However, here there are no borrows involved. All it is doing is copying a plain int, which seems useless.

The trick is that like all generic interfaces in Rust, printing takes arguments by reference, regardless of whether they are Copy or not. The println! macro hides this from you by implicitly borrowing the arguments, which you can see by having rustc print out the macro expansions (note the `(&size,)`. In case you were wondering, this is why you can print non-copyable values without explicitly borrowing them, in seeming violation of the ownership system.

```rust
#![feature(prelude_import)]
#![no_std]
#[prelude_import]
use std::prelude::v1::*;
#[macro_use]
extern crate std as std;
fn main() {
    let size = 1usize << 25;

    // Adding this line causes program to go from 0.16 seconds to 1.7 seconds

    ::io::_print(::std::fmt::Arguments::new_v1({
        static __STATIC_FMTSTR:
        &'static [&'static str]
        =
        &["", "\n"];
        __STATIC_FMTSTR
    },
    &match (&size,) {
    (__arg0,) =>
        [::std::fmt::ArgumentV1::new(__arg0,
        ::std::fmt::Display::fmt)],
    }));
    let mut ints = ::vec::from_elem(0u32, size);
    for i in 0..size { for c in 0..8usize { ints[(i ^ c) % size] += 1; } }
}
```
Passing {size} instead of size prevents println! from borrowing size . Instead, it borrows a temporary copy. However, that still doesn’t explain how the borrow causes such a huge slowdown. The other half of the story is that while Rust knows that the borrow is immutable, this information is sadly not passed to LLVM. This means that the LLVM optimizer sees that a pointer to size is being passed to some function and just gives up, leaving the following code to assume that size holds an arbitrary value. Borrowing a copy instead allows the optimizer to do its job.

You can also see this by explicitly resetting the value of size after the print call returns. This makes the code fast again, because the optimizer sees the constant value of size .

```rust
fn main() {
    let mut size = 1usize << 25;
    println!("{}", size);
    size = 1usize << 25;
    let mut ints = vec![0u32; size];
    for i in 0..size {
        for c in 0..8usize {
            ints[(i ^ c) % size] += 1;
        }
    }
}
```
At that point, the mystery was solved, but I was curious to see what the actual differences in code generation were that were causing the speed difference. It turns out that you can ask rustc to print out assembly as well.

```
rustc -O --emit asm src/main.rs -C llvm-args=-x86-asm-syntax=intel
```

It’s pretty easy to identify the inner loop in the assembly, especially since the code in this example is so small. For the optimized `{size}` version, the inner loop looks like this.

```
.LBB0_3:
 mov r14d, dword ptr [rbx + 4*rax + 4]
 inc rax

.LBB0_2:
 inc r14d
 mov dword ptr [rbx + 4*rax], r14d
 mov rcx, rax
 xor rcx, 1
 inc dword ptr [rbx + 4*rcx]
 mov rcx, rax
 xor rcx, 2
 inc dword ptr [rbx + 4*rcx]
 mov rcx, rax
 xor rcx, 3
 inc dword ptr [rbx + 4*rcx]
 mov rcx, rax
 xor rcx, 4
 inc dword ptr [rbx + 4*rcx]
 mov rcx, rax
 xor rcx, 5
 inc dword ptr [rbx + 4*rcx]
 mov rcx, rax
 xor rcx, 6
 inc dword ptr [rbx + 4*rcx]
 mov rcx, rax
 xor rcx, 7
 inc dword ptr [rbx + 4*rcx]
 cmp rax, 33554431
 jne .LBB0_3
```
The code is pretty much as optimal as you can get, short of removing memory accesses (the optimizer could theoretically figure out that ints is just set to 8 in this toy example, but luckily, it doesn’t). In particular, the % size operation and the bounds checks in the inner loop are completely optimized away, and the outer loop condition just compares against a constant. This is possible because the optimizer realizes that the size is a) constant and b) a power of two, and thus xoring by a small value won’t go out of bounds.

By contrast, the corresponding code for the `size` version is unoptimized apart from the loop unrolling. It does the modulo and bounds checking on every single access, since it doesn’t know what size is.

```
.LBB0_6:
 xor edx, edx
 mov rax, rsi
 div rbx
 cmp rcx, rdx
 jbe .LBB0_7
 inc dword ptr [r14 + 4*rdx]
 mov rax, rsi
 xor rax, 1
 xor edx, edx
 div rbx
 cmp rcx, rdx
 jbe .LBB0_7
 inc dword ptr [r14 + 4*rdx]
 mov rax, rsi
 xor rax, 2
 xor edx, edx
 div rbx
 cmp rcx, rdx
 jbe .LBB0_7
 inc dword ptr [r14 + 4*rdx]
 mov rax, rsi
 xor rax, 3
 xor edx, edx
 div rbx
 cmp rcx, rdx
 jbe .LBB0_7
 inc dword ptr [r14 + 4*rdx]
 mov rax, rsi
 xor rax, 4
 xor edx, edx
 div rbx
 cmp rcx, rdx
 jbe .LBB0_7
 inc dword ptr [r14 + 4*rdx]
 mov rax, rsi
 xor rax, 5
 xor edx, edx
 div rbx
 cmp rcx, rdx
 jbe .LBB0_7
 inc dword ptr [r14 + 4*rdx]
 mov rax, rsi
 xor rax, 6
 xor edx, edx
 div rbx
 cmp rcx, rdx
 jbe .LBB0_7
 inc dword ptr [r14 + 4*rdx]
 mov rax, rsi
 xor rax, 7
 xor edx, edx
 div rbx
 cmp rcx, rdx
 jbe .LBB0_7
 inc rsi
 inc dword ptr [r14 + 4*rdx]
 cmp rsi, rbx
 jb .LBB0_6
```

#### Bonus: nonconstant size

After seeing the above code, I was curious if the optimizations would still work when size is an unknown power of two. After all, in real world code, the size is often variable. I couldn’t figure out how to get rustc to print the nice assembly when using an external crate dependency, so I simulated the opaque parameter with an extern function instead. It obviously won’t link, but that doesn’t matter for assembly generation.

```rust
extern {
    fn opaque() -> usize;
}
fn main() {
    let bits = 14 + (unsafe{opaque()} & 15);
    let size = 1usize << bits;
    println!("{}", {size});
    let mut ints = vec![0u32; size];
    for i in 0..size {
        for c in 0..8usize {
            ints[(i ^ c) % size] += 1;
        }
    }
}
```
Anyway, it turns out that the resulting code is mostly unoptimized, though still better than the previous case where the optimizer thought size was unknown.
```
.LBB0_2:
 mov rsi, rbx
 and rsi, r13
 cmp r12, rsi
 jbe .LBB0_3
 inc dword ptr [r15 + 4*rsi]
 mov rsi, rbx
 xor rsi, 1
 and rsi, r13
 cmp r12, rsi
 jbe .LBB0_3
 inc dword ptr [r15 + 4*rsi]
 mov rsi, rbx
 xor rsi, 2
 and rsi, r13
 cmp r12, rsi
 jbe .LBB0_3
 inc dword ptr [r15 + 4*rsi]
 mov rsi, rbx
 xor rsi, 3
 and rsi, r13
 cmp r12, rsi
 jbe .LBB0_3
 inc dword ptr [r15 + 4*rsi]
 mov rsi, rbx
 xor rsi, 4
 and rsi, r13
 cmp r12, rsi
 jbe .LBB0_3
 inc dword ptr [r15 + 4*rsi]
 mov rsi, rbx
 xor rsi, 5
 and rsi, r13
 cmp r12, rsi
 jbe .LBB0_3
 inc dword ptr [r15 + 4*rsi]
 mov rsi, rbx
 xor rsi, 6
 and rsi, r13
 cmp r12, rsi
 jbe .LBB0_3
 inc dword ptr [r15 + 4*rsi]
 mov rsi, rbx
 xor rsi, 7
 and rsi, r13
 cmp r12, rsi
 jbe .LBB0_3
 inc rbx
 inc dword ptr [r15 + 4*rsi]
 cmp rbx, r12
 jb .LBB0_2
```
In particular, it still does the bounds checking, and it still does the % size part. However, it is at least smart enough to do the modulo via bitwise and instead of a full division operation. On the other hand, the bounds checking is far from ideal. It makes me wonder whether it would be worth it to hand monomorphize performance critical code like this and duplicate it for every possible power of two and then switch on size to call one of these functions at runtime, to get the full optimization potential.

