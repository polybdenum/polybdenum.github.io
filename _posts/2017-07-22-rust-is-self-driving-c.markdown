---
layout:	post
title:	"Rust is self driving C++"
date:	2017-07-22
---

  *Warning: Opinion piece without code*

Rust is often mocked for the relentless evangelism of Rust programmers and its perceived overhyping. For people who aren’t already familiar with Rust, it is hard to understand what the big deal about it is, and hence all the talk about Rust just seems like a crazy fad. I think the best way to explain it is by analogy to the work on driverless cars.

The most striking thing when reading stories about people working on driverless cars is their passion. Humans are really bad at driving cars. They get tired, or distracted, or drunk, and kill over 35,000 people a year. For a long time, this was tolerated because there was no alternative, but now that there is, people are understandably excited. Driverless cars are a really, really, big deal.

I think the same situation is playing out in the realm of systems programming, minus the horrible deaths. C and C++ are incredibly bad languages for programming. Among other issues, they make it nearly impossible to write correct code, leading to countless bugs and security vulnerabilities.

At this point, some C++ programmers will object that if you are just smart enough, you won’t write bugs. But that simply isn’t borne out by reality. Consider Google Chrome, a modern C++ codebase supported by sophisticated tooling and a world-class security team. A quick check of cvedetails.com shows 5 critical vulnerabilities in just the last year. Or as another example, consider Android, which had 523 vulnerabilities reported last year.

I’m not trying to pick on Google here, I just highlighted it because they have a bug bounty program that paid out $3 million last year. C++ is costing people serious money. And that’s just the tip of the iceberg, since most companies don’t have security teams or bug bounties and have orders of magnitude more vulnerabilities lurking in their code. As it turns out, human programmers also get tired and distracted (and frequently drunk too). Even with the best coding practices possible, you can’t keep every detail of the code in working memory. Expecting perfection from a million line codebase is simply unworkable.

For a long time this was tolerated, because there was no alternative to C/C++ when it came to systems programming, but Rust is changing that, and that is what makes it so exciting. This isn’t to say that it will catch every possible vulnerability, any more than a driverless car won’t eventually get into a crash somewhere, but even eliminating say, 95% of vulnerabilities would bring immense benefits. Just because many fads get overhyped doesn’t mean that the hype isn’t justified this time. It is high time that systems programming be brought into the 21st century.

  