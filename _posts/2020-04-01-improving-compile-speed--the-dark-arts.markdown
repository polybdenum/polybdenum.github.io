---
layout:	post
title:	"Improving compile speed: the dark arts"
date:	2020-04-01
---

  So you’re designing a statically typed programming language. You recognize the importance of fast compilation to adoption of your language and have slaved over your compiler, optimizing it every way you can think of, but it’s still not as fast as you’d like. Luckily, I’m here to reveal some common pitfalls and underappreciated techniques for improving compilation speed.

#### Problem #1 — deeply nested scope resolution

Most programming languages have *scopes* which determine which points in the program can access a given variable, and allow scopes to be nested, so that an inner scope can automatically access anything in the enclosing scope without specifically mentioning it.

In order to compile this code, the compiler must figure out which identifiers in the source code refer to which variables in which scopes. The typical implementation strategy is to maintain a dictionary/hash table for each scope with the variables defined in that scope. When scopes are nested, there are two common approaches — either eagerly copy all the items from the outer scope dictionary into the dictionary for the inner scope, or chain lookups so that any variable resolution that isn’t found in the inner scope dictionary falls back to checking the dictionary for the outer scope.

Unfortunately, both these approaches suffer from poor O(n²) performance in the presence of deeply nested scopes. The more scopes you have, the more time the compiler spends copying the same variables down into each successive layer or alternatively, the more time it spends walking back up the chain for each failed variable lookup. This means that even small amounts of code can take forever to compile if they use a lot of nesting.

One possibility is to use [a persistent balanced tree data structure](https://en.wikipedia.org/wiki/Persistent_data_structure#Trees) to ensure worst case O(nlogn) performance. However, this decreases performance considerably in the common case and is more work to implement and maintain. Luckily, there is a much simpler solution:

#### Solution: require indentation for nested scopes

Although Python is not a statically compiled language, it has lessons for anyone seeking to make their language fast to compile. Specifically, it solves the O(n²) scope resolution problem by requiring indentation for nested scopes.

```py
def favourite_colour(colour):
    def decorator(func):
        def wrapper():
            print(colour)
            func()
        return wrapper
    return decorator
```
To understand how this works, consider how compilation speed is measured. The most common figures quoted are in lines of code/second, but this is not a fair unit of measurement because lines of code can have varying lengths. A more reasonable metric for compilation speed is bytes/second, since every byte in the source code has to be processed at least once. This distinction can also be obviated by imposing a maximum line length, in which case the two measures would match up to a constant factor.

The n in the O(n²) figures given above is shorthand for the number of scopes and variable definitions and references. However, the actual numerator for compilation speed is not the number of scopes, but the number of bytes of source code. Thanks to the fact that each nested scope is required to be indented to a higher level than the previous, each line of code has length at least linear in the number of previous scopes, which means that the size of the source code is also ~O(n²) in the number of scopes, which means that the actual compilation speed in bytes/second is linear, no matter how many scopes you use.

The majority of mainstream programming languages fare poorly on this front due to a slavish adherence to C-style syntax with few restrictions on the placement and quantity of whitespace. However, there are efforts underway to improve this state of affairs. Even if your programming language syntax is already set in stone, you can change the de-facto syntax by promulgating an official source code formatter which inserts the appropriate indentation, thus making your compiler perform well on typical, i.e. properly formatted code.

#### Problem #2 — generics

Most performance oriented languages cannot escape the siren song of supporting convenient code reuse via some sort of “template” or “generics” feature that allows programmers to use the same code with different types in a type safe and runtime-efficient manner.

Unfortunately, this is also one of the most notorious killers of compilation speed in languages that support them, because what looks like a single innocuous block of code in the source must be duplicated by the compiler under the hood for each distinct usage. In cases where one generic function calls another generic function, this can lead to exponential increases in the effective size of the code, and consequent compilation time, compared to what is actually present in the source code.

[IntercalScript](https://github.com/Storyyeller/IntercalScript) pioneered an approach to solve this problem syntactically. In IntercalScript, each generic leaf function must be prefixed by a $. Each generic function which calls other generic functions must be prefixed by a number of $s equal to the total among generic functions it calls. This has the result that the number of $s, and hence source code size, increases exponentially with the nesting depth of generic functions, and thus the time required for compilation is polynomial in the size of the source code.

```
{-# language rank1-types #-}

f = $funct(x) x(x) end;
f2 = $$funct(x) f(f(x)) end;
f3 = $$$$funct(x) f2(f2(x)) end;
f4 = $$$$$$$$funct(x) f3(f3(x)) end;
f5 = $$$$$$$$$$$$$$$$funct(x) f4(f4(x)) end;
```
The $ rule is simple and easy to understand, but not all that attractive from a code aesthetics perspective. However, there are alternatives that can achieve the same effect while being more in line with traditional programming language syntax. For example, you could require type signatures for generic functions that include the complete type signatures for nested function calls with no affordances for type aliasing, inference, or otherwise compressing the signatures.

#### Problem #3 — macros

Macros are a less common feature, but absolutely kill performance in the languages that implement them. It might seem like a good idea to let users customize the language arbitrarily, but it is one of the worst things you can do for compilation speed. You should be building a compiler, not an ad-hoc ill-considered scripting language interpreter for whatever garbage your users see fit to execute on every single compilation.

Instead of integrating compile time code generation into your language, you should strive for your language to be a platform which can be targeted by third party code generation tools and transpilers, as it is the *output* of those tools that will serve as input to your compiler, and thus be the metric that your compilation speed is measured against.

To facilitate this, you should keep your language as simple as possible. Simplicity has a lot of benefits — it saves you time in developing the language, and it saves your users time in learning the language and it saves them time when developing tools to work with your language.

If a feature that users like is absent from your language, they can always use third party code generation tools to work around this. Not all features are created equal. When deciding what to include and what to leave out, you should strongly consider avoiding performance pitfall features such as generics entirely. In general, you want your language to be powerful enough that code generation tools can express anything necessary in your language, but not so powerful that they can express it *concisely*.

If you do intend for your language to become a platform, be extra careful with the design, as the kinds of code you are asked to compile may not be what you expect. For example, a human would be unlikely to write code with deeply nested scopes (see #1), but code generators may not be so considerate. If it is possible in your language, you should expect to see it and be able to handle it efficiently in the compiler.

#### But isn’t this cheating?

If you are not accustomed to these techniques, they may strike you as “dishonest” or “underhanded”. However, they have precedent in other design philosophies that pass largely without objection.

To wit: some languages forbid user defined operator overloading under the rational that it can negatively effect runtime performance in ways that are not readily apparent from the source code. It is considered desirable that runtime performance be predictable from the source code syntax, with things that could be slow correspondingly conspicuous in the source code. Even in the case of C++, which does have operator overloading, there have been [suggestions](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2020/p2137r0.html) that it adopt predictability of runtime performance as an explicit goal.

While runtime performance of the compiled code is of course important, there has also been increasing appreciation for the importance of compilation speed as well. Excessive compilation times are highly disruptive to developer flow and productivity. Therefore, if it is worth warping the syntax of a language to make runtime performance more predictable, then it is only logical to make predictability of compilation speed a consideration in the design of the language syntax as well.

#### Conclusion

I hope that this article has been helpful. As you can see, some of these techniques have already been employed by popular existing programming languages, but there is obviously a lot of room for improvement. I can’t wait to see what the collective ingenuity of the programming language community can come up with.

