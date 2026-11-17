---
layout: post
title: Fable 5.2 incorrectly fixes bug in 3 out of 4 trials
date: 2026-11-16 19:08 -0800
---
Last month, I used Claude Code (Opus 5.5) to look for bugs in [1SubML](https://github.com/Storyyeller/1subml), a project I wrote last winter. It found a number of bugs, but one bug was particularly notable because Claude incorrectly identified the problem.

Claude had found a test case which demonstrated a real soundness bug in the compiler, but it was wrong about the *cause* of the bug, incorrectly blaming the coercion code and suggesting a change there. Fortunately, as 1SubML was a project I wrote myself, I had a pretty good understanding of it and was suspicious of Claude's proposed "fix". I investigated the code myself and discovered that the *actual* bug was in the unification code, a different file entirely. (The final commit is [here](https://github.com/Storyyeller/1subml/commit/cce535b395ce50ed4527ed68394ea2935e716094#diff-c5f99746a9d4d4a748f35c7c56bfabb377309fcf2e99b63721dafcf9c36bdc13) in case you're curious.) If I hadn't reviewed Claude's output and pushed back, it would have landed a pointless change and failed to address the actual root cause.

As Anthropic released Fable 5.2 last week with one week of free access, I figured that this bug might make for a good benchmark to see how muhc Fable 5.2 has improved over Opus 5.5.

I ran the benchmark manually by resetting my git checkout to [the commit before the fix](https://github.com/Storyyeller/1subml/commit/ff5424202e108fba60f797267f8f79633ea5424b), opened a fresh Claude Code session, and pasted in just the original repro case and a request to find the bug:

Here's the prompt I used:
```
Can you find the cause of this bug and appropriate fix?
alias e = {type t; v: t; use: t -> int};
let cell = {mut x = `None 0};
let f = fun (p: e) -> (
  mod M = p;
  let old = cell.x;
  cell.x <- `Some (fun[T] (x: T) :: (T, M.t) -> (x, M.v));
  match old with
  | `Some g -> M.use ((g :> [T]. T -> (T, M.t)) 0)._1
  | `None _ -> 0
);
let a = f ({v=42; use=fun x -> x + 1} :> e);
print a;
let b = f ({v=fun y -> y + 1; use=fun g -> g 3} :> e);
print b;
```

I considered the benchmark passed if Claude identified and made the correct fix in unification.rs and failed if it left unification.rs untouched and made the incorrect fix in coercion.rs. (Every attempt resulted in one or the other.)


I ran four trials each with Opus 5.5 and Fable 5.2 (medium effort in both cases). Both Opus 5.5 and Fable 5.2 made the correct fix in 1/4 trials and the incorrect fix in the other 3/4 trials.

Although the sample size is small, it seems clear from this experiment that Fable 5.2 is not a huge leap forward. Going into the experiment, I expected it to identify the correct fix every time. The fact that it still screws up a lot is rather concerning and suggests that expert human oversight is still important in coding.

## Other vibes

Apart from this experiment, I also tried asking Fable 5.2 in a web chat for ideas on how to improve and extend 1SubML. However, most of the ideas it came up with were broken. I ended up spending a lot of time explaining to Fable why it was incorrect, and it felt like I was doing all the work and Fable provided no new useful insights.

Overall, based on the limited testing I did this week, it does not feel like Fable 5.2 is an advance over Opus 5.5 at all. I'm sure it is much better in some ways, and the benchmarks are certainly higher, but at the very least, it never managed to impress me. I'm curious whether other people had the same experiences, and if not, whether I just didn't try it on the right problems or ask it in the right way or what.






