---
layout:	post
title:	"Rust makes implicit invariants explicit"
date:	2017-01-07
---

  A surprising thing I’ve noticed while coding in Rust is that, for better or worse, Rust makes you think a lot more about the design of your code. In the other languages I am familiar with (C++, Go, Java, Python, Javascript), all reference types are nullable and mutably aliasable. In fact, code that mutates shared objects looks the exact same as any other code, with the result that this is pervasive and idiomatic.

Rust doesn’t prevent you from coding in this manner, since Option and RefCell exist. But the key difference is that these require extra syntax every time the values are mentioned or used. Additionally, interior mutability is a pain to deal with due to the loss of covariance. This is an issue if the problem you’re solving inherently requires shared mutation (most commonly graph manipulation), but the rest of the time, it encourages you to think twice and restructure your code so that Option and RefCell are unnecessary and the program invariants are instead statically verified.

For example, I recently encountered this phenomenon while [optimizing Enjarify](https://github.com/google/enjarify/commit/f9a22c97a53957102b1208ea7408bbcbbc0eba10). Enjarify is a tool to translate dex files into Java classfiles. Nearly all the strings used can be borrowed from the input dex file. However, there is one exception — method descriptors are stored as contiguous strings in classfiles, but the dex format stores them in multiple pieces. The previous version of Enjarify created a new string on the fly whenever a method reference was parsed, making things unnecessarily slow. My goal was to remove this and switch to borrowed strings everywhere.

The core of parsing is a class called `DexFile<'a>`. This holds a `&'a [u8]` to the original dex file, as well as data from the parsed file header, giving the offset and size in the file of the string table, type table, etc. It also has convenience functions such as `cls_type(&self, i: u32) -> &'a [u8]` which takes an index into the type table, calculates the appropriate offset, and returns a string borrowed from the dex file.

My idea was the precompute strings for every method descriptor in the file, store them in DexFile, and return borrowed references whenever a method is parsed. The first step was to add a field protos: `Vec<Vec<u8>>` to DexFile. (Actually, the type was more complicated since there was other information I needed to precompute as well, but that’s not important now.)

The next step was to initialize the new field at the end of DexFile::new. However, I ran into a problem — the code that computes the method descriptor relies on calling `DexFile::cls_type`. I needed an instance of DexFile to compute protos, but I needed protos to construct a complete instance of DexFile.

I responded by doing what I would in other languages- making protos mutable and filling it in after the initial DexFile instance is created. I couldn’t prove it to the compiler, but I knew that `DexFile::` didn’t actually access protos so there would be no problem at runtime. However, as soon as I added the RefCell, my code would no longer borrow check, and I couldn’t figure out why. I ended up having to get help from Stack Overflow.

The issue boiled down to the fact that borrowing from inside a mutable field doesn’t live long enough. Previously, every string had been borrowed out of the input file, which meant that they had the same lifetime and could be freely intermixed. However, strings borrowed out of the protos field are only guaranteed to be valid as long as the borrow of the wrapping RefCell. Essentially, the compiler doesn’t understand that I only set protos once and leave it effectively immutable, because the actual type constraints say that protos can be reassigned at any time.

I probably could have fixed this by adding more lifetime parameters throughout the codebase, but I wanted to avoid changing as much code as possible. It seemed like pushing a round peg through a square hole by brute force, and I wanted a cleaner approach.

The only reason I originally made the field mutable was to work around the fact that the compiler doesn’t reason about methods accessing a subset of the class state and therefore being safe to call on a “partially initialized” object. But another possibility is to split up the class so that the compiler can understand this.

I renamed the original DexFile to DexFileNoProtos and added a new struct named DexFile which contains a DexFileNoProtos, plus the protos field. I also implemented Deref from DexFile to DexFileNoProtos so the existing code would work with no changes. After that, it was a simple matter of changing the method descriptor calculation code to take DexFileNoProtos, thus proving to the compiler that it does not access protos.

The resulting code took a bit more work to write than the mutable approach idiomatic in other languages, but it benefits from static type checking. Under the mutable approach, if someone ever accidentally violates the implicit invariants about not accessing certain fields from certain methods, they’ll get an error at runtime at best. With the Rust approach, this is turned into a compiler error. You could theoretically do the struct splitting technique in other languages, but without the syntactical cost of mutability, there is no incentive to do so, so it doesn’t happen in practice.

P.S. Rust is of course not the first programming language to do this, but I think it will be the first “mainstream” language, and the first one I’ve bothered to learn. The reason is because Rust is a better C++ with functional programming bits sprinkled in, so it has enormous practical value, whereas languages like Haskell “avoid success at all costs”.

