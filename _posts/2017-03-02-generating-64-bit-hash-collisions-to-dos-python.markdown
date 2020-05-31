---
layout:	post
title:	"Generating 64 bit hash collisions to DOS Python"
date:	2017-03-02
---

  Hash tables are one of the most commonly used data structures in computer science, due to their O(1) access time. However, this assumes a perfect hash function — the complexity can increase to O(n) when there are a lot of hash collisions. Historically, most libraries used weak, non cryptographic hashes for efficiency. These worked well for random strings, but the simplicity of the hash functions used makes it possible to generate multiple strings with the same hash value, leading to a denial of service vulnerability.

Although this problem has been theoretically known for decades, it didn’t receive much attention until 2003, when [a USENIX paper](http://static.usenix.org/event/sec03/tech/full_papers/crosby/crosby_html/) pointed out that Perl and the Squid proxy were vulnerable to this attack. [They also reported it on the Python mailing list](https://mail.python.org/pipermail/python-dev/2003-May/035874.html), but no action was taken and the issue was once again forgotten until December 2011, when [a talk at the Chaos Communication Congress](https://events.ccc.de/congress/2011/Fahrplan/events/4680.en.html) pointed out that nearly every framework and language in use is also vulnerable and finally brought widespread attention to the issue.

At the time, Python used a non-cryptographic multiply/xor hash algorithm similar to [FNV](https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function) for string hashing. [After](https://mail.python.org/pipermail/python-dev/2011-December/115116.html) [much](https://mail.python.org/pipermail/python-dev/2012-January/115690.html) [deliberation](http://bugs.python.org/issue13703), the Python developers decided to simply modify the hash function to xor a random value to the beginning and end. In Python 2.7, hash randomization can be enabled by passing `-R` to Python. In Python 3.3, it was turned on by default.

It didn’t take long for someone to [point out](https://bugs.python.org/issue14621) that Python’s hash randomization added negligible collision resistance. In version 3.4, Python switched the default string hash algorithm to [SipHash](https://131002.net/siphash/), a cryptographic keyed hash function recently created specifically for use in hash tables, thus solving the problem for real. However, anyone using Python 2.x is stuck with an insecure hash function.

As the author of a Python 2 application which deals with untrusted inputs and as an amateur cryptographer, I was curious to see if I could perform the DOS attack first hand. Unfortunately, there’s often a gap between crypto that is theoretically broken and crypto that is easily breakable by the average person. I couldn’t find any public information about how to generate 64 bit FNV collisions, so I had to figure it out myself. It turned out to be a lot harder than I expected, but I eventually managed it, and here is how I did it.

### Background

There are several different ways to attack a hash table. When you insert or look up a string in a hash table, the string is first hashed to a 32 bit or 64 bit value, and then this hash value is reduced modulo the size of the table to get the actual bucket to search.

If the size of the hash table is small and predictable, and the hash function is deterministic, then it is possible to find strings that map to the same bucket by brute force, regardless of the strength of the underlying hash function. Therefore, it is necessary to use a keyed hash function, where the output hash depends not only on the string, but on a secret key. Typically the key is randomly generated at startup, or when creating a new hashtable.

However, if the hash function is weak, then it may be possible to find strings which map not only to the same bucket, but to the same raw 64 bit value. This means that such strings will be in the same bucket regardless of the hashtable size, or even if it is resized, making the attack much more powerful. Additionally, if the hash function is sufficiently weak, it is possible to find strings that map to the same hash value *regardless of the secret key*. This is the type of attack I’ll be focusing on.

Additionally, there is the question of interactive vs noninteractive attacks. In some scenarios, such as a web server, the attacker can query the server multiple times, which potentially leaks information about the secret key. However, if you can perform the attack without any knowledge of the secret key at all, that is strictly more powerful.

The target I chose is the [Krakatau assembler](https://github.com/Storyyeller/Krakatau) that I wrote, which is designed to have worst case linear performance in the size of the input file (ignoring time spent printing error messages anyway). However, pathological hash collisions would increase this to quadratic time, making it take unreasonably long, even with a small input file. Naturally, this is a non-interactive attack.

Additionally, I decided to inject the strings via Krakatau’s symbolic references feature, which limits the strings to lowercase alphanumerics and underscore, a total of 37 characters. The more characters you have to choose from, the shorter your colliding strings can be, but I figure that alphanumerics is a superset of any plausible character restrictions, meaning that the strings I use to attack Krakatau would also be useful for testing other programs.

### Universal collisions

A universal hash collision is a collision where two strings hash to the same value, regardless of the secret key. The first step is to show that such collisions exist, even theoretically. To make things easier to understand, I’ll first explain using a simplified version of Python’s actual hash function.

Consider the following simple hash function pseudocode where x is a 64 bit int.

```
P = 1000003
def hash(s):
    x = random key 1
    for byte in s:
        x = (x * P) + byte
    x ^= random key 2
    return x
```
All the hash function does is start with a random 64 bit state, loops through each byte in the string, multiplying the state by a constant and then adding the byte, and then adds another random value at the end.

Note: This is defined for byte strings. If you hash unicode, you need to utf8 encode it first. However, since I am only using ASCII here, I’ll use the terms “byte” and “character” interchangeably.

Each step in the hash function can be thought of as a function that maps from the old state to the new state. In fact, this function can be written out explicitly.

```
step(oldstate, byte) = oldstate * P + byte
```

Or giving the variables shorter names,
```
step(x, b) = x * P + b
```
This can also be curried. Any particular byte defines a function from one state to another. We’ll call this the action of the byte on the state.
```
act(b)(x) = x * P + b
```
Just like individual bytes, substrings also act on the state of the hash function, and the action is just the application of the action for each byte in turn.
```
act('a' + 'b')(x) = act('b')(act('a')(x))
```
The trick is that the action of each byte is a linear function, i.e. of the form `f(x) = a*x + b`. Since the composition of linear functions is also linear, this means that the action of every possible string is also a linear function.
```
let act(s1) = a*x + b
let act(s2) = c*x + d
act(s1 + s2) = c*(a*x + b) + d = (a*c)*x + (b*c + d)
```
That means that the action of any possible string is completely defined by just two numbers. Since we’re assuming 64 bit math, each of those numbers is at most 64 bits, meaning that there are only 2¹²⁸ distinct possible actions. If you have a set of at least 2¹²⁸+1 strings, two of them are guaranteed to have the same action.

If two strings have the same action, that means that given the same input state, they’ll have the same output state. This means that they’ll collide, regardless of what happens before or afterwards. Such strings will produce the same hash value, regardless of the secret keys. The actual hash value obviously does depend on the key, but whatever it is, it will be the same between the two strings.

This puts an upper bound on the length of the shortest collision. If you are using an alphabet of W bytes, then there is a collision of length at most `floor(1 + 128/log(W))`. In fact, the bound is half this because the multiplier coefficient depends only on the length of the string (it is P to the nth power mod 2⁶⁴). This means that for any fixed length, only the additive constant matters and there are 2⁶⁴ possible actions.

Naturally, the actual hash function used by Python is slightly more complicated. Here it is in pseudocode.

```
P = 1000003
def hash(s):
    if len(s) == 0:
        return 0
    x = random key 1
    x ^= s[0] << 7
    for byte in s:
        x = (x * P) ^ byte
    x ^= len(s)
    x ^= random key 2
    if x == -1:
        return -2
    return x
```
Most of the extra details don’t matter for our purposes. For example, the empty string is special cased to always hash to 0, but we don’t care about that. Likewise, the -1 check strictly increases the number of collisions and can be ignored. Also, the length addition doesn’t matter if we always used strings of equal length, and the special handling of the first byte doesn’t matter if we prefix all our strings with an arbitrary fixed byte.

One other thing to note is that x is either 32 or 64 bits depending on the platform and how Python was compiled. However, any 64 bit collision is also a 32 bit collision and I’m using 64 bit Python, so I focused on the 64 bit case. If you only care about 32 bit collisions, you can generate them very quickly with just brute force anyway.

Once these details are removed, the hash function simplifies to this.
```
def hash(s):
    x = random key 1
    for byte in s:
        x = (x * P) ^ byte
    x ^= random key 2
    return x
```
This is identical to the previous hash algorithm except for the use of xor rather than addition. However, this one tweak makes it much more difficult to break. The problem is that the step function is no longer a simple mathematical equation. Bitwise xor is a nonlinear operation when viewed in the ring of integers mod 2⁶⁴.

Fortunately, xor is only slightly nonlinear. In particular, it is addition without carry, which means that the nonlinearity is limited to the size of the smaller operand, in this case a byte. Therefore, for any fixed least significant byte in the input state, the new state is a linear function of the old state. This means that the action of any string can be expressed as a table of 256 ints, where you look up and add the appropriate value from the table based on the low byte of the input. This puts a bound, albeit a much larger one, on the size of the smallest universal collision.

Unfortunately, simply knowing a collision exists doesn’t help you find it, unless the bound is small enough to brute force. Therefore, I needed to come up with an algorithm to find collisions.

### First try: concatenate and filter

The first idea I came up with is a relatively simple algorithm. On each step, you start with a set of n strings, which are all the same length and which collide in the lowest k bits. Then you form a set of n² strings that are twice as long by concatenation. Since each of the individual strings collides in the lowest k bits, the concatenated strings will as well. There are a fixed number of values for the next highest bit, and by the pigeonhole principle, you can take the largest subset that have the same value. This gives you a set that collides in the lowest k+1 bits and you can repeat.

There are a few more subtleties than that. I started with a set of strings that leave the lowest byte unchanged, so that the actions don’t “mix” between the 256 possible input bytes. This lets you collide them one at a time, meaning that you only divide your set by 2 at each step, rather than 2²⁵⁶. It is fairly easy to generate short strings that leave the lowest byte unchanged by searching combinations of 2 or 4 characters for permutations of low order and then repeating them until they reach the identity. For example, “08080808080808080808080808080808” is one such string, while “000h000h000h000h000h000h000h000h” is another.

Another note is that rather than concatenating the strings explicitly, you can [represent them as a tree, with pointers to two other strings](/2017/02/11/optimizing-rc-memory-usage-in-rust.html), which makes things much more efficient, especially as the strings tend to grow exponentially long. In fact, using this method, the colliding strings ended up at least 2²⁴ bytes long, no matter what I tried. It’s nice for a proof of concept, but not terribly practical in actually demonstrating an attack.

At that point, I gave up on generating fully universal hash collisions, and decided to try creating 256 sets of semi-universal collisions, which would hopefully be much smaller.

One of the flaws of Python’s hash randomization scheme is that only 8 bits of the key actually mix with the hash in a nontrivial way. This means that if you fix the value of the lowest byte of the key, you can easily generate collisions, and such collisions will collide for 2¹²⁰ out of the possible 2¹²⁸ keys. However, it’s easier to pretend that the key is only 8 bits to begin with and treat these like normal hash collisions, which is what I’ll do from now on.

Anyway, this means that you don’t need a set of fully universal colliding strings to ensure hash collisions. Instead, you can just prepare 256 different sets of strings, one which collides for each possible key byte. You don’t know which set will collide, but if you include all of them in the input, one of the sets is guaranteed to cause a lot of collisions, and hence a slowdown.

Anyway, I modified the code to start with individual characters and maintain 256 colliding sets. My initial try produced 128 byte strings, which was already much shorter. After a lot of optimization and tweaks, and combining results from multiple runs with different parameters, etc. I managed to produce minimal collisions of 48–64 bytes.

Since a single pair of colliding strings isn’t that useful, my plan was to produce a larger number of colliding strings by repeatedly concatenating the smaller sets. I decided that I needed 10,000 strings to produce a noticeable slowdown. Even using A* search to choose the optimal sets to concatenate, this increased the size to 328 bytes for 10,000 strings. (It is roughly logarithmic in the number of strings you want). At that point, the files I was generating containing the colliding strings were nearly a gigabyte, and I decided that the method was impractical.

### Second try: near optimal collisions

I decided that in order to have a practical file size, I needed colliding strings of near optimal length. Unfortunately, brute force is infeasible, so I wasn’t even sure if this was possible. Eventually, I figured out a way to do it, which relied on several key observations.

#### Lossy and lossless pruning

Since it’s not feasible to actually calculate 2⁶⁴+ strings, it is necessary to prune the search space. Doing so can either be lossy or lossless.

For example, suppose your initial search space is all 10 byte strings, or 2⁸⁰ strings. Since there are only 2⁶⁴ possible hash values, there is guaranteed to be at least a 2¹⁶ way collision. Now suppose you restrict your search space to strings whose hash ends in the most popular lowest 16 bits. By the pigeonhole principle, there are at least 2⁶⁴ of these. However, there are now only 2⁴⁸ possible hash values. Therefore, you are still guaranteed to have a 2¹⁶ way collision. I call this type of pruning lossless, because it doesn’t reduce the worst case collision size.

Note that lossless doesn’t mean you aren’t throwing away collisions. Although improbable, there could have been a 2⁶⁴ way collision among the strings you threw out. All it means is that the ratio of search space to output space is maintained or increased, and therefore the worst case collision size is maintained.

By contrast, lossy pruning does not preserve this ratio. For example, suppose you restricted your search space to all strings whose state after 5 characters ends in the most popular lowest 16 bits. In this case, you have once again restricted your search space to (at least) 2⁶⁴ strings. However, the hash of all 10 characters mostly doesn’t care what the internal state was after 5 characters, so the output space is still 2⁶⁴ possible values. Therefore, you have thrown away the guaranteed collisions.

The reason the repeated concatenation algorithm performs so poorly is that *every step but the last is lossy*. Suppose the final output size is 2048 bytes, and these strings collide with all 64 bits. The construction of the algorithm means that these 2048 byte strings are concatenated from 1024 byte strings, where the internal state after 1024 bytes is a partial collision (up to 63 bits). This means it is a lossy way to prune the search space.

Anyway, this means that I needed to find a way to do only lossless pruning.

#### Counting the most popular lower bits

It might seem like it is impossible to actually perform this lossless pruning. After all, how can you determine which lower bit values are most popular without actually generating the strings? It turns out that this is possible.

To count the number of strings of length n whose hash has a given lowest k bits, you can create two tables of size 2^k. At each step, you iterate through the table, calculate the new state for each character in your alphabet, and then increment the corresponding entry in the other table. Essentially, you are performing a sparse matrix multiplication n-1 times. This works because in order to know the number of strings of length n with given low bits, all you need to know is the number of strings of length n-1 that have each possible low bit value.

The main limitation of this is memory usage. With 32gb of RAM, it is effectively limited to k=31, but even with unlimited memory, the time would increase exponentially with k.

Anyway, this was the code that resulted in [my previous optimization post](/2017/02/19/how-copying-an-int-made-my-code-11-times-faster.html). However, I later realized that this step isn’t actually necessary for generating large multi-collisions. The reason is because FNV is approximately uniformly distributed for large enough inputs. If you’re trying to find a small number of collisions among a small set of strings, it is necessary to take the most common hash value (the extreme case of this is the birthday attack). However, for larger numbers of strings this evens out. For example, if you are searching 2⁸⁰ strings, then each of the possible hash values will have roughly 2¹⁶ strings that hash to that value, with a small amount of random variation. Therefore, you can take any arbitrary end state and get almost the same number of strings. In my final version, I just find strings that hash to the value 0.

Although I didn’t end up using it in the final version, I included the code anyway, as the function get_common_lowest(), since people were curious after my last post.

#### Meet in the middle

Even once you’ve decided to restrict your search to strings which hash to 0, it’s not immediately obvious how that helps, since you can’t determine which strings hash to 0 without generating and hashing them all.

Suppose you have two lists of N ints, and you want to find all pairs that are equal mod 2^k. The naive approach of looping through all pairs is O(N²), but as it turns out, there is a much faster approach. Just sort the lists (using the low bits as sort key), and iterate through them both in order. This lets you find all the matching pairs in O(N) time, or more accurately, O(N+M) time where M is the number of output pairs. (In the degenerate case, all the ints are equal mod 2^k and M = N²).

Now suppose that the two lists are of the hashes of strings of length n, and you want to find the strings of length 2n whose hash is equal to e mod 2^k. The action/hash of concatenated strings can be expressed as a simple equation.
```
act(lhs + rhs)(i) = (act(lhs)(i)-j)*P^len(rhs) + act(rhs)(j)
where j = act(lhs)(i) mod 256
```
Assuming you’ve dealt with the nonlinearity in the lowest bits (I’ll explain how below), the equation is just
```
act(lhs+rhs) = act(lhs)*Pn + act(rhs)
```

where Pn is the appropriate power of P. If you let a = act(lhs) and b = act(rhs), then you’re essentially trying to find pairs which satisify the equation

```
a*Pn + b = e mod 2^k
```
If you multiply every number in the first list by Pn and subtract from e, you get
```
a' = e - a * Pn
a' = b mod 2^k
```
But that’s just the pair matching problem described earlier, and hence can be solved in linear time.

This meet in the middle step means that you can effectively search N² strings in time O(N + M) where M is the number of output strings. Without any pruning, M would just be N² and there is no speedup. However, the lossless pruning lets us reduce M, giving a potentially quadratic speedup.

Without further improvements, this still takes an impractically large amount of memory. For example, if you want a 2¹⁶ way collision, you need to search 2⁸⁰ strings, meaning that the two lists of half-strings must have 2⁴⁰ entries each, which is obviously not possible in 32GB of ram. Additionally, I skated over the issue of how to ensure the lowest bytes match up.

#### Recursive meet in the middle

Say for example, that you are trying to search strings of length 24, so your lists of half-strings contain strings of length 12 (or more accurately, their hash/action values, since there is no need to explicitly construct the strings at this step).

Instead of generating all 12 character strings, you choose some number s ≤ k and a target s bit value, mid. For the left hand strings, you find all 12 character strings where the lowest s bits of the hash are mid, and for the right hand side, you find all strings where starting from an initial state of mid, the lowest s bits of the hash are your goal. For s ≥ 8, this also solves the problem of making sure the nonlinearity in the lowest byte matches up.

This means that instead of lists of size N, you only need to store lists of size N/2^s, reducing the memory requirement. By itself, this is a lossy restriction. However, instead of choosing just one value of mid, you can repeat this process for all 2^s possible values of mid, meaning there is no loss.

That seems like it would multiply the time required by 2^s, but there is a further trick — apply the meet in the middle step recursively. If you choose the parameters right, the time complexity of the substeps are linear in their output size (the O(M) part above). Increasing s doubles the number of iterations in the top level function, but each of the substeps takes half as long, meaning the time is unchanged overall. Theoretically, the optimal value for s is proportional to log(N), but I found that setting it a bit lower makings things faster in practice.

Optimization note: Once the recursive splitting is added, the bottleneck is the sorting step. I tried writing several different radix sort implementations, as well as the [quickersort](https://crates.io/crates/quickersort) and [pdqsort](https://crates.io/crates/pdqsort) libraries. Surprisingly, the only one that was faster than Rust’s native stable sort was pdqsort, which was about 25–30% faster in my tests. This is notable mainly due to being a rare situation where a) sorting performance is the bottleneck, b) sort stability is observable, and c) unstable sort performs measurably better than stable sort. It’s also interesting that radix sort was slower than a generic comparison sort, though I may just suck at implementing fast sorts.

#### Reducing nonlinearity

Previously, I assumed that the lowest 8 bits of the state participate in nonlinearity, but I realized that that wasn’t quite true. It’s only nonlinear if some byte in the string actually has a set bit in that position or higher, since otherwise it is just being xored against 0 all the time. In particular, this means that if you are using only ascii characters like I was, you only need to worry about the lowest 7 bits.

The corollary is that using smaller character values reduces the number of states you have to consider. I restricted myself to the digits (0–9), which are all below 64, meaning that I only had 6 bits of nonlinearity to contend with. Reducing the alphabet size from 37 to 10 increases the minimum collision length, but having half as many colliding sets to generate more than makes up for it.

If the target of the DOS accepts arbitrary bytes, then you can make collisions much more effective by using only low bytes. In the extreme case, if you only use the bytes 0x00 and 0x01, there is only one bit of nonlinearity. At that point you could generate two sets of colliding strings, or just generate universal collisions, which is almost as easy with only 1 bit.

In my case, I couldn’t go below 64, since I had already decided to restrict myself to alphanumerics. There are other parts of the Krakatau assembler which accept arbitrary bytes, but I didn’t feel like attacking that, even though it’s much easier. Besides, generating colliding digit strings means the resulting strings could be used practically anywhere.

#### String recovery

At first, I tried computing the strings directly through the recursive meet in the middle method, but this turned out to be infeasibly slow. I figured this is probably due to all the intermediate strings being created, concatenated, and thrown away. Therefore, I came up with a different approach — run meet in the middle only on the hash values, and record which pair of hashes was composed to create the larger hash. Then perform this recursively until you get to short enough strings, at which point you find the strings and build it back up. This avoids creating any intermediate strings that will be thrown away, making things much faster. There are also a couple other optimizations I did which you can see in the code, such as avoiding sorting at this step.

#### Putting it together

With all this done, I was ready to generate large multicollisions in 64 bit FNV. I decided to go with 24 character strings, mainly due to memory constraints. Since the time taken to generate the strings is roughly proportional to the number of strings generated, I deliberately added a lossy partition to speed things up, which I then relaxed to generate more and more strings.

The initial four runs took a cumulative 71 hours on an i7–4790K running 8 threads, which resulted in 64 sets of colliding strings with 3206–3538 strings each.

To test Krakatau, I created one assembly file with the collided strings, and another with equal lengths of randomly generated digits as a control. That way, I could tell how much of the time was parsing overhead and how much was the hashtable slowdown.

With the 3000 strings, the difference was 6.4 seconds vs 6.8 seconds, a measureable slowdown, but a bit disappointing. Keep in mind though that this is with 64 sets of strings, only one of which collides, which effectively divides the slowdown by 64. If you only include the colliding set of strings (possible if hash randomization is not enabled, or if you’re making 64 different requests to a web server), then the difference is 0.10 seconds vs 0.62 seconds, a much more dramatic slowdown.

At that point, I realized that there is no need to generate 64 independent sets of colliding strings. If you have say, a set of strings that collides when the input state is 0 (mod 64) and a fixed prefix string that maps state i to state 0, then preprending that prefix gives you a set of strings that collides when the state is i. This means that at the cost of adding a single character, I could just generate one set of colliding strings and reuse it 64 times.

With the collision search now effectively 64 times faster, it became practical to generate many more collisions. In an additional 8 hours, I generated another 50k strings, bringing the total to 54091.

Using all 54k strings, the time difference became 114 seconds vs 414 seconds, a much more dramatic slowdown (although the filesize also grew to 229mb with this many strings). Keep in mind that if you only include one set of strings instead of 64, the difference is 1.7 seconds vs 304 seconds, and the filesize is only 3.6mb.

Anyway, all the code is [available on Github](https://github.com/Storyyeller/fnv-collider), as well as the collided strings I found and the script to generate the Krakatau files. If you have a Python application you are concerned about, you can use these strings to test how it responds to hash based DOS.

### XML parsing

While reading through the discussions surrounding the original decision to add randomized hashing to Python in the python-dev archives, I noticed one comment that Python’s string hashing function is duplicated in the xml parser. Out of curiosity, I checked the source, and even in the latest Python 3.6, it is [still there](https://github.com/python/cpython/blob/227e42754059806e37aab276baa9d251059aaba6/Modules/expat/xmlparse.c#L111), still using the insecure FNV hash.

Presumably, it wasn’t considered important since XML parsers can be trivially DOSed through other means, such as repeated entity expansion, the “billion laughs” attack. However, this is worth noting if you are parsing untrusted XML with a “safe” library like [defusedexpat](https://pypi.python.org/pypi/defusedexpat) which limits entity expansion but does nothing to protect against hash collisions.

