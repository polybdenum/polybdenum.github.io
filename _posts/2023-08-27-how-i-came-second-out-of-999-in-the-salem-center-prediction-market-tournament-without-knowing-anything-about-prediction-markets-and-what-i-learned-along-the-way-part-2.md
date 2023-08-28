---
layout: post
title: |-
  How I came second out of 999 in the Salem Center prediction market tournament
  without knowing anything about prediction markets, and what I learned along the
  way - Part 2
series: salem
series-num: 2
date: 2023-08-27 17:58 -0700
---
{% include series-util.html %}

<style>
blockquote {font-style: initial;}
blockquote em {font-style: italic;}
</style>

Last August, the Salem Center at the University of Texas [announced a year-long prediction market tournament](https://www.cspicenter.com/p/introducing-the-salemcspi-forecasting) in partnership with the Center for the Study of Partisanship and Ideology in an attempt to find people who are good at predicting the future. Despite having absolutely no experience with prediction markets, I decided to give it a try and amazingly managed to place second out of nearly a thousand participants.

This post is divided into two parts. The [first part]({{prev_url}}) begins with a brief description of how the tournament worked, then the overall lessons I learned while participating in the contest. The second part (what you're reading) is a detailed chronological account of the contest from my perspective, explaining the notable events and how my strategy changed over time.

To avoid hindsight bias and show what I was thinking at the time, this post is largely composed of all the journal entries I wrote about the Salem contest over the last year. Warning, I wrote a **lot** about the contest during the periods when I was most actively participating, and as a result, this post will be *very* long.

> Quotes from my journal will look like this,

While after-the-fact notes look like this. For the first two and a half months, I didn't even mention the contest in my journal at all, so I've described what happened after the fact like this. I've also added graphs for each month (or half month), showing how the positions changed over that period.

# August

The contest began on August 7th (first non-Salem Center bet was at 06:02:59), but I didn't find out about the contest until August 16th, after seeing it [mentioned on the blog Astral Codex Ten](https://astralcodexten.substack.com/p/mantic-monday-81522). At the time, I had absolutely no experience with prediction markets or Manifold, but figured I should give it a try and see if I can win anyway.

When I joined, I assumed that I would discover a clever hack to shoot to the top, or perhaps write a high-frequency trading bot or something, since it seemed unlikely that I'd win playing normally. But for the time-being, I had to make my initial bets.

## Initial bets (Aug 16)

The only market I had an obvious edge in was "Will Elon Musk Buy Twitter?". From months of reading Matt Levine, I was convinced that Musk would be forced to acquire Twitter, but the market was only trading at 45.6%. (And before anyone asks, no I did not buy any real-money Twitter stock.)

However, [the contest rules](https://www.cspicenter.com/p/introducing-the-salemcspi-forecasting) said that you had to "spend at least $50 on each of 20 different markets". Therefore, I foolishly split the starting $1000 by betting $50 each on 20 different markets, even though I only had a strong contrarian opinion on one. In retrospect, I should have put everything on Twitter, and then if/when I won, I would have had plenty of money to spare and could easily put $50 on 19 other markets later with the winnings, but I didn't think of that until later.

I didn't bother trying to find undervalued markets, and ignored the market prices and just bet on whichever outcome I thought was most likely in each market. For the ones I didn't know anything about, I spent a couple minutes at most researching each market.

However, I did put a *little* strategy into my choices. Specifically, I chose most of the markets that would be resolving earlier than the Musk Twitter market, reasoning that I could reinvest my winnings into Twitter for additional profit. For the rest, I focused primarily on the markets that would be resolving earliest, though I did bet on a few longer term markets that seemed more interesting.

Here were my initial 20 bets:

```
2022-08-16 12:12:14 Will Elon Musk Buy Twitter?
  $50 for 102.323 YES shares (market price 45.62% -> 46.93%)
2022-08-16 12:13:53 Biden at 40% Approval on Labor Day Weekend?
  $50 for 67.950 YES shares (market price 71.21% -> 71.81%)
2022-08-16 12:14:58 Republicans Favored in Senate on Labor Day Weekend?
  $50 for 61.737 NO shares (market price 20.87% -> 20.47%)
2022-08-16 12:16:11 US GDP Growth 1% or More in 2022 Q3?
  $50 for 137.790 NO shares (market price 66.89% -> 65.25%)
2022-08-16 12:22:38 Will Russia control Kherson on 10/31/22?
  $50 for 75.707 YES shares (market price 63.20% -> 64.16%)
2022-08-16 12:23:59 Over 100,000 Monkeypox Cases in 2022?
  $50 for 114.178 NO shares (market price 59.60% -> 57.88%)
2022-08-16 12:24:57 Biden Cancels Student Debt in 2022?
  $50 for 77.816 NO shares (market price 38.65% -> 37.68%)
2022-08-16 12:26:25 Will Donald Trump Be Indicted for a Crime in 2022?
  $50 for 85.407 NO shares (market price 44.52% -> 43.48%)
2022-08-16 12:27:52 Will Russia Control Kramatorsk on 12/31/22?
  $50 for 88.098 NO shares (market price 46.39% -> 45.23%)
2022-08-16 12:29:19 COVID Falls Below 20,000 Cases in 2022?
  $50 for 244.537 YES shares (market price 17.85% -> 19.82%)
2022-08-16 12:33:38 Will Republicans Win Michigan 3rd District?
  $50 for 82.751 NO shares (market price 42.59% -> 41.58%)
2022-08-16 12:34:24 Will Trump Announce in 2022?
  $50 for 110.999 NO shares (market price 58.19% -> 56.83%)
2022-08-16 12:35:14 Will Republicans Win the Senate?
  $50.0 for 79.949 NO shares (market price 39.68% -> 39.00%)
2022-08-16 12:35:36 Will Republicans Win the Senate in Ohio?
  $50 for 62.870 YES shares (market price 77.45% -> 78.12%)
2022-08-16 12:36:44 US GDP Growth over 4% in any Quarter 2022?
  $50 for 63.458 NO shares (market price 23.56% -> 22.40%)
2022-08-16 12:37:09 Russia Annex Territory in 2022?
  $50 for 100.236 NO shares (market price 53.35% -> 52.08%)
2022-08-16 12:37:41 Will Republicans win the House of Representatives?
  $50 for 69.889 YES shares (market price 68.83% -> 69.95%)
2022-08-16 12:38:52 Will Republicans Win the Senate in Arizona?
  $50 for 76.913 NO shares (market price 37.83% -> 36.96%)
2022-08-16 12:39:59 Republicans Favored by Summer 2023?
  $50.0 for 121.577 NO shares (market price 61.68% -> 60.36%)
2022-08-16 12:40:38 Will Donald Trump Be Indicted for a Crime by July 2023?
  $50 for 107.675 NO shares (market price 56.79% -> 55.48%)
```

The whole process only took 28 minutes, and then there was nothing left to do but wait and hope my genius was rewarded and they all magically came up in my favor.

## First blood (Aug 24)

Spoiler: They didn't. On August 24th, the first market resolved, "Biden Cancels Student Debt in 2022?". I didn't expect him to actually cancel student debt, so I lost my first $50 there.

## Early chaos

After my initial 20 bets, I didn't make any more trades on Salem until September. However, I did come across comments talking about the chaos in the first few days of the contest (before I started).

As it turns out, at the start of the contest, the markets had extremely low liquidity, which, combined with a rush of inexperienced players who didn't understand the inner workings of Manifold, led to chaos as people would come in and bet large amounts on a market and the market price would swing it up to 99% or below 1% due to the lack of liquidity.


<img src="https://substackcdn.com/image/fetch/w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F9c7de71a-0a8f-4870-b35c-7d4ff3d0ff89_727x531.png">

Here you can see that the "Chinese Military Action against Taiwan?" market swung up to 99.0% on the second day of the contest. The only reason it stopped at 99.0% is because one savvy player had put a limit order at 99.0% in order to profit from just such a mistake. This led to massive profits for the few players who were able to exploit the wild price swings of the first few days.

As a result [Salem did two things](https://www.cspicenter.com/p/salem-tournament-5-days-in). First, they increased the liquidity pool for each market from $100 to $2000. Roughly speaking, this means that any given trade would move the market by 1/20th as much as before.

Additionally, they announced that they would subtract out first-day gains from player's scores for the purposes of rankings on the leaderboard. Players who managed to "unfairly" profit from the early chaos would still have an advantage, because they would have a lot more money to invest, making it much easier to gain more money in the future. However, the fixed score adjustment would at least give players who weren't there early and didn't luck out a fighting chance.

This all happened before I even heard about the contest, and I was a bit disheartened when I found out about it, since it seemed like I had missed my chance and the contest would be decided by who was in the right place at the right time in the first few days.

## August standings

Here's a graph of my score and rank over the course of August. My score varied from a low of 941.9 to a high of 1044.0 and is plotted on the left axis, while my rank varied from 32nd to 445th and is plotted on the right axis.

![Graph of my score and rank in August](/img/salem2/aug.png)

Since I didn't actually make any bets in August after I started, all this variation is due to market movement over time changing my "portfolio value" at market prices. You can, however, see a big dip on August 24th, when I lost on the student debt cancellation market.

# September

![Graph of my score and rank in September](/img/salem2/sept.png)

September was quiet, and went pretty much the same as August, with my balance jumping around randomly due to market movements.

The one notable event came on September 2nd, when the next two markets resolved in my favor ("Republicans Favored in Senate on Labor Day Weekend?" and "Biden at 40% Approval on Labor Day Weekend?"), and I duly reinvested the winnings in the Twitter Acquisition market.

```
2022-09-02 21:21:58 Will Elon Musk Buy Twitter?
  $129 for 307.863 YES shares (market price 37.66% -> 41.28%)
```

Conveniently, the market price was now down to 37.66%, even lower than my initial purchase in mid-August.

There was actually a third market that also resolved on September 2nd, "Over 400,000 Jobs in August?", but I didn't know that at the time, since I never bet on that market and hence didn't get an email about the resolution.

# October

![Graph of my score and rank in October](/img/salem2/oct.png)

October began with another bit of bad news when "Russia Annex Territory in 2022?" resolved YES on October 3rd. I couldn't believe that Putin would formally annex more of Ukraine, and thus lost my $50 there.

I didn't know it at the time, due to only checking Salem when I got a market resolution email, but there was a huge jump in my score and rank the next morning on October 4th as the Twitter Acquisition market suddenly went from 48.1% to 84.6%.

## October 27th

The next two market resolutions came on October 27th. (Or rather, the next two resolutions *for me*. "Fewer than 300,000 Jobs Any Month in 2022?" resolved on October 6th, but I wasn't in that market.)

The first, "US GDP Growth 1% or More in 2022 Q3?" went against me, as at the time I was pessimistic about the economy at the time and bet NO. Then came the important market, "Will Elon Musk Buy Twitter?", where I made my first big profit.

I wasn't sure what to do next, so for the time being, I just reinvested all my money in "Will Russia control Kherson on 10/31/22?". I noticed that it was still only at 89%, despite the fact that it would be resolving in just 3-4 days, and after the months of slow progress in Kherson, I couldn't imagine anything changing overnight, so it seemed like safe, easy money to me.

```
2022-10-27 18:25:49 Will Russia control Kherson on 10/31/22?
  $410 for 453.868 YES shares (market price 88.86% -> 89.97%)
```

This was the first of several markets I invested in which seemed like safe short term bets to earn a little bit of extra money, which I thought of almost like an "interest rate".

# November 1-15

The first two and a half months of the contest were very quiet for me, but everything changed in early November.

![Score graph](/img/salem2/nov.png)

## Initial plans

By late October, I had grown alarmed at how much time and thought I was devoting to the Salem contest when I was unlikely to actually have any chance of winning. At the time, I had no idea what my rank was or how far away the top players were, but I assumed they were significantly higher, and thus that I'd have to double my money to even have a shot at the leaderboard.

Therefore, I came up with a plan. I would bet everything on Democrats in the midterms, and either lose everything, in which case I would stop participating in the contest and stop wasting my time, or else win big and thus hopefully be a serious contender in the contest.

However, for the time being, I invested my free money in one last "risk-free" market for a quick 10% return, "Biden at 40% Approval on Election Day?", which would conveniently be resolving the morning of election day, just in time for me to bet on the midterms.


```
2022-10-31 22:18:12 Biden at 40% Approval on Election Day?
  $530 for 587.881 YES shares (market price 88.49% -> 89.96%)
```

## Election day (November 8th)

At 06:53 on November 8th (morning of Election Day), right before I made my election bets, my score (portfolio value at market prices) was up to $1252.69, a 25% gain over the starting $1000. I didn't know it at the time, but I was in 74th place, with 1st place at $5554 and 20th place at $1603.


The final "deluxe" forecast from 538 gave Republicans a 59% chance to win the Senate. (It later turned out that [there was a minor data error](https://fivethirtyeight.com/features/how-a-data-processing-error-changed-our-deluxe-forecast/) with the Deluxe model, and it would have given Republicans 55% using the correct data, but noone knew that at the time.)

However, prediction markets were much more bullish on Republicans than 538, and Salem was no exception, with Republicans at 73.4% to win the Senate at the time. I had heard that prediction markets long had a noticeable pro-Republican bias, as most vividly demonstrated by the fact that they gave Trump a significant chance of winning in 2020 *even after Biden had been sworn in as president*.

I'd read Richard Hanania's [The Problem with Polling Might Be Unfixable](https://www.richardhanania.com/p/the-problem-with-polling-might-be), which argued that polls might have a systematic pro-Democrat bias that is impossible to correct for. It seemed plausible, given that Trump outperformed the polls in 2016 and 2020, and even in 2018, when the polls were spot-on overall, Democrats lost a lot of close Senate races. I didn't think that that conclusion could really be drawn from just two data points, when there is so much noise and when pollsters are constantly adjusting their methods to attempt to correct for identified bias. But the argument seemed plausible, and I figured if it happened a *third* time, it would be looking pretty good.

On the other hand, there were also reasons to think that 538 might be *underestimating* the Democrats' chances. I'd been following Paul Krugman on Twitter, who argued that Biden's approval ratings had been closely tracking gas prices up and down. 

With gas prices falling in late October, a continuation of this trend would presumably lead to a steady increase in Democratic support, and since polls are a lagging indicator, that would imply that the polls were slightly underestimating Democrats. (As it turns out, it appears that gas prices ticked *up* slightly in the week before the election). But overall, I didn't really know much, and figured that 538's estimate was the best predictor, or perhaps slightly more to account for the chance of Hanania being right.

As it turns out, I was actually right about the prediction markets being heavily biased towards Republicans, but it's not like I can really pretend to have called this. After all, if you think something has a 60% chance of happening and the market price is at 73%, that's still normally not a reason to go all in on NO. And I did go to bed thinking Republicans were more likely to win than not.

The real *main* reason I went all in on Democrats is that I *already* had some small bets on them, and so it made sense to double down. (And of course, the odds were *much* better as well - there wasn't much money to be made betting on Republicans anyway!)

Back in mid-August when I started the contest, things were looking good for the Democrats, and thus when I placed my initial $50 bets, I bet on Democrats in nearly every midterm contest (I did still have Republicans to take the House of Representatives and the Ohio Senate seat.) By late October, the polls had reversed, and if I had started in October rather than August, I probably would have bet on the Republicans instead. But fortunately, that didn't happen.


Anyway, I sold all my initial $50 bets that weren't already invested in the various midterm markets, and combined with the winnings from Twitter and the Kherson/Approval "interest", I had $997 in free cash to invest.

I decided to split my big bet between two markets in an attempt to reduce slippage, and chose "Will Republicans Win the Senate?" and "Will Republicans Win the Senate in Nevada?", since based on the coverage I'd read, I thought that Nevada was the individual race where Democrats had the best chances. (I was particularly worried about Fetterman's chances, which turned out to be the opposite of correct.)

At the time, I had no idea how the liquidity or market making worked. I didn't know anything about Manifold's automated market making algorithm, and assumed that the markets just functioned based on crossing orders with people betting the other way somehow. I guessed that liquidity would be roughly proportional to the "total amount bet" display and initially tried to split the bets proportionately, but then gave up on that and split the money roughly equally, $522 on the Senate and $475 on Nevada.


```
2022-11-08 06:53:48 Will Donald Trump Be Indicted for a Crime by July 2023?
  $-40.1908112464 for -107.675 NO shares (market price 59.59% -> 60.85%)
2022-11-08 06:54:02 Republicans Favored by Summer 2023?
  $-46.261929156 for -121.577 NO shares (market price 58.69% -> 60.29%)
2022-11-08 06:54:10 US GDP Growth over 4% in any Quarter 2022?
  $-53.8043951876 for -63.458 NO shares (market price 13.66% -> 14.16%)
2022-11-08 06:55:04 COVID Falls Below 20,000 Cases in 2022?
  $-29.8252755891 for -244.537 YES shares (market price 13.90% -> 12.76%)
2022-11-08 06:55:18 Will Russia Control Kramatorsk on 12/31/22?
  $-65.4022055518 for -88.098 NO shares (market price 23.49% -> 24.13%)
2022-11-08 06:55:28 Will Donald Trump Be Indicted for a Crime in 2022?
  $-55.1746640661 for -85.407 NO shares (market price 32.60% -> 33.49%)
2022-11-08 06:55:38 Over 100,000 Monkeypox Cases in 2022?
  $-101.981483177 for -114.178 NO shares (market price 9.60% -> 9.84%)
2022-11-08 06:56:17 Will Trump Announce in 2022?
  $-16.7367339772 for -110.999 NO shares (market price 83.28% -> 83.82%)
2022-11-08 06:59:15 Will Republicans Win the Senate?
  $522.0 for 1477.001 NO shares (market price 73.41% -> 59.55%)
2022-11-08 07:00:11 Will Republicans Win the Senate in Nevada?
  $475 for 1261.301 NO shares (market price 70.93% -> 57.39%)
```

Despite splitting my bet between two markets, they still moved the markets significantly (73->60% and 71->57%), and people quickly pushed the market price back up, so I could have gotten a lot better prices if I had split my bets up into multiple purchases and waited for the market price to bounce back in between. But of course I didn't know that at the time, and wasn't trying to put much effort into something I didn't expect to pay off anyway.

... and then it was time to wait and forget about Salem and isolate myself from the news.

## Election night

As usual, I completely avoided the news on election night and didn't check the results until the following morning in order to minimize pointless stress. I also mentioned the Salem contest in my journal for the very first time:



> **08.11.22**

> **22:15** - ...I deliberately avoided the news this evening. I'm planning to check during the day tomorrow to avoid pointless angsting, since it's not like we can do anything about it anyway other than just wait. I do know that Republicans won the senate in Ohio because the Salem Contest Manifold markets thing sent me an email about the market resolution, so that rules out a massive *blue* wave, but that's it.

Note: The first market to resolve that night was actually "Democratic Governor in Texas or Florida?", but I didn't bet on that one and hence didn't get an email for it. Besides the Ohio Senate, the only other resolution email I got was "Will Republicans Win Michigan 3rd District?", which resolved NO at 3:30am that night.

I didn't know this at the time, but the first couple hours of results on election night were apparently favorable for Republicans, so it's a really good thing I wasn't following the results live. The Salem markets naturally swung R during this time, causing my score to reach a low of 843.6 and briefly sent me all the way down to 681st place, my lowest rank during the entire competition.



## November 9th


> **09.11.22**

> **08:08** - ... I also got another email from Salem saying that Republicans did not win the Michigan 3rd district.

> **09:19** - ... Anyway, with all the layoff drama, I figured I might as well go ahead and check in on the election results as well. Looks like things are very close, though Republicans still have a slight edge. But even the fact that it is close is a really good night for the Democrats. It was about the best that could be expected, given how dire things had been looking for the last month.

When I finally checked in on Salem on Wednesday (the 9th), I kicked myself for not betting on Fetterman, as that market had already resolved overnight. But of course, there was no way to know that in advance.


The next mention of Salem in my journal wasn't until the 12th, when I finally got around to describing it in detail and recounted pretty much the same history described here, as well as the post-election night bets:


> **12.11.22**

> **08:20** - ... Anyway, I should explain the Salem Center thing now. In early August, the Salem Center at the University of Texas launched a prediction market contest on Manifold. Everyone starts with $1000 of virtual money and can bet on various prediction markets. They're looking for a new research fellow and said they would choose between the top 5 finishers of the contest.

> I found out about the contest on ACX and decided to give it a try just for fun. I don't know much about prediction markets and didn't plan to put much effort into it, but I figured I might as well try and maybe I'd manage to get into the top five anyway. Obviously, I don't actually want the job, but I thought it would be cool if I won just for bragging rights.

> The original rules required you to spend at least $50 on 20 different markets in an attempt to prevent people from just getting lucky on one or two bets. Of course, they quickly changed the rules to be a lot more subjective, saying they would carefully consider everyone's patterns of betting, etc. to avoid abuse of the system or people just getting lucky.

> Anyway, the only market I was really confident on that the market was seriously undervaluing was Musk to acquire Twitter, but I foolishly decided to just split the starting $1000 equally between 20 markets, just randomly betting on whichever side seemed most likely to me in each case, and planning to reinvest the proceeds of early resolving markets back into Twitter. In retrospect, I realized that I should have just put everything into Twitter, and then once I'd massively increased my bank roll, throwing 20 into 19 other markets would be a lot less onerous. Oh well.

> As it turns out, of the five markets to resolve pre-Twitter, I only won two (Biden approval 40+% on Labor Day - YES and Republicans favored in Senate on 538 on Labor Day - NO) and lost three (Biden Cancels Student Debt in 2022? - NO, US GDP Growth 1% or More in 2022 Q3? - NO, and Russia Annex Territory in 2022? - NO). So I was able to double down on Twitter, but not that much.

> After Twitter resolved, I reinvested into short term high probability bets to eke out a few extra bucks (first Will Russia control Kherson on 10/31/22? - YES, then Biden at 40% Approval on Election Day? - YES).

> When it resolved on Election Day morning, my "portfolio value" was up to around 1250-1280, but figured I had no chance of winning like that and that I might as well gamble everything on a risky bet, since I wasn't going to win anyway otherwise. Therefore, I sold all my non-election related bets and split everything between NO on Will Republicans Win the Senate? and Will Republicans Win the Senate in Nevada?.

> I remember that I bought the latter from 71% down to 60%, but it almost immediately started going back up again (lots of people betting on election morning). All of the Salem markets were significantly more pro-R than even 538's last forecast. I know other prediction markets were also more R leaning than 538, especially PredictIt, but PI has a notorious pro-R bias. At least it further increased the margins on my bets.

> As mentioned, two of my original bets (Will Republicans Win the Senate in Ohio? - YES and Will Republicans Win Michigan 3rd District? - NO) resolved on election night, but then nothing until Thursday night. Wednesday evening, I finally checked in on Salem again for the first time in a day and a half and saw that I was up to 2075, and in 15th place on the leaderboard.

> I was shocked, since I didn't think that even doubling my money would be enough to get onto the leaderboard. Of course, I'm probably much farther from the top 5. In order to discourage people from gambling everything on risky bets to improve their ranking, the leaderboard does not actually show anyone's value, just the names and ranking, and just for the top 20.

> I was tempted to sell to lock in my gains, but balked at the massive slippage it would entail, which is just as well. Instead, I just plowed the winnings from Michigan and Ohio into another sure-win market (Michigan Abortion Rights Landslide? (60+% of the vote) - NO) that hadn't resolved yet for some reason (7% at the time) to earn a few extra bucks.

> After I got back from Safeway last night, I saw the first resolution since election night, (Will Republicans Win the Senate in Arizona?) and put the money into another sure-win, (Another Polling Miss in the Midwest and Pennsylvania?, aka 3+% pro-R average polling miss in midwest + PA), which was down to 4%, just like the Michigan abortion market.

> Anyway, the Michigan abortion and polling miss markets finally closed this morning, and there weren't any sure-wins left, so I put the money into Nevada Senate (buying it from 10% down to 9%), as I realized that if I lose my big bets, I'm toast anyway, so I might as well double down. My portfolio value is currently up to $2916, and I'm now 12th on the leaderboard.

```
2022-11-09 19:24:53 Michigan Abortion Rights Landslide?
  $146 for 156.282 NO shares (market price 7.38% -> 7.11%)
2022-11-11 20:31:14 Another Polling Miss in the Midwest and Pennsylvania?
  $77 for 80.017 NO shares (market price 4.20% -> 4.14%)
2022-11-12 07:48:27 Will Republicans Win the Senate in Nevada?
  $236 for 259.092 NO shares (market price 10.14% -> 9.41%)
```


> **12.11.22**

> **18:34** - My big bets on Salem just resolved, leaving only one small bet (R to take house, ironically enough). Each market shows the top 5 bettors in total profit as well as a "proven correct" and "smartest money" listing with unclear methodology. I got "smartest money" in both.

> For Republicans to take Senate overall, it says "Robert Grosse bought S$522 of NO from 73% to 60% 4 days ago Robert Grosse made S$955!", but then I'm listed in 4th under Top Bettors with a total profit of only $984 (first was John Gross-Whitaker with 1271). Presumably the discrepancy is because I also put $50 in back in August, which had gone down in value as the Rs rose in the polls. The "smartest money" section must be showing my total profit  *since the big bet on election day*, including the re-appreciation of the original 50, while the top bettors must be counting total money won from when the bet was placed, rather than Tuesday.

Note: Smartest Money actually just shows the profit for the one specific bet that was chosen, so the initial $50 had nothing to do with it. And 955 < 984 anyway. I'm not sure why I thought otherwise.

> On the Nevada Senate market, the smartest money said "Robert Grosse bought S$475 of NO from 71% to 57% 4 days ago Robert Grosse made S$786!" (which incidentally shows that I didn't quite remember the odds at time of my purchase correctly). Meanwhile I'm 2nd under Top Bettors with total profit $809 (First is David Hassett at 1566). Presumably this time, the total profit is higher because the smartest money isn't counting the extra bit I put in last night? It's interesting to try to reverse engineer what it is saying like that.

> Anyway, I'm now at 3134 portfolio value (3077 cash) and up to 10th in the rankings. John Gross-Whitaker is at 15th while David Hassett is up at 6th, which makes sense given his massive winnings in Nevada. Anyway, I'm planning to just leave things be for a while while I decide what to do next, since I actually have a good shot and there aren't any easy wins left now that the elections are over.


## November 13th

I didn't notice this at the time, but I was briefly up to 9th place from 16:13 to 17:35 on the 13th. However, I ended the first half of the month in 11th place.

# November 16-30

![Score graph](/img/salem2/nov2.png)

With Election Week almost over, the second half of November was *much* quieter than the first half. (There were around three times as many bets in the first half of the month as in the second.) However, there were still a few notable events, and one major lesson I learned the hard way.


> **16.11.22**

> **08:12** - P.S. Yesterday evening, I got another resolution email from Salem, for "Will Trump Announce in 2022?". Which is odd, since I of course sold everything. It claimed my investment was 33 and my payout 0. In reality, I put in 50 at the start and sold for 18 on election day, so presumably a bug causes it to think the difference was still invested for the purpose of the email sending. I guess this means I'm going to be getting resolution emails for every market I've ever participated in as well. Or at least the ones where I sold for a loss.

Note: I'm still a bit baffled by this one. I assume that a rounding bug resulted in me still having an infinitesimal fraction of a share, and so it mistakenly thought I was still invested in the market and thus the email still triggered. But if so, it somehow didn't even show up in the API, because the logs show that I bought and sold exactly 110.998594394 shares each time. 

Perhaps it really does just email everyone on resolution if you've ever invested in the market, even if you later sold everything. I don't think I ever fully sold out of a market again without buying back in like this anyway, so I wouldn't know. 

> **08:55** - I decided to go ahead and throw all my money into the "Republicans to take House" market in Salem. Of course, lots of other people already had the same idea, and I purchased it from 99.3 to 99.4%, with a profit of 18 off of 3077 if I win. It looks like it shows 0.1% increments once it goes above 98%, something I'd never seen before. The 3rd place, Connor Pitts, put over 6k into it last night, and I'm sure the others have large amounts as well. I'm also down to 11th in the rankings. Oh well.

```
2022-11-16 16:43:49 Gay Marriage Bill in 2022?
  $3166.0 for 3198.238 YES shares (market price 98.69% -> 99.00%)
```

## The gay marriage fiasco

As mentioned, I had earned "interest" in late October by betting on near-certain markets that would be resolving shortly, and continued doing so with a succession of unresolved markets on Election Week following the midterms. Naturally once the House market finally resolved, there was the question of what to do next with my money. In the afternoon, I noticed that "Gay Marriage Bill in 2022?" had spiked and decided to pile in. Unfortunately, this turned out to be a huge mistake, as described in [the previous post]({{prev_url}}).


> **22:28** - Late this afternoon, I checked in on Manifold again, since the House had finally been called earlier. I noticed a market, "Gay marriage bill in 2022" which had suddenly shot up and was at 98.7%, usually a sign of a near-sure win, so after reading a news article for confirmation, I threw everything in. As usual, Connor Pitts was there 35 minutes before me with his 6.5k stack. I'm also down to 12th place now.

> Of course, now that I'm in the big leagues, the people ahead of me are all the ones who actually know what they are doing and are willing to spend time obsessively checking the news to quickly pounce on easy wins (and have much larger bankrolls besides). My plan was (and is) to wait until this weekend and figure out the state of things and decide what to do going forward. I figured that with all the election stuff out of the way, things would be pretty static, so it's disappointing that I've already dropped two ranks again. Oh well, hopefully I'll figure out some sort of clever quant trading strategy and zoom up the ranks.

```
2022-11-16 16:43:49 Gay Marriage Bill in 2022?
  $3166.0 for 3198.238 YES shares (market price 98.69% -> 99.00%)
```


> **19.11.22**

> **15:18** - ... My goal for the day was to start investigating the Salem Center Manifold stuff to try to figure out how things worked, what the rankings were, and come up with a strategy to advance. Naturally, I ... didn't get to Manifold until after 3pm.

> When I got in, I noticed that the Gay Marriage Bill market was down to 95%. The top ranked player, Johnny Ten-Numbers, has been buying it down and started a discussion asking why everyone was so confident, saying that " The current leaderboard numbers 3, 4, 8, 10 and 12 have pretty much bet their entire fortunes" (the last being me of course). I suppose if it does somehow fail, at least I'll be in good company! To be honest, I saw everyone rushing in and assumed it would be resolving shortly. One of the commenters (zubbybadger, not ranked) said they think it will pass in the first week of December. Of course if I had known it would take so long to resolve, I wouldn't have jumped in, just for the sake of having liquidity in the intervening weeks. Oh well.

It's funny to see Zubby talked about like a nobody at this point, since he ended up winning the entire contest.

> Anyway, after seeing that, I figured I should write this journal entry, so I haven't actually started researching Manifold yet. Not that it will matter *too* much if there's nothing I can do until mid-December anyway.

## Learning about Manifold

When I first started the contest, I had no idea how Manifold actually worked, but after getting catapulted onto the leaderboard following the midterms, I realized I actually had a chance and should start actually trying, and as alluded to in the above journal entry, the first step was to research how Manifold actually worked.

Previously, I had assumed that the market prices were somehow determined by crossing YES and NO bets. However, a bit of googling revealed that Manifold actually uses an algorithm for **automated market making**, a concept I had never heard of before. You can find the details online if you want, but the bottom line is that it means that market price changes in response to bets are determined by a simple fixed algorithm, rather than relying on users to make the market and cross orders manually. One consequence of this is that there's always a little bit of potential profit available even at extremes, such as when the outcome of the market is already certain and it just hasn't resolved yet.

The other prong of my research was to write a script to scrape the public bet histories and reverse engineer everyone's portfolios and scores, and thus the leaderboard.

> **20.11.22**

> **16:07** - ... Anyway, yesterday evening, I (finally) got around to the Manifold thing and worked on that for an hour or two. The page for each market shows a complete list of bets, with the player, amount, and approximate probabilities (e.g. "Spencer Henderson bought S$168 of YES from 52% to 56% 8 hours ago"), although it doesn't show the shares received. I had assumed that I would just have to scrape those pages and then approximate the number of shares received based on the start and end probabilities, which would at least let me estimate the current standings and portfolio of each player.

> Fortunately, it didn't come to that. As it turns out, the page source shows much more detailed data, including the exact amount of shares received for each bet (as well as the exact start and end probabilities, whether it was a limit order and if so how and when it was filled, etc.). Even better, Manifold also has an API to get this data so I didn't have to scrape it all by hand. After some trial and error, I wrote a Python script to use the api to get the data for each market, and then added up all the bets to get the current holdings of each player and their current total market value.

> At least as of yesterday evening when I scraped the data, the current standings are 1st - 8924, 5th - 5334, 10th - 3255 (and me at 3034 in 12th - of course there's lots of people close behind me as well.) It will be a tall order to triple my money relative to Johnny Ten Numbers, but hopefully I'll figure out a way to do that.

> I also discovered in the process that the market probabilities as well as share amounts and money are arbitrary decimals and it just all gets rounded in the UI, which makes sense and explains a lot. The API also has options to place and cancel bets as well as just fetching data, which would allow things that are impossible through the normal website such as setting a limit order at an arbitrary decimal price, though I doubt it will ever matter much.

Note: The API doesn't actually let you do this.

> My plan for today was to further dig through the data to a) figure out how the trading fees work and b) look at the holdings of the top players and their bet histories to try to understand what strategies they might be using. As usual, I was hoping to get started early, but it is already 4:21pm and I haven't started yet. Oh well.

> **21.11.22**

> **06:07** - I spent a while looking through all the markets and the top players' portfolios, but I still haven't come up with a plausible strategy yet. I'm now down to 13th, though I'd be in 11th if the Gay Marriage Bill market magically resolved. One notable discovery is that Mike Aniello, then 11th, has most of his money on Republicans to win the Georgia Senate seat and would be instantly catapulted near the top two if that actually happens.

> I also spent considerable time trying to reverse engineer the fee formula, looking at the before and after numbers for a couple bets and trying every combination I could think of, but nothing matched up. Eventually, it occurred to me that Manifold is open source and I could just look up the code, which I did. So that was pretty embarrassing. Oh well.

My plan to figure out a good strategy by looking at what the top players were doing was a complete bust, but one nice side effect of the Python script is that, as alluded to above, I could also ask it to calculate what the leaderboard would be under hypothetical scenarios if a market magically immediately resolved a certain way.

## The Desktop

To be clear, I didn't exactly have real time information from the script. I'd been using a Chromebook as my main computer for many years, and had a Linux desktop that I only sometimes booted up on the weekends for the purpose of programming projects like this, and thus all my Salem stuff was on that desktop and only accessible on the weekends. When I work from home, I use the same monitor, keyboard, and mouse, and thought it was a hassle to constantly plug and unplug the various computers and move the monitors around, so I only bothered to fire up my personal desktop on the weekends.

Additionally, the script took a minute or two to fetch updated data from the API, so I only occasionally bothered to do so. So I only checked in on the Salem standings via my script every week or two, but it was still better than not having the information at all, I guess. Initially, the script wasn't of much use, but I continued tweaking it and adding functionality over the course of the rest of the contest, and I made a lot more use of it later in the contest.



> **01.12.22**

> **08:11** - I forgot to mention that yesterday, I went to Salem Markets again and noticed a new comment from ussgordoncaptain (current #8) on the gay marriage market explaining that "I wagered it thinking this was a simple resolution hop event not looking hard enough, sadly at this point it's too hard to sell out", so exactly what happened to me as well. At least I'm in good company. I'm also back up to #11, but that's probably just random variations in the market values, since not much happened last week.

# December

December was again quiet for me, up until the last week.

![Score graph](/img/salem2/dec.png)

## The GA Senate Runoff (Dec 6)

The main event of December was the GA Senate runoff election on the 6th. Unfortunately, I had foolishly locked up my money in the Gay Marriage market weeks ago and thus couldn't actually do anything on Salem other than watch helplessly. But that didn't stop me from trying anyway:

> **04.12.22**

> **19:11** - I also spent a while this evening looking into the Salem/Manifold stuff some more. I realized that I am effectively in 12th place rather than 11th, because the current 12th, Asher Gabara, is hot on my heels and has a big bet on Warnock besides. On the other hand, if Walker somehow manages to win (and the gay marriage bill goes through), I'd be in 10th. But of course I wouldn't hope for a tragedy just for the sake of gaining a few points in a pointless competition.

> I also discovered that Andy Martin, a newcomer to the leaderboard (currently 14th) is all in on "China Reaches 100,000 Covid Cases by Winter", which seems increasingly likely (hence their rise through the ranks).

> **05.12.22**

> **08:07** - When I looked into Salem last night, it showed one player (Max) with a *negative* balance, which shouldn't be possible, thus indicating a likely bug in my code. But it's probably not too serious, since everything else makes sense, probably just improper handling of open limit orders or something like that.

> **06.12.22**

> **21:50** - After work (and to be honest, even before, starting around 4pm), I checked in on 538 to watch the election results come in. If the outcome became clear before the markets on Salem adjusted, it might have made sense for me to sell part of my stock in Gay Marriage, even at a loss, to play the GA senate market.

> However, Johnny Ten Numbers (the longtime first-ranked player) bought Gay Marriage down to 92% (with just $60), and GA Senate from 15% down to only 6% (with $3000) early on, ruling out any possibility of profit there, unless Walker somehow won out of nowhere and noone got the news before I did. I was especially frustrated to see Johnny betting big on the senate since the profit on that one bet alone would be way bigger than anything I'd get on gay marriage even if/when it passes, and bigger than most wins I could plausibly hope for in the future. Incidentally, there was also bad news on that front, as the House was supposed to vote on the Gay Marriage bill today, but it was delayed for unclear reasons.

> It didn't take long after 5 to decide that there was negligible chance of Walker suddenly winning, and I stopped paying attention to the news and markets.

## Some Bankman Fraud (Dec 12)

On December 12th, Sam Bankman-Fried was indicted, leading to huge profits to whoever was fortunate enough to see the news first and bought up the market on Salem. (It looks like Ussgordoncaptain was first, with Johnny and then Josiah Neeley joining in later).

This didn't affect me, since my money was still locked up, and in any case the whole spike and resolution happened in the space of an hour and I only found out about it well afterwards. However, this was presumably the cause of the huge jump in 8th place on December 12th in the graph above.

## Gay Marriage (Dec 13)

On December 13th, the Gay Marriage market *finally* resolved, thus unlocking my money after nearly a month of forced inaction. However, I didn't actually have any plans at the time and just left my money in cash for the time being.

## Disillusionment (Dec 18)

> **18.12.22**

> **21:36** - ... Later this evening, I checked in on Salem/Manifold again. I'm now down to 13th, but more significantly, the top 5 now all have more than double my money, and Johnny is up to over 12k. I was reluctantly forced to come to the conclusion that I just don't have any chance and it is best if I just stopped even wasting time thinking about it entirely. It's especially frustrating because it feels like the kind of thing that I should be good at, with my math and programming skills. I think that maybe if I had been more experienced and had even gotten around to programming a trading bot like I wanted to, I might have had a chance, but I never got around to it and it is obviously too late now. Oh well.


## Final Bets (Dec 19)

> **20.12.22**

> **21:44** - ... I spent the rest of the evening on Salem, despite my decision to abandon it just the night before. I decided to go back and divided my money up between the five near-certain markets that will be resolving at year end (e.g. Recognition of Taliban in 2022, Trump indicted of crime in 2022, etc.). I figured that there's a chance I might decide to get really into it in January and actually write and set up a trading bot, maybe just to see how I'd do out of curiosity or see if I can get back into the top 10 at least even though there's no prize for that. The year-end markets were already down to 3-4%, but even a 3% return should help slightly reduce the ground I'm constantly losing to the higher ranks until January.

Note: The entry is dated December 20th, but I was writing about what happened the previous day on the 19th:

```
2022-12-19 20:43:04 Will Donald Trump Be Indicted for a Crime in 2022?
  $500 for 519.404 NO shares (market price 4.32% -> 3.91%)
2022-12-19 20:47:31 Over 100,000 Monkeypox Cases in 2022?
  $500 for 515.150 NO shares (market price 3.35% -> 3.15%)
2022-12-19 20:48:24 Recognition of the Taliban in 2022?
  $100 for 102.165 NO shares (market price 2.56% -> 2.12%)
2022-12-19 20:50:40 New Iran Nuclear Deal in 2022?
  $500 for 519.283 NO shares (market price 4.25% -> 3.94%)
2022-12-19 20:53:19 Will Russia Control Kramatorsk on 12/31/22?
  $500 for 515.891 NO shares (market price 3.51% -> 3.29%)
2022-12-19 20:55:36 COVID Falls Below 20,000 Cases in 2022?
  $500 for 515.633 NO shares (market price 3.46% -> 3.24%)
```

## Limit Orders

In addition to throwing most of my money into risk-free interest rate markets before I left for Christmas vacation on the 21st, I crucially also experimented with **limit orders** for the first time.

I was aware that the top players were using limit orders, but had no idea how they worked and hadn't bothered to try them out myself yet. The first thing I discovered is that they don't lock up your money like I had assumed. I had assumed that when you place a limit order, it also reserves an equivalent amount of your cash in order to ensure that the limit order can be filled when applicable.

However, it turns out that that isn't the case, and you can place *multiple* limit orders with the same amount of money, and so I did. I put one limit order at a little above market price for each of the five near-certain markets, and then randomly decided to place a large way-out-of-the-money limit on China COVID as well for fun. Fortunately, fate smiled upon me and I got very lucky with that limit order.

> **28.12.22**

> **22:01** - When I accidentally checked the Salem markets again this morning, I was surprised to see a balance of -$100. Before I went on vacation, I had 3098, and I put 500 into each of the five near-certain markets that would be resolving at the end of year, and left the remaining 598 as dry powder.

> I tried entering a limit order for the first time, putting one down for Trump Indictment at 10% for 598 (it was 4% at the time) to hopefully profit in case someone did a big dumb order pushing the price way up. Then I tried putting in similar limit orders on a couple other markets. I had assumed that putting in a limit order locked up the relevant capital, but apparently not. It let me put in multiple limit orders backed by the same money. For fun, I also put one for 598 at 70% on the China COVID market. It was 39% at the time, and it is riskier and doesn't resolve until the end of February so I left more of a margin. I didn't think anyone would ever put in such a huge order to actually hit it, but figured I should do it just for fun.

> Anyway, that's where things stood for a week, but then yesterday, I decided to put another 100 down on Trump Indictment (NO), since the deadline was approaching and I figured I should try to lock in at least 4% while I still could, leaving me with 498 in free cash.

> It turns out that not long after that, Dylan Levi King, formerly around 20th place, apparently went crazy and put 2,486 (presumably their entire stack) into YES on China COVID, buying it up to 72%, and thus filling my huge-way-out-of-the-money limit order, a huge lucky break for me.

> When I saw that it let you put in multiple limit orders with the same money (and even spend the money afterwards), I had assumed that it would just only fill limit orders up to your available money. However, that is not the case. My entire limit order was filled, bringing my free cash balance down to -100.

> Even weirder is that four hours after Dylan Levi King's initial splurge, they sold everything and went all in on NO instead, bringing it down to just 16%. And then I got a second, more minor lucky break, as they had just happened to decide to buy it back up to 61% *again*, only ~30 minutes before I happened to check this morning.

> Users had already bought it down to 52% when I saw it, but I decided that at that price, it made sense to sell some of my stacks in the Dec 31 markets and get more China shares, even though selling incurs huge losses, and I also had to fill in the 100 deficit first. And thus I put 498 more in, buying down to 39% (it is currently at 27%, but it seems very unlikely at this point, and in any case, I'm pretty much committed to assuming it resolves NO).

> Anyway, Dylan's generous donation very luckily hitting the one limit order I put out catapulted me up to 9th in the rankings, and it might be even higher once the China market resolves at the end of February. So that was extremely fortunate. Another break like that and I'd have a decent shot of the top 5, though it's hard to expect lightning to strike twice.


# January 1-15

![Score graph](/img/salem2/jan1.png)

Thanks to the lucky break in the China COVID market courtesy of Dylan Levi King, I ended December up in 9th place, and thus when I returned from Christmas vacation in January, I felt like I had a real chance and started participating on Salem far more actively than before.

Initially, I tried to make lightning strike twice, by placing limit orders way above/below market prices in various markets, hoping that a dumb whale would donate money to me like Dylan Levi King happened to do over Christmas in the China COVID market. However, that strategy ended up not working and even backfired in several cases when the markets suddenly shifted for legitimate reasons, so I was forced to abandon that tactic.

Instead, I started checking the Salem website frequently, several times a day in the morning and evening, in hopes of just happening to be the first person to check the website after a massive dumb-money price swing that I could profit off of by trading against.

The other big event of early January was the Q4 GDP >= 4% market. I thought it was massively undervalued, since the Atlanta Fed's GDPNow website was predicting first 3.9% and later up to 4.1%. It seemed crazy to me that the market price would be as low as 12% when GDPNow was forecasting 4.1% GDP growth, and I bought it up to 25%, and was continually surprised when it failed to spike following the GDPNow updates and in fact went back down.

I found the schedule for GDPNow forecast updates and made a point of checking the website when each update was scheduled, because at the time, I assumed that other people would be checking and trading based on the same website, and thus I could profit by doing it first. However, it seems that hardly anyone else was doing so, as the markets stubbornly kept going back down, and also didn't seem to react at all in the hours following the GDPNow updates. I guess everyone else had different preferred news sources.


> **10.01.23**

> **22:24** - I guess I should talk about Salem as well. I've been a lot more active in Salem for the last week. Sadly, I actually lost ground as far as "portfolio value" goes in that time, due mainly to getting caught out with a bad limit order.

> It started Tuesday morning last week when I saw GDPNow update to 3.9% and bought the Q4 GDP >= 4% market from 9% up to 18%. I got cold feet later, especially after the Thursday update dropped down to 3.8%, but I managed to cash out a little part with a limit at 20%. This morning, the latest update jumped up to 4.1%, and I bought the market up to 25% and left a limit order there (and thus bought more when people pushed it back down). So far, it has been sold back down to 20%. It's so nerve-wracking, especially since it's just an "expected value" bet - the actual resolution is very far from certain.

> The big hit came yesterday though. Since December, I'd started putting in a lot more limit orders to try to profit in the unlikely event of a wild price move. I put in $444 at 44% on Russia to control Bakhmut at a time when it was in the 20s and there seemed to be no chance of it actually happening, but yesterday, the probability jumped up with the news of Russia's renewed assault, and my limit order unfortunately got filled. That's one of the risks of limit orders - there's always a chance of new information when someone is betting, even if it seems unlikely a-priori. Which is incidentally a reason why I never put any limits on something like "DeSantis to run for President" - conditional on the probability shooting up, it is very likely due to new information.

> I put in a corresponding YES limit on Bakhmut at 43% this morning, hoping that people would push it back down slightly and cash me out, but instead, it kept going up. I upped my limit to 46% this afternoon, but the market is now up to 51%. I'm regretting not buying a bit with quick orders, but of course hindsight is 20-20, and it is frustratingly hard to find actual news from Ukraine.

> The one semi-bright spot for the time being is the China COVID market. I got really worried yesterday morning when the latest report was 14k cases, uncomfortably close to 100k. During the day, someone bought it up to 62%, but as I was panicking, I didn't try to buy it back down (people since took it back down to 37%, so at least the others are more confident than me). Today, there was no report at all, and I have no idea what to make of that.

> Anyway, playing Manifold is surprisingly nerve-wracking, even though there are no real stakes other than bragging rights, and I only got to the position I am in now by being pretty lucky in the first place. Still, I really want to win.

> **11.01.23**

> **20:52** - As far as Manifold goes, not much is new, except that three days ago, back when I was panicking about the China market, I put in a YES limit for $340 at 34%, and after the spike later that day, the market has continued falling, and this evening someone pushed it all the way down to 34% and bought out my limit, thus cashing out 1000/2868 of my shares.

> I don't understand why the rest of the market is so confident, and I also don't understand why the page I was looking at (from the China CDC) hasn't reported *any* regular daily reports since the 8th. But I guess my risk in that market is reduced now. Of course, the paradox of these things is that you always feel bad about limit sales, no matter how they happen. When the market finally moves enough to hit your limit, it suddenly feels like they know something and you're just leaving profit on the table by cashing out. Oh well. On the Bakhmut front, I upped my limit to 52%, but still no takers. On the Q4 GDP, someone pushed the market back up from 20% to 25%. I haven't put in any new orders, so it doesn't directly affect me, but it's nice to have a vote of confidence that at least I'm not the *only* person who thinks it should be higher.

> **14.01.23**

> **10:57** - On the Salem front, China COVID jumped back up to 27% (from 21%) overnight, Bakhmut jumped back up to 48% (from 45), and GDP 4+% is down to 15%.

> **11:19** - I also installed the Twitter app on my phone and created an account and followed @realDonaldTrump so I can get a notification and hopefully buy up the "Donald Trump back on Twitter" market first in the unlikely event that he ever tweets again. I've steadfastly refused to create an account on Twitter all these years, even though the UI makes it really annoying to browse without an account, but I figure I should take any edge I can get on Salem. At least I can uninstall it again on March 31st when the market ends.

> **15.01.23**

> **22:24** - Saturday evening, the China COVID market suddenly jumped to 37%, though the two people responsible are clueless IMO. In fact, one of them is the guy who literally joined the contest just to try to persuade Salem to resolve the market YES (after finding out about it due to a linked market on regular Manifold and getting angry about it) and has been commenting endlessly on that topic ever since. However, I declined to take advantage because I was down to only $500 in free cash and wanted to preserve it in case something else comes up, and thus the profit opportunity fell to others (it fell back to 29% this morning). It's a further layer of irony, as I FOMO'd into China at low prices only to regret it after seeing the US market, and then I regretted plowing so much into the US market because I didn't have the spare cash left to take advantage when fools mispriced the China market. Oh well.

> Speaking of Manifold, this evening I got on the computer and ran the scripts again to see what would happen if I won the GDP 4% market or not. If it resolved YES today, I would be in 6th place, and just a hair's breadth from fifth. If it resolved NO on the other hand, I'd still be in 9th, but just barely above 10th. It's a little nerve wracking to have so much riding on what is essentially a coin flip even under the most optimistic scenarios. But to be fair, I only got as far as I did in the first place with an incredible amount of luck, and even if I lose, I'll still be on the leaderboard at least. It seems like a decent gamble for something that will near-guarantee me top 5 if it pays off.

> I woke up to an email from Twitter this morning, with a digest containing a bunch of rightwing tweets from random accounts I didn't follow. When I set up Twitter, I followed Donald Trump and also followed Paul Krugman as a test to make sure the notifications were actually working. I was disappointed to discover that I did not get any sort of notification on my phone or any notification when Krugman tweeted yesterday, and did somehow get an email with a digest of people I'm not even following. You had one job, Twitter!

> Fortunately, after looking around in settings more, I discovered that I had accidentally turned on Do Not Disturb on my phone. I turned it off and also set Twitter notifications to bypass DnD for good measure. I also of course went through the Twitter settings menus and unchecked everything I could that wasn't specifically "tweets from people you follow". Sadly, there's no settings option for "spam from random people you aren't following". I later got a notification for a (re)tweet by Krugman, so I assume it works now, and unfollowed him.


# January 16-31

![Score graph](/img/salem2/jan2.png)

For the first half of January, up until around the 18th, things were looking pretty good for me as my frenetic betting had slowly increased my score. Unfortunately, the second half of the month was just one setback after another, followed by one last blow at the end of the month so significant that I was convinced that I'd been knocked out of the contest for good.


## China GDP

The first setback was a minor loss from my limit orders in the China GDP market.

> **16.01.23**

> **22:04** - Well today was a chaotic day on Salem, though it fortunately mostly worked out for me in the end. There are two thinly traded markets for China 2022 GDP 4% and World GDP 3% respectively, and I'd of course frequently seen them and eyed them as a potential new source of profit, but I wasn't able to turn up any information in a cursory search, even basic stuff like when the numbers are expected to be reported (but it sounded like this would happen in June).

> Anyway, five days ago, I put a small $50 limit for YES at 50% (and another at 21%) on the China market, which was at 64% at the time and had recently been in the 70s. With no information and expected resolution not until June, I didn't want to risk much, but I figured I should put some way out-of-the-money limits down to try to catch fat finger/whales.

> The China GDP market was at 61% last night, and thus I was surprised when I checked again this morning and saw it down to 48% (and thus my first limit was hit). It continued falling through the day, and when I checked again tonight it was all the way down to 20%. Most of the selling over the last day was due to one person, Iraklis Tsatsoulis, who posted a comment three hours ago linking to a news story that China just reported a 2022 GDP of 3%.

> I quickly sold my shares (for $58, thus a total loss of $42) and then decided to put $300 more in buying NOs. I got 355 NO shares, so assuming it resolves no and you ignore the time value (i.e. opportunity cost) of money, I'll actually profit slightly overall. It's a big risk putting in half my bankroll, but I'm hoping that it will resolve imminently, given the report of an official GDP release. And either way, I still have $333 in free cash left now.

> I am kind of groaning that I didn't do enough research to actually figure anything out about the market and catch the fall ahead of time myself, but at least I'm in good company. In fact, Johnny put 375 into YES on the way down, and the Kalshi market was completely taken by surprise as well (Iraklis suggests that the Salem market was completely out of whack due to people trusting Kalshi too much - of course I don't look at prediction markets myself except occasionally when people link them in the comments on Salem, but I relied on it by proxy by assuming the current market was sane. On the other hand, it makes me a little more optimistic that Kalshi might be wrong about the US Q4 GDP as well. The Kalshi market only goes up to 3.5%, but when I looked recently it had a forecast of only 15% for 3.5 (now up to 30%). I assume the reason the Q4 GDP market has been so much lower than I thought reasonable was because other Salem members were relying on Kalshi. It makes no sense otherwise for the market to go as low as 12% (now back up to 15%) when GDPNow is forecasting 4.1% GDP.

> But that wasn't the only excitement on Salem today either. This morning, I finally gave up on cashing out my Bakhmut position at the 43% limit with the market languishing at just under 48, and so I put in a new limit to cash out at 48%. I was really surprised when I checked again in the afternoon and saw that it was down to 42% and that instead of getting (most of) my money back, I suddenly had an equal number of *YES* shares. Presumably, I forgot to cancel the 43% limit. Oops. I put in a NO limit at 48 to cash out just in case, and tonight someone bought it back up to 48% and cashed me out, so all's well that ends well, I guess.

> I also noticed this afternoon that Johnny had almost bought up the rest of the 25% limit on the US COVID market a day after I put in the 1050, so I felt a lot better about my decision to commit so much then. I worried that it was an opportunity that wouldn't last forever and I was vindicated much faster than expected. Tonight I bought the last $36 of the limit, and discovered that the other limits were all gone too. Up to this afternoon, the same person who put the giant limit at 25% also had limits at 24%, 22%, and 20%, but they suddenly canceled all of them.

## Q4 GDP

The next big setback was in the Q4 GDP 4% market, where I had a larger bet, thanks to the odds seemingly being so good. On the 18th however, the bear consensus was justified when the GDPNow forecast suddenly dropped from 41.% to 3.5%.

There were also some worries in the Trump Twitter and China COVID markets that I'd forgotten about because they were ultimately insignificant. It's interesting looking back at my journal entries and seeing what I wrote about at the time vs what I remember now.


> **18.01.23**

> **07:32** - Well, the morning didn't start with good news on the Salem front. Patrick commented, pointing out that the Chinese CDC has now officially released an update mentioning 1.27 million cases of COVID in hospitals. It appears to be a snapshot rather than a report of *new* cases, but it is still concerning, since there is a risk John Hopkins decides to average those into the case numbers somehow anyway.

> Also, I noticed the Donald Trump Twitter market spiking up. I quickly checked that he hadn't actually tweeted, and then decided to throw $200 in (69->63%). Then I googled it to see what the fuss was about and found a new article that says Trump is planning to tweet again and has been talking about it for weeks. I wish I'd done them in the reverse order. Of course, there's still a chance that he doesn't tweet before April, but I wouldn't have taken those odds if I'd known. I really need to learn how to stop FOMOing into things (or the reverse in this case, I guess). Also, the China GDP market is back up to 11% (other people cashing out).

> **08:17** - I spent the morning reading the latest Magic spoilers on Reddit to distract myself, and when I checked back the Trump Twitter market was down to 61% and I had managed to partially cash out with my 62% limit, so that was nice. Of course, the real risks are the Q4 GDP and China Covid markets, since those are the ones I have large positions in (well, I also have a huge position in the US Covid market, but I'm not worried about that one). But I can't really do anything except just wait and hope for the best.

> **08:36** - Johnny just left a comment saying that he thinks the new CDC report is actually evidence in favor of NO, because it is the first report that doesn't explicitly list new cases at all, consistent with China's plan to stop reporting those. I sure hope he's right. He also pointed out that OWID has now been updated with a string of 0s for the last few days (previously it just stopped at Jan 10th). But of course it's theoretically possible that they decide to put that 1.27 million in somehow anyway, even though it is a completely different type of data.

> **11:10** - I couldn't get Salem out of my mind and just checked again, and then discovered more bad news - this morning's GDPNow update is down to only 3.5%. I'm still planning to hold it just in case, but I guess I need to resign myself to the fact that I'm probably effectively in 10th now and top 5 is a longshot again. Hopefully, this means I can stop worrying about it as much now, but I doubt it will actually happen that way.

> **21:52** - As far as Salem goes, the silver lining is that checking at 11am at least let me cancel the limit orders I had on Q4 GDP at 12 and 10% before they were hit, and thus I avoided throwing another $90 into the fire. On the other hand, I discovered this evening that a $50 limit at YES 45% for Donald Trump Indicted that I placed 11 days ago was now filled (it was 62% at the time I placed the limit.) I went through every single market on Salem and canceled all the random old limit orders I had placed in early January.

> I had been hoping to replicate my stroke of luck with Dylan Levi King in the China COVID market in late December, but instead, the majority of the limits I placed ended up being harmful when they were hit. Oh well. At least I can be glad that I'm not KDM, who had a $250 order at 50% filled for Donald Trump Indictment placed 12 days ago.

Note: I sold the Trump Indictment shares on January 30th at 52.46% for a profit of $8.29, so that one ended up working out for me at least.

> I also finally gave in and quick-sold the China GDP (11->12%) and put most of the money into the "new general state mask mandate by end of Feb" market (18%). I definitely regret not quick selling at 7% last night though. It's so hard to predict when other players will buy or sell, and how much.

> Anyway, on to real, non-Salem news. I've been spending way too much time and effort on that lately anyway, though it is hard to cut back. ...

## Biden approval

The next hammer to drop was in the Biden Approval market. I'd assumed that it was practically a sure thing, since there were only weeks left, and his approval rating had a large margin above 42%. However, the approval rating suddenly dropped unbelievably quickly, so fast that even the articles on the 538 website couldn't keep up with the news.

I ended up refreshing the 538 poll tracker frequently throughout the day, hoping to be the first person to trade off any movements in the polling average. However, this ended up being counterproductive, as I *still* somehow managed to lose money on every trade.

The most ironic part is that the market ended up resolving YES after all, but it didn't help me since I sold out near the bottom. I think Josiah, who was heavy on YES but didn't sell out, did better. But all that was still a week and a half in the future, and with a lot more bad news to come.

> **20.01.23**

> **21:52** - I've still been checking Salem several times a day, even though I've largely just been a passive bystander recently. Today was pretty dramatic though, with the sudden decline of Biden's fortunes in the "Biden Approval 42% on Feb 1st" market, which peaked at 92% two days ago and was at 88% just a day ago.

> When I checked around 11 this morning, it was already down to 74%, and Biden's approval rating on 538's average (which the market uses for resolution) was down to 42.9%, from a recent peak of 44.1%. Fortunately, though I'd thought it was nearly a sure thing, I hadn't put much in yet, just 75 at 86%, 50 at 87, and 100 at 79% over the last couple weeks, all via limit orders.

> Personally, I thought there is an obvious tendency in politics to overhype every little scandal and figured that the classified document thing wouldn't hurt Biden much or that he would probably bounce back by February if it did. When I checked around 11, I was amazed how rapidly the price had fallen and figured people were getting ahead of themselves. I initially put a limit at 70-something, but then on second thought canceled it a minute later and just put a small limit at 61% for only $24, due to liquidity issues plus uncertainty over how much the polls would drop. I figured that the current market drop would naturally bounce back as people fought the overcorrection and it would never even come close to my limit.

> I checked again around 4pm and was shocked to see it down to 56%, and even more shocked when I checked 538 and saw the polling average down to only 42.2%. I never thought it could move so fast - it looks like two polls were added this afternoon with Biden at only 38%!

> Anyway, the good news is that I only had a couple hundred in the market, and not *quite* bought at the peak, so my losses are a lot lower than they could have been. I checked the leaderboard this afternoon to see if I had fallen to 10th yet, and was surprised to see myself in *8th* instead. Josiah Neeley, who has long been sitting just above me at 8th, had suddenly fallen to 10th. Based on the bet history, it looks like he put a lot of money into Biden approval, explaining the sudden drop. As much as I've had a lot of losses in all my trading these last few weeks, at least I can be glad that I'm not him (or Connor, who fell from 3rd to 6th).

> ussgordoncaptain (currently 7th) also put a bunch in, but not enough to drop a rank, apparently. Meanwhile, zubbybadger (previously 7th, IIRC) has suddenly shot up to 3rd. He was the first person to start selling Biden approval last night and sold a lot of it at high prices. Later, Johnny came in and also sold a lot and presumably claimed a lot of profit as usual as well, but I've given up worrying about him, since he is so far ahead and so active that there's no stopping him, and my goal was just top five anyway, so profits he claims at least aren't going to the other top players.

> When I checked again just now, Biden approval was down to 49% and Josiah was all the way down to 12th. It wasn't just the Biden thing though - it looks like this evening, Josiah also suddenly sold a large amount of Trump Back On Twitter and bought a large amount of Russia Bakhmut, which of course not only incurs fees and massive slippage, but traders also pushed each market back up/down a few % from the peak after his trades, further eroding his current market value (but of course, it could yet pay off for him if he managed to guess right on the outcomes.) This incidentally also cashed out my remaining Trump Twitter No shares with a limit at 63%. I set the limits aggressively enough that I probably made minimal profit, but what really matters is that that little chunk of money is back out of the market again.

As alluded to previously, I was desperately short of uninvested cash in late January, so getting cashed out was very welcome.

> Anyway, I haven't been affected much beyond watching my positions continue to rack up minor losses, but watching people shoot up, first with Iraklis on China GDP and then with zubby on Biden, I can't help but get jealous and wonder why it wasn't me who was able to capitalize on those rare breaks. Of course, there are a lot of players and only a few can get lucky like that, and people's luck can easily change (much like I got a big lucky break when Dylan sent me cheap China COVID shares last month and then I had a bunch of smaller bets go bad last week.) In particular, Iraklis is already back down to 17th place. I've noticed him doing some questionable trades, rushing into markets at low prices and panicking back out when they go up (like China COVID), which is presumably what eroded his standings.

> Incidentally, a major silver lining is that if Trump actually does return to Twitter, as now seems plausible, I'll have a decent chance of being the one to ride the rocket thanks to the app notification. Not a sure thing of course, since others could have easily done the same thing, and the market in aggregate is usually way faster and more knowledgeable than me, hence how I kept getting caught out earlier when people were trading on stories or developments I hadn't heard of. But it is a chance at least, and Josiah helpfully pushed up the potential profit by selling.

> Anyway, that's way too much discursion on something that is meaningless in the big picture, and where I have only a small chance of winning anyway. But oh well. Now for the regularly scheduled journal entry: ...


> **21.01.23**

> **21:42** - I checked Salem a lot less often than usual, and instead have just been refreshing the 538 Biden approval page every couple hours, which is much faster and accomplishes almost the same thing. However, the 538 average hasn't been updated since those two polls Friday afternoon that dropped it to 42.2. Salem has also been pretty quiet, with just one minor event of note.

> I checked Salem a little before 2 and just happened to notice that only 17 minutes before, zubbybadger had suddenly sold "Biden Cabinet Official Out by Summer?" up from 55% to 69%. At first I thought it was a sudden news break and checked, but only saw a fresh story saying that the Chief of Staff (which is not one of the positions covered by the resolution criteria) was departing. I thought maybe zubby just wanted to free up money for another market, but checked around the other active markets and didn't see any new bets and after a little while, just forgot about it again.

> The lucky timing would have made it a lucky break that I happened to be the first to notice the swing, except there was no actual news development to capitalize on. And of course, I didn't want to push the market back down because a NO won't resolve until June. I was puzzled and thought maybe zubby was confused and didn't read the resolution criteria carefully, but if they really thought resolution was imminent, they should have put everything they had into it.

> In an even more remarkable coincidence, I checked Salem again just before writing this, and saw a new comment posted by zubby literally seconds before (9:41pm), explaining their trade, saying "NYT story had Walsh and Vilsack in the mix for Chief of Staff. I didn't want to be holding the bag." So that's one mystery resolved.


## The Paradox

I checked my script again and discovered a counterintuitive phenomenon I dubbed "the Paradox". I was currently in 8th place, but would end up in 9th place no matter how the markets resolved.


> **22.01.23**

> **16:43** - No real action on Salem since Friday. This afternoon, I fired up the desktop and checked what the standings would be under a few hypotheticals. Assuming GDP 4% resolves NO, I'd still be in 8th place, but only barely above 9-11th, and 5th would be 1.60x me. I also calculated the rankings under all four possibilities for the GDP 1% and Biden Approval markets (assuming GDP 4% is NO as well). Paradoxically, in all four cases, I would drop to 9th place, even though I'm 8th before they resolve. Of course, *which* person takes my spot at 8th depends on what exactly happens - Josiah if Biden hits 42% and Krum-Dawg Millionaire if he doesn't. However, my gap from the top 5 varies based on the scenario, from 1.68x if both resolve NO, to only 1.42x if they both resolve YES. It's a bit frustrating that all my math and programming skills and the script and so on haven't actually helped me find a winning strategy at all. It just lets me see in more detail just how badly I'm failing or not.

## The final week

The last week of the month brought a steady stream of more bad news on the Biden Approval and GDP >4% fronts, with the latter resulting in my largest single loss of the entire contest.


> **23.01.23**

> **07:30** - I checked 538 and Salem first thing after getting up like usual this morning, and 538 had coincidentally finally updated just minutes before, with Biden down to 42.1%. Oddly, I remembered the last two polls Friday afternoon having an adjusted approval of 38%, but now the three most recent polls were adjusted to 39%, 40%, and 41% respectively. Still, the average going down seems like a bad sign. Noone had traded on it on Salem yet, and I decided to sell a tiny amount (30 shares) at 49%, just in case. Of course, thanks to transaction fees, selling at 49% is effectively more like selling at 46%. In early January, I was trying very hard to avoid transaction fees, which probably cost me a lot sometimes, but then again, I think the other players are too cavalier about the fees. Still, there's no way to avoid it if you want to trade on fresh information, since you can't exactly place a limit and wait for someone to trade the other way.

> **21:54** - This morning, ussgordoncaptain put $2425 into US GDP 1%, bumping it from 90% up to 94%. It had been stuck at 90% for such a long time that I assumed it would stay that way right up until resolution, with the discount reflecting genuine uncertainty rather than just time value of money. I'd planned to put my spare money there at the end myself earlier, back before the GDPNow estimate suddenly dropped to 3.5% and released the updated blue chip estimate and I got worried about the possibility of <1% GDP. But it sees ussgordoncaptain doesn't share my hesitation.

> I continued checking 538 periodically throughout the day, but there were only two more updates, at 10:30am and 3:37pm (going by the update time listed on the site). The former bumped Biden back up to 42.2%, but I decided to just wait and see, since there is still a lot of risk and transaction fees make it impossible to profit off minor swings (49->43% and back). David Hassett however, didn't share my hesitation and bought it from 43% back up to 51%.

> The second update (well third update of the day) in the afternoon dropped a third poll, but the average stayed steady at 42.2%. There was no real action for most of the day, but when I checked again just now, I discovered that two hours ago, zubby had suddenly bought it up to 63%.

> Either way, it's ironic that the only result of me obsessively checking 538 so frequently is that I was actually worse off than if I had done nothing, due to panic selling a little at low prices this morning. Oh well. If it had kept going down, I would have been praising my attentiveness and regretting not selling more. It's still ironic though.

> The other notable action of the day was from 11-12 when Iraklis suddenly started buying China COVID up to 35% for no apparent reason. I initially assumed there must have been a new development, but I checked the OWID page (still showing all zeros) and the relevant discussion about how to handle the data on Github, and googled for news stories, but there was no discernible reason for the spike. If anything, it seems like things are looking more favorable for NO than ever.

> I couldn't shake the feeling I was missing something and was low on cash (only 341), but I very nervously quick-bought $41 of NO and put in a limit at 39% for another $30. When I checked tonight, someone named David Lawrence (not a name I've ever seen on leaderboards) had pushed it up to 40%, filling my limit. I checked all the above mentioned again, but still no new developments. I just have no idea what people are thinking. I guess it means more profit opportunity for me (but not that much, since others have been pushing it down aggressively too - currently 36%), but it is very nerve-wracking.

> **22:24** - There was one other notable action on Salem that I missed before, because it was in "Trump the Favorite in Summer 2023?", a market I haven't paid much attention to due to lack of good information and July 31st resolution date. For some reason, it jumped from 42% to 55% this morning. Of course, markets with a very distant resolution are naturally less liquid, and one person selling could just be to free liquidity, but for both David Hassett and Johnny to suddenly sell it up at the same time suggests there must be *some* reason. I've always wondered sometimes where people are getting their information when there are massive market movements with no discernible cause. Oh well, it's not like I'm even in that market. Really, I need to start preparing for bed again.

> **24.01.23**

> **07:37** - ... As usual, I checked 538 after getting up, and as usual, it had recently updated this morning (6:25). The new data bumped the average up to 42.3%, and I decided to put another $70 down on the market (63->64% - noone had traded since last night). I think Biden is a lot safer now that we've had three consecutive updates that were neutral or favorable, including polls taken over recent days, the period where it seemed like he had had a sudden drop in support late last week. Of course, I'm probably jinxing it now. I'm also surprised that Johnny still hasn't tried to buy the China COVID market back down from 36%. I'm guessing he's short of liquidity and will do so after the markets resolve tomorrow. Or maybe he just gets up late in the morning, but usually he's really active about stuff like this. I suspect that both David and Johnny's sales of "Trump favorite in summer" yesterday morning were just to free up liquidity.

> Update: I just idly checked 538 again (7:48) and it showed as updated at 7:33, but I don't see any new polls listed and the average is still 42.3%. Still, that must be at least a *very slightly* good sign.

> **13:54** - I just checked 538 every once in a while this morning, but just now, I checked Salem again, and was shocked to see China COVID up to 40%, driven by Iraklis and another no-namer. As usual, I checked, and still no sign of any news developments. I really wish I knew what people were thinking. It's a shame that I'm so short on cash that I don't want to buy it back down right now. Speaking of which, not a single person has traded Biden Approval since I bought it up to 64% this morning, to my great surprise. I guess it shows how hard it can be to predict other people's trades. The market swung a lot more than I expected from the updates yesterday morning, and much less (not at all) since then.

> **25.01.23**

> **08:01** - When I checked 538 this morning, it had, as usual, just updated, this time going back down to 42.1%. It seems like every time I make a transaction, the polling average immediately goes the other way. This update is less concerning (famous last words) than the first Monday morning update since at least Biden isn't in freefall now. It seems more like he's hovering just at 42% and it's practically a coinflip where things will end up. There's not much time left for a change in the news cycle and reversion to mean like I was hoping, but hopefully the Pence document story will help him out.

> I decided to just stay put in the market, since it seems silly to immediately sell shares I just bought yesterday at the same price and eat transaction fees. Unlike yesterday, *this* time around, other people decided to trade on the news. Specifically, zubbybadger just sold it from 64% back down to 59%.

> In other Salem news, overnight David and Johnny tried to push the China COVID market back down a bit and Iraklis keeps buying it back up (currently at 38%). It's a shame I don't have enough liquidity to participate myself.

> **18:56** - I was mostly occupied with actual work today, and didn't bother checking Salem, though I did keep refreshing 538 periodically (it updated at 12 and 3pm, but with no new polls and the average stayed the same.) Thus I was shocked when I checked Salem again after work and saw China COVID was now up to 41%, since Iraklis had only been buying it up to 38-40%, and there had been a limit order wall at 40.

> What really surprised me though is that it wasn't Iraklis buying it up, it was Sam Dittmer, who had previously been on the NO side, and constantly arguing (alongside me) against Patrick's comments, explaining why they don't make sense and the market should resolve NO. So seeing Sam suddenly do a 180 was pretty concerning. I checked and there were some new comments on the Github issue, with one non-Patrick user expressing support for randomly throwing the 1.2 million into the stats and a new post from the Chinese CDC which still doesn't include any new confirmed case numbers, but does include graphs of the number of tests and test positivity rate over the last month or two (unsurprisingly a peak in December which has since fallen). Perhaps that is what changed Sam's mind.

> In any case, at least Johnny is still putting up the good fight. This afternoon, Sam bought it up to 50, but Johnny pushed it back to 41 (with minor help from another no-name). Now, however, Sam has bought it back up to 48.

> Looking around, I see that Sam bought Bakhmut from 43 down to 37. And Johnny sold a bunch of "Oil at $100/Barrel During Winter?" (9->10%), presumably to fund the fight over the China COVID market. It seems that even the massively rich Johnny has limited liquidity. Incidentally, I've long been puzzled by the oil market, since it was at 9% for the last week and a half (and 10% before that, etc.) even though it doesn't resolve until March 1st and there are several sure-thing markets resolving Feb 28 with much better prices (e.g. "COVID Peak of over 300,000 by End of Winter?" is at 16% right now). Not that you can really profit off other people doing a bad job of considering opportunity costs like that. Incidentally, the COVID 300k market was at 14% for the last week, until Iraklis sold it up to 16% yesterday, presumably to fund *his* China COVID buying. It's weird how everyone is suddenly dropping everything over that.

> Anyway, it's hard to stop thinking about Salem right now, which is why I wrote this instead of continuing to try to study Japanese just now. It's ironic because there's basically nothing I can actually do right now anyway, since I want to preserve my last $200 in case Trump suddenly tweets or something. But tomorrow, I'll hopefully get $216 freed up from the GDP 1% market.

> It's also an especially momentous night because I'll finally find out tomorrow whether my lottery ticket in the GDP 4% market paid off or not. I've been doing my best to avoid even thinking about it and I don't actually expect it to happen, but it's hard to stop dreaming. Perhaps the weirdest possible outcome is that my long-shot bet in GDP 4% pays off, but then the seemingly near certain China COVID market resolves YES. In that case, it would be pretty much a wash for me, but some of the other players who were betting the other way would get hurt. But that scenario is doubly improbable. The funny part is that I feel like I should go all in China COVID, because if I lose that, I'm toast anyway now, with such a large stake there. But we'll see what happens.

## The leaderboard discrepancies

Amidst all the bad news, I also noticed a strange discrepancy between the rankings predicted by my Python script and what the leaderboard on the actual website showed. I spent considerable time trying to debug it, but I ultimately didn't figure it out until my return in March.


> **25.01.23**

> **21:00** - Around 8:40, I fired up the desktop to run my Python script again and see what the standings would be under the various hypothetical scenarios. It showed that, as I suspected, Johnny has now fully invested everything (as have Iraklis and a bunch of other top users). According to the script, I would be in 7th place in the fantasy scenario where GDP 4% and China COVID both resolve YES. (I'd be 5th place if the lottery ticket strikes gold and China COVID goes the other way). Also, the China COVID market is now up to 54% after yet another purchase by Iraklis and a no-name.

> However, there was one other really weird thing - for the first time ever, the leaderboard on the website didn't match the standings calculated by my script, and I wish I knew why. It had zubby and Mark swapped in 3rd and 4th, and 15-20th were also different. It's not like the former are even particularly close together, and my script has never been wrong before, and it matches my own displayed portfolio value exactly. I wonder what happened.

> **21:19** - I extracted (and prettified) the html for the leaderboard page, which as usual for Manifold, has a bunch of hardcoded JSON data, including the user data for the top 20 users displayed. This shows among other things, their current balance, but sadly not their current portfolio or portfolio value. I compared the balances of the top 10 to what my script thought they should be, and they all matched exactly.

> Also, at 9:06pm, David Hassett bought China COVID back down to 49%, which raised my ranking from 11th back up to 9th, and this was correctly reflected on both the leaderboard page and in my script (once I refetched market data from the API). And yet through it all, the Mark/zubby swap and the 15-20th discrepancy persisted. Very mysterious. In any case, I need to stop worrying about Salem and just watch SAO and then prepare for bed. There's nothing I can do about Salem right now anyway, and thinking about it will just make it hard to sleep later.

> **26.01.23**

> **05:52** - I ended up not making it to bed until 12:06, partly because, while I didn't actually visit Salem after ~9:15 last night, I did get caught up thinking about it for quite a while. ...

> As for Salem - it was the most expected outcome - 1% YES, 4% NO. China COVID is down to 45% and OCaml put a big limit there, presumably with the freed up money from the winnings. I decided to buy it down to 44% and put a limit there of my own (no point putting a limit at 45% since Johnny's would have to be filled first.) Unusually, there was no 538 update waiting for me this morning for the first time this week. But it has typically listed an update time of 6:30-7, so maybe there will be one later.

> **06:05** - P.S. There was also a newly created market on Salem this morning, "Send ATACMS to Ukraine?". Noone else had bet at all yet, so I threw in $1 just for fun, so I could claim the first bet. This is the first time I'd been the first to see a new market.

> **07:20** - 538 updated again at 6:58, and the average is down to 42.0%, even though there are no new polls. It often updates with no new polls included, presumably re-weighting or minor data additions to existing polls, but this is the first time that such an update actually changed the top line number.

> I went ahead and sold 125 of my 385 shares (57->55%), painful as it is. Also, the China COVID market broke through Johnny and my limit orders, up to 47%. There certainly is reason for concern, since John Hopkins *did* add the 59k deaths in the January 15th update (which says the deaths were from Dec 08-Jan 12th) as a single day data point on January 15th. If they did the same thing with the 1.27 million hospitalized number from the same report, that would spike the weekly average above 100k. It seems completely unreasonable to me, and they at least haven't done so so far, but the fact that they did something similar with deaths already is definitely concerning. However, I feel like after my numerous setbacks this month, and the fact that I'm already heavily invested in the market, I have to keep doubling down, because if it resolves YES, I'm screwed anyway. Also, there's another new market, for whether the debt ceiling will be raised.

> **07:42** - In other Salem news, the leaderboard now shows that Mark has dethroned Ben in second (and zubby is back down to 4th, where my script had them all along). For as long as I can remember, Ben has been secure in 2nd place (but distantly behind Johnny in actual money), and thus this was a surprise.

> Ben did have a small YES bet on Q4 4% GDP and Mark had a NO bet, but that alone would account for only a fraction of the gap between them, and when I ran the rankings again on my desktop just now, sure enough, Ben and Mark were still nearly in the same position as last night. Furthermore, the other rankings on the leaderboard are even more different from my script predictions than before, with random swaps all over the place (plus some completely different people in the bottom section).

> I really wish I knew wtf was going on. But I also feel like I need to stop thinking and worrying about Salem so much, since if China COVID doesn't go my way, I'll be out of the running anyway. But I feel like I should still keep trying to maximize value in e.g. the Biden approval market until then, so I'll be in the best position just in case. Also, there was a third new market this morning - Q1 GDP 1%. There was already a Q1 GDP 3% market, but I guess they figured that seems less plausible now since Q4 GDP was already under 3%, and they might as well have two markets like they did for Q4.

> **07:57** - Well technically speaking, there weren't two markets for Q4 GDP, so this is new. The 4% market was officially "US GDP >= 4% in any quarter 2022", but of course once the Q3 numbers came out, it de-facto became a Q4 market, and I spent so long thinking about it that way that I forgot how it was actually worded.

> **21:50** - As for Salem, I checked 538 a few times during the day, less often than before, but still enough to see it go down to 41.9% and back up to 42.0%. I didn't check Salem at all, as I was at work and couldn't do anything anyway and it's a lot less fun when everything is going poorly. On the way back, I was actually kind of dreading what I would see when I got home.

> In the event, it could have been worse. Biden Approval was down to 46%, but I was expecting that. I was surprised that China COVID had seen no trades all day, still at 47%. In fact, my free cash actually went up because I had put down a small $20 YES limit at 16% on the US COVID market yesterday in an effort to free up cash, which had finally been filled.

> The big surprise though was that "Will PredictIt Survive?" was suddenly up to 94%. Checking the history, it had shot up from 35% in just the last hour or two before I got home (~5:45), as first zubbybadger, then Johnny, and lastly ussgordoncaptain capitalized on the (presumed) news. I had trouble figuring out what news had actually triggered the flip though, as Googling didn't turn up any relevant news stories. I eventually discovered that the PredictIt Twitter account had tweeted at 4:13pm saying that the appeals court had granted them a temporary stay, presumably the trigger.

> Of course I couldn't have done anything about it even if I had thought to look in such places, since I was at work at the time, but it's still frustrating every time I see someone manage to scoop the market like that, since I wish it were me (and of course rankings in the competition are zero-sum). Oh well.

> ... Oh, the other thing I forgot to mention is that after getting back, I checked Salem again and found China COVID up to 48%, filling my limit from this morning. I put a new limit at 48%, plus small YES limits to partly cash out in the US COVID and Mask Mandate markets, and a small ($20) NO limit on Bakhmut at 38%. But I haven't even looked at Salem since ~7:40. I feel like I should be worrying about it a lot less than I am. In any case, it's now 10:21. I guess I'll check again before worrying about bed. Hopefully it will be easier to sleep tonight since I didn't get as much sleep last night.

> Update: No visible changes since 2.5 hours ago.

> **27.01.23**

> **07:24** - This morning brought further bad news on the Salem Front. I checked 538 after getting up (~6:43), and it had updated at 6:39, going back down to 41.9%. I reluctantly sold 31/301 of my shares (46-45%). Just four minutes later, zubbybadger jumped in and bought it down to 39%. Then at 7:09, it updated again, with a new poll taking it down to 41.6%. Unfortunately, this time, zubby got to it first, buying to 29% (in fact, the only reason I thought to check is that zubby posted a comment, sending me an email notification). I gave in and sold my entire stake (29->26%). These last two weeks have been absolutely brutal for me on Salem. It's frustrating, since everything seemed to be going so well earlier this month, and now it is all for nought.

> Incidentally, I forgot to mention the most alarming part of the PredictIt affair yesterday. Ussgordoncaptain commented "god I lost because my phone notifications were turned off", implying that they do have phone notifications of some sort set up to find alerts about this somehow. Which implies that they probably also set up alerts in case Trump tweets, since that's the simplest and most obvious to do, and that I have pretty bad odds of winning the race, even if he does end up tweeting.

> **22:10** - I didn't check Salem again until this evening, but there were no further updates from 538 today, and basically nothing happened on Salem either since Biden Approval tanked this morning. The most notable event was a no-name buying through my small 48% limit (in China COVID), after which I put another small limit down at 49%. I'm surprised that Johnny hasn't tried to push it down again, since it's been like a day now. Actually, I was surprised that there was barely any trading in general today (you know it's a slow day when the most notable event is a no-name buying "Former Trump Official to Run For President by Summer" from 70 to 75%).

> **29.01.23**

> **07:14** - ...later I got to the big other item on my agenda, Salem debugging, which ended up taking a lot longer than I expected, ~2-4:30. Of course, I don't have much chance of actually winning, but I really wanted to solve the mystery of the leaderboard discrepancies, just due to curiosity.

> The first item was relatively simple to resolve. I first reported seeing a leaderboard discrepancy on the 25th, but in retrospect, I realized that the first discrepancy was probably actually when I checked the previous time (IIRC the 22nd), though I didn't appreciate it at the time.

> When I first set up all the Salem stuff, I could access the *market* APIs to get the probabilities and resolutions and list of bets and everything, but for some reason, I couldn't access any of the apis for *user* data. The user apis do work when trying to query regular Manifold, and I assume that Salem somehow disabled them in an attempt to prevent people from seeing the exact standings.

> What this meant is that my script was able to calculate everyone's portfolio and simulated leaderboard and so on, but it was all random user *ids*, not names, and there was no automated way to get anyone's name. Instead, I built up a manual partial id=>name map for top users, by comparing my script's predicted top 20 to the public leaderboard. Whenever someone showed up in the top 20 who I hadn't already hardcoded a name for, I would find the corresponding name on the leaderboard and add it to the map in my script. Fortunately, there's little reason to care about the names of anyone who hasn't made the top 20 anyway.

> When I checked the script again on the 22nd, I noticed something odd. There was a new unknown user in 20th, who should have the name Oliver S. The odd part is that I had already previously assigned "Oliver S" to a *different* userid. I thought it was strange and likely a bug, but didn't pay it much attention at the time and thought there was a chance of two different accounts that happened to have the same name.

> When the much more extensive discrepancies showed up a few days later however, I realized that this was probably the first sign of the discrepancy. Presumably this "Oliver S2" was actually in 21st at the time or something, and the discrepancy was just enough to put him in 20th in my script, beating out the actual Oliver S, who was still 20th on the public leaderboard.

> Anyway, yesterday afternoon, I looked into it by checking "Oliver S2"'s betting history and comparing it to the publicly visible bet history on the website (which shows usernames) and confirmed that Oliver S2 is actually Adrian Kelly. So that was one minor mystery resolved (~20m).

> However, I also wanted to figure out *why* the leaderboards were suddenly way off, and that proved much more difficult. I again checked the balances in the page source data for the leaderboard and compared them to my script's predicted balances. When I did this before, the top 11 all matched exactly. This time, I checked all 20, and strangely, four of them (Mark, Connor, ussgordon, and Henri Lemione) had different balances then they should, while the other 16 were exactly down to the decimal as usual.

> Mark's discrepancy was especially notable and intriguing, as my script suddenly had him at -949, while the official data had him at 0 (actually 0.1457... - since the UI only shows rounded amounts and only lets you spend whole numbers, it is common to end up with a fraction when you try to spend everything, but I won't bother listing those.)

> While it is theoretically possible, as I discovered, to go negative via limit orders, this seemed less plausible, and it was a lot more likely for him to be at 0 after spending down everything, so it was a hint that my numbers were the ones that were wrong, although it took me hours to figure out why.

> My script was previously just focused on totaling everything up to determine *current* standings, but I modified it to instead build a list of all bets (or even more specifically, all bet fills, since limit orders can be partially filled at different times, not that Mark appears to have used any) and all market resolutions in sorted order of time in order to simulate the entire history of everyone's cash balances over time, and then printed out the history of Mark's balance.

> Mark had very often spent everything down to 0 but had never gone negative up until a day or two ago. Also, he had shot up to around 950 after the GDP resolutions on Jan 26th, just about the same amount he was now negative. After more fruitless troubleshooting, I tried subtracting the official balance from my predicted balance to get the exact amount of the discrepancy, and then checked how many shares Mark should have had as of Jan 25th, and discovered that the discrepancy *exactly* matched the number of GDP 4% NO shares he had, down to the decimal.

> I checked Gmail and discovered that Salem had actually sent me *two* emails about the GDP 4% resolution. Bingo! Evidently, they had accidentally resolved that market *twice* giving people on the NO side double the money they should have gotten. After I modified my script to count that market resolution as worth double, the discrepancies in the four user's balances suddenly went away. I left a comment (4:35pm) on Salem mentioning @SalemCenter to explain the problem and ask them to fix it, though I wasn't optimistic about the response.

> Of course, the double resolution didn't explain away *all* the discrepancies. First off, I had first noticed a mismatch on the 22nd, and on the 25th, there were massive mismatches even though the top balances were all the same. Even then, after correcting the script for the money doubling, the top 17 spots of the predicted leaderboard now matched up, but the bottom was slightly different. (Specifically, it had Adrian Kelly inserted in 18th, who didn't appear on the public leaderboard at all, and thus I couldn't check what his balance was supposed to be. The balances of 18-20th, or 19-21st in my script, all matched up. This could be explained if his account was deleted or something, though I don't think that's likely.)

> However, I decided that it was best to wait to see how things fell out with the double resolution issue before hunting for the source of the further discrepancies. Besides, I was exhausted after hours of debugging and just wanted to declare victory. In fact, it made me feel like I won Salem in spirit, even though I'm not close in the rankings, due to discovering a critical bug in the contest, which is not something everyone could do.

> After relaxing for a bit, I discovered that someone named "James Grugett" had already responded at 4:58pm, saying "This appears to be accurate after inspecting the logs. I will write a script to subtract the second payout from user balances."

> I was pleasantly surprised by the speedy and positive response. It was also surprising due to the account. People (including me) had commented a number of times @ing SalemCenter with questions about question resolution criteria and contest administration, and in the cases where they responded, they had always responded under the official "Salem Center" account.

> ... However, I got waylaid by notification of another comment from Salem first. At 6:16pm, James had commented again, saying "It is done! You can see the updated balance reflected in, e.g. this user's portfolio graph: https://salemcenter.manifold.markets/VictorLevoso?tab=bets".

> Of course, I couldn't actually see the linked page. It seems that regular Manifold allows you to see other user's portfolio value over time, but Salem disabled that for obvious reasons, but their admins can still see it and didn't realize others can't.

> While on Salem, I looked around and noticed "Former Trump Official To Run For President" up to 81%. The main news of Salem was that Saturday morning, Johnny had suddenly woken up and bought (together with another user) China COVID back down to 43%. A second no-name took Trump Official President up to 80 and he put it back to 77 as well.

> This time however, zubbybadger had sold it 77-81 just minutes before, and I have to pay attention to something like that, because if it is a sign of new information, it would mean I was in the perfect position to profit. I spent some time researching, but couldn't find any explanation for the sale...

> ... The morning brought new notifications from Salem. Immediately after the last message (6:17pm), James had commented "Oh wait, only I can see your portfolios haha. Cheers." At 1:07am, ussgordoncaptain responded "yeah though you can backcalculate everyone's portfolio using a scraper+python". It was a big surprise to see that I wasn't the only one who had thought to write a python script to reverse-engineer everyone's balances and portfolios. On the bright side, this makes me less worried that I'd be accused of cheating if contest organizers realized that I was doing this.

> As usual, I also checked the markets on Salem and was surprised to see Biden Approval way up. From 4:17-6:08am, zubbybadger had suddenly sold it from 19% all the way up to 41% (with Johnny pushing back a bit 24-22%, after the first sale.)

> Now *this* really got my attention, since it seemed to imply a huge profit opportunity one way or another. 538's average still hadn't updated since Friday morning when it went down to 41.6%, but I also googled for news stories, but couldn't find anything. I thought maybe zubby was just selling to get money to buy something else, but the script showed that wasn't the case either. I was completely mystified by why they would suddenly do this, especially as it seemed to imply information I didn't have, but if it was just a random dumb trade, I worried that the profit opportunity wouldn't last long and there was still no clear reason for Biden's prospects to be any better than the last two days (if anything, the chances of a swing go down the closer we get to February.)

> Eventually, I decided to just put $50 into NO, and keep checking 538 periodically. However, when I checked back on Salem later this morning while researching some numbers and times in the process of writing the earlier part of this entry, I discovered that Johnny had suddenly sold from 41-47%. Now that *really* made me worried. Having *two different* top traders (in fact exactly the 1st and 2nd place) both seemingly acting on hidden information, especially when Johnny had just recently been on the NO side made me think that regardless of what it is, *something* must be up, so I immediately sold my stake back. I only got $40 out due to the price swing from Johnny and transaction fees both ways, but losing $10 is better than losing $50 at least.

> **10:54** - After idling around this morning, I randomly checked 538 again at 10:43, not expecting anything, and was shocked that they had just updated with a new poll (at 10:38), spiking the average up to 42.2%. I decided to put $34 on YES (at 48%, which is effectively more like 51% accounting for transaction fees).

> What still mystifies me though is how zubby and Johnny figured it out so early, assuming this is what they knew about. There was a CBS article about the poll earlier this morning which I saw when I was desperately googling for news earlier, but it wasn't clear when the poll was taken or whether it was even a new poll, let alone whether 538 would include it, and if so how it would be adjusted and weighted. And even that article came out *after* zubby's pump, though before Johnny's  (obviously, since that happened after I first researched it this morning).

> In the past, when I've been really confused about why other players are trading the way they are, the answer has often been "Kalshi". I checked Kalshi, and coincidentally, there is in fact a market specifically for Biden's 538 approval rating on February 1st (and no other dates until the end of the year). Kalshi's market is hard to read because they actually have separate markets for multiple bands of possible outcomes, rather than a simple yes/no >42%, but if you add up the yes probabilities for each outcome >=42%, it comes to an implied 52% chance. Of course, there's no way to see the historical values, so I can't tell what it was like seven hours ago and whether that would have prompted zubby and/or Johnny's selling.

> Anyway, I definitely didn't expect the Biden Approval market to be a continued source of volatility, and hopefully profit (though I've purely *lost* money trying to trade it so far today.)

> Also, I'm surprised that Josiah Neeley hasn't made it back into the top 20. He disappeared from the leaderboards after the market tanked on Friday, but he should be climbing back up now, because at least eyeballing the bet history, he didn't sell out at the bottom like I did and should still be holding lots of shares.

> **11:11** - I just used my Python script to find Josiah's ranking and found that he is currently in 29th, but would be 12th if Biden immediately resolved YES. It looks like he also put a lot of money into PredictIt survival on the NO side back when it was in the 20-30% range. I'm not even sure what that is for him now, a triple-whammy? quadruple? All I can say is I'm glad I'm not him. I also discovered that despite their selling, Johnny and zubby both still have huge NO stakes on Biden Approval. If it resolves YES, Johnny would still comfortably be first but zubby would fall to 4th place. Also, Dylan Levi King is now down to 71st place (I modified my script to show the ranks of everyone I put names to, not just the top 20, to find Josiah's current rank.) How the mighty have fallen (IIRC, he was 12th back in December). Him, I can't feel sorry for though, since he repeatedly squandered money in obviously dumb trades across many markets. The worst though is someone named Mike Aniello, who is in 905th place with only $0.4216. Obviously, he must have gambled everything on a risky bet and lost.

> **21:48** - ... Later this evening, I spent over half an hour unsuccessfully trying to debug the further leaderboard discrepancies in Salem. My script's predictions now differed from the public leaderboard in three ways - 5th and 6th (Connor and David) were swapped, as were Stevie Miller and Henri Lemione in 15th and 16th, and I had Adrien Kelley inserted in 19th as well.

> However, this time, all the relevant balances matched the page source, so I had nothing to go off of. It seems like it will be basically impossible to debug these discrepancies without more information, and there's no way to get that information, so eventually, I was forced to just give up.

> Also notable was that in an unprecedented extreme coincidence, my portfolio value was only about $0.1 below 10th place (Spencer Henderson). Aside from being highly unlikely to have two balances happen to differ only 1 part in 35000, it also provided yet more evidence that the portfolio value calculations are correct. If the site is somehow miscalculating them, it would have to happen to be in a way that favors Spencer. But I doubt they're actually off. However, it's hard to think of what else it could be. It's weird that it only affects a few people with no apparent pattern, and there are no discrepancies in the cash balances. I wish I knew what was going on.

> I also commented asking zubbybadger how they knew to dump Biden this morning *before* the 538 update, and they explained

> "I saw Chuck Todd talking about the NBC poll on GMA on twitter. The CBS poll dropped like 30 minutes later which was a complete surprise to me, which made me sell a lot more. Those were probably the 2 worst polls for the No holders to get. Solely on vibes, I think No wins, but it’s pretty much a coin flip at this point."

> It seems that they basically just got lucky. I assume that Johnny's later selling was based on the CBS article about the poll, which was out at the time, even if the 538 average hadn't been updated yet. It's amazing how good other people are at finding out about news stories quickly (and assessing them correctly - I didn't take the CBS article seriously myself.)

> **30.01.23**

> **21:56** - I checked again (among many other times today of course when there was no update) at 2:48pm and found it had updated again at 2:43, back up to 42.3%. The market was back down to 81%, but you can't really profit off tiny swings like that thanks to transaction fees, and I wished I had not sold out (of course hindsight is 20/20 - it could have just as easily gone *down* further rather than back up, in which case I'd have been praising my genius.) At 2:50, while I was still agonizing over whether to buy back in or not, a rando bought it up to 82%, and so I decided to stay out for now.

> There haven't been any trades since. It will be interesting to see what happens over the next day or two. It ends at 6am on Wednesday, and 538 *usually* doesn't add new polls before 6:30, but it could very easily add a new poll or two tomorrow. I'm hoping that the probability doesn't go too close to 100% before the outcome becomes clear, so I can buy in and make a small fast profit.

> In other news, someone filled a $100 YES limit I put down on PredictIt at 92% a few days ago. I figured it was worth putting in a limit just below the market price because someone holding a lot might need to sell out for liquidity. Of course, it's unfortunate timing because it would be useful for *me* to have the liquidity right now, since it would have been better to throw it into Biden Approval tomorrow (and/or Wednesday morning). Oh well.

## The final blow

After work on the 31st, the two weeks of continual bad news were capped off by the greatest misfortune of them all - the China COVID market had suddenly spiked *up*. I had accumulated a large NO position in the market over the last month of trading, and there was no way I could recover from such a heavy loss. I was out of the contest for good... or so I thought.

> **31.01.23**

> **17:20** - Welp, so much for Salem. I checked Salem after work ~5:09, and was shocked to see that Johnny had just dumped the China COVID market up to 88%. I checked OWID and the Github issue and googled for news reports, but didn't see an explanation, and figured that since since I'm already invested so heavily in the market, I might as well double down, and put my last $152 in, then sold some other shares and put more in.

> Afterwards, I looked for other issues in the same Github repo out of curiosity, and discovered a comment posted at 5:04 in another issue saying

> The WHO COVID-19 Dashboard has updated China cases and deaths: https://covid19.who.int/region/wpro/country/cn

> We're working to bring this data into our repository but need to rectify some conflicts with data for Hong Kong SAR. For now, I recommend observing the WHO dashboard for mainland China COVID-19 data.

> The linked dashboard shows millions of cases in December, so this seems to imply that the market is a guaranteed YES now. However, there was nothing I could have done anyway. Even if I sold, I'd be so far behind that I don't have any chance of winning anyway. I guess at least I can stop worrying about Salem now. It will be really weird to not have that in my life any more.

> In other Salem news, 538 updated to 42.4% this morning. I was shocked when I randomly checked Salem again around 11:13 and saw that zubby and Johnny had sold from 89% down to 75% again for no apparent reason. I checked Google, Twitter, etc., but couldn't find anything. A few minutes later however, I checked 538 again, and it had updated at 11:16, taking the polling average down to 42.1%.

> I spent another 15 minutes unsuccessfully searching Twitter for news of new polls that could have triggered the selloff, then checked back on Salem and discovered that zubby and bought back up to 88% at 11:17, leading to the following exchange of comments:

> RG: @zubbybadger Man, you and Johnny are giving me a heart attack, suddenly selling it down to 75% and back for no apparent reason. I kept searching Google and Twitter to try to figure out what you knew, but I came up empty.

> ZB: @RobertGrosse Very curious if he knows what's going on or if he's just tailing me lol. Pew released a poll at 38%. It wasn't enough to bring us under, but I thought it would be close. I don't have anything else on my list that's[sic] could be dropping today and 538 doesn't usually update until after 9 AM. You never know though!

> J10N: No idea what’s going on, just blindly following Kalshi, which is at like 70%: https://kalshi.com/events/538APPROVE-23FEB01/markets/538APPROVE-23FEB01-B41.2/

> But yeah that resolution is a later[sic] in the day so maybe that’s the difference. And I am starting to worry that the Kalshi market is just you @zubbybadger in a wig.

> ZB: @1941159478 Lol respect for admitting that. Yeah I'm in the Kalshi market and heavily invested there. Tomorrow we get another Rasmussen, Yougov/Economist, plus the possibility for a couple other heavily weighted polls (Monmouth and Fox especially). Unfortunately all of those are likely to show up after 9 AM EST. I think the NO side's best bet is something random in the next couple of hours (maybe Yahoo?) or AP-NORC at midnight.

> RG: @zubbybadger Wow, it sounds like you are incredibly knowledgeable and invested in this. And I thought I was clever just by checking the 538 average periodically to see if it goes up or down.

> ZB: @RobertGrosse Yeah, I didn't even play this right though. Those polls over the weekend caught me completely off guard. I still might have set myself up to lose if there's something coming that I don't know about!

> I was amazed to see just how much more advanced zubby was than I, though even zubby failed to predict most of the wild gyrations in the polling average lately. Anyway, it's all moot now, sadly.

> **18:42** - I just sold my Biden and Bakhmut shares to free up $199 and put a $199 NO limit at every 1% interval from 99% down to 75% (by hand). With that many limit orders, it could absorb nearly infinite sell pressure. Hopefully if people decide to start selling again, I'll rack up a huge position and either end up in 1st place or last. And *now* I can completely forget about Salem until March and then check and see if by some miracle it resolved NO. But in any case, it will at least make things interesting for the other market participants, basically a windfall to whoever notices first and has the most free cash to take advantage.

> **22:11** - ... I also unfollowed Trump on Twitter and uninstalled the Twitter app this evening, now that I'm no longer playing Salem.

# February

![Score graph](/img/salem2/feb.png)

I thought I had already lost at the end of January, and decided to completely ignore Salem for the month of February and then check in again in March just in case a miracle had happened.

I disabled all notifications from Salem, stopped checking the site, and enjoyed a peaceful month wasting all my time on other pursuits instead of wasting it on Salem.

The rankings in my absence were pretty volatile though. As it turned out, far from quickly spiking to 99% and then resolving YES like I expected, the China COVID market swung wildly back and forth over the course of the money, before finally closing at 5%. These gyrations took me as low as 26th place and as high as 6th, but I ended up in 7th place in the end.

## Duplicate payouts

In late January, as a side effect of investigating the leaderboard discrepancies, I figured out that the "US GDP Growth over 4% in any Quarter 2022?" market must have accidentally been resolved *twice*, giving NO bettors twice as much money as they should have won. I didn't even know this was *possible* on Manifold. Fortunately, when I commented about this, the staff ran a script to undo the effects and subtract the relevant amount from each person's balance.

While I was away in February, the same thing happened *again*, in the "Will PredictIt Survive?" market. This time, it fell to Zubby to notice and report the problem, which was likewise quickly reversed.

# March 1-15

![Score graph](/img/salem2/mar1.png)

Apart from the initial shock of returning to Salem and finding out that I'd actually won, the first half of the month was quiet, with me only making a few minor bets. I did however spend a lot of time trying to reverse engineer the leaderboard score adjustments.

## The return

I couldn't believe my eyes when I checked Salem again at the beginning of March. However, there ended up being several days of suspense because Salem inexplicably failed to actually resolve most of the end-of-February markets.

> **01.03.23**

> **06:40** - Salem - Back at the end of January, I'd assumed that I was toast, so I just yolo'd everything into NO limits on the China COVID market just in case a miracle happened, and then decided to completely avoid checking Salem until March, so I'd find out what happened one way or nothing.

> I expected the most boring case to be what happened (it resolves YES, hardly anyone buys my limits), and when I checked as planned this morning, my first sight was a balance of $-130, so I assumed that was what happened, until I looked at the markets and saw that China COVID was at 5%! Somehow, the market hasn't resolved yet, but people think it is going to resolve NO after all. My "portfolio value" is now over 7k, and I'm in 7th place on the leaderboard. Although it's a bit weird, since this implies that all my "sure thing" end of February bets that I didn't sell somehow lost. I'm going to have to keep looking into it to figure out what happened, but my heart started pounding as soon as I saw that, and I figured I should immediately note this down. I guess now I need to start actively following Salem again, since I have a decent chance of winning again.

> **07:07** - Looking at the comments on Salem, it looks like the last month was a rollercoaster, so it's a good thing I didn't have to worry about all that. Anyway, it sounds like the current state is that OWID is still showing 0, but the spreadsheet the data is based on shows >100k cases, and they may or may not update it in the future. The end-of-February markets all closed, as programmed, but they haven't been resolved yet for some reason, not just China COVID, but also US Covid and Mask Mandates. (Which is also the reason why they didn't show up on my portfolio page as mentioned earlier.) In any case, I can't actually do anything on Salem, so I guess I just have to wait and hope they resolve NO.

> One other weird thing is that of the limit orders I left, only the 75%, 76%, and part of the 77% limits were filled, even though the prices subsequently went up to 82%. Presumably, someone from Salem decided that my limit orders weren't serious and arbitrarily canceled them, but it's weird that they wouldn't leave any sort of comment or notification about that.

Note: At the time, I assumed that my limit orders had been manually canceled by admins. It was only after the contest was over that I found out that Manifold *automatically* [cancels your limit orders once your balance goes below zero](https://github.com/manifoldmarkets/manifold/blob/0e62922331bb1c31070c2ddb1ea67f9d9d08487f/common/src/new-bet.ts#L218). So your balance can go negative via limit orders, but only by the amount of a single bet.  


> P.S. The "Debt Limit raised" market is down to 56% from a high of 77%. It doesn't affect me Salem-wise, since I never bet in it, but it seems like ominous news as far as the actually important state of the world goes.

> **10:33** - I just decided to check Salem again, as I couldn't resist thinking about it, and turned on email notifications for market resolutions. There isn't anything I can do on Salem until the markets resolve anyway, so I might as well get notifications so I don't have to keep worrying about it. Incidentally, not *all* of the February markets have failed to resolve. The "Russia to control Bakhmut" market, which was also supposed to end on Feb 28 did resolve on time, so it's not like the Salem team is just asleep or something. No idea why the other three haven't resolved yet. If it was just China COVID, I could understand it due to being ambiguous, but there's no controversy over the outcomes of the other two markets. Oh well, it's not like I can do anything but wait.

> **22:03** - ... I really hope I didn't use up all my luck with Salem (though the longer Salem goes with the markets stuck unresolved, the more uncertain it seems).



> **02.03.23**

> **08:06** - Salem: The Mask Mandate market resolved overnight, but the other two are still unresolved. Also, the oil price market, which closed March 1st, is stuck unresolved as well. It's so odd, the way they're resolving some markets and not others for no apparent reason. They also resolved the Peter Obi market. With the mask mandare market finally resolved, I have a positive balance again, so I could technically start trying to gamble again, but I don't think it's worth it, especially as I won't even know whether I'm in the running until China COVID resolves.

> **03.03.23**

> **00:27** - ...After work, I got home to an email notifying me that China COVID had finally resolved (NO). It was dated 8:40am, but of course I don't have internet access at work. So I'm back in the game as far as Salem goes. I re-installed the Twitter app and followed Trump again, though I don't expect him to actually tweet this month and don't expect to win the race even if he does. I haven't touched anything else yet though - hopefully I'll be able to figure out a strategy after looking at things over the weekend.

> The US Covid and Oil markets are still stuck unresolved for some reason, and I have a chunk of money tied up in the former, but I'm not worried about that now, as China was the important one, and I have $6235 in free cash now (with a portfolio value of $7,448). It's a bit dismaying that my balance is now high enough to have been good for second place (IIRC) when I left a month ago, but now only puts me in 7th. It's such a Red Queen's Race. Also, I looked at the history and it turns out the China COVID market peaked at 87%, not 82% like I said before. It's annoying that the admins stepped in and canceled my limit orders, since I would have made serious bank if they had been filled. But I guess I can't complain too much, since I never expected to win in the first place and thought I had lost for good and was just hoping to at least go out in style and not expecting to achieve even that.

> Also, I got "Smartest Money" and "Proven Correct" on the China COVID market. In a deep bit of irony, the Proven Correct comment was my resignation comment, "Welp, I guess I'm out as far as this competition goes. It was nice knowing you all. Even if I sold I'd be so far behind that I can't win anyway.". I'm so glad to have been proven incorrect!

![Score graph](/img/salem2/china_covid_proven.png)

## The leaderboard discrepancy hunt

Once the weekend arrived, I could plug in my desktop (see above) and start trying to hunt down the leaderboard discrepancies again:

> **04.03.23**

> **14:05** - I haven't been looking at Salem much, but I got the emails this morning that the last two stuck markets had finally resolved. I finally got around to firing up the computer to check the standings this afternoon.

> When I last checked on Jan 29th, 8:14pm, the standings were (per my script)

> 1) Johnny Ten-Numbers   11909.6212543

> 2) zubbybadger  8005.88716964

> 3) Ben  7537.06524301

> 4) Mark   7485.39806775

> 5) David Hassett  5837.63273154

> 6) Connor Pitts   5737.61252569

> 7) ussgordoncaptain   4975.49057389

> 8) Krum-Dawg Millionaire  3724.91205728

> 9) Asher Gabara   3623.72040371

> 10) Spencer Henderson   3517.12434972

> 11) Robert Grosse   3517.01782341

> 12) Jack G-W  3106.81841568

> 13) Iraklis Tsatsoulis  2754.16388399

> 14) Max   2698.67223969

> 15) Henri Lemoine   2619.22840724

> 16) Stevie Miller   2593.35918722

> 17) Zach Viglianco  2550.02611026

> 18) Nate Stover   2417.08414792

> 19) Adrian Kelly  2397.42475241

> 20) Sam Dittmer   2381.50076577

> When I checked again at 2pm today, they are now

> 1) Johnny Ten-Numbers   9364.13773078

> 2) zubbybadger  9168.2494107

> 3) Mark   8682.97902346

> 4) David Hassett  8008.54652802

> 5) Connor Pitts   7825.06048076

> 6) Ben  7627.37493567

> 7) Robert Grosse  7489.07083312

> 8) ussgordoncaptain   6126.38597093

> 9) Zach Viglianco   5012.44230592

> 10) Krum-Dawg Millionaire   4532.57009935

> 11) Josiah Neeley   4092.7755846

> 12) Stevie Miller   3579.11266493

> 13) Spencer Henderson   3466.98127927

> 14) Asher Gabara  3317.53597191

> 15) Alvaro de Menard  3058.86012968

> 16) Jack G-W  2976.78286778

> 17) Henri Lemoine   2945.66674254

> 18) Sam Dittmer   2803.73086904

> 19) Charles Paul  2668.23401361

> 20) Oliver S  2604.34321508

> Of course, these need to be taken with a grain of salt, since there have been persistent unexplainable discrepancies in the data since mid January. In particular, the leaderboard has shown zubby in first and Johnny in second ever since I checked in on March 1st. My rankings also have Connor and David swapped compared to the official rankings, though there are no swaps at the bottom of the table for once.

> The good news is that the top 7 are closer than I feared. If only the admins hadn't canceled my limits early, I might very well be in first now, but there's no sense in continuing to lament that. The real challenge will be figuring out how to get ahead (or even stay ahead) going forward.

> Incidentally, the comments indicate that the PredictIt market also resolved twice (in mid-February while I was gone), but the commenters fortunately noticed and got the staff to fix it on their own.

> **14:52** - I checked the cash balances against those from the leaderboard page source again, but as I expected, they matched exactly like usual. Back when the discrepancies first started, I thought that if it weren't a cash difference, there must be some difference in the market probabilities used to calculate the portfolio values, but there was never any pattern in the holdings of those affected by the swaps, so it didn't seem plausible.

> Fortunately, I had a new hypothesis - if it's not cash or market value, it must be some adhoc per-user adjustment. Specifically, back when the contest first started, there was a lot of chaos due to low liquidity and people not understanding how Manifold worked, and people complained that it was unfair that a few users who happened to be lucky on the first day profited immensely from these errant trades. Therefore, the organizers announced that they would subtract off people's winnings from the first day for scoring purposes, but still let people keep the money (so they still have an edge with a higher bankroll).

> I thought perhaps they only got around to implementing that in mid-January, thus causing the discrepancies. I modified my script to simulate the standings after the first day of the contest, and then subtracted them out from the scores, and sure enough, it caused my projected leaderboard to finally match. Of course, it is hard to say this is correct with confidence with only one datapoint, and I may be somewhat off on the exact time they checked the scores to calculate the adjustments. However, it is notable that the top 20 after the first day included Johnny, Adrian Kelly, Mark, David Hassett, and Henri Lemoine (and no other users I've been tracking). I believe that set neatly accounts for one member of every discrepancy that I recall seeing before, so it seems likely that this is the answer after all. It's nice to finally solve that mystery.


## First Bets

After the 4th, I didn't write about Salem again until the 12th, as I basically wasn't doing anything in early March. On March 12th, I wrote the first code to try to reverse engineer the leaderboard score adjustments, and also made my first minor bets for March.


> **12.03.23**

> **22:15** - The main news is that after lunch, I finally spent a couple hours on Salem. First off, just for fun I wrote some code to automatically put bounds on the adjustments for affected players by calculating what the minimum and maximum possible adjustment they could have without changing the displayed top 20. I figured that the adjustments I estimated before probably aren't exact, since I don't know which time point they used, so it would be nice to see if they could be bounded directly. Over time, as people's portfolio values bounce around, the calculated bounds should be narrowed down. However, it is hard to get much data like this unless the leaderboard happens to get really shaken up again.

> After that, I finally spent time looking into the current unresolved markets and trying to decide what to do next. The markets now are relatively boring, but there are two notable markets, for the Chicago mayor race and Wisconsin supreme court race, both on April 4th. There's also another Biden approval 42% market for April 1st, but there's unlikely to be much drama or profit opportunity there, as he's currently sitting at almost 44% on 538. (Then again, that's what I thought last time!)

> I still don't have any plans and don't see any good profit opportunities, but I did make a few small bets just for the sake of it - $600 on Russia to hold Melitopol on 3/31 (96%) and $100 on Vallas for mayor (65->66%), plus an additional $100 limit just below market on both.


> **13.03.23**

> **22:45** - I made some more bets on Salem this evening - $200 each on Trump Twitter (16->14%) and Biden Approval (82->84%).

> **15.03.23**

> **01:09** - Salem remains quiet. Tonight I put down $140 on Trump indictment at 69%. Conveniently, the market was at a limit order, and thus it was actually 69%, so this is equivalent to buying in at ~66% under normal circumstances.

# March 16-31

![Score graph](/img/salem2/mar2.png)

As of March 4th, things were looking pretty good for me. I was up to seventh place, and the top six were relatively closely packed ahead of me. In fact, I was only 22.4% away from first place ($9168 vs $7489)! Sadly, Zubby and to a lesser extent, Johnny soon started running away again.

Although I was officially in 7th place, I knew I was effectively in 6th because 6th place was Ben, who was a) barely ahead of me and b) not doing anything, and thus I knew that I would naturally pass him eventually even with just safe bets. However, my goal was to get into the top 5, which would be much tougher, and March ended up going pretty badly for me, especially at the very end. I was very conservative in March, so my balance barely changed, while the other top 5 players raced ahead of me, putting them much further out of reach.

## The Trump Twitter blip

As in January, I checked the Salem website frequently in March, hoping to happen to be the first person to see a major dumb money spike and thus the one to profit by trading against it. However, I didn't have any luck on that front. In fact, it actually *backfired* for me, as I managed to catch a "lucky" dip during the short-lived spike in the Trump Twitter market and sold out. But it immediately went back down again and I would have done a lot better if I hadn't been "lucky" enough to see that dip and I'd never sold in the first place.

> **17.03.23**

> **18:02** - Salem: Since I got back into Salem last week, I've been checking it several times a day, but it was eerily quiet up until today. The first bit of drama happened late this morning. When I checked around lunchtime, I saw that someone had bought Newsom to Run for President (by June 1st) from 17% up to 41% an hour and a half before. Sadly, Johnny and zubby had already pushed it back down to 22%. Even checking several times a day, I'm always late to the party.

> Even months ago, I'd concluded that the chance of Newsom running was effectively zero, but there was no way to profit from the market, since betting against it would mean tying up your money until June, and back in January, I was desperately short of capital and had more profitable short-term opportunities anyway. This time however, I have a much larger bankroll (and June is a bit closer), so I threw in $100 to bump it down to 21%.

> While I was at it, I threw another $100 on Biden Approval at 88%. I realized to my amusement that the Biden Approval and Trump Tweet markets had nearly the same odds and maturity (it was at 12% at the time), but decided not to bet any more on the latter, as it was too unpredictable compared to opinion polls.

> This evening when I checked after work, I saw Trump Tweeting had spiked to 37%, with the run starting at 1:19pm (i.e. not that long after the lunch session). It looks like the reason is because Trump posted to Facebook this afternoon, and thus it suddenly looks like he's likely to tweet too. Sadly, I'm late to the party as usual. I decided to stay put for now and pray I get lucky, but the next few weeks are certainly going to be nerve wracking. At least I only had $200, but losing that much is still painful, when profit opportunities are so slim. I was only like $200 behind 6th place these last couple weeks, and still trying to figure out how I could even make that up with all the markets so quiet and no obvious opportunities for big profits besides the Vallas election.

> Incidentally, Trump Indictment also shot up this evening for no apparent reason, going from 71% to 80%. Anyway, that's the Salem news, a fresh source of worry as I'll probably be checking even more obsessively for the next couple weeks than I had been.

> **18.03.23**

> **20:03** - On the Salem front, I had a remarkable stroke of luck Friday night. I decided to check Salem one last time before going to bed, and saw that Trump Twitter had both gone up slightly (as well as Trump Indictment). I opened up the bet history to check who had pushed it up (Connor Pitts), but even as I had the page open, a new bet came in. Some random person had put $999 on NO just seconds ago, sinking it from 38% down to 23%.

> I decided to buy $60 of YES (23->25%) in order to close out my position at a low price while I still could, since the way the market had been going, I assumed it would quickly be pushed back up to the high 30s. I didn't expect it to revert *that* quickly though - just a minute later, Connor bought it back up to 35%. He must have still been on the site from when he made his previous trades 25 minutes before.

> I kicked myself for not buying more than $60 so I could flip the extra at a profit, but of course hindsight is 20-20. I was a lot less regretful this morning when I got up and saw that it was down to 31%. It seems that the Zubby-Johnny duo had cooled on it again. The shallow decline belied the volatile trading overnight, as it went up to 44% and down to 27% during the night. However, there hasn't been a single trade all day since I got up.

> This evening, I checked the leaderboards and noticed that Connor had climbed from 5th to 3rd (presumably on the strength of his recent massive bets on Trump Indictment, currently at 91%). I got on the desktop and ran the stats script again, hoping that the leaderboard flux would help narrow down the bounds on everyone's first day adjustments.

> Unfortunately, the adjustment bounds are still extremely wide, because the only way to get it really narrow is if I happen to run it when two relevant users happen to be very close to each other. Still, it was enough to resolve one question - whether those unlucky enough to lose money on the first day (as Spencer did) had their standings adjusted upward. I didn't think they would, but it was nice to have confirmation.

> I also discovered that Zubby is now ahead of Johnny even without the latter's downward adjustment. I also added code to the script to calculate how far I was from 5th place. I'm currently 4.4% ($329) away, down from 5.1%/381 last week.

> I also ran the numbers if Vallas won or lost and found that for one, I was the beneficiary of the paradox. If he wins, I'll be 2.6%/198 away, but if he loses, I'll still be only 3.3%/240 away, and in sixth place either way. The reason is that the current 5th, David Hassett, has a huge YES position on Vallas. If he wins, David will shoot up to 2nd. If he loses, I'll lose my bet, but still get closer to 5th because David will fall to a distant 7th, so I'd only have to catch up to Ben, the current 6th place.

> **19.03.23**

> **10:45** - Salem: Connor dumped $2013 of Melitopol overnight for no apparent reason. I'd bought $100 yesterday, and thus regretted not putting in a limit instead, but of course hindsight is 20/20. It's also a bit silly to regret just $1-2 of forgone profit while ignoring the uncertain markets where vastly larger sums are won and lost. Speaking of which, Trump Twitter was down to 23% this morning (now 24%). It has fallen a lot faster than I expected on Friday. In retrospect, I would have been better off if I hadn't gotten "lucky" and dumped it at a loss Friday night.

> However, I was still happy to see Connor's sale because the transaction fees heavily penalize cashing out high probability bets, and it's always nice to see a competitor stumble. I've long ago given up on catching up with Johnny or Zubby, but 3-6th (Mark, Connor, David, and Ben) are my primary competition right now (8th+ are far enough behind that there's little immediate risk there). If anything, when I see the highly active ZB+J duo taking profits, I'm disappointed that it wasn't me but relieved that at least the money isn't going to anyone else.

> Normally when someone cashes out of a sure-thing bet like that, it is because they need the money to invest in a different, more profitable opportunity, but it appears that Connor just sold out for no reason and kept everything in cash.

> To figure out what happened, I fired up the stat script again this morning and discovered that my rankings now had Henri and Stevie swapped (in 17th and 18th), thus confirming for the first time that my adjustment numbers don't exactly match the ones actually being used.

## Adjustment reverse engineering

I didn't have much luck actually *trading* in March, but I also devoted considerable time and thought to reverse-engineering the leaderboard score adjustments, and had a bit more luck there, though I wasted a lot of time on data collection practices that later turned out to be pointless as I came up with better ideas instead.

> **20.03.23**

> **07:52** - Salem has been quiet, but I noticed this morning that Connor was back up to 3rd on the leaderboard. I had already shut down my computer last night, but decided to fire it back up to run the stats, since I assumed the fact that he had changed rank again meant that he must be close and this would help narrow down the adjustments. Sure enough, David Hasset became the second person after Henri to have accumulated bounds that no longer include my calculated adjustment value.

> The new bounds for David are -291.8 to -194.1, while my estimated adjustment was -189.8. Henri was unchanged at -60.8 to 31.1 (-73.0). Johnny was also unchanged at -1477.2 to -195.9 (-914.7). It's hard to get tight bounds for the higher ranks, especially Johnny, since the bounds can only be narrowed down if he happens to get really close to another player. And Henri's bound still includes 0 (obviously I now know that there are no positive adjustments, but I figure I might as well leave the upper bounds above 0 for consistency.)

> I also lost a bit of ground against 5th place (now ~5.7% behind), due to Connor, Mark, and David moving up, though I can't tell the exact numbers since Mark and David have unknown adjustments. Ben, who is still 6th, has done essentially nothing for weeks, and I've effectively already passed him, but my goal is top 5, not top 6, so that is largely irrelevant (it just helps in the sense that Ben staying put means that I at least only have three competitors in the Red Queen's Race rather than four.)

> **21.03.23**

> **07:25** - On the Salem front, I checked the leaderboard again around noon yesterday and discovered that Connor was back in 5th. I wanted to immediately boot up the computer and update the adjustment bounds, but of course I couldn't do that during work, so I did it after work ~5:15. Fortunately, nothing much had changed since noon. Mark became the third person after David and Henri to have confirmed that my estimated adjustment is incorrect.

> As usual, the markets have been quiet. I've been checking the news several times a day though to try to get hints about when the Trump indictment might come down. It's probably pointless, but the biggest potential profit opportunity is if I can somehow be the first person to break the news. It seems very unlikely, but I have to at least try. It sounds like nothing is expected today though.

## The (second) Biden dip

I had a big scare in late March when Biden's approval rating dipped again and it seemed like we were headed towards a repeat of January.

> **17:56** - After getting up, I checked 538 and noticed that Biden's approval had slipped to 43.5%. I hadn't been checking it regularly, since it was so high and stable, but I decided to check again today. It was concerning, but I decided to hold, since buying and selling incurs high costs and I learned the hard way back in January that overreacting to every little bump is a fool's game.

> Not too long afterward, zubby sold it from 90 down to 87%. I bought an additional $100 yesterday morning, which was unfortunate timing. I wish I'd waited, but of course hindsight is 20/20. I checked 538 again this afternoon and it was down to 43.4%. I got on my desktop and ran the stats again in case the fall had jiggled the positions enough to narrow down people's adjustments.

> Also this afternoon. Josiah Neelely put $1000 into Trump Indictment, bumping it up to 92% (they seem to barely move even with large amounts of money when they're so close to 100%). Someone else bought Trump Twitter from 21% to 24%, which was another minor bit of unfortunate timing, as I'd put in $50 at 21% yesterday.

> **18:25** - ... I checked Salem, and despite no market moves I could see, Connor is back in 4th place, sandwiched between David and Mark. That'd be the perfect opportunity to (probably) narrow down the adjustments, but of course I couldn't use the desktop even if I wanted to right now.

Note: I couldn't use my desktop because the power was out.

## Linear programming

Once the power came back on at my apartment, I fired up the desktop and started reverse engineering the score adjustments again. This time, I had the idea of using a linear programming solver.

> **22:58** - Later tonight, I fired up the desktop and dumped the stats again, as Connor and Mark had traded places again. However, my main plan was to spend the night analyzing the data and seeing if I could develop better bounds.

> The first step was to simply re-calculate the bounds (using different, newly written code). When I first started accumulating the bounds estimates, each time I did the update (eight to date, going back to the 12th) I also dumped (to json) the top 20 on the leaderboard and also my calculated portfolio values for every user at the time, with the idea that I could potentially later re-analyze that data with different algorithms.

> Unfortunately, the first time (data left over from the 4th, IIRC), I forgot to record the portfolio values, so the running bounds estimates were based on additional data not included in the complete log. This turned out to only matter in one case - the lower bound on Johnny's adjustment.

> The current bounds are (195, 1477), but without the missing data, the lower bound is 0. (Since I know now that all adjustments are negative, I decided to flip the sign and re-define the adjustment as the (positive) value subtracted from the rankings to make things simpler.) Back at the beginning of March when I first checked, he was already in 2nd but still had a higher net work than zubby. However, between the 4th and the 12th, zubby zoomed ahead and now beats Johnny outright, and thus it won't be possible to put a lower bound on him unless he starts flirting with 3rd place, which seems pretty unlikely.

> As it turns out, it looks like I happened to have saved a copy of the leaderboard from March 4th, (as well as January 28th and 29th when I was originally trying to figure out the discrepancy issues.) I could conceivably try to reconstruct what everyone's portfolio values were at that time and feed that data in, but that's more work and a lot less reliable.

> After writing the new bound calculator script, the next step was to apply linear programming. The original algorithm I've been using is pretty stupid. When an adjustment candidate is next to a non-candidate (users who didn't bet on the first day of the contest are assumed to have no adjustment) on the leaderboard, you can trivially update the lower and/or upper bound on their adjustment based on the difference in their values.

> However, when two adjustment candidates are next to each other, this doesn't work. The original algorithm just conservatively applies the current worst bound to each value when calculating the difference to adjust the bounds for the other. I'd been thinking that it would be a lot better to accumulate bounds on the difference between their adjustments and then feed everything into a linear programming solver. I figured it would probably be overkill, but wanted to try it just to see what would happen.

> Anyway, I did successfully get the LP solver working. Since it only applies when two candidates are next to each other in the rankings, I thought it would only be relevant to Mark and David. However, it actually turned out that the only improvement was a slight decrease in the upper bound on Johnny, from 1477 to 1400 (Johnny has been next to Mark and David at various points when I dumped the stats, as Mark/David/Connor have been shuffling around 3-5th the whole time).

> Anyway, it pretty much doesn't actually matter for anything, and I already have pretty tight bounds for Mark and David (404-438 and 194-208), the only ones directly relevant to me, but I thought it would be an interesting experiment, and it was sure more fun than watching Cowboy Bebop would have been.

## Biden Approval

> **22.03.23**

> **22:18** - When I checked Salem around 11am, I saw that Trump Indictment had suddenly fallen from 91% to 84% two hours earlier, presumably a result of the news that the grand jury would not be meeting today. I'm so glad that I was conservative and only put in $140 at 69% and had decided to only put in more money once the outcome was certain. I feel bad for Josiah Neeley, who put in $1500 at the top (though I guess it worked out for him in the end on the Biden rollercoaster in late January). I considered selling at 84%, but it seems to me like it is still probable, even if it will take until next week. Later, someone sold down to 81%.

> Much more worrying was Biden's approval rating, which continues to fall. I was alarmed that it had gone from 43.7% to 43.4% to 43.1% in two days, per 538's tracker. How does this always happen in the final week of the month? And this time, there isn't even any obvious scandal that could be driving down the numbers. This afternoon, it was down to 43.0, but went back up to 43.1 later.

> I did not bother firing up the desktop to dump stats this evening and see if it would further narrow down Mark or David's bounds, since there's no real point. What would be more interesting is if the leaderboard got shaken up enough to test some of the other pairings and narrow down bounds on other players, but of course I don't actually want that to happen from a personal winning standpoint, unless it happens by one of the top 5 players suddenly dropping past me.

> **23.03.23**

> **07:10** - ... When I got up, I saw that Biden's approval had fallen to 42.7%. If I didn't know better, I'd swear that zubby had a button to magically tank his approval in the final week of every market. I guess all I can do now is anxiously sit tight and pray that it stays/goes back above 42 at the end like it did in January.  It made it hard to concentrate on [Japanese study] this morning, so I stopped early. Hopefully I can avoid worrying about it much though.

> **24.03.23**

> **08:04** - Finally a bit of good news on the Salem front. 538 didn't update at all yesterday, staying at 42.7, and when I got up, I saw that it was now up to 42.9%. Of course, that doesn't mean he's out of danger, but it does reduce the risk. I decided to put in $150 (75->77%) and hope for the best.

> Also, when I checked last night, I cautiously decided to throw $40 more into Trump Indictment (74-75). I don't understand why it dropped so much. The coverage I've read indicates that the delay doesn't actually affect the chances of an indictment coming down. I wonder if people had overreacted originally.

> Trump Twitter also fell to 11% overnight, but I haven't touched that lately, following my two $50 buys at 21 and 24%. Also, someone bought down Newsom to 19%, the first trade in that market since my own buy back on the 17th. It's funny because I thought I was taking advantage of a temporary spike to get a good price, but the market is so thinly traded that that turned out to be a complete illusion.

> Anyway, I'm not out of the woods yet, but at least I have reason to be more optimistic about my position again.

> **25.03.23**

> **08:54** - Later Friday morning, Connor Pitts threw $1000 into Biden Approval (77->84). That was at 8:42. At 8:55, zubby sold down to 83%, and at 9:06, Johnny sold down to 80%. It's amazing how fast they are, particularly zubby (Johnny has seemingly been a lot less active lately).

> Then at 11:03, zubby bought it up again, followed by Johnny at 12:27 (for some reason, he's always behind zubby and thus gets worse prices on each direction), pushing it up to 89 (Josiah later bumped it up at 90 at 4:26pm).

> The market bounced back a lot faster than I expected. It's funny because I was incredibly nervous putting in even $150 on Friday morning, and now I'm kicking myself for not putting in a lot more. Connor basically stole my thunder by being a lot bolder, and he's probably going to make a lot more than me on the market, despite the fact that I had the "diamond hands" to hold through the dip and was the one who bought at the bottom. On the bright side, it's nice to see zubby and Johnny look like fools for once.

> Meanwhile, the Trump Indictment market is still where I left it over a day ago (a rando threw in $12 yesterday, but it is still at 75%.) I'm beginning to suspect that everyone actually knew something I'm missing somehow after all. I can't understand why everyone would suddenly think the indictment is much less likely just because of the grand jury delay. It's funny because when I buy at the dip and everyone pumps it back up, I regret not buying more, but when they don't, I get nervous, even though I only put in $40. But that's just hindsight bias of course.

> Paul Vallas has been pretty stable, stuck in the 60-66% range for weeks, and I haven't paid it much attention, but I saw a story yesterday that the polls have narrowed significantly. As usual, I just have to hope for the best.

> **11:38** - I also threw in $50 more into Biden Approval and Trump Twitter (at 90% and 11%) this morning. It's ironic that the latter now offers slightly better odds. I wanted to go all in on Biden Approval in my heart, but I realized that logically, the chance of something going wrong in the next six days is probably still at least 9%. In fact, it's even worse than that, because with Melitopol at 96%, that means there is a risk-free return of ~3% so the effective return on Biden is only like 6% now.

> Anyway, after breakfast, I spent an hour or two working on the Salem scripts again out of curiosity, even though the adjustment estimation stuff is completely useless. I solved the unknown time problem by modifying the script to calculate the entire range of time during which the top 20 user's balances matched the expected values, and then calculated the upper bound on the difference between each adjacent pair of users across the entire time period and used those for the calculations, rather than a specific value from a specific point of time.

> The March 4th dump gave me a lower bound on Johnny as expected, and also decreased the upper bound (now 196-1183), with no other changes. The January 29th dump only tightened the lower bound on Henri Lemoine, and the January 28th dump (from before the double Q4 GDP resolution was fixed) provided no new information at all. Oh well. I was really hoping that the long ago dumps would be more useful, but I guess the current bounds are mostly tight enough that they are unlikely to be improved.

> Afterward, I ran some counterfactual scenarios. I'm currently just 1.43% behind 5th, but that is largely an illusion because I'm once again a victim of the paradox. Even after this morning's purchase, Connor has ~50% more Biden shares than me, so even if it resolves YES, I'll lose ground and be 1.90% behind. (Mark also has a fair bit on Biden, albeit less than me.)

> I also discovered a different sort of counter-intuitive paradox as far as Trump Indictments goes. As I have $180 riding on it, I always assumed I should be rooting for YES. However, I discovered that zubby, Johnny, and Connor all have huge (2000+ share) positions on YES, which means that if it resolves NO, I'll rise to 5th by default despite my loss as Johnny and Connor fall out of the top 5. Meanwhile, if it resolves YES, I'll be 4+% behind 5th place again. I guess now I just have to pray that he *doesn't* get indicted. It almost makes me think that I should sell my stake in order to double-down on the defacto NO bet.

> Anyway, that was the morning - a lot of time wasting worrying about Salem, and not even the kind of worrying that leads to useful results.

> **20:21** - Anyway, I got home at 3:52, and spent 20-30 minutes lost in thought before finally checking the computer. I saw that Stevie Miller (now 11th place) had bought Trump Indictment down to 70%, and I was now 6th place on the leaderboard. It didn't come by passing Ben as I always expected, but by him swinging the market almost exactly just barely enough to place Connor under me.

> I also ran the stats again and discovered that now if Trump Indictment magically resolved NO, I'd still be in 6th with Stevie in 5th. He now has over 5000 NO shares. The purchase this afternoon was only a small part of that, but apparently enough to tip the counterfactual rankings. It looks like he has been consistently betting against indictment for the last month, including several bets when it was at 90+%, so it's no wonder he has so many.

## Optimal bet allocation calculator

> **27.03.23**

> **13:48** - ... I wrote a script to calculate the optimal allocation of money between multiple equivalent markets on Salem. Assuming nothing unexpected happens, at the end of the month there will be three near certain markets resolving imminently, Melitopol. Trump Twitter, and Biden Approval. They'll probably be like 98% by then, but I figure it's best to throw most of my remaining money in there at the end to earn a few quick pennies. The question is how to split my bets between them.

> I'd originally planned to write a function like this back in December, when there were something like six different markets resolving at year's end, but never got around to it. Better late than never. The code doesn't take into account limit orders, which make things way more complicated, but I don't expect anyone to put in limits against a sure market anyway.

> Speaking of Salem, I saw Sunday morning that Stevie had bumped Trump Twitter back up to 11% and put in another $107. I soon had second thoughts however. When I went on my walk Sunday morning, I as usual spent the whole time ruminating about Salem (and ignoring Noriko's podcast in the background), and regretted my wager and concluded that it was a bad idea. My regret was short-lived however. A few hours later, someone bought it down to 8%, and it is now down to 6% (or rather was when I left for the doctor this morning.)

> **28.03.23**

> **21:51** - Anyway, after finally getting home, I immediately drank some water, then briefly checked Salem, put away the groceries, and took a second shower. I'd missed what at the time seemed like a bit of excitement in the Trump Indictment market, as while I was away, it had gone from 70 to 69, jumped to 76, then back down to 69 and finally ended at 72%. Since it was a weekend for me, I'd almost forgotten that it was still Monday and thus the grand jury was meeting and there was news that might sway the market. Of course, that was nowhere near the swings on Tuesday.

## Zubby's Windfall

In one of the most remarkable coups of the contest, Zubby somehow managed to buy a huge dip after only *four minutes*, cementing his massive lead over Johnny in first place. Zubby did it by hand, but Johnny turned out to actually be using a bot to alert himself to major market movements like this. Somehow even with the bot, he ended up being consistently slower than Zubby in March, to the point where I nicknamed him "Johnny Come Lately".


> **29.03.23**

> **20:34** - Around 1:10, I checked Salem, and saw that I'd missed some major action in the Trump Indictment market, real drama this time, not the piddly little nonsense that had passed for drama back on Monday.

> Specifically, at 10:22 Alec Cenci (then 18th place) suddenly bought it from 72% all the way down to 28%. Then, just four minutes later, zubbybadger bought it back up to 61%, and at 10:44, Johnny Come Lately bought it up to 68%. It's funny how Johnny always seems to follow behind zubby, getting worse prices each way. I was amazed at how fast zubby had jumped on it, and asked if they had a bot set up to notify them of market movements or something, but they said they just got lucky. It makes sense, given that they aren't normally quite that fast.

> Anyway, I decided to take the opportunity to sell out my own stake (68->65%), netting $162 for a loss of $18. It's hard to sell at a loss, but the news of yet another week's delay (plus a delay in the Georgia case) made me want to just wash my hands of the whole thing and free up the money for other bets (not that I'm exactly short of cash at the moment). I was really glad that I sold out, because this morning, Johnny sold down to 62%, and then Spencer down to 59%.

> That wasn't the only market action I missed Tuesday morning. Alec Cenci also dumped Trump Twitter from 5% up to 14% (also at 10:22 and the same amount they immediately threw into Trump Indictment). No zubby/Johnny squad stepped in to try to correct that one - it took until 12:22 when Krum-Dawg Millionaire bought it down to 9%.

Not only did I fail to call the Trump Indictment market, but I managed to sell near the bottom, because of course I did. I think there might have been an element of wishful thinking involved. If the market resolved NO, it would be really good for me in the contest, and also better for the country (as having the first indictment be based on a relatively insignificant crime with a dubious legal theory would make it seem like a political witch hunt and cause people to be more dismissive if/when Trump later got indicted for more serious crimes - but of course Bragg had his own incentives.)

## The Big Miss

It was the last two days of the month when things *really* went south though, as not only Zubby and Johnny jumped ahead, but so did Connor and my other competitors.

> **30.03.23**

> **08:04** - There was a bit of bad news on the Salem front, as when I checked 538 in the afternoon, I saw that after five straight days of Biden's approval staying at exactly 42.9% across multiple poll updates, it had fallen to 42.7% at 11:50.

> This is exactly the kind of thing I worried about before, but it is too late to do anything about anyway. I just have to pray that it doesn't fall farther in the next two days. It was unchanged at 42.7 after another update in the evening, and when I checked after getting up this morning, I saw it was down to 42.6%. Coincidentally, 538 had updated just 38 seconds before I checked after getting up. The Salem market seems undeterred though. Just 15 minutes before, zubby had sold it up to 96%. Zubby has normally been more bearish on Biden than me and somehow knows about the polls before they show up in 538, so if they're acting like it's a sure thing now, I guess I shouldn't worry too much.

> Also, this morning on Salem, Johnny responded to my comment from two days ago saying that he *does* have a bot set up to alert him to market movements. It's funny how despite having a bot, he is consistently slower than zubby, who is apparently doing it all by hand. Anyway, it makes me think that I need to invest in figuring out how to set up a bot of my own so that I'm not fighting one handed.

> **17:31** - Well, today was certainly a day on Salem. This morning when I checked the leaderboards, I was up to 5th place, having finally passed Ben, presumably on the strength of the final bump of Biden Approval up to 96%, and having not yet been overtaken by Connor, presumably weighed down by Trump Indictment.

> Unfortunately, it was short lived. I randomly checked Salem again at 3pm and found way more action than I expected, as Trump Indictment had spiked up, with news having just come out reporting that the grand jury voted for indictment.

> The first buy was actually a rando, Chris Rigas, 59->67% at 12:31pm. However, I assume that was just random, not based on any information. The real action started at 2:25pm when zubby suddenly started buying it up at 61% (Johnny and Josiah having pushed it back down a bit). Zubby pumped it to 75% (with some resistance from Johnny), followed by a rando (Thomas Stearns) boosting it to 84% at 2:31pm.

> After one last sale at 2:32, Johnny stopped trying to push it down and started buying it up again at 2:33pm, soon joined by PPPP and Josiah Neeley. At 2:41pm, Connor Pitts jumped in, throwing in a massive $3611 in, which (plus another 300 from Josiah) took it up to 96%, where it still was when I happened to check in an eon later around 3pm.

> Of course, it was far too late for me to do anything there. It didn't seem to make sense to buy in at 96% when the time to resolution is still uncertain and Melitipol is sitting at 97% to resolve in just a day and a half. That didn't stop others from later pumping it up to 98.7%, so either they think it will resolve in the next day for sure, or they don't understand opportunity costs at all (which to be fair, is a hard concept, and something I've messed up before as well.)

> The chaos in Trump Indictment did lead to unusual moves in other markets as well. China GDP >4% jumped from 9 to 14% as Connor dumped his stake to free up money to put more down on Trump. That's the one that tanked back in mid January as the outcome became certain, but it won't actually resolve until the end of June, and so has just been sitting around testing people's time value of money.

> Newsom To Run For President, also spiked up to 31% as zubby dumped it to free up money. That one, I put $300 into (down to 26%), so at least I (hopefully) was able to profit slightly off that.

> Zubby also bought Trump Twitter up to 10% at 3:08, which I guess makes sense, since there's always a risk of important high profile news like this being what spurs Trump to finally start tweeting. I just nervously checked his Twitter page a few times over the next hour, hoping to be the first to see it if it did happen. Ussgordoncaptian was less cautious though, putting seemingly their entire stake on it (down to 2%) at 3:29pm - others later brought it back up to 5%.

> Anyway, this was pretty unfortunate news for me, though I suppose at least I haven't outright lost any major bets yet, like Biden Approval. But it does mean that I'm much farther away from the top 5, since Connor was the only one I was close to. I haven't booted up the desktop to check, but I'm guessing that I'm now a lot farther away than I was even at the beginning of March. Oh well. At least I did briefly reach 5th place.

> Anyway, it's now 5:49, but I really had to get that off my chest, as I've been thinking about Salem all afternoon, and couldn't even concentrate on trying to study Japanese after work.

> **17:53** - P.S. What really stings about the whole thing is that it was Connor Pitts who managed to join in. Zubbybadger now having basically infinite money is one thing, but it's not like I ever had any chance of beating them anyway. But Connor was my closest rival, and now he's lightyears ahead again (in fact, he's up to 3rd, ahead of David and Mark). I wish I had a bot to alert me to major market movements. If it had been me there instead of Connor, things would be very different. It wouldn't be a complete reversal of positions, since I think Connor already had a large stake in the market - his gain wasn't just from the big bet this afternoon, but I would certainly be a lot closer.

> **19:23** - Even worse news on the Salem front: the Trump Indictment market resolved at 6:49pm today. I'd been hoping that it would take several days to resolve and lock up everyone's liquidity so that I would at least be able to eke out another percent or two on Melitopol et al., and the fear that that might happen is the reason I stayed out of the market. But no such luck, and Connor and Josiah have already plowed large amounts of money back into the other markets. Incidentally, zubby's total profit on the indictment market was $4,592, almost half of their total portfolio value as of last weekend. They're now likely in a more dominant position than Johnny ever was.

> **31.03.23**

> **18:40** - Well, on the Salem front, I screwed up again. I had assumed that the Trump Twitter and Melitopol markets would both resolve at 9pm (midnight Eastern) on the 31st, with Biden Approval following at 6am April 1st. Last weekend, I wrote a script to calculate the best way to distribute money between multiple markets, and planned to wait until Friday evening and use it to throw my money into the three markets and eke out whatever pennies I could.

> Unfortunately, Trump Twitter resolved at 11:01am this morning for some reason, which means that much like with Trump Indictment yesterday, I left a bunch of money on the table by failing to invest before resolution and that it freed up other's money to join in the remaining markets. After work this evening, I immediately fired up the computer and used the script to distribute my money between the remaining two markets as planned. Of course, they were already up to 98.6%, so profit will be minimal, but it's better than nothing.

> Still, it is pretty frustrating, as I deliberately kept most of my money uninvested till the end so that I'd be able to capitalize on any opportunities that arose without having to eat fees and time delay selling out other positions, but I completely failed to capitalize on any of the major profit opportunities that actually arose.

> It's funny because when I examined the state of Salem in early March, I concluded that the main opportunity for profit (or loss) would be in correctly guessing the outcomes of the Chicago Mayor and Wisconsin Supreme Court elections. However, those have barely moved at all this month while the actual action was in Trump Twitter and Trump Indictment. The worst part is that I did invest in the latter, but then sold at a loss. Actually that happened both times.

> The best that can be said for March is that I avoided any major losses (not counting opportunity costs and missed opportunities). I played conservatively and ended up with a slight profit for the month (and overtook Ben, who has just been sitting there the whole time), but lost a lot of ground relative to other top players as a result.

> And much like in January, all my time and effort and obsessive checking of Salem several times a day didn't help much in the end. In fact, not once but twice this month, I took advantage of a temporary spike to close out my position at a small loss, counting myself lucky, only for that to have turned out to be a bad idea. Meanwhile, I managed to miss the most important events. Hopefully I can figure out how to set up a bot to alert myself to market movements, and hopefully that will help in the future, but I'm not sure even that will, and the longer the competition goes, the harder it will be to overtake the top 5.

> Also, as far as the adjustment bounds thing goes, previously all the stat dumps had been a manual process on my desktop, where I had to run the script, manually confirm the leaderboard positions on the website, then comment/uncomment some code and run it again.

> Early this week, I came up with a new idea, where I used the Chrome Dev Tools to dump the page source of the Salem leaderboard whenever I noticed a major movement, and saved the dumps to a Google Doc so that I could later copy out the leaderboard json blob and put it through the script, the way I did with the January 28/29 and March 4th dumps. I spent a while working on that this evening, and it did lead to minor improvements on some bounds. But of course it is a stupid and pointless waste of time, as I already have pretty tight bounds on Mark and David, the two I'm closest to, and tightening them further won't really matter to anything more than idle curiosity. Also, I'm unlikely to get any better bounds in the foreseeable future. I guess now I can finally put that to rest for the time being.

> Anyway, it's now 6:56, so I just spent 16 minutes writing this, and almost the last two hours thinking about Salem. Hopefully I can do some Japanese practice now.

# April 1-15

![Score graph](/img/salem2/apr1.png)

At the end of March, I was pretty disheartened again, as the top five had seemingly slipped out of reach. I concluded that my main problem was that I played too conservatively in March and that I needed to be bolder in betting and take more risks. Fortunately, I ended up reaching the top 5 after all just days later.

Additionally, April also saw more top players drop out of the competition, making the leaderboard increasingly static and lifeless. As already mentioned, Ben (who was ahead of me in sixth for most of March) was not actively playing (it turns out his last bet was all the way back in early December), and players who are just sitting there are relatively easy to pass and also much less of a threat, since they won't jump up and overtake you from behind.

In March, ussgordoncaptain had been behind me in a distant 8th place, making me feel relatively secure in 7th at least, although they did gain ground over the course of the month. However, that turned out to be their last effort, as they, too, stopped playing after March 31st. It's rather ironic, since ussgordoncaptain had predicted back in December that the remainder of the contest would be very quiet, with only a few people left who had any real shot and thus few people bothering to play.

Lastly, Connor Pitts, one of my closest targets in March before he infuriated me by taking large profits and jumping ahead, also stopped playing following the elections on April 4th, leading to the situation where three of the top eight players were no longer actively participating in the contest. This situation would persist for months and only ended whem Malte Schrodl broke into the top eight later on, bumping ussgordoncaptain down to 9th, so three of the top *nine* were inactive instead.

However, I didn't know all that at the time, and April opened with yet another disappointment, though fortunately a relatively trivial one:

> **01.04.23**

> **06:19** - Salem - somehow I managed to just miss things again, multiple times. I knew that the Melitopol market was set to resolve before Biden Approval, and thus hoped to plow the winnings from the former back into the later to earn a bit more. I considered weighting it higher in my script, but had no idea how what price I'd be able to get Biden Approval at afterward, and also worried that it might take a while to resolve (like the markets at the end of February), so I decided to just treat them as if they resolved at the same time in my bet calculation script. At least that part proved wise. Still, I was hoping to be able to reinvest in Biden to get a bit extra.

> Trading on the Melitopol market was set to close at 11:59pm Pacific. Not sure why they used Pacific instead of Eastern like the other markets. I thought they might resolve it at 9pm anyway, but that didn't happen.

> By coincidence, I got caught up reading the Magic subreddits again until 12:04, but of course, trading just closed in the market, they didn't actually resolve it then. I went to bed at 12:27. As usual, I had trouble sleeping, which I thought would be to my advantage for once. Whenever I woke up during the night, I would check my phone to see if I'd gotten the email about market resolution yet.

> At 5:09am, I woke up and saw a notification for an email about Josiah commenting on the market (at 4:50). I decided to get up and check what was going on, but of course, there was no resolution, just Josiah commenting to ask them to resolve it.

> I went back to bed at 5:12 and woke up again at 6:08. The Biden market had trading set to close at 6am so there was nothing I could do, but got up again to check anyway out of curiosity. Naturally, they had resolved the Melitopol market at 5:12am, so I literally just missed it. And I also just missed the reinvestment cutoff. It was up to 99.3%, but I still could have earned a bit more if I had even happened to wake up just 10 minutes earlier. Johnny had immediately reinvested everything at 5:12, followed by two "randos" (what I call people whose names I don't recognize from being on the leaderboard), but at least none of the other top players managed it, not even Josiah.

> Anyway, I tried to go back to bed, but the frustration, etc. of thinking about Salem meant I couldn't fall back asleep like the other times, so I got up again after a few minutes. So I guess I was triply cursed. By just missing the relevant times twice and also waking up early enough to still lose a lot of sleep over it. Oh well, what's done is done. It's now 6:31, hopefully I can make the most of my morning and avoid sleep deprivation headaches. I wish I could start going to bed earlier again.

> **12:45** - Some minor good news on the Salem front. Mark woke up and made a bunch of bets this morning. It seems that he normally keeps all his money invested and thus is only active in times like this when a market resolves and gives him more money. Significantly though, one of those bets was NO on Paul Vallas.

> Currently, David and Mark are neck and neck in 4th and 5th respectively, about 4.7% ahead of me (down from 6.1% when I checked yesterday evening and became dejected, so that's nice at least). Since David (still) has his massive YES bet on Vallas, that means that they are even more anticorrelated on that market than before.

> If Vallas wins, then David will shoot ahead, but Mark will fall back and I'll only have to beat Mark to regain 5th. If Vallas loses, then I'll be set back, but will still not be that far behind Ben, and will only have to catch up to Ben again to take 5th with David knocked out. I did some math and concluded that buying $32 more of YES would equalize these ratios, so that no matter what happens in the Chicago and WI Supreme Court elections, I'll be at most 0.88% away from 5th place.

> Of course, the markets are constantly changing and varying by more than that, and it's not like being 0.88% away from 5th on April 5th specifically is meaningful, and the nature of the Salem is that you have to run as hard as you can just to stay still and if Vallas loses, I'll be knocked down enough that ussgordoncaptain starts looking like a real threat (it helps that he already gained a bunch this week as well), etc. So it's not a particularly good strategy, but using math like that makes me feel clever, so I went ahead and did it. It's only $32 anyway.

## All's Quiet on the Salem Front

On the morning of April 4th, everything was still quiet, and it didn't seem like there was much opportunity for advancement left. Little did I know that everything would change that evening.


> **03.04.23**

> **13:34** - I've barely paid attention to Salem since Saturday morning, figuring that there was little I could do and the markets in play right now aren't ones that were interesting to me as I don't know anything about them. However, I checked this afternoon and saw that Q1 GDP >=1% had dropped a lot and so checked GDPNow and saw that this morning's GDPNow forecast had dropped from 2.5% to 1.7%.

> As GDPNow seems to usually be an overestimate, I thought it was pretty safe to buy NO on Q1 GDP >= 3% now, and put in $500 (21->17%). That's more than my first inclination would want to risk, but the lesson of last month is that I need to be bolder about taking risks (and also have them all pay off for me of course, which is easier said than done).

> I really regretted not actively following the GDP stuff, assuming that nothing of interest would happen for the next few weeks. If I had just checked GDPNow when it came out this morning and bought in then, it would have been at 24% instead. Oddly, the usual suspects, zubby and Johnny haven't touched these markets (Johnny bet on the 1% one yesterday, zubby hasn't ventured in at all). Instead it fell to Alvaro de Menard, currently 15th place, to sell the 3% market down from 24 to 21% at 11:04am today.

> It's funny because when the titans do jump in, there is no opportunity for profit, but when they don't, I worry that there's something they know that I don't. In this case, at least there's the endorsement of Mark. NO on 3% was one of the markets he bought with his winnings Saturday morning (27->24%).

> In other news, Salem added a new market today, on whether Erdoğan manages to stay in office. They also added two markets last Friday, on Trump gets indicted *again* and whether he rejoins Twitter. All three end on July 31st, when the entire contest ends. There are increasingly few markets which resolve before July, part of what makes things less interesting. In fact, I think April will be the first month since last year when no markets are set to resolve at the end of the month (though the two GDP markets will resolve on the 27th, which is close).



> **04.04.23**

> **07:44** - This morning on Salem, I noticed a spike in the "Ukraine to take major city" market, from 39 to 49%. I decided to buy $125 in NO (going down to 45%) and then put in a YES limit at 40% in hopes that the others will buy it back down. It's only a profit of $10 even if I'm successful, but every little bit helps. Oddly, none of the major players have touched this market. The recent movements were all no-names (I think I'll go back to that term, rather than "rando"). I also noticed that zubby and Johnny no longer seem to be betting against Vallas at 66% (in fact the only NO limit is at 80 now), so that's an encouraging sign at least.

> There was also a weird event where "Mark Ingraham" (a no-namer, not to be confused with regular Mark in 5th place) commented on Erdogan last night "This will be a NO, given his charges. Mods are retards and banned me." and then on GDP >1%, "This will also be a NO. Capitalism is in rapid collapse and few if any quarters will have positive growth. Mods are of course retards and prevent me from betting." No idea what is up with him, but presumably he's just a troll of some sort who got banned. Still, this is the first time this has happened in the entire competition.


## Election Night

> **20:25** - Wow, what an evening on Salem! It was pretty tense for a while, but in the end it worked out better than I could have hoped. I first checked in on Salem a little after noon, and basically nothing had changed as usual. I put down $100 on Protasiewicz at 83% just for fun and to hedge my bets a little. I think I might have checked a couple more times in the afternoon, but nothing much happened.

> As the polls had Vallas 2-4% up, indicating a close race, I assumed that the votes would take a long time to count and the results wouldn't be clear for a while, probably not even before 8:59pm when the market was set to close, and so I didn't have much urgency in checking Salem after work and instead continued reading Zvi's latest AI post, which took me until ~5:52.

> At 5:52pm, I finally checked Salem and was in for a shock, with Vallas at 15% and dropping even as I watched. I briefly considered panic selling, but the election results showed a dead heat with Vallas up <0.1%, which seemed like a lot more than 15% to me. It wasn't until several minutes later when I found my way to Dave Wasserman's Twitter, where he talked about how Johnson would have an edge in mail-in votes and thus Vallas's rapidly dwindling lead was bad news for him, that I decided to sell.

Note: I had not previously read Dave Wasserman's Twitter. My strategy was to just endlessly search through the most recent election-related tweets on Twitter until I happened to see people who looked like they knew what they were talking about, a strategy I would employ again for the two Turkish elections, and also the way I later found out about the ScotusBlog.

> By the time I sold at 6:00, it was down to 9%, and I only got $28 for my original investment of 232. Fittingly, Johnson first took the lead outright immediately after I sold. I also discovered that 538 had a live blog and anxiously spent the next hour flipping between the NYT election results for the two elections, the Salem market pages, Wasserman's Twitter, and the 538 Liveblog.

> After my sale, Josiah continued buying down to 6%, Sam Dittmer bumped it up to 12% at 6:09 and Josiah had one last buy down to 10% at 6:10. I assumed Josiah was out of money at that point. I put in $500 of my own on NO at 6:14 (10->8%) and then another $1000 (8->6%) at 6:15 as Johnson's lead widened. I immediately had second thoughts though and actually had a $50 YES limit out at 6% for a while, but there were no takers, and I canceled it once the next round of votes came in and Johnson's lead widened again. It didn't help my nervousness that others had bought it back up to 8% (it didn't turn until 6:42, when Sam dumped his stake).

> I also started buying up the WI Supreme Court market once results started coming in, at first only a little bit, but more and more as more results came in and 538 and Wasserman talked about how Kelly was underperforming Trump in the major counties, etc.

> At 6:54, I put in the last bit of my money, $200 on each market (at 5% and 95%). Well, I left $79 uninvested for liquidity sake, but I invested essentially all my money as the results became clearer. With Johnson's lead up to 2.4% and WI called by various places, I figured there was no point in watching things further and decided to go out for donuts to celebrate and hope for the best.

> I left at 7:01 and got back around 8:16, and saw that both markets had resolved, at 7:38 and 7:39pm. One thing that really surprised me was how absent the top players were during the critical 5:30-7pm period. Zubby did a bunch of selling on the Vallas market early on (5:28-5:37) but disappeared after that. Most of the selling was done by Josiah Neeley and a couple of nobodies (Noah Lafountain, Sid Sid, and Richard Zhu, with Noah being the earliest and most active). The WI side was even better, as while Noah and Josiah (and a couple bets from others) were there buying it up with me, I was largely ahead of the curve and thus managed to harvest a lot more of the profit than I would have expected. In particular, I was the first person to bet really big on it, with $1500 at 6:43 (89->91%).

> In fact, I actually made a big profit overall, despite taking a huge loss on my initial bet on Vallas. My "net worth" is now up to $8168, up from $7828 right before the big plunge at 5:21. And that means that I'm now in 5th place again, with David knocked out of the top five and my bold bets this evening boosting me back past Ben and even ahead of where I was before.

> There was a little bit of top player involvement after I left for donuts, but only after the main action was over. At 7:34, David sold $89 worth of YES from 5->2%. I know he had over 2000 YES shares before, and I'm guessing he sold everything and that was all he got for them. Ouch. Connor put a total of $8600 into WI from 6:55-7:06 (95->97%), and then $8900 against Vallas at 7:39pm (2% -> 0.5%). It seems that the WI market resolved at 7:38pm and the Chicago market at 7:39pm, presumably because a human at Salem was manually resolving them and Connor was somehow watching at that exact moment and managed to transfer all his winnings into the Chicago market before it resolved too. That was really impressive.

> Still, it is really nice that for once, I was the one throwing in thousands at 89-93% and Connor the one just getting the dregs later. Take that! And that was pretty much it. Zubby never reappeared and Johnny didn't show up at all. I can't understand how they could have missed out on this, since it's not like election night is an unexpected night and they're usually really on the ball. But I can't complain about my good fortune.

Note: "Liberals Win Wisconsin Supreme Court?" resolved at 19:38:54, Connor bet everything on "Paul Vallas Mayor of Chicago?" at 19:39:10 ($8900 NO, market 2.32% -> 0.51%), and then that market also resolved at 19:39:55. I'm not sure why it took the Salem staff 61 seconds to resolve both markets, but it was a really impressive play on Connor's part. I imagined it being like Indiana Jones rolling under the closing door at the beginning of Raiders.

Little did I know that this would be Connor's swan song. He never bet again, making him a stationary target. He was far ahead of me at the time, but with months left in the competition, I knew that I would pass him sooner or later (in fact, at the end of the competition, two other players also just barely passed Connor, so he finished in only sixth place.)


> **22:05** - Noah Lafountain is now 14th on the leaderboard, so I guess I can stop treating him like a nobody now. 13th place is also a new (old) face, Dylan Levi King. I remember DLK being on the leaderboard back in December before they went crazy and bought China COVID all the way up and then back down again (making me rich for a while in the process). However, it seems that they made a large bet against Vallas back in early March, and hence got catapulted back up the ranks tonight.

> When I checked Salem again tonight after watching the latest episode of Hi Score Girl, I saw that "Will Russia Control Kramatorsk on 5/31/23?" had plummeted, with Mark buying 23->21% at 8:28 followed by DLK putting in $2000 on NO (21->11%) at 9:26. I at first assumed it was a news development and checked Google, but there was nothing, and I realized that they must have just been reinvesting their winnings from the elections tonight.

> I also went back and checked the old Nevada Senate market page to bask in nostalgia.

## Post-election

The next few weeks were uneventful, with the only notable action being the Q1 GDP markets. I stopped checking Salem frenetically like I had in January and March, and planned to write a bot to alert myself to sudden market movements instead, like Johnny had. Unfortunately, I procrastinated for several weeks on the bot, and it only barely worked even when I finally finished it. I also learned that Johnny had written scripts to scrape the API data and calculate everyone's portfolios and rankings, much like I had.


> **05.04.23**

> **07:54** - Salem - Last night I also checked the old Nevada Senate page to bask in my "smartest money" award. It shows the top 5 winners in each market, and I was #2 (809). I noticed that Noah Lafountain was in 4th (387), so I guess he's been playing for a long time as well and just only now made it onto the leaderboard. Incidentally, David Hassett was first with nearly double my profit (1566).

> Last night, David had fallen to 8th, below ussgordoncaptain. When I checked again this morning, I didn't see any notable market moves, but he was now back up to 7th. I figured that this means they must be relatively close together and there was a decent chance they were close enough to help narrow down the adjustment bounds, so I dumped the leaderboard source to my Google Doc for later again. I wish I'd done that last night as well.

> **06.04.23**

> **07:28** - Salem: I completely forgot about my plan to check GDPNow yesterday morning until I suddenly remembered at 9:50. The latest forecast is down to 1.5%, so I threw another 300 in on no for the 3% market (14->12%). Fortunately, my delay didn't matter since people have barely touched the 3% market for some reason.

> Meanwhile, there's been a lot of action lately in the >1% market, with it bouncing around in the 70-80% range. Not sure why everyone is betting there instead of 3%, but I guess to be fair, the outcome is a lot more uncertain and there's a lot more money to be made there if you're right.

> Anyway, no action of note in markets I care about lately, but there was a notable discussion. I went to the Chicago Mayor page last night to leave a comment congratulating Connor on somehow moving his money faster than Salem could resolve the markets, and saw that someone had started a discussion about whether Salem should resolve markets earlier so people couldn't profit off of near certain outcomes. What was especially notable though is that Johnny left some comments with numbers estimating how much profit each person got from markets before they closed. He said that he also wrote a script using the API, so I guess I'm not the only one to do that. I've done my best to avoid mentioning the possibility myself out of fear of it being considered cheating. It makes sense since Johnny previously said that he had a bot to alert him to major market movements as well (although I'm not sure how he manages to often miss them anyway if that is the case).

> **08.04.23**

> **14:22** - After finally pulling myself away from ... this morning, I attended to my Salem script. I put in the leaderboard dump from Wednesday morning, plus one more right then for good measure, but it didn't lead to any bound improvements.

> I also tried using the bounds to reverse engineer the cutoff time. As fun as it is to try to narrow down the bounds purely based on leaderboard observations, the whole thing started as I know that the adjustments were calculated by taking the scores at some point in the first day or two and subtracting $1000 (if above 1000). The only uncertainty was *when* they chose the scores from.

> Therefore, I figured I could use a similar script to the code I already wrote for finding the time range corresponding to the particular set of top 20 cash balances from the leaderboard json dumps and instead calculate all the time ranges which are consistent with the already known adjustment bounds, and then figure out what ranges everyone's scores were at those times.

> Unfortunately, it turns out that there are *no* times consistent with all the bounds I'd established. I figured that the problem must have been with the manual script-based dumps I did many times in late March, where I would manually confirm the order of the top 20 on the website and then put that in together with the calculated scores of everyone from my script. That's a more fallible process than the score bounds reverse engineered from the json dumps because there might have been a change in values while I was in the process of messing with the script or I might have just made a mistake in the process somewhere.

> Therefore, I calculated the adjustment bounds using only the json leaderboard dumps, ignoring the earlier manual logs, and then used those to see which time ranges were consistent. The bad news is that throwing out the mid-March data means somewhat wider bounds for everyone, and the historical reconciliation barely helped with Mark and David, whose scores varied over almost the entire range of my calculated bounds. It did narrow down Johnny's adjustment a lot though, and would also help with Adrien, should he somehow ever make it back into the top 20. Also, the dump from Wednesday morning did improve the bounds when the March data is discarded, so that wasn't a complete waste.

> **09.04.23**

> **10:50** - Anyway, I mostly stayed home and took it easy Saturday, and didn't do much of note. I finally got around to looking into the status of Salem with my script. I'm currently way behind Mark and Connor (~10.3% from 4th place), so there's little chance of me getting 4th (though I narrowly would take 4th if Q1 GDP 1% resolves NO, as Mark is betting on that), but also relatively little risk of losing my spot in 5th. I also noticed that David has invested everything in a mix of three markets, which surprised me as he didn't usually spend his entire stack of money in the past.

> The remaining markets are also much more boring than in the past. I confirmed my impression that they're all long term now. There are 29 markets remaining, of which two are set to close on April 27th (the two Q1 GDP markets), four on May 31st (Newsom and DeSantis to run for president, and Russia to hold Kherson and Kramatorsk on 5/31), one on June 30th (China GDP - which was already effectively decided back in January), one on July 27th (Q2 GDP), and the entire **twenty one** remaining markets are all set to close on July 31st, the end of the competition.

> To be fair, the Erdogan market will probably actually resolve in May, and others may resolve sooner if something specific happens (Trump indictment, return to Twitter, recognition of the Taliban, etc.) Still, it seems like an unusually boring selection of markets for someone like me who had always focused on the soonest resolving markets.

> I think it might be to the point where the time-value of money is greatly reduced and it makes more sense to invest in long term markets. But you still have to be careful there, because there's potential for unexpected developments when you really want to have money available. In any case, it seems like the best I can do is to create a bot to alert me to major market movements, and then stop worrying about Salem for a while (besides checking GDPNow, I guess).

> **12.04.23**

> **07:50** - Sunday afternoon, I spent an hour trying to set up Python 3.10 and the Google Cloud Platform client example before getting tired again and giving up on the Salem bot effort to play Beat Saber.

> **15.04.23**

> **22:52** - I've barely been paying attention to Salem or checking it at all lately, but I did remember Friday morning that GDPNow would be updating its estimate that morning. I checked a bunch in the early morning, but it never updated, and I didn't remember to check again until 1pm, when I saw that it had jumped up to 2.5% (from the previous estimate of 2.2% a few days before, itself a big jump up from 1.5%.)

> Of course this is great news for the country, which is what really matters, but it is more unfortunate for my position on Salem. I'd stood tight on my position after I'd noticed that the estimate had risen to 2.2%, but this was the last straw, and I decided to sell 500 shares, a little under half my position (11->13%).

> I later put in a YES limit at 13% to cash out the rest in the unlikely event that someone else decides to trade. I also threw $100 each into 1% GDP (YES) and Newsom (NO) at 86% and 12% respectively.

> Of course, as usual, it basically didn't matter that I was hours late finding the GDPNow update, as noone else seems to trade on those releases at all for some reason, and particularly not in the 3% market. The whole market had no trading on Friday since 3am, and the 1% market, which had recently tended to be a lot more active, was silent on Friday as well.

# April 16-30

![Score graph](/img/salem2/apr2.png)

After David's self-immolation on election night and Connor's dropping out of the competition, it seemed like the only question left was whether I could *also* overtake Mark and reach 3rd place. It would be tough, but I figured I could probably do it, and even changed my display name on Salem to "I'm coming for you, Mark". I wouldn't manage it in April though.

As you can see from the graph above, April was very quiet up until the 26th when there was sudden movement thanks to the GDP markets, followed by Josiah Neeley quitting and donating all his money to Johnny. I gained some ground against Mark following the GDP markets, only to immediately fall even further behind Mark. (It didn't help that Mark got some of Josiah's money as well.)


> **17.04.23**

> **22:59** - [Sunday Afternoon] I fired up the desktop and checked Salem, the first and only time since Friday. I ran some hypothetical scenarios to see how the rankings would change depending on the resolution of the two 4/27 and four 5/31 markets. The rankings are remarkably stable in each case. I was still 5th in every scenario except when Newsom runs for president, though the exact margins between me and 4th place or 6th place would increase or decrease depending on the particulars. In fact, in most cases, there was not even any movement at all in the top 10 rankings.

> I think I would actually be better off if GDP ends up above 3%, as despite still having 573 shares, Mark has more like 1000, and Ben also has a smaller amount, so I'd be a bit closer to 4th place, and not lose too much margin from 6th (David would start to become a bit of a threat lurking behind though). It's nice that the best outcome for the country is also favorable to me, though it is improbable.

> I was also surprised to discover that almost noone at the top is in the Erdogan market, despite that seemingly being the best place to make money right now, since the outcome is still massively uncertain and it will probably resolve in May following the elections. Only three of the top 10 have any money in it at all, and only small amounts.

> After that, I took the next token step towards building a bot. Last week, I'd left off after getting the Google API client example working, so the next step was to modify it to send email. As I wasn't sure where to find the API docs and I'd heard that people had good experiences asking ChatGPT for help with such things, I decided to try it myself.

> It was pretty amazing, as ChatGPT would explain how to use the API, complete with example code. The first example it posted was incorrect, but once I pasted in the error message, it figured out the correct API. so I guess I've officially found ChatGPT to actually be useful for the first time. I just wish I could get access to GPT 4, since everyone says it is a vast improvement over 3.5.

> Despite it not taking long to successfully get my first test email sent, I got bored and stopped immediately anyway, so the actual bot work will have to continue to wait.

## A missed opportunity


> **20.04.23**

> **07:40** - I checked Salem again yesterday and discovered that DeSantis spiked from 57% to 77% from 10:23-10:29am from three purchases by three different players (it has since fallen back to 67%). I googled a bit to try to find out what happened and saw a news story citing sources that he planned to announce in May rather than June.

> When I checked Salem again just now to confirm the numbers, I also discovered that a nobody had bought "Russia to Take Donbas" from 15% up to 29% yesterday evening (Johnny since bought it down to 24%). So there definitely are opportunities that I'm missing by not checking Salem regularly any more (the Donas one was open for 10 hours before Johnny intervened), though I wonder if I would have been confident enough to take advantage even had I seen it. I'd stopped checking Salem for the last couple weeks because there was never anything interesting going on, but maybe I need to start again.

## The bot

> **24.04.23**

> **07:26** - On the Salem front, I tried another trick I'd thought of for the adjustment calculations, just for fun. Previously, I had calculated upper and lower bounds on each individual's adjustment as well as the difference in adjustment when two people were next to each other in the rankings, eliminated the redundant bounds, and then used an LP solver to find refined lower and upper bounds taking into account the binary constraints.

> I then searched through the simulated history and found all the points in time which were consistent with all the solved adjustment bounds for each individual person, and then for each person, took their highest and lowest value in that period as refined new bounds. However, it later occurred to me that I could potentially do better by incorporating the binary bounds as well. After all, a candidate point in time in the simulated history has to simultaneously satisfy all the binary bounds as well to be a true candidate, and using only the individual bounds resulting from the LP solver loses information. I wasn't sure if it would help, but it worked like a charm, reducing the candidate points in time from 71 to 38, and I now have relatively tight bounds on everyone's adjustment.

> Later in the afternoon, I finally devoted myself to working on the bot, as I told myself that I would be doing it this weekend no matter what. I programmed a Python script to query the Manifold API every 15 seconds to get a list of markets (and their current market probabilities), and programmed it to send me an email whenever a market changes by over 7% in a 15 minute period, with a maximum of one email every 30 minutes. Hopefully it will work.

> For simplicity, I'm not running it in the cloud, but rather just on my desktop computer. This of course means leaving the desktop running 24/7. Previously, I had only powered it on for a little while every weekend when actively using it, and shut it down during the week. I hope it doesn't interfere with using my monitor with the work macbook, since I have the monitor plugged into both computers (or will once I plug the macbook in again). I'm hoping that with the desktop not being interacted with, it will be sleepy and not try to use the monitors.

> Another annoyance is that Google expires oauth tokens every 7 days for an application in "testing" mode, with no way to renew them. I had to manually delete the token file and reauth, and it seems that I'll have to do that every 7 days. It's not hard to do, but it is still frustrating with how pointless an annoyance it is.

> **25.04.23**

> **07:23** - I got my first email from the Salem bot yesterday, as "DeSantis to Run for President by Summer?" went from 68.2% to 58.4% at 1:02pm yesterday. Unfortunately, I never saw the email on my phone lockscreen, let alone getting a sound notification, and didn't notice until later (not that it matters in this case, but it means that the bot emails won't help when it actually matters). I added a filter to Gmail to automatically mark all emails from myself as Important, hopefully that will help. At least I know the bot part works now.

## Biden declares

> When I got up, ...I saw a comment saying that Biden had officially declared, and went over to Salem to see what had happened with the news.

> Earlier this morning, Johnny had bought Newsom from 10% down to 8% and "Biden the Favorite in Summer 2023?" from 85% up to 88%. The latter case was immediately followed by Noah and then a massive $4,691 bet from zubby bringing it up to 90%. It's kind of funny, because I knew this was going to happen all along and it's amusing to see the others finally catch up to this fact. But it also demonstrates a startling lack of consideration for opportunity costs, since "Will Russia Control Kherson on 5/31/23?", which resolves at the same time as the Newsom market (and two months before the Biden market) was still at 12% (I put in $200, so it is 11% now).

> It's possible that they think there is still more uncertainty about Kherson than Newsom, but it is really hard for me to imagine Russia successfully launching an invasion across the river and occupying the entire city in barely over a month, when Bakhmut has taken them far longer. More likely, people just get ahead of themselves at the news and don't look closely at the other competing markets.

> I also discovered a rather strange pair of market movements, as Sam Dittmer had simultaneously bought GDP 3% YES from 14% up to 20% and bought GDP 1% NO from 91% down to 86%. (Johnny had already brought the former down to 17%, and I put in $200 bumping the latter up to 87%). It's an unintuitive strategy, since those are mutually contradictory outcomes, but presumably it's just a "volatility play", betting against the consensus on both ends in the hopes that something unexpected happens. The odds are good enough that he'll come out ahead from a single win if either one happens, not to mention that a number of top players, particularly Mark, but even myself and Ben, will suffer major losses at the same time.


## Q1 GDP and adjustment reverse engineering


> **26.04.23**

> **22:38** - The big news today was Salem. In the morning, I periodically checked GDPNow, waiting for the final Q1 GDP forecast. I didn't expect anything notable to happen, and thus was shocked when I checked again around 9:08 and saw that the forecast had come in and had dropped from 2.5% all the way to 1.1%. I couldn't believe it could change so dramatically at the very end, but nevertheless rushed to Salem to trade on the news.

> I quickly sold my YES stake in the 1% market (84->81%) at 9:12 and bought 2k NO on the 3% market (15->9%). Sadly, I forgot to cancel the $75 YES 13% limit I'd put down 12 days ago when I was trying to sell my stake, and thus my big order was partly wasted trading against my own limit order. Oops. One of the downsides of limit orders I've discovered is that it is easy to lose track of them and forget to cancel them when conditions change, even now that I've been barely using them.

> At 9:14, I bought another $200 NO on the 1% market for good measure (81->75%), and then put up a YES limit at 70% to counteract it, hoping that someone else would panic sell and cash me out at a small profit (this ended up happening, but not until 1:30pm, over four hours later. Meanwhile, the 3% market hasn't been touched at all. I'm continually amazed by the lack of activity there, as well as the lack of activity in general - even the 1% market wasn't touched until the afternoon.)

> At 2:23pm, I checked in again and saw that I'd finally been cashed out in the 1% market. I also decided that I already had so much on the 3% market that if I lose, I'm out of the game anyway, so I might as well double down, and put down another 1k (9->7%). Although presumably the really rational thing would have been to really go all in, instead of just investing 3k.

> After buying 1% down to 75% this morning, I figured it would trigger my email bot, and thus it would be tested again. Sure enough, I got an email, but it was "37.862%-45.448% Ukraine to Take Major City?" as someone had coincidentally bought that market at the exact same time (and the bot is programmed to only send a maximum of one email every 30 minutes, regardless of the number of market movements).

> I later got a total of five additional emails from the bot in the evening, primarily due to gyrations in the "DeSantis to run for President" market, though the 1% market also went down and back up and there were other markets with large movements back and forth as well.

> Despite specifically creating a filter to forcibly mark all emails from myself as important, the emails still weren't marked as important. I also marked them as important manually, hoping that Gmail's inscrutable AI would decide they were important the normal way even without the filter, but many emails later, that still hasn't happened yet either. When I started the bot project, I would have never guessed that getting the bot working would be the easy part and that Gmail would utterly fail at basic functionality.

> And frustration at scripts seemed to be a running theme today. Tonight I discovered that the Wanikani API is no longer returning reviews at all (apparently they disabled it due to not being able to handle the load), and I didn't even mention the disappointment over the Salem leaderboard adjustments tonight.

> Anyway, as far as Salem goes, the dice is cast and I'll just have to see how things go tomorrow morning. Hopefully it will be under 3% and I'll still be in the running. It's a bit stressful to have to constantly take risks like that, but it's hard to avoid that as well.

> **29.04.23**

> **07:44** - Wednesday night, I noticed that Mark had slipped to 4th below Connor on the leaderboard and thought I might be able to narrow down the adjustment bounds so I got on the computer and ran the rankings and discovered that they were shockingly close (at then-current market values). Connor was ahead by only about $5 out of thousands (9126 vs 9121) and ahead of the upper bound on Mark's balance by only about $0.8! (I've just been using the median value of the adjustment bounds as my estimates, and in this case Mark's range was around 10, so 9121 +- 5.)

> With the two so absurdly close, I decided to try manipulating the market prices for science in order to try to find the exact point where they cross over and thus find out the adjustments exactly. I did this by buying small amounts of YES on the GDP 1% market (50->52%), because Mark had a lot of shares there and as it was at 50%, it would be relatively easy to manipulate the price, and because I figured it was basically a fair price for a coin flip so I'd barely be losing money in expectation (I ended up winning the coin flip, so I'm glad I did).

> I spent a while buying small amounts of YES and checking the leaderboard and dumping the leaderboard json after each time, but the rankings stubbornly refused to change. Eventually, I reached the point where Mark's lower bound was just above Connor (i.e. 9127-9137 vs 9126) and yet the leaderboard still showed him in 4th. I tried refreshing for a minute or two in case it was just slow to update, but it wouldn't change. As this indicated some sort of contradiction in the data, I was forced to just give up, so that was a huge frustration.

> Even more frustrating is that around an hour later (~10:11), I checked the leaderboard again, and suddenly Mark was in 3rd place, despite the fact that there had been literally no bets at all in the last hour, and so nothing changed. It almost made me wonder if I somehow messed up/hallucinated the final leaderboard check and that if you ignore that and Mark is at the very upper end of the possible range, it could theoretically be consistent. But overall, it just left me very confused and dispirited. I was considering trying to do more investigation, but even as I watched, at 10:16, someone suddenly started buying up a different market (DeSantis IIRC) which pushed Mark well out of range.

> ...I went to bed at 12:02 and woke up at 6:38/6:39 (67.6-68.2).

> For once I wasn't sleepy and had to lie in bed for 15 minutes before getting up. But the other reason I got up immediately after waking up is that I was eager and anxious to see how the GDP markets had resolved.

> As it turned out, the 1% market had closed but not resolved yet. Even more surprisingly, the 3% market was still open. It appears that they *tried* to set them to close before the data was revealed, but messed it up, so the 1% market was set to close at 5:29 am (or 8:30 Eastern), but the 3% market was set to close at 8:29am *Pacific* for some reason.

> Even better, the 3% market had for some reason still remained completely untouched since my bets on Wednesday. The actual GDP number was 1.1%, exactly as forecast by GDPNow this time, and after some minor hesitation, I decided to dump nearly everything I had into the 3% market, since it was just free money, buying $3700 of NO at 6:43 (7->3%).

> It's a really good thing I did it then, because despite the market barely being touched for days, just 23 minutes later at 7:06, Johnny finally acted and bought $3000 NO (3->2%). Good thing I nabbed all the free money first.

> I also woke up to one more bot email, this one from the 1% market. For some reason, Josiah Neeley seems to have become utterly convinced that it would resolve NO and made a series of three large bets, $1k at 4:15pm (69->46), 500 at 6:54pm (58->45), and then a final 1k at 3:34am (52->32), triggering that last overnight email. In each case, it went back up to the 50s, primarily due to Johnny's efforts, though others contributed as well.

> At 8:10am, the 1% market finally resolved, and a couple people (Alvaro de Menard and a nobody) moved their money over the 3% market, as did I once I noticed (already down to 1.3%). The 3% was still unresolved when I left for work ~8:30 and apparently didn't resolve until 8:45 am for some reason. I have no idea how the Salem people work, since there is no reason why they should ever not resolve the two markets at the same time, but whatever.

> One oddity is that normally, each resolved market shows the top 5 bettors by winnings in that market. However, the 3% market only shows the top 4 (myself, Mark, Johnny, and Ben). Clearly there must be some absolute threshold to show up, since there were other people trading in the market, not least the two who piled in at the very end, but it still seems like a testament to how utterly desolate the market was. I guess everyone thought that gambling on the 1% was a lot more fun.

## Josiah Neeley's donation

> When I got home from work Thursday evening, there was one more surprise in store. At 9:21am, Josiah Neeley inexplicably threw in $1974 on YES for "Newsom to Run for President by Summer?", spiking it from 8% to 67%, which Johnny bought down to 20% from 9:34-9:46am.

> Then at 11:16, Josiah threw in a final $108 (20->24%) after selling his stake in another market to free up one last bit of cash for his final hail mary. This time, Mark bought it down from 24->16% at 11:24.

> I was very frustrated, because that should have been me. To be fair, I've never connected my phone or Chromebook to the wifi at work and thus wouldn't have seen the alerts even if Gmail wasn't a buggy piece of shit, but *this is exactly the scenario my bot would excel at* if it actually worked. With Josiah's forays into the 1% market, I would have stayed out even if I had been the first to see them, because I don't like to bet large amounts in markets where the outcome is uncertain, but the Newsom market is practically "my" market and I absolutely had the money and the confidence to take advantage. And Johnny took 13 minutes to respond, so I would have had tons of time to jump in if the bot alerts were actually working. The whole thing was extremely frustrating.

> As for Josiah, I have no idea what he was thinking. Presumably, he became absolutely convinced that 1% would resolve NO, and then when he lost most of his money, he put the rest into a longshot bet since he'd be out of the game otherwise anyway. I ran the stats Thursday night and confirmed that he is basically all in - he has a tiny stake in one other market (like $50 IIRC) that he could have sold too, but other than that, it's all riding on Newsom. And to be fair, he would immediately shoot to 4th, and close to 2nd, if it did somehow resolve YES, it's just that that's not actually going to happen.

> Back in my highschool days when I played Warcraft III a lot, including the custom map Island Defense, it was common for Island Defense players to say that the titan was "fed" when incompetent builder players left vulnerable units out for the titan to kill, giving them tons of easy XP and gold, and it definitely seems like Johnny is "fed" now. Of course, I had no hope of catching Johnny anyway, so my only frustration in the matter is that I didn't secure the easy money for myself instead.

> I imagine zubby would have good reason to be upset though. Zubby still has a commanding lead, but it's not quite as commanding has before. As of Thursday night, zubby was at 14k while Johnny was at 12.5k, putting him within plausible striking distance of first again. To be fair, Johnny has been very active this last week or two, and made aggressive bets on risky outcomes (e.g. buying up the 1% at low prices, which is good EV but could have easily backfired if he got unlucky). Meanwhile, zubby wasn't completely absent, but made relatively few bets, a complete reversal of March when zubby was the most active and Johnny always seemed to come after zubby when he showed up at all, to the point where I even nicknamed him "Johnny Come Lately".

I didn't know this at the time, but Zubby had extra reason to be upset. It turns out that he had *also* set up a bot to alert himself to market movements in order to compete with Johnny, but he was on a golf course at the time and hence missed out like I did.

> Anyway, following the GDP resolution on Thursday, I made a decent profit and jumped up to $8870, putting me close to Connor, who has been sitting at $9126 in all cash since the early April elections and hasn't done anything since then, much like Ben before him.

> The fact that he didn't even pile into the free money 3% market bolsters my assumption that he has really been AFK and not just excessively cautious. But it's always possible he'll wake back up at some point. If he doesn't, I was already close enough that I'd pass him just from the 5/31 markets resolving, assuming there were no surprises there.

> First however, I have to avoid shooting myself in the foot. I checked Salem again at 1pm on Friday and saw that the DeSantis market had dipped to 45% that morning before Johnny bought it back up to 55%, and I fomo'd in and wagered $100 myself (55->57%). I quickly regretted it though, as it went back down, and it is now only at 45% again.

> In fact, the major drop was Dylan Levi King buying 52->45% this morning just 10 minutes before I got up. I was really tempted to buy the dip before someone else (Johnny) could, but I spent a while researching news stories and just couldn't get confidence that DeSantis will actually run before the end of the month, as the talk now is only of an exploratory committee in mid-May. At least I only put in $100, and there's still a decent chance it will pay off.

> Anyway, that's all the Salem news for now. It was a wild few days, but I'm sure things will be boring for another couple weeks again. The main thing now is that I have to figure out what to do about the Erdogan and DeSantis markets, as those seem likely to be the next to resolve and also have the most uncertainty among upcoming markets (otherwise, there's just the three 5/31 markets that are basically sure things just tracking the time value of money).

> Speaking of which, I forgot to mention that when I got home Thursday evening and saw all the missed opportunities from Josiah's YOLO into Newsom, I decided I could at least pick up the scraps and put down $2345 (16->9%). That amount wasn't random - I tried different numbers, wanting to put in just enough to bring it down to 9% (which presumably means just under 9.5%, given the rounding). I was a bit reluctant to tie up so much money until the end of the month when I might need it to capitalize on any other easy-profit opportunities that arose, like if Trump suddenly tweeted or the Erdogan result came in and I found out before too many others, but oh well. That might not happen and in any case I still have $5040 in spare cash. It's so hard to predict when random opportunities like this will arise. I regretted some of my bets during the April election when I was in early and could earn a free 2-5%, but I had no way of knowing that that would happen, since in the past, I was always late to the party.

> **08:53** - P.S. Thursday night, Mark put in another $575 on Newsom (9->8%). Betting isn't just a matter of taking profit opportunities. That's the most important part, but denying profits to my closest competitor is also a nice bonus. I'm a bit puzzled about why, if Mark was interested in betting that anyway, why he didn't just put it in immediately Thursday afternoon when it was still at 16% but whatever, I'll take it.

## A rare bot win and failure at SMS

> **30.04.23**

> **20:12** - ...Thursday night, I checked the Salem rankings as previously mentioned, and confirmed that while Josiah had one small stake he could still sell, he is pretty much all in on Newsom. Also Thursday night,

> **01.05.23**

> **07:28** - A bit after noon, I checked the Salem standings again and ran some hypotheticals. Nothing notable had changed since Thursday night, but I did notice that Sid Sid had appeared at 16th on the leaderboard. I remember seeing their bets a lot in recent months, and I guess now I can stop calling them a nobody.

> Even with the DeSantis blunder, I'll still easily overtake Connor at the end of the month, so as I thought, the real competition is Mark. Passing Mark will be very difficult though, as he is much farther ahead (in fact he actually made more profit off the GDP markets than I did, due to betting on both YES 1% and NO 3% and not panic selling like I did), but it could happen if I get lucky. My best hope for passing Mark is if DeSantis runs for president, since he is betting heavily against that, while I have a small positive wager.

> Currently (well as of noon on Sunday), Mark is 13.6% ahead of me. If the three sure 5/31 markets (Newsom, Kherson, and Kramatorsk) resolve NO as expected, that increases to 14.4%. If DeSantis also resolves NO, that shoots up to 24.1%, probably permanently out of reach. On the other hand, if it resolves YES, he'll be only 2.7% ahead of me. So it basically all comes down to that, though I'm hoping that I'll also be able to make some profit off Erdogan or getting fed by random whales. I also changed my display name from Robert Grosse to "I'm coming for you, Mark", just for fun.

> **20:35** - ...After that, I read the Economist for a while, and noticed another email from my Salem bot. At 3:29, Noah Lafountain suddenly bought "Trump Back on Twitter between April and July?" from 54% up to 72%. I saw the email five minutes later, and after quickly checking to make sure Trump hadn't tweeted and googling for news stories trying in vain to find the impetus, I hesitantly put $100 on NO (72->68), since 72% seemed like pretty good odds, especially as if Trump was planning to tweet again, it seems like he would have already done it. 23 minutes later, I put down another $150 (68->63) and put in a YES limit at 53% to cash out in case it falls that far.

> Anyway, that was a rare win for my email bot. Of course, noone else entered the market until over three hours later, so the window wasn't that short anyway. The market's now down to 57%, so it seems like I made a decent profit.

> Speaking of the Salem bot, I also tackled the second major item on my todo list Sunday evening, modifying the bot to send an SMS as well as email so that I'd actually get notifications regardless of how buggy Gmail is and also when my phone isn't connected to wifi. Unfortunately, I had far less success on that one.

> I easily set up a Google Voice account and successfully sent two test SMSs to myself. Unfortunately, Google Voice does not have an API and is not meant to be used programmatically. I then signed up for a Twilio account, but it said my account was suspended before I even completed the signup flow! It sent me an email asking me about my intended use case in order to unblock the account, and I responded but still haven't heard back.

> Lastly, I tried signing up for Vonage which got off to a bad start when they sent me an SMS code to confirm my phone number during sign up which I didn't get. I asked to resend, but the second didn't show up either. The two SMSes didn't show up until fully ten minutes later, by which time the codes had already expired. Fortunately, at that point, resending the code again worked instantly and I managed to complete the signup flow, but it didn't bode well for their ability to deliver SMSes reliably. Sure enough, when I tried to send a test SMS, it was rejected for some reason.

> I also learned that it is possible to send SMSes just by emailing a special address (<phone number>@tmomail.net), but the test SMS I sent that way took a whole half hour to show up, so that didn't seem like a viable route either. So now I'm not sure what I can do. I can't believe it is so hard to send a simple SMS message in this day and age.

# May 1-15

![Score graph](/img/salem2/may1.png)

At the end of the first half of May, I finally managed to pass Mark and take third place. There was also excitement at the top end, as Johnny also passed Zubby and regained the top spot.


## Botting for the win

My failure to find a way to send SMS from my bot or to get notified of new emails on my phone meant that the bot was near useless, as I would only see if the emails if I happened to be on my laptop at the right time *and* not in the middle of something else on the computer. My bot proved to be useless the one time it actually mattered (the Josiah Neeley fiasco), but I did manage to get a few small wins from it in May. I suspect that at the time, Johnny had the threshold on his bot set too high, so it would only alert him to *major* price movements, and he thus missed small-scale profit opportunities like this.


> **05.05.23**

> **07:48** - At 9:13pm Wednesday night, a nobody (Evan Harper) suddenly bought up the DeSantis market (50->74%), and I saw the email from my Salem bot after finishing the nightly Aggretsuko episode at 9:31pm. I quickly checked for news about DeSantis, but didn't see anything recent and concluding it was just a dumb uninformed bet, sold my YES stake and put $400 down on NO (74->73->61%). I also put down a YES limit at 51%, hoping to cash out when it went back down. It had been trading at 45-46% recently, but you don't want to be too greedy.

> Anyway, that makes the second win from my Salem bot in recent days, where I happened to be on the computer in time to see the email relatively quickly. It's not immediate like it would be if I had SMS working, but fortunately, it usually takes a while before people see these random spikes. However, based on past experience, that still won't protect me against actual resolution based spikes (e.g. if Trump tweeted or got indicted again), as those tend to have everyone piling everything they can into it in a matter of minutes. Still, I have been able to pick up a nice profit those two times, and this put my net worth over 9k for the first time. At this rate, I'll soon pass Connor on the leaderboard.

> The DeSantis market is now down to 57%, courtesy of Sid Sid. The weird thing is that a couple hours later (11:26pm) Wednesday night, Johnny bought it down to 56%, but then sold it back at 1:31am. So it seems like Johnny thinks the true price is higher now and it wasn't quite as much of a steal as it might have seemed, but it was still a good deal.

> Actually, I just checked the leaderboard again, and it seems that Sid Sid buying down to 57% last night was enough to officially put me in 4th on the leaderboard. I've now passed Connor de-jure as well as de-facto, and my "I'm coming for you, Mark" name seems more appropriate now.

> Other than that, I've barely been checking Salem at all. It seems like we're going through another quiet period again, and besides, I have the bot emails to alert me if there are any really good deals.

## Zubby's mistake

> **06.05.23**

> **09:40** - I haven't bothered checking Salem much lately since I figured that my bot would email me if there were any sudden changes, but I randomly checked again this morning and saw that I'd missed a lot of drama yesterday afternoon.

> At 2:52pm yesterday, zubby bought up DeSantis 57->69%, and then just as suddenly back down to 45% at 2:53-4pm. I wonder what happened there. My assumption is that zubby was intending to buy NO, but accidentally bought YES instead and immediately sold and bought NO when they realized their mistake (but not before 50P managed to sell $25 of NO at 69% - talk about lucky timing!). Anyway, the market is now down to 41%, though of my course my limit was at 51%, and thus I didn't benefit at all from the further drop - if anything, it is bad because it puts Mark further ahead. But at least I did lock in a profit on the previous buy. Also, Johnny canceled the 8% YES limit on Newsom (presumably to partially cash out his large NO stake from when he caught Josiah's spike) that I was hoping to trade against later and moved it down to 5%.

Note: 50P *bought* NO at the peak, rather than selling NO. Obviously *selling* NO during a price spike would not have been lucky timing.

> **10:37** - I got on the desktop to investigate why my bot didn't email me yesterday, and it turns out it hit a connection error while querying Salem at 12:39am yesterday and hadn't been running for the last day and a half. I added logic to ignore errors and keep going, and to email me the first time an error occurs so I can investigate in case it gets stuck permanently unable to connect. But this error was presumably just transitory and the first such error in nearly two weeks of running, so hopefully they won't be common.

> I also checked the standings again while I was at it, but barely anything had changed. I'm now 11.7% behind Mark, which goes up to 12.0% assuming the three end of month markets resolve NO as expected. This jumps up to 19.6% if DeSantis resolves NO and only 0.9% if it resolves YES. As before, my best hope is that DeSantis does run soon, it's just that my relative standing to Mark has increased very slightly thanks to my recent wins.


> **10.05.23**

> **06:43** - During Avalon on Sunday, I got a bot email about a fetch error, but figured it wasn't urgent, and in the afternoon, I restarted the bot (so it would send another email if it failed again) and also manually re-generated the API token, which I have to do every Sunday because Google is stupid. (The API token isn't related to the fetch errors from Salem, I just need it to send emails). Monday evening, I got another fetch error email and again restarted the bot. In both cases, it was just an isolated failure. I think I'm going to need to reprogram it to not send emails after isolated errors. The only reason I set it to email after the first error was so that I could check in case it got stuck erroring out repeatedly, but so far that has never happened.

## ATACMS and Storm Shadow

> **11.05.23**

> **07:49** - I got home to another Salem bot email, the first of what would be many due to chaos in the "Send ATACMS to Ukraine?" market.

> It first started at 6:40pm on Tuesday when Sid Sid bought 36->39% and then sold again two minutes later and left a comment asking the mods to clarify "is this any type of long range missile or the ATACMS in particular". It seems that the British announced that they'll be providing long distance missiles to Ukraine, which means that the US now sees no need to provide its own ATACMS, and so it could resolve YES or NO depending on whether the British missiles count or not and Sid Sid presumably sold due to uncertainty over the resolution criteria.

> At 6:44pm a nobody (Richard Zhu) bought it down to 23%, thus triggering my first bot email. I looked into it after getting home and considered buying NO shares myself, but decided to stay out due to uncertainty over the resolution criteria, and the fact that a NO would take until July 31st to resolve. In retrospect, I'm glad I stayed out.

> From 9:40-10:15am Wednesday morning, 50P bought it back up to 33%, over the course of 11 transactions. For some reason, 50P always splits their buys into a long stream of tiny transactions. It's a suboptimal strategy since the Manifold fee algorithm results in very slightly higher fees when splitting up a purchase compared to buying the same amount in one transaction, though I'm guessing that most players don't know this, probably not even a lot of the top players. More significantly, it's annoying to me because it clogs up the bet history and makes it hard to read.

> It didn't stop me from getting another bot email at 10:15 though, since my bot just triggers on a total 7% variation in a 15 minute window. I noticed the email five minutes later and checked the market, but again decided to stay out. Ironically, what I didn't notice is that at the very moment I checked, 50P sold back to 26% at 10:20. Then from 10:26-27, they bought back to 29%. I have no idea why they did any of this, although it's ultimately meaningless. Still weird though, and if I were a mind-reader, I guess I could have profited off these gyrations regardless of the ultimate outcome. Sadly I am not a mind-reader.

> The gyrations continued when zubby stepped in and bought it up to 34% in two transactions at 10:41 and 10:49am. At 9:10pm, 50P made one last buy up to 35%.

> Then at 1:31am, another nobody (Alexander Mengden), bought $10 three times ->36% (50P isn't even the only one splitting up their transactions for no reason), and then at 5:13 and 5:15am, bought it up to 45% , resulting in another bot email. Finally, at 7:10, Johnny stepped in and bought it down to 31% in three transactions, followed by a sale to 34% (incidentally, back in the early days of the contest, I wondered whether Johnny was a bot, but concluded that he wasn't when I saw him buying and then immediately selling back like this, which just incurs fees for no reason).

> Anyway, that's the chaos in the ATACMS market, though it's ultimately meaningless to me, not being a mind-reader and just sitting out. I did make one notable bet on Tuesday though. I put down $100 on DeSantis after seeing the Politico story about him cutting ties with a state fund-raising group in preparation for a likely run last Friday.

> The market had been 39% for the last day or two, but sadly went up to 41% that morning, presumably someone buying on the same article I saw, so my buy went 41->44%. It's now back down to 42%, so Johnny and Sid Sid clearly don't agree with me, but at least it's basically even odds.

> Anyway, that's all the meaningless Salem nonsense for now. It took so long to recount that it is now 8:29, and thus I'm 10 minutes over the target entry length, and will also be leaving for work a tad later than intended. And I didn't even get through Tuesday!

> Edit: I just tabbed over to the Salem tab I had open to double-check the DeSantis results in order to close it, and as I watched literally just seconds ago, a nobody (Ruston Eastman) bought up 42->46% (in three separate transactions) followed by Sid Sid buying back to 44%. Not that it matters.

## Twitter CEO

> **20:40** - I think my last entry was incorrect and I actually did see the sale down to 29% when I checked at 10:20am on Wednesday morning. Not that it matters.

> At 1:23pm today, I decided to check the Gmail app on my phone, just in case anything crazy had happened this morning. Even though my phone is connected to the wifi at work now, it still doesn't help unless I actually bother to check my email, since Gmail is too stupid to actually send notifications and I never got SMS working.

> I was shocked to see multiple bot emails indicating that Twitter CEO was spiking, and immediately got on the Chromebook to investigate.

> It looks like Twitter CEO had sat untouched at 30% for the entire last week, until the fun began at 12:46pm today, as 50P slowly started buying it up, joined by Sid Sid at 12:50 and Spencer at 1:05. Josiah Neeley also threw in $48 (54->56%) at 12:56. Now that's a name I didn't expect to ever see again. It's weird, since it really seemed like he'd given up entirely, and even doubling his money wouldn't be enough to matter here.

I really wish Josiah would come forward and explain WTF he was thinking with the tiny bet on Twitter CEO. Back when he YOLO'd into the Newsom market, he didn't *quite* put everything on YES. He still had one small bet ~$50 on something else which he later sold to bandwagon onto Twitter CEO. But as a strategy, this makes absolutely no sense, because if he lost on Newsom, he would be stuck at the very bottom of the leaderboard no matter what, and having $50 vs $60 left over would not actually change anything. He should have either gone *all* in on Newsom or else sold it and attempted to rebuild. Going *mostly* in and then making other random bets with the last $48 makes absolutely no sense.

I guess I can't *really* throw stones, since I didn't sell out of everything else when I put most of my money into China COVID at the end of January either. However, I didn't know that limit orders automatically get canceled when you go negative, so I *thought* that I was effectively going all in with my limit orders. Josiah had no such excuse.


> Anyway, the market passed 37 at 12:50 (35->39%), triggering the 7% threshold on my bot for the first time. If I'd actually had SMS notifications working, I could have jumped in immediately and probably bought in while it was still in the 40s or 50s. It's funny how nothing happens 99% of the time, and then something like this or Josiah's yolo happens and I really regret not getting around to/managing to fully setting up the bot.

> ...Anyway, back to Salem. By the time I checked the market, it was up to 86%. I decided to put in $1400 (86->92%). I didn't want to go too deep because a quick news check indicated that the new CEO wouldn't start until six weeks from now and the market might not resolve until then (i.e. after the 5/31 markets). This evening, I put in a $42 NO limit at 94% to try to free up some of the capital.

> Anyway, Sid Sid is now up to 11th on the leaderboard, presumably due to riding the Twitter CEO rocket, as well as their various other recent wins. I'm surprised 50P hasn't shown up on the leaderboards yet.

> Twitter CEO wasn't even the only Salem drama this morning. I also discovered that Salem had commented on the ATACMS market at 9:30am, unexpectedly ruling that the British missiles didn't count and it had to be literal ATACMS, and it immediately tanked (now 15%).

> **12.05.23**

> **07:29** - A bit more excitement on the Salem front: I almost had a heart attack when I checked my email after getting up this morning and saw "63.323%-94.000% Elon Appoints New Twitter CEO?". Fortunately, it looks like the new CEO is still going to happen, but for some reason, a nobody (David Lawrence) suddenly decided to buy down from 94 to 63% overnight. It looks like they even sold their NO stake in "Nuclear Use in Ukraine" (10->12%) to do it.

> Johnny had already bought it back up to 84%, but I figured there was still a bit of profit to be made and bought $1211 more myself (84->91%). Now I really need to start freeing up capital. I put in a $16 NO limit at 92% and another $22 at 94% in hopes that people will help cash me out.

> **11:13** - At 11:10, following our team meeting, I randomly decided to get out my chromebook and check email just in case before leaving for my usual walk. Much to my surprise, I had a bot email from 11:01, "33.698%-44.516% DeSantis to Run for President by Summer?", as well as a resolution email saying that Twitter CEO resolved YES.

> Twitter CEO went up 93% before resolution, so I lost the $16 from my 92% limit, but overall, it was a pleasant surprise, since I was worried that the money would be tied up for six weeks. It's funny because yesterday afternoon when the news first broke, I felt like it was basically a 50-50 whether it would resolve immediately, or only resolve in six weeks. However, since it didn't resolve yesterday, I assumed it would be the latter. If I'd known, I would have of course dumped in my entire fortune rather than trying to cash out, but of course, there's no way to know things like that, and having the money tied up for six weeks is pretty bad (especially when the current rates on the 5/31 markets were barely lower, and there would also be the DeSantis and Erdogan wildcards during that time).

> As a joke, I commented "Deploying more capital - steady lads." this morning, and it was selected as the "Proven Correct" comment. Meanwhile, "Smartest Money" was "ussgordoncaptain bought S$500 of YES from 37% to 53% 4 months ago", which was a bit of a surprise, since every time I've checked for IIRC the last month or two, ussgordon has been sitting on all cash. I guess they made a big profit flipping it four months ago and that counted them as "Smartest Money" somehow. It really should have been Sid Sid or 50P, who were actually first to trade on it, but I guess the fact that they split it into many small transactions means it didn't get flagged by the algorithm.

> The other email was the DeSantis thing. It looks like Spencer randomly bought from 45->38% at 10:46 and 10:49, and then Alvaro de Menard bought down to 34% at 11:00, this triggering my bot almost exactly at the 15 minute threshold. Alvaro immediately sold half back though, and then Johnny bought up 36->39%.

> Anyway, I'm planning to check the standings tonight, but I should have gained a fair bit of ground towards Mark on the back of the Twitter CEO winnings, especially since I think Mark also had money on NO. Of course, I still probably won't be able to take on Mark unless DeSantis resolves YES, but at least it's a lot closer now.

## DeSantis


> **17:33** - More surprises on the Salem front: After work, I got on my Chromebook, around 5:19pm and noticed a bot email saying "41.563%-49.626% DeSantis to Run for President by Summer?", which I didn't think much of, since it had been fluctuating in that range for a while, and an email that someone had commented on the market.

> The comment linked to a news article saying that DeSantis was planning to move his campaign to a new HQ on Monday, which would trigger a 15 day deadline to file paperwork with the FEC, thus effectively forcing him to officially declare his run.

> Coincidentally, at the exact moment I checked Salem, Sid Sid had suddenly dumped their NO stake, spiking it from 50 to 78%, just seconds before I checked. Of course, it wasn't really as close as all that, since I probably would have dithered for a few minutes before investing anyway.

> With it now at 78% I decided to stay out, since 15 days sounded like a lot and he could theoretically still decide not to run after all as well (or the article could be mistaken - there have certainly been false reports before, like the sources saying that an exploratory committee would be formed on the 11th.)

> Around 10 minutes later, after thinking about it more (and checking the calendar to confirm that 15 days after Monday is still before the end of the month), I decided to throw another $100 in after all. Conveniently, zubbybadger had stepped in and pushed it down to 76% in the meantime.

> Anyway, it's almost unbelievable how much luck I've had on Salem lately, first with the Twitter CEO market and now this. Especially as DeSantis was basically *the* thing standing between me and overtaking Mark. Mark is still 3rd on the leaderboard for now, but I'm sure that will change if it resolves YES. Incidentally, Sid Sid was 11th on the leaderboard earlier today, buoyed by their success on Twitter CEO, but now they're down to 15th again and PPPP has come out of nowhere to occupy their old spot at 11th. PPPP was the first person to buy DeSantis just now, 42->50% from 4:47-4:49, thus triggering my original bot email, but for some reason, they left the main spike to Sid Sid.

> It's almost amazing to realize that if this does resolve YES, I will have made a profit on the market three times in three different directions, first YES, then NO, then YES again. Of course, I don't want to count my chickens before they hatch, and I could still be surprised in the wrong way for once. We'll just have to see what happens.

> **20:57** - After my last buy, zubby bought down to 74% again, and later on, Zach Viglianco stepped in and tanked it to 65%, so I very nervously threw in another $100 (65->66%). Zubby also left a comment saying "I’d still guess the day after Memorial Day, but seems like a solid price".

> Anyway, tonight I fired up the desktop (nowadays I've been leaving it on 24/7 even while not in use to keep the bot running but I accidentally hit the power button while plugging the keyboard and mouse back in.) and checked the rankings.

> I'm now 3.96% behind Mark, or 4.21% if the three sure markets resolve NO. And as before, it all comes down to DeSantis, but of course the disparity is now even more dramatic. If it resolves NO, I'll be 20.26% behind Mark, while if it resolves YES, I'll be negative 3.51% behind.

> I also discovered that Johnny is now very close to overtaking zubby again, which makes sense since Johnny has been very active lately, constantly profiting off the various spikes that have been occurring lately (plus zubby guessed wrong on the ATACMS thing).

> Out of curiosity, I also checked Josiah. He's now up to "only" 782nd place, thanks to jumping on Twitter CEO early, but of course most of his portfolio is in the soon-to-be-worthless Newsom YES shares. He only has like $82 in cash, even after the win. I don't know why he even bothered with that. He should have either sold Newsom and gone all in on the rush, or else dumped everything into Newsom, since he's all in on that anyway.

> It's now 9:05, so that's 36 minutes I spent recounting Salem stuff today, even apart from the normal half hour journal entry this morning which was also mostly Salem. To be fair, it was a wild day on Salem.

> **14.05.23**

> **06:48** - Salem: 50P pushed DeSantis down to 61% Saturday morning. I really don't understand why people are so bearish on it, given the news story Friday. At least some people are more optimistic. Josiah Neeley put down $89 on YES (presumably all his non-Newsom money) yesterday afternoon. I left the following comment addressed to him:

> *I don't understand why you're actually playing again, but only with (presumably) your non-Newsom money. Even when you double your money like with the Twitter CEO market, it's not enough to even move the needle. However, if you sold your Newsom shares and invested it like this, you'd still be pretty far behind, but it would only take a couple doublings of your money to get back on the leaderboard.*

> *Either you gamble everything on Newsom and don't bother doing anything else or you sell your Newsom shares and actually start trying again. Doing both at the same time is pointless.*

## My mistake

Like Zubby did earlier, I accidentally bought the wrong shares and immediately sold again at a hefty loss. Fortunately, the amounts involved were *much* smaller in my case, but it still stung.

> Of course, I'm not one to lecture, as I made a minor blunder myself afterward. I decided to put down $50 on YES on the Erdogan market (35->36%), since I thought that was for him losing and the odds seemed favorable to me. It was only a minute or two later when I realized that YES is for Erdogan staying in office and sold back for only $43. Oops.

> I've known since late December that there were hefty transaction fees, but losing 14% just by buying and immediately selling (on a small bet with minimal slippage even) was surprisingly high even to me. For a long time, part of my strategy has been to try to minimize frivolous trading and only buy or sell things if you think you can make a decent profit or buy and hold to resolution. I think avoiding stupid transaction fees like this has given me a small edge over other players, who are much less careful.

> I'm guessing this lost $7 negates some of my clever but ultimately inconsequential plays earlier, like when I flipped "Ukraine to Take Major City" from 48 to 40, but then again, it is also dwarfed by bigger things. I gained at least a hundred or two on Twitter CEO and will win or lose more on DeSantis regardless of how that turns out. Still, that was pretty embarrassing and annoying to me.

## The Turkish elections

Going into the Turkish elections, all the news I'd seen had been predicting that Erdogan would finally be defeated, and the prices on Salem matched that consensus. Unfortunately, the opposite happened, but at least I managed to make a bunch of imaginary money on Salem off of it.

As usual, I knew absolutely nothing about the elections or where to go for good information, so I just repeatedly searched through the latest tweets on Twitter and tried to find people who looked like they knew what they were talking about. Early on, there was a lot of confusion, as the official government tallies showed Erdogan with a huge lead, while the pro-opposition tallies showed a close race.

Eventually, even the opposition tallies showed Erdogan's lead starting to widen slightly, and I figured that that meant it was pretty much a done deal and started betting YES. I think that following the numbers on the pro-opposition Halk TV website (thank you, Google Translate) might have been an advantage for me, because the official numbers had Erdogan's lead steadily dropping (from the absurdly high initial numbers), so people looking at that might have been more uncertain. Of course, some people (namely Zach Viglianco) were making really dumb NO bets even after the result was basically certain, so who knows.


> **13:12** - Well that sure was a rollercoaster on Salem today. It's funny, because I actually considered holding onto my YES shares this morning just in case in order to avoid paying fees to sell, but decided to sell so I wouldn't subconsciously be rooting for Erdogan.

> I started following the results at 11:00am, but it wasn't clear what to think at first, with the widely varying numbers cited by pro and anti-Erdogan counts, warnings of a "yellow mirage", claims that opposition ballots were being excluded from the official count en-masse, etc.

> However, with the pro-opposition Halk TV site showing Erdogan's lead slowly widening, I put in $50 on YES (51%) at 11:34, followed by another $150 at 11:37. Those were against a 51% NO limit by Zach Viglianco, so no fees. 50P, Sid Sid, and Johnny were the main other ones who had bought it up.

> With Erdogan's lead continuing to widen on Halk TV, I put in another $100 (62->63%) at 11:59, followed by 200 (64-67) at 12:06 and 500 (67-74) at 12:14. I went off to read the ISW's Ukraine War assessment while I waited for results to finalize, since the outcome already seemed pretty certain. (I figured that even in a runoff, Erdogan would probably win again, if he really won the first round by 3% - in any case, the predicted groundswell of opposition support was markedly absent.)

> I came back at 12:28 and was shocked to see it down to 56%, courtesy of Zach Viglianco, 50P and a nobody (Alexander Mengden). I quickly checked around to try to figure out what news might have spooked them, but the last update from Halk TV showed Erdogan's lead continuing to slowly widen, and I couldn't find any sort of good news on Twitter either. Meanwhile, Noah Lafountain sold (56->68) and then quickly bought back (68->59).

> I put in another 100 at 12:35 (59->61), though I was nervous since I couldn't help but wonder why so many others were suddenly bearish (well Zach has been bearish all along, but still). Also strangely, the Halk TV website died at that time, failing to load from 12:28 to 12:50. No idea what that was about - maybe an accidental DOS from many people accessing it?

> At 12:50, Zach bought down (61->54) and I put in another 100 (54->56). But with it looking very likely to go to a runoff now, I'll have two more weeks of angst. It's funny though, because the outcome that would be good for me on Salem would be very bad for Turkey and the world, and vice versa. Meanwhile if a miracle happened and Erdogan did lose, it would completely take me out of the running on Salem. But that seems so remote now that I can scarcely hope for it anyway. I do wish it hadn't gone to a runoff though, so I could cash out quickly and not have to worry.

> **13:27** - P.S. I checked the Salem leaderboards one last time just now out of curiosity and there was a weird glitch where it just showed only me (in first place) and noone else. Refreshing put it back to normal though.

> **15.05.23**

> **17:48** - Well, I've gotten pretty far behind again, and this time I won't even have the full 30 minutes because my laundry comes out of the dryer at 6:14pm. I suppose per tradition, I'll start by recounting the Salem news.

> Zach Viglianco continued trying to keep the Erdogan market down, but he couldn't win against everyone else, and it is now up to 75%, a level it first reached at 5:56pm yesterday. I had put in a NO limit to cash out at 80%, as that seemed like a fair price to me given the opportunity costs of holding shares for two weeks until the runoffs and the slight risk that the opposition somehow manages to win the runoff, but never got any takers, even though it had gotten tantalizingly close.

## In other news

> At 10:30pm, just before getting off the computer to get ready for bed, I randomly decided to check Salem one last time and discovered that "No-Confidence Vote on McCarthy?" had spiked. A nobody (Tim Fred) had suddenly bought $1000 of YES at 8:02pm, spiking it from 20% to 57%. Presumably, they just joined and that was their entire balance of starting money.

> At 8:04pm, another nobody, Henry A Long, bought it down to 47%. It's amazing how fast they were. It made me wonder if they had a bot, though I didn't recognize the name, so if so, they haven't been making much use of it. I sure hope it was just a fluke so I don't have as much competition.

> Speaking of the bot, I wondered why it didn't trigger and discovered that my bot had died a bit after noon due to the Google API token expiring, as Google stupidly expires all tokens for test apps after a week and I had forgotten to manually regenerate it again this week due to all the excitement. That also explains why I didn't get any bot emails for the spikes in the Erdogan market Sunday evening. Oh well.

> The good news is that after Henry A Long, it had been untouched at 47% until I saw it two and a half hours later, so I figured there was still profit to be made and bought $200 NO (47->41%) and put in a YES limit at 25%, hoping to flip it for a small profit. It is now down to 25%, so pretty close.

> The big news today was in the DeSantis market though. In recent weeks, I'd rarely bothered to check Salem during the day, or maybe only once, but today I checked several times.

> I checked before breakfast around 8:15 and saw that DeSantis was now up to 70%. I checked the leaderboard to see if I was in 3rd yet, but not quite. However, Johnny had finally regained the lead from zubbybadger. I briefly got on the desktop to run the stats and saw that I was close behind Mark (0.75%), but not quite there yet.

> I checked again at noon and DeSantis was back down to 60%, and with it, Johnny back in second. Then I checked at 2pm, and DeSantis was back up to 69%.

> More significantly, PPPP had left a comment at 1:20pm saying "Here we go... Wish I had some more $$" and linked to a news article confirming that DeSantis's campaign moved into its new campaign headquarters (triggering the 15 day FEC reporting countdown), as was reported by the story on Friday. PPPP bought $318 of YES (60->66) and it looks like they had to dump their stake in "Trump Indicted Again?" to do it, tanking that from 54->50% (since restored by Johnny).

> Fortunately, I'm not so money constrained, and put down $650 (69->71%). The reason my buy moved the market so little was that Zach Viglianco had a NO limit at 70% (funny how he seems to be on the contrarian side of everything these days) and I sized my purchase to make sure I got it all. He had another limit at 74% and I still have $3025 in spare cash, but I was hesitant to risk it, especially for something that might not resolve for two weeks.

> I checked Salem again at 3:20pm and DeSantis was now up to 80% (where it still is), which finally put me in third on the leaderboard ahead of Mark. Hooray! I'll rest easier once the DeSantis and Erdogan markets are cashed out and locked in though. PPPP is up to 9th. Perhaps he'll be the first person in months to sneak past the slumbering ussgordoncaptain and break into the hitherto static top 8.

> Also, when I checked at noon, I discovered that Johnny had put a NO limit on Erdogan at 79%, right below mine. So rude! (I say despite doing the same thing myself many times, etc.) I moved my limit down to 78% even though that's almost certainly the wrong move mathematically. I suspect that the optimal number is actually higher than 80, but I tell myself that it'd be nice to get cashed out just so I can start rooting for Kemal in the runoffs with a clean conscience.

> Anyway, it's now 6:15 and my laundry is calling. Amazing how I only got through the Salem news and still went over the time I had available.

# May 16-31

![Score graph](/img/salem2/may2.png)

May 14th saw me finally overtake Mark and reach third place in the Salem competition. The only thing left to do was to try to catch up to Zubby and/or Johnny and see if I could nab *second* place, but they were both so absurdly far ahead of me that there was no plausible way that could happen. It would take *multiple* major lucky breaks for me to even have a shot at catching up to them. Unfortunately, the *opposite* happened, with May ending in one of the greatest disasters of the entire competition.

But first, there were still the DeSantis and Erdogan markets to worry about.


> **17.05.23**

> **19:27** - Tuesday morning was mostly occupied with journaling again. I also decided to put down $1088 more on DeSantis on Salem at 81%. Conveniently, a nobody had a NO limit at 81%, and this time I calculated the exact amount required to buy it all up, rather than just eyeballing it.

> This put me down to only $2055 in free cash, which made me a bit nervous, but today someone finally pushed Erdogan up to 78% and partially cashed out my stake there, bringing my balance back up to 2999. Also, while double-checking the numbers on Salem just now, I discovered that the DeSantis market is now at exactly 1000 bets. The main reason is that 50P keeps spamming the logs with long strings of tiny bets. I really wish they would stop, as it is very annoying and makes it difficult to actually read the bet history, and it's not like it's even a good strategy for them either.

## The bot wars heat up

In addition to Zubby and Johnny being *massively* ahead of me, it didn't help that they were also faster and more active than me. In fact, it turns out that Zubby had built a bot to compete with Johnny. Additionally, their bots seemed to be a lot faster and more reliable now. Back in March and April, Johnny would typically take 10-15 minutes to actually respond to any prices spikes, but this time they both jumped in under two minutes, meaning I'd have no chance even if I did have a working bot to compete with them, as it would take me longer than that just to get out my laptop, confirm the alert and actually place my bets.

> At 1:50pm... I took advantage of the elevator on the way down to check email on my phone and saw a bot email indicating a big drop in "Biden favorite in summer 2023" market from 12:20pm. I figured it was likely just a dumb nobody YOLOing in, since there was no obvious news that would change that market.

> I doubted it would still be there an hour and a half later, but checked Salem after getting back anyway, just in case. Sure enough, a nobody had bought down from 86->63% at 12:19 for no reason. The shocking part was that zubby bought back from 63->83% at 12:20pm, followed by Johnny buying 83->85% at 12:21pm.

> Such tight timing couldn't be coincidence, and made me wonder if they were running bots now after all, so I left a comment later, asking about it. Sure enough, they responded confirming that they were:

> *Johnny: Well I have a script that polls for market changes once a minute and happened to be at my computer anyway. Still I frankly felt quite good about how quick I was. Until I looked at the actual seconds via the API: My 107 second reaction time got easily outclassed by zubby’s 24 seconds.*

> *Anyway, congrats on having come for Mark!*

> *zubby: A couple months ago I saw J10 aka The Goat clearly had some sort of monitor running and I decided I needed to do the same. I was on a golf course when Josiah Neeley decided to rage quit in the Newsom market, which is why I was extra mad!*

> Learning that the top two have bots made me a bit dispirited, since there's little hope of competing with them, even if they weren't massively ahead of me to begin with. I do wonder about the various opportunities in the past that I caught, but presumably either the movements there weren't big enough to trigger their bots or they were busy/not at the computer at the time or something. Oh well. The good news is that I've already achieved third place, which was beyond my wildest expectations even as late as the end of March, and my position is pretty secure, assuming no upsets in the DeSantis or Erdogan markets, as it's basically just Mark who could plausibly pass me. And the same dwindling number of markets which makes catching up to zubby implausible also makes it unlikely that anyone else will catch up to me.

## DeSantis


> **18.05.23**

> **07:33** - ...I checked Salem this morning and discovered that DeSantis went up from 85% to 92% this morning, mostly due to zubby and Johnny. It looks like a bunch of news articles came out saying that DeSantis plans to formally declare next week. It's now basically the same odds as Newsom (which zubby sold up to 8% to buy DeSantis), though the former will presumably resolve early, so they aren't quite comparable. Meanwhile, Erdogan is back down to 76%. I still think I'll be rooting for Kemal, as much of a longshot as that is.

> **07:55** - I just checked the Erdogan bet history, and it looks like the dip is just due to zubby selling (78->75%) this morning (followed by 50P spamming it back up to 76), so it's not a real loss of confidence, just zubby freeing up money to pump DeSantis. It's funny, since you wouldn't think someone with ~14k would ever be short of liquidity like that.

## 50P's bet spam

> **19.05.23**

> **07:50** - ... I left a comment for 50P on Salem complaining about them spamming the bet history, and pointing out that it is not even good strategy as splitting up transactions results in slightly higher fees (which I hoped to change their behavior if nothing else).

> They responded, saying that it was due to them using the arrow buttons on the site, which are apparently a shortcut for buying just 10 shares at a time, and that they didn't know about the fee thing.

> To be fair, that's a subtle point I only realized after reading the source code. Basically, Manifold calculates the final market price after your bet if there were no fees, then subtracts 10% \* (1-P) from your bet amount where P is the *final* price, and then uses that reduced amount to determine the actual shares and market movement. This means that all else being equal, moving the market price farther towards the tail in a single transaction will result in lower fees, though the difference will probably be negligible in all but the most extreme cases.

> Anyway, so far it looks like 50P has switched to normal bets, so that's nice.

Note: That switch was sadly short-lived.

## The twin spikes

> **20.05.23**

> **16:28** - Last night, I checked in on Salem again and discovered that my 78% NO limit on Erdogan was fully cashed out, so now my interests on Salem are once again aligned with what is best for Turkey and the world. Although even if by some miracle Kemal does win, it would still be a very unfortunate situation, since they already lost parliament.

> ...at 11:51 [on the 20th], I saw a Salem bot email from 11:11, "7.395%-18.458% Newsom to Run for President by Summer?". I was pretty frustrated that I only saw it 40 minutes later, despite actively being on the Chromebook the entire time. I think I must have put it in fullscreen mode while reading. I normally use fullscreen mode whenever I'm reading anything in order to free up that extra bit of screen space and move the text I'm reading right up to the top edge of the screen in order to make the sight lines more comfortable. Presumably, I spent 40 minutes in full screen mode on Wikipedia and thus never noticed the new mail on my Gmail tab.

> Anyway, it looks like a nobody put $500 on YES (7->18%) at 11:10, and I bought $2000 NO (18->10%). I was nervous about being low on cash, down to only around 1k with the Turkish elections, etc. still coming up, so I put up a small YES limit at 9% to try to cash out a little.

> I was confused about why Johnny and zubby would have still not hit the spike 40 minutes later, despite being confirmed to have bots. I noticed that "Nuclear Use in Russia-Ukraine War?" was up to 22%, and discovered that the same person had put down $490 on YES at 11:11 (11->37%). Presumably it was a new player who had decided to YOLO their entire starting stake between two markets.

> Anyway, Johnny had bought it down from 37->29% at 11:13, just two minutes later (followed later by another nobody to 22%). I assumed that he had thus seen the spike and just didn't think it was worth locking up his money in Newsom at 18% for some reason.

> However, I checked again a couple hours later and saw that Johnny had put down $500 NO on Newsom, cashing out $17/50 of my limit. So I guess I just got lucky that he only noticed the nuclear spike and missed the Newsom spike which happened at the same time. Anyway, after further thought, I decided to cancel the rest of my limit order. I figured that should I need to free up money, it'd be better to just eat the transaction fees and sell my lowest shares, and keep the money "invested" in the meantime.


## More leaderboard adjustment reverse engineering

> **21.05.23**

> **20:33** - Saturday evening, I chatted with my parents. I also spent a while, perhaps 45m plugging the old late-April Salem leaderboard dumps into the adjustment solver and debugging. No matter what I tried, there was an inconsistency, but it was related to PPPP and Alvaro de Menard, rather than Mark and Connor like might be expected, the inconsistency happened with just the constraints from the leaderboard dumps, not looking at historical first-day data, and it arose from the first leaderboard dump I did, not the later ones when I was manipulating the GDP market to try to push Mark past Connor.

> ...I spent most of the morning up until around 1pm further investigating the Salem leaderboard data inconsistency. I figured out that it was due specifically to the out of place positioning of Alvaro de Menard in my first dump, where he had a portfolio value much lower than the surrounding players for some reason.

> The first point in time consistency with the balances from the leaderboard dump was at 9:14:33, and I looked at the ten points before that and calculated everyone's balances then. It looks like I made the dump right after I dumped the 1% GDP market, bought up NO on the 3% market, etc. The last point where Alvaro de Menard's score was consistent with his leaderboard position was before 9:12:21, when I first sold my 1% GDP shares.

> It seems that something I long feared is true - the leaderboard data isn't actually atomic. It seems that the balance values shown are always up to date, but it may take several minutes for market value changes to be reflected in the rankings. I always wondered about that, since I wasn't sure if the server would actually recalculate everyone's portfolio value and recalculate the rankings every time anyone made a bet in any market. It wouldn't be a problem with the relatively small scale of the Salem markets, but it probably wouldn't scale to the main Manifold site, which the code was written for.

> Anyway, I just modified the history matching code to include points up to 2.5 minutes before the first point that matches the given balances when calculating the range of differences to associate with that ranking, and after that the constraint solving had no inconsistencies. I then applied the new constraints to the historical first day data, and there were now only two time points that were consistent with the data, so I now have either exact or near-exact adjustments for everyone.

> Of course, knowing the exact adjustment values is completely useless and not worth the considerable time I've devoted to the topic over the last couple months, but I wanted to investigate it just out of curiosity.


> **23.05.23**

> **06:33** - Monday morning before work, I checked my Linux desktop again... I also checked in on my Salem bot script and discovered that it had just frozen at 11:37am on Sunday. No errors or anything, it just wasn't doing anything. In addition to restarting it, I remembered that Google stupidly requires the tokens to be regenerated every week and I'd forgotten to do that, so I once again performed the weekly ritual of deleting the token and going through the browser flow to manually re-authorize the app. I guess it's a good thing I apparently didn't miss much on Sunday when the bot was unknowingly dead for a day.

## Despair and determination

> I checked my computer around 2 and found a bot email from 1:06 saying that McCarthy had spiked from 25% to 34%. Johnny had already bought $100 NO (34->32%) just a minute or two after the spike, but he evidently didn't think it was worth pushing all the way. It wasn't a good sign, but I decided to throw $100 in myself (->30%) and upped my YES limit to 26%.

> The last time this happened, the spike was still there two and a half hours later (though nobody Henry A Long jumped in just minutes later and took part of it) and Johnny only stepped in *after* I bought mine, but it seems that Johnny has fixed his bot or is paying more attention now or something, so I'm unlikely to get even the minor gains I saw from my bot before. Even if I ever managed to fix the bot to send SMSs, he would still probably be faster than me. It is annoying, although I guess it doesn't matter that much since I'm massively far behind Johnny and zubby with no realistic chance of catching up, even if they weren't taking all the best profit opportunities and constantly widening the gap, and also have little chance of being passed by anyone from below. But still, I can't help striving to rise further.

## DeSantis declares

> **24.05.23**

> **07:22** - ...Anyway, besides the previously evidenced journaling Tuesday morning, I also googled for DeSantis news as usual every morning and saw a story saying that he specifically planned to announce on Wednesday. I decided to throw in $300 of my remaining $1101 in cash on Salem, (91->92%). I figured if it would only be resolving in a day, then even relatively small gains are still favorable, since I could still use the money for other markets (Erdogan, Newsom, etc.) afterwards.

> Still, I was surprised how fast it went up. Around noon, I read that morning's Money Stuff, which mentioned under "Things Happen" at the end that DeSantis was planning to announce with Elon Musk. A quick google showed that sure enough, there were news stories ~20 minutes old saying that DeSantis was now specifically planning to announce at a Twitter Spaces event with Musk on Wednesday afternoon.

> I threw in another 500, but of course other people had already seen the same story and pushed it up to 95%. Within hours, it had jumped to 98%, where it remains.

> **25.05.23**

> **07:13** - As far as Salem goes, besides the excitement on Tuesday I described yesterday, I also planned to

> (p.s. Just got a bot email at 7:31 while writing this and went to check it, but it turned out to be nothing useful, just KDM selling Trump Twitter back down, 54->45%, and then down to 40% while I was checking)

> Anyway, I thought DeSantis would declare in the afternoon, sometime after 3pm. I was planning to check the news periodically to try to find out when he officially declared so I could quickly dump in my last 300 at 98% to earn a few extra pennies before the market resolved.

> Unfortunately, I first randomly checked the news at 12:52 and discovered that he had already declared and the market had already resolved nearly an hour before, so so much for that. Not that it matters that much, since $6 is pretty trivial, but it was still annoying.

> The main reason for not dumping my last 300 in before was because I wanted to keep some dry powder until right before resolution in case some other opportunity came up, but in retrospect, that is pointless if I'm not going to be checking the markets during that time anyway.

> I think I did check once in the midmorning, but normally, I don't bother checking my email and/or Salem much during the workday, and thus wouldn't have been able to deploy that 300 to jump any opportunities that improbably arose anyway, and thus I should have gone ahead and thrown it in that morning. Oh well.

> The other thing I was planning was to buy some more Newsom as soon as the market resolved. I figured that lots of people would have money tied up in the market suddenly freed and this would probably lead to major moves in various markets, and that would probably include buying up the free interest in Newsom (and likewise the two Ukraine markets), and thus I thought about trying to buy some after resolution before the inevitable drop.

> It's funny, because that morning, I was debating to myself how much Newsom I would buy at 9% after resolution, since I wanted to preserve most of my money for the Erdogan market. I had decided on just getting 100 or 200. However, that turned out to all be for naught, since I only discovered the resolution an hour later after everyone had already started buying stuff (and Newsom was suddenly down to 6%).

> But of course, those were all trivial amounts. It's not like I'm going to catch up to zubby or not based on winning $6. The real game-decider will be if A) something highly improbable happens and B) I am somehow the first person to find out and trade on it. I think that's the only way I could hope to catch up with Zubby and Johnny at this point. The most plausible way that could happen is if Kemal wins the election, but that's a longshot, and it's even more of a longshot that I'll be able to take most of the profit in the process. Realistically, the rankings are already fixed (at least for the top 8 - the bottom half of the leaderboard has been a lot more fluid).

## **The debt ceiling debacle**

Near the end of May, I got blindsided when the debt ceiling market was suddenly revealed to actually be a deceptive trick question. I already wrote about this at length in the [first part]({{prev_url}}), but I'm still frustrated about it. You know things are bad when even *Richard Hanania* himself, the *founder* of the contest, was deceived by this market. But ranting won't change the outcome.

I guess the one positive thing that can be said about this farce is that I'm lucky I didn't lose *more* than I did. If I had actually had a working bot, it probably would have woken me up during the night when Malte starting his massive NO bets, and I probably would have assumed it was dumb money and starting buying it back up, and thus lost even more money.

In fact, this is actually exactly what happened to Johnny. For a while, he kept buying YES while Malte continued buying NO. However, Malte then posted a comment explaining the ruse, and Johnny dumped the market himself, and thus made a huge profit to compensate for his earlier losses trading against Malte.


> **28.05.23**

> **06:29** - Salem: Last night around 8:10, following the chat with my parents, I checked the news and saw that a tentative debt ceiling deal had been reached, so I put in $500 (92->93%), although I immediately regretted it after it occurred to me that it likely wouldn't resolve until after May 31st, and that it would be better to keep the money to put in the Erdogan and 5/31 markets, and put in a NO limit at 94%, hoping someone would bail me out.

> I also checked the news about the Turkey elections, and saw that there was no sign of a turnaround and everything pointed to Erdogan winning the runoff, so I reluctantly put down $300 on YES (84->86%).

> Unfortunately, disaster struck, as I woke up to two bot emails this morning saying that the Debt Ceiling market had tanked. Several months ago, zubbybadger had commented on the market asking Salem whether suspending the debt limit would count or not, and they said it would count as NO. I'm really kicking myself for not paying attention to that now.

> Overnight, Malte Schrödl (who jumped onto the leaderboard after profiting the most off the DeSantis bounce) dumped the market and commented pointing out that the current plan is to "suspend" the debt ceiling rather than "raise" it. Later on, Johnny also dumped it much harder, down to 27%.

> It was extremely frustrating since it feels like the whole time the market has been a secret "gotcha" that was not actually predicting what the title suggested and what everyone thought it was. I'm probably still going to end up in 3rd, but this pretty much permanently slams the door on my hopes of advancement, and it feels like continuing to play is pointless.

> At first I decided not to do anything, but later on, it went up to 35%, and after agonizing over it for a while, I just decided to sell (6:40, 35->30%), thus locking in my loss. My portfolio value is now back down to where it was a week ago, before the DeSantis bounce. But of course, I've lost far more ground than that relative to Johnny and Zubby. It's so frustrating how weeks of hard work could be undone in an instant over a stupid gotcha. I guess at least I should be thankful that I didn't put more in.

> Anyway, it's now 6:42, I guess hopefully I can forget about things until the Turkish election results start coming in, although it all seems so pointless now.

> **06:56** - I ran the stats script on my desktop for the first time since Sunday afternoon last week. It looks like I was 38.6% away from second place as of last week, although I likely got closer following the DeSantis pop. But all that's history now, obviously. I'm currently 44.1% behind, which would go down to 27.9% if the market somehow resolves YES and up to 51% if it resolves NO as expected. (I sold my own shares, but Johnny and Zubby are both betting heavily on NO now, so the resolution is still significant).

> As impossible as making up a 30% deficit seemed a week or two ago, making up a 50% deficit with a few less weeks of playtime and several less markets left to resolve seems even more impossible.

## The Turkish runoff election

> **09:24** - A bit after 7, I decided to watch the first episode of Wednesday (in English) in order to try to distract myself from the Salem debacle and wait for the election results to come in. I've heard it's really popular, but it didn't seem especially appealing to me. I was also surprised that the episode kept going after the cello montage, since that seemed very much like an end-of-episode kind of scene.

> After that, results still weren't in, so I forced myself to go through a dialog on Satori Reader, not paying much attention due to thinking about Salem. I thus started following the results at 8:18am, checking HalkTv periodically while constantly searching Twitter for news and analysis.

> This time around, HalkTV showed Kılıçdaroğlu with a lead hovering around 2% which only started to slip a bit around 8:37. It seemed improbable, but that was enough that he might win if it held up (HalkTV notably never showed a lead like that in the first round).

> It was hard to find any election analysis this time around, but I eventually managed to find one guy, Grady Wilson around 8:28, and saw a post where he said that even though the Anka showed the opposition in the lead, Erdogan was still "a clear favorite".

> At 8:43, I saw another post from Wilson with a chart of six high reporting districts, showing that Erdogan was beating his 2018 numbers in all six, and the lead on HalkTV had started to slip a bit as well, so I finally became near certain that Erdogan would win.

> However, nobody had touched the market since last night, and I foolishly thought that meant that noone else was paying attention and I could afford to wait for another update or two, just to be safe. While I was wavering over whether to bet yet, at 8:46 zubby jumped in and bought it up 86->89%, so I flew too close to the sun. I immediately panicked and put in 3500 on YES (89->96%), out of my 3507 in free cash.

> I checked again a couple minutes later and discovered that oddly, zubby and Johnny had actually sold down to 93%. I can't understand why they would do that when the outcome was even more obvious (by then, HalkTV's numbers were in freefall), but I guess I can't complain too much if they're going to waste their money for no reason. It almost makes up for the big miss of me not jumping in at 86%.

> I discovered that I could sell my 222 Kherson shares for $210, which would fetch 232 on the Erdogan market, a very slightly profit even excluding the ability to reinvest the money once this resolves, so I went ahead and did that (and threw in the last $7, too). I went for a walk to the bay (thinking about Salem the whole way) and there was no further action.

> I left a comment on the market about missing out to zubby at 8:43 and wondering why they sold later, and then wrote this. It looks like Zubby jumped back in at 9:30 (93->94%), which is a bit unfortunate, since he will still be getting some more money. I was hoping nobodies would swarm in and take the remaining profit, but no such luck.

> Anyway, that's the morning's excitement. I think I did gain some ground on Erdogan, but only a little, and with one more opportunity for a longshot win off the table (i.e. if the opposition had won and I was the first to recognize it and made a killing), my odds of taking second probably actually went down further.

> I just checked, and I'm currently 43.3% behind second (which is Johnny again, as he fell to second following the Debt Ceiling drop). Assuming that the Erdogan, Debt Ceiling, and 5/31 markets all resolve as expected, I'll be 45.1% behind (compared to around 49.5% behind when I checked earlier this morning.) So I did get slightly closer but it is still an extreme longshot. Anyway, it's now 9:41. I wonder how long I'll be distracted by Salem today.

> **09:46** - P.S. I ran the numbers, and it looks like I'll be at a total of 10753 once Erdogan resolves, compared to 10781 last night before the debt ceiling debacle. In a stupid way, it almost seems fitting that the Erdogan boost was just enough to *almost* make up for my blunder last night. Anyway, I guess that really, I should be happy that the US is probably not going to default on the debt and tank the economy now, regardless of what happens to the imaginary internet points on Salem. Shame about what happened in Turkey.

> **13:07** - This morning, I kept waiting for the Erdogan market to resolve,  but the message never came. I was hoping that nobodies would flood the market and punish zubby and Johnny for their mistake, but if anything, the opposite happened. Bizarrely, 50P actually sold a bit and put down some NO limits, even though the election was already decided, giving a slight extra boost to Johnny when he bought back in.

> Anyway, I checked in again at 1:04 just now and saw that it had finally resolved (at 12:59). I put in 2329 of cash (leaving me with 2000) into the three 5/31 markets, using my script to optimally divide them up. For a long time this morning, I kept thinking about whether I should just give up and stop playing Salem. It certainly doesn't seem worth all the time and effort now. But I'm already heavily invested in the Newsom market, so I might as well do that at least. I think my current plan is to keep playing until the Debt Ceiling deal goes through and see if in some miracle, the market resolves YES then, which would at least give me a chance. If not, I guess I'll probably just stop playing then. Or at least I intend to: knowing me, it will be hard to give it up.

## Scooped by Zubby

Besides the debt ceiling debacle and the Turkish elections, Sunday held one last notable minor event, a price spike in the afternoon. I successfully got the bot email and was (presumably) the first person to see it, but I waited too long to bet and Zubby stole it anyway.

> **30.05.23**

> **18:18** - [May 28th] at 3:57pm, I saw a Salem bot email, "24.720%-48.221% Trump Indicted Again?". Dylan Levi King had made a massive NO bet just minutes before, something that Dylan does on various markets from time to time for some reason. I quickly checked the news to see if there were any news stories that would have prompted the selloff and was still busy researching and thinking to myself about whether I should risk just throwing in $100 before researching when two minutes later, zubby jumped in obviating the issue. So that's another minor loss for me (as usual a double loss, since not only did I not get the profit, but my competitor did, putting them that much farther out of reach). Oh well, catching up would have been an extreme longshot anyway, and things like these probably involve relatively small amounts compared to the Debt Ceiling fiasco.

> **01.06.23**

> **06:29** - Speaking of Salem, I also noticed Sunday that Malte Schrödl (the person who first dumped Debt Ceiling) shot up to 7th place, which I believe is the first time anyone new had entered the top 8 since the beginning of March (when I did). It made me think that I have a bit of extra competition now.

> He's still way behind me, but the fact that he shot up from nowhere to 7th place in less than a week was pretty alarming. The other thing is that in addition to me having a large lead, most of the top players weren't even playing at all, further increasing my security in 3rd. Besides Johnny and Zubby bitterly duking it out for first, the only other top player who was still active was Mark. But Malte could conceivably pass me if he somehow pulls another rabbit out of the hat like that.

> Incidentally, while it was frustrating that I got screwed over on a trick question with the debt ceiling market, it could have gone a lot worse. It would have been a real disaster if I had put in 1000 instead of 500, or if I had actually had bot notifications working at the time and saw Malte dumping the market as dumb money and bought it back up.

## The final night

The night of May 31st (Wednesday), I attempted to build a bot that would automatically check Trump's Twitter for new tweets and bet my money on the Trump Twitter market when that happened. Making bets on Salem programmatically turned out to be easier than I expected, but unfortunately, finding new tweets on Twitter turned out to be much harder, or rather impossible, and I never finished the bot. (Fortunately, it didn't end up mattering as Trump never tweeted anyway.)

I also put my last bit of money down on Newsom to earn a free 2.5% return overnight, though I regretted it in the morning.

> **03.06.23**

> **09:32** - Anyway, back to Wednesday evening. After Avalon, I spent half the evening working on the Salem bot. For a long time, I'd been thinking about trying to make the bot scrape Twitter as well and send me an alert if Trump tweeted again, and later it occurred to me that it would be even better to just have it directly spend all my money on YES shares on Salem when that happened. Going by recent weeks, there's no way I'll ever win a race against Johnny and Zubby if it comes to me having to get an email from my bot and use human judgment, so the Trump Twitter market, where the outcome can conclusively be judged by a bot, seems like my one hope for advancement. Assuming of course that they didn't write such bots themselves (which I highly doubt) and that Trump actually does tweet in the next two months (which seems pretty unlikely) and that everything actually works.

> I'd always assumed that scraping Twitter would be the easy part (it's just fetching a webpage, right??) but wasn't sure if I could successfully make bets on Salem from my bot. However, the opposite turned out to be the case.

> I first tackled the Salem half. Manifold does have an API, but I discovered that the documentation says there is an extra transaction fee applied to all bets and comments made via the API. I then looked at the network requests to see what happens when you place a bet normally in the browser, and fortunately, it turns out that it is the exact same as the normal API, just with a different URL.

> I successfully wrote some Python code to replicate this API and place bets (but substituting my API key for the JWT bearer token used in actual requests, since I worried that might expire) and tested it with a couple $1 bets. All in all, it took perhaps 30-40 minutes.

> Unfortunately, Twitter proved to be more of an obstacle. Twitter does have an API, but unfortunately they charge for it. Meanwhile, you can't just fetch a webpage either, as the tweets are not part of the html, but rather loaded dynamically via json requests. After a little while, I gave up and decided to put off Twitter for later.

> I also put my remaining $200 (well six $1 test bets followed by $194) into Newsom (one of the test bets was for Kramatorsk instead to make sure I could place bets on different markets) and examined the standings with my script. I noticed that Zubby and Johnny had opposite bets on the outcome for Trump Twitter and Trump Indictment, although the amounts involved were small and liable to change over time (case in point, when I checked again Friday night, they were both YES on Twitter), so I wouldn't benefit from much of a paradox.

# June 1-15
![Score graph](/img/salem2/june1.png)

I ended May secure in third place, but impossibly far away from second. For a while, I was tempted to stop even trying, since the final ranks were practically fixed in stone already.

Fortunately, I decided to keep playing anyway, just so I would be in a slightly better position in the unlikely event that a bunch of miracles happened and I actually did get within striking distance of Johnny (which is what actually happened later on.)

The first half of June was quiet, partly because there were few active markets left and because I no longer had any incentive to obsess over Salem, but also because I was *on vacation* from June 6th through June 14th. The most notable event was that I programmed a new tool I called **Salem Plus**, which made things a bit easier later on.

But before all that, the *very beginning* of the month held another trivial disappointment for me:


> Wednesday night, I went to bed at 11:01 or 11:16. I woke up during the night at 4:08 (probably not the only time), but had trouble falling asleep again for long and at 4:42, I finally gave up and decided to get up. ...I went back to bed at 5:31 and woke up again at 5:57.

> I had been planning to put down perhaps $500 NO on Trump Twitter at 43%, since I figured that the risk of betting NO would be low once I got the Twitter bot working (which means I likely get huge gains in the unlikely event he does tweet) and the odds seemed pretty good at 43%.

> I knew that once the 5/31 markets resolved, everyone else who had their money locked up would likely rush into other markets and mess around with the prices, but I hoped that I could get in first. Unfortunately, the markets weren't resolved yet when I woke up during the night, and only resolved at 5:39, while I was asleep, and by the time I had gotten up again, people (mostly Mark) had bought Trump Twitter down to 39%.

> In retrospect, I should have put my last $194 on Twitter rather than Newsom Wednesday night. But of course, I thought I could get the free 2.5% return on Newsom and then also jump into Twitter first. Oh well. I resignedly bought $300 NO (39->34%). Oddly, a couple people seemed to think it was undervalued. When I checked again in the afternoon, it was back up to 40%, so I put down another $100 (40-38). I think those odds are just about high enough that I'd probably close the gap with Johnny, assuming it resolved NO *and* I could magically invest my whole stash at that rate. But of course, you can only put in a little bit before the price slips and I wouldn't risk my whole fortune on that anyway, even if I could. In any case, it is now down to 35%, so it doesn't seem like I'll be getting any more deals there.

> **16:12** - One other amusing Salem thing Thursday morning: I got curious what following people did on Manifold, and so Wednesday evening, I commented "BTW, what does following someone here do? For some reason, I can't find anything about this online." on the Newsom market, hoping Johnny would explain (which he did). The amusing part is that my comment was somehow inexplicably chosen as "Proven Correct" with a cheerful announcement below it that "Robert made $0!" (presumably interpreting my comment as relating to one of the $1 test buys I made around that time).

![Proven correct screenshot](/img/salem2/newsom_proven.png)

## Johnny's debt ceiling mistake

Johnny misinterpreted the resolution criteria and foolishly rushed into the Debt Ceiling market, which meant that he lost a little money on transaction fees, buying in and then having to sell again, and thus he was *very slightly* less impossibly far ahead of me. Unfortunately, [as described previously]({{prev_url}}), I underestimated Johnny's willingness to sell, and thus failed to take advantage and further punish the mistake by buying YES shares myself. This would have netted a small profit for me and more importantly, inflicted further losses on Johnny. Since Johnny was my only real competition by this point, his loss was my gain and vice versa, so buying YES would have effectively netted a double profit here.

Also, I again tried and failed to build a bot to watch Twitter.

> ...Also, when I checked Friday afternoon and evening, I discovered that the Debt Ceiling market was down to only 2%. For some reason, Johnny (and to a lesser extent, Sid Sid) decided to dump massive amounts of money into the market, as if they expected it to resolve imminently.

> I actually considered buying a few YES shares on the assumption that people would likely sell out of the market at some point to pursue other opportunities, but decided that the tiny potential profit wasn't worth the effort and risk. Zubby, however, bought $60 YES for the same reason (and 50P later put in $10 as well).

> Johnny said that he misinterpreted an update that was added to the market description on the 28th, saying "A debt limit suspension without a raise would cause this market to settle as NO. For the difference between a suspension and a raise, see the first two paragraphs of this document."

> I can see how that would make him (and Sid Sid) think that it would resolve NO immediately, even though normal common sense would say that a market which asks "will X happen?" can't resolve NO until the end of the specified time period, since it is still theoretically possible that congress could decide to actually raise the debt ceiling, not just suspend it.

> Anyway, I was pretty happy to see Johnny dump half his money into this at dumb rates, since it means that either that money is tied up and not deployed in other markets where he could earn a lot more profit, or else he has to sell out early and eat huge transaction fees. Either way, the prospect of passing him is very slightly less absurdly improbable than it would have been otherwise (still not going to happen though, barring a miracle). Incidentally, when I ran the numbers Friday night, I saw that a YES resolution to the Debt Ceiling market would drop Johnny to 4th and Zubby would be a full 1.70x above the second place person (me). I jokingly wondered what it would take to bribe congress to raise the debt ceiling by a dollar.

> **08:38** - Friday evening, I tackled the Twitter thing again. I found the JSON request that the browser was using to fetch Krugman's tweets and replicated it in a Python script, and programmed the bot to email me when new tweets showed up as a test. It's a good thing I decided to test it in just email-only mode before hooking it up to actual bets because it soon resulted in false positives.

> My assumption is that this was due to ads or promoted tweets showing up in the timeline and changing every once in a while, but there's no way to know. I tried to investigate further Saturday morning, but by then, the exact same code was just returning 403s. Presumably the authorization token it was using expired. Seeing that made me give up on Twitter for the time being, since it seems hopeless unless I pay for the API.

> **05.06.23**

> **22:46** - I forgot to mention that as far as the Debt Ceiling market on Salem goes, Johnny sold most of his NO shares Sunday morning, going up to 5% (and it looks like he's been using 5% limits to try to sell the last few). It looks like Zubby sold the $60 in YES shares for $97. I really regret not buying some YES shares myself, especially as I'd profit doubly, both from getting money myself as well as from costing Johnny more when he sells. I really underestimated Johnny's willingness to sell and take a loss, as well as how much the price would go up if he did. I guessed that the price would be unlikely to even hit 3% after the selling, which is why I decided that the possible profit was negligible. Oh well, it's comparatively minor in the scheme of things.

## The second Trump indictment

I'd been ignoring the Second Trump Indictment market and not bothering to check for news, and thus missed out on the spike. The good news is that at least Johnny missed it too, so I didn't fall further behind.

> ...I happened to check my Chromebook at 3:11pm, and that happened to be exactly when I got a bot email of a spike in the Trump Indictment market (68-75). Unfortunately, it seems that I was late to the party. It started the day at 51%, but people slowly bought it up, particularly from around 11-12 and again around 2-3:15. The email I got was just from one purchase by PPPP that happened to be large enough to bump it up by 7% in one go.

> I ended up putting in $400 (at 73-75 and 75-77), but I was pretty much the last person in, and it has been quiet since. The ironic part is that I had actually been thinking about buying NO shares recently, but had decided to wait until after I arrived in Atlanta to research the market. Which of course means that I seem to have missed all the excitement. (Of course, if I had decided to buy NO now rather than later, I would have actually researched it and seen the news stories from yesterday indicating a likely indictment soon.) Oh well, at least it doesn't seem like Johnny made much more than me on the market either, as he invested relatively small amounts.

> As of this evening, Zubby is now well ahead of Johnny, thanks to the Debt Ceiling sale, and probably the Trump Indictment stuff as well (Zubby did buy a bunch of YES this morning 51->54%, as well as more later in the day.), when they had previously been neck and neck for a while. Meanwhile, Johnny is currently "only" around 42% ahead of me. I've probably gained perhaps 2% on him thanks to the debt ceiling blunder, which is not enough to actually make a difference, but still better than nothing. The real problem though is that there are only 21 markets left in the contest at all, and most of them are already pretty much decided.

## Salem Plus

Previously, all my Salem analysis and calculator scripts were done in Python on my Linux desktop, but I was about to go to Atlanta for a week and a half on vacation, and I obviously couldn't bring my desktop with me. Fortunately, I came up with the bright idea of re-implementing everything in Javascript and embedding it into a custom website I dubbed Salem Plus.

By publishing Salem Plus to Github Pages, it would be a publicly accessible website, and hence I could use it from my Chromebook, even while on vacation. Unfortunately, I never got around to implementing any more than the most bare-bones possible functionality of displaying recent market activity (read-only) in a plain text dump. But even that turned out to be surprisingly useful.


> **06.06.23**

> **09:53** - After work, I quickly set about working on the "Salem Plus" custom website concept. It wasn't hard to replicate the web requests from my Python script in Javascript using the fetch api, and I even made another $1 test bet from JS, but the work of actually designing and coding a website by hand is more annoying, and I didn't get beyond just listing the current market probability for each open market in a bare text list. I had grand dreams of adding all sorts of calculators and scripts, or even just stuff like highlighting markets in different colors if they had seen recent activity, but I never got around to that.

> After perhaps 30-40 minutes of working on the website, I got a headache and felt tired, so I took an ibuprofen, lay down on the bed for a little while, then watched an episode of Bojack Horseman.

> **14:11** - I forgot to mention that Johnny sold part of his Trump Indict shares last night (77->74), meaning he took a loss on the 75-77 batch (though he did buy shares at much lower prices as well). I guess this means that if it does resolve YES, I'll gain a bit of ground on him.

> Anyway, I worked for a while (perhaps 45m) on the Salem Plus website again this morning and then pushed it to Github. I'm writing the website in pure html using JS to assemble html elements by hand (e.g. with appendChild, createTextNode, etc.) which is pretty annoying and error prone. I probably should learn how to set up and use React, TS, etc., but I figured doing it all by hand would be good enough for something quick and simple like this. Anyway, the page is now at the point where it will display the last 10 bets in each market, with each market sorted by the time of the most recent bet. It's all plain text and has no scripts or bet functionality built in, although the fact that it displays the exact decimal of the current market price rather than rounding might be useful.

## Vacation

While I was on vacation, I was obviously busy and preoccupied with other activities, but I still continued checking Salem (via Salem Plus) a couple times a day in spare moments to keep abreast of major market activity. I basically didn't bother to do any actual bets though, apart from one calculated bet on World GDP that didn't go well.


> **09.06.23**

> **09:46** - ...When we got back, I checked my Chromebook at 8:32 and saw a Salem bot email for Trump Indictment, and quickly checked the news and saw that the indictment came in and put my entire fortune on YES (97.67%->99.28%). Of course, I was late to the party this time, and everyone else had already bought in (Johnny in particular put in tons of money in the 80s and 90s) and it was already at 98% so I'd barely get anything, but I guess every little bit helps. It does mean though that Johnny presumably shot much farther ahead and now I really have no chance of beating him.

> For some reason, the market still hasn't resolved yet. Normally, I'd worry about the opportunity costs of putting all my money in, but I assumed it would resolve imminently, and since I'm on vacation, I wouldn't be trading much normally anyway. By pure coincidence, when I first got up this morning and checked my email, I got another email and saw that PPPP had made major investments in a couple markets just minutes before (YES on World GDP >3%, NO on Trump Twitter). Although even if I did have money, I probably wouldn't trade on them, especially the latter.

> **10.06.23**

> **08:35** - ...When I got back (~2:30), I found that the Salem Trump Indictment 2 market had finally resolved. Strangely, Johnny sold ~2k of YES (at 99.3) shortly before resolution for no apparent reason. It's almost like he doesn't understand transaction fees at all. Of course, he's made so much money over the last couple days that it won't matter, if it ever would have (for example, he made a total of over 600 on just the Trump Indict 2 market, even after the dumb blunder at the end, and he's been trading a lot in other markets too.)

> Salem also added their first new market in months, will Trump be indicted a third time. I put in 183 on NO at 35%. Also, PPPP had been buying up the "World GDP >3%" market all day and posted a comment arguing that it should resolve YES immediately because the World Bank published an official document saying "Our baseline scenario calls for global growth to slow from 3.1 percent in 2022 to 2.1 percent in 2023".

> I'm guessing that Salem will wait until an official GDP estimate is published using the particular linked data source and thus it won't resolve until the end of the contest, but I threw in $500 (at 90%) just in case. In this case, the risk isn't losing my money (probably) but just the risk that that it takes until the end to resolve and my money is locked up with a return of only 10%, so even though the actual chance of the early resolution was small, I figured the cost of taking a chance was relatively small. Johnny has been heavily betting against that market and now has it down to 85% again, so that's hopefully going to cost him, though the amounts involved are small and there's no way it will matter.

> **12:20** - ...Despite it being very barebones, I've been using my "Salem Plus" page more than the actual Salem website when checking in on the markets lately. I think it loads faster, and having all the markets on one page sorted by recency and with recent bets listed on one page is convenient.

> This morning, I tried to make some improvements for the first time. Of course, there's no code editor - I had to modify it by typing the code into Github's web editor, committing it, waiting a minute for it to deploy to Github pages, and then hoping that the changes worked. And this kind of thing has the worst edit->debug cycle even on the best of circumstances.

> I just made two minor changes - getting the bet timestamps to display in local time instead of UTC and merging bets by the same person on the same outcome within two minutes into a single line, in order to avoid the display being clogged up by "50P spam". Incidentally, 50P is back to the old tricks, making eight consecutive $10 bets on Trump Twitter this morning, and other nobodies do it too, including one streak of seven this morning, so at least I had good test cases. This logic took me three tries to get working, since I couldn't actually test the code other than deploying it and hoping for the best. Obviously more complicated and involved changes will have to wait until I get home.

> **17.06.23**

> **21:57** - While I was on vacation, I ended up checking Salem via my Salem Plus website several times a day, especially when I got home after a long time out at e.g. a restaurant. It doesn't seem to have done me any good though. The most notable event was that someone suddenly dumped the World GDP >=3% market down to 62%. By the time I saw it, Johnny had bought it up a bit, but then sold back almost to where it was. I was nervous buying into a dip that Johnny refused for some reason, but I ended up putting in $400 at up to 70%. (I put in a limit at 70%, buying 216 immediately and the rest at 70 when Johnny traded against the limit later). It was only when I checked Salem again this morning that I discovered why he was skeptical - he left a comment saying that the World Bank report PPPP cited listed the 2022 figure as an estimate.

> Other than that, the Iran deal market spiked to 48%, and later went down to 36% yesterday afternoon, but I stayed out of that. By pure coincidence, I was on my chromebook at the time and saw the bot email for the dip to 36% just minutes later, meaning I would have quite possibly beat Johnny to it, but I decided not to try to trade on that dip, which is just as well, as Johnny never bought it either, meaning I couldn't have flipped it to him.

> Anyway, I checked the rankings with my script this morning and saw that I'd lost a bit of ground (currently 45% behind Johnny, but of course it will be much higher or lower depending on how the World GDP market resolves). It's funny how before I left on vacation, I was really gung-ho about Salem and the Twitter bot and so on, but nowadays I barely care about Salem since there's no hope of advancement anyway, and I haven't been able to work up the motivation to work on Salem Plus or Twitter or anything else.

# June 16-30
![Score graph](/img/salem2/june2.png)

By the middle of June, I was barely even bothering to check Salem at all, since there was no realistic prospect of the final rankings changing anyway, no matter what I did. Fortunately, my luck was about to take a dramatic turn for the better.


## The Supreme Court dress rehearsals

Previously, I'd almost completely ignored the Supreme Court markets, but in late June, I heard that the Supreme Court's calendar was almost over and they'd be releasing the decisions soon, and it occurred to me that I should try to find out when the decisions would be released to see if I could trade off the news.

As usual, I had no idea where to look for information at first, so I turned to Twitter, where I eventually came across the website **SCOUTS Blog**, which has a really good and timely liveblog of the Supreme Court Decisions, that I relied on for all subsequent days.

> **22.06.23**

> **22:19** - I'd barely thought about Salem at all for the last week and rarely bothered to even check Salem Plus, but this morning I decided to try to follow the news of the Supreme Court decisions in the hopes of being the first person to find out and trade in the two Supreme Court markets (college affirmative action and student debt forgiveness). I started with a "live update" post from The Guardian, but eventually discovered that looking at Twitter is a lot more timely (albeit with lots of irrelevant crap to wade through, not that the Guardian liveblog didn't also have irrelevant crap).

> However, they only released four decisions this morning, and it was all over pretty quickly. It sounds like tomorrow is the last day so they'll be releasing a massive number of decisions then. It's nice to have a dress rehearsal so I have more practice at knowing how to look for news of the decisions being released ahead of time.

> **23.06.23**

> **07:30** - At 7am, I once again spent eighteen minutes anxiously checking for news of the Supreme Court opinions. This time, I mostly relied on the live blog at https://www.scotusblog.com/, though I also refreshed the official Supreme Court website while waiting around. Once again they just released four opinions. It seems that there's another non-argument day scheduled for the 27th, when they'll presumably release all the remaining opinions.

> **07:51** - P.S. I also briefly got on the desktop this morning to delete the Google API token and authenticate again. It's so annoying that Google makes you do that. Incidentally, when I checked Salem Thursday morning last week after getting back from vacation, I discovered that I'd missed several market moves in the last day because of the expired token. I refreshed it before leaving the Tuesday before, but it only lasts a week. Not that it matters - market movements that are actually worth trading against are rare and Johnny always pounces on them in only two minutes in the cases where they are profitable, so there's basically no point in even trying.

## A new hope

> **24.06.23**

> **09:47** - Friday night, I had a rare stroke of luck on the Salem front. At 9:08pm, a new face (Guangyu Song) randomly bought up Russia-Ukraine Ceasefire from 12.3% to 62.5%. (They put in 2142, presumably yoloing all they had in the hopes of jumping to the top.) I was researching DisneySea travel on r/japantravel at the time and just happened to notice the bot email at 9:10, only two minutes later.

> I was extremely lucky because big spikes like that are rare and Johnny always snaps them up in only two minutes. I hurriedly checked Google News, and then put in $100 before researching further since I assumed Johnny was racing me and every second counted. A couple minutes later, after I had checked the news more carefully and confirmed no signs of a plausible ceasefire, I put in $1000 more, and then at 9:22, I threw in 400 more to bring the total investment to a round 1500 (leaving it at 30.9%).

> I put in a YES limit at 18%, which if hit, would leave me with a total profit of $705, enough to at least make up for the debt ceiling debacle. I think that Johnny must have just been asleep or busy at the time or something, because he would normally never miss a spike like this, so I got doubly lucky. It did of course make me nervous, with him not jumping in, since there's always the risk that the spike was real, but overnight, Johnny threw in 400 (30.9->26.0%) at 3:24am, reassuring me. (Of course, that means Johnny is making a bit of profit too, reducing the relative advantage, but you can't win them all, and I still did pretty well.)

> Incidentally, Guangyu Song shot way up the leaderboard as the result of the spike. Even after my purchases last night, he was up to 11th place, but as of this morning, he has disappeared again.

> Anyway, even the profit from the ceasefire market is nowhere near enough to close the gap and advancing to second is still an extreme longshot, but at least I have a tiny amount of hope now. Perhaps if I get very lucky on the Supreme Court markets next week, I might be able to get in striking distance of Johnny. And I guess this incident proves that Johnny's bot is not infallible and it actually is theoretically possible for me to reap a spike, albeit very unlikely and not something I can expect to happen again before the contest is over.

Spoiler: It didn't happen again.


## The Wagner rebellion

I didn't even mention it in my journal at all, but the Wagner Rebellion happened during this time as well. I did notice that the "Ukraine to Take Major city?" market suddenly jumped up into the 40s in my cursory checks of Salem Plus, but I didn't bother to investigate further or check the news, and didn't even find out about the rebellion until several days later, after it was already over. I guess it's for the best, since it meant I avoided making any trades I'd later regret.

P.S. It's only just now as I was writing this that I realized that Guangyu Song's spike of Russia-Ukraine Ceasefire was probably triggered by news of the rebellion. I guess that explains a lot.


## Another paradox

> **25.06.23**

> **10:33** - ...I also worked a bit on Salem yesterday evening. I modified Salem Plus to filter out limit orders from the bet history (and added Guangyu Song to the names list). I also ran the Python script again, curious how the rankings would fair under various scenarios.

> I also used the multi-market bet allocation script to simulate what would happen under the ideal circumstances where I knew the resolutions of the two Supreme Court markets with certainty in advance and had the opportunity to be the first to bet on them. That's unlikely to happen, but it's what I'm hoping for, and it's important to at least be prepared to take advantage of it.

> I modified the code to print out the total profit and the marginal values of an additional $1 bet as well as the bet amounts. If both markets resolve YES as expected, I'd have a profit of 1733 with a marginal return of 9.2%. If they both resolve NO, I'd have a profit of 3459 with a marginal return of only 7.2%.

> That was completely counterintuitive to me. I'd always assumed that if the current market probability is farther away from the resolution and you're making more total profit, the marginal gains from additional bets would be higher as well, but somehow the opposite is true in this case. (The same pattern applies to each market individually as well.)

> The markets each have a liquidity probability, which is the initial probability they set when creating the market, and Manifold's automated market making algorithm is weighted to allocate more of the liquidity to values closer to the initial liquidity probability. In this case, the initial probabilities were set to 65% and about 66.2%, so bets would move the market faster on the NO half, but I'm still very surprised that it would lead to lower marginal rates like this.

> It's all irrelevant though, since profit is profit, and in any case, this is already assuming the best possible scenario. The hard part will be even being the first, and there's also a big risk that I misread the resolution. The resolution criteria on the affirmative action market is particularly confusing, and I worry that if the decision results are ambiguous, I'll get it wrong and lose all my money even if I am first.

## Selling out

I tried to sell my other shares in order to free up money to bet on the upcoming Supreme Court decisions, but unfortunately, this turned out to be a terrible idea, because the money I lost by selling my shares early turned out to be vastly more than the marginal profit from putting extra into the first Supreme Court market, and that's despite the fact that I *won* on it!

Especially painful was the World GDP market, where I sold half my stake at 67%, only for it to resolve YES (i.e. 100%) just days later. It's ironic that I managed to lose a bunch of money in that market even though I was *right* about the eventual resolution when I first bought in.

The best that can be said is that, irrationally afraid of transaction fees like usual, I used limit orders to try to sell my shares, and thus fortunately only managed to sell part of them.


> I also set limit orders at just above market price for all the markets I bet on to try to sell my bets to free up more money (to cash in at 7.2% if I'm lucky) ahead of the expected Supreme Court announcements on Tuesday. Of course, the problem with limits is that that relies on someone else to actually buy you out, and so far things have only gone the wrong way.

> It was also a bit discouraging, since even that total profit of 3459 in the best possible scenario is still less than the amount that Johnny is currently ahead of me, though I'd at least be close. If the markets resolve YES, then I'd only catch up half way even under ideal circumstances, and I'd still require another major stroke of luck or two to have a hope at catching up. And probably, I won't even get the 1733. The ceasefire windfall at least gave me hope again, but it will still take several more bits of extreme fortune to actually change things.

> **26.06.23**

> **07:37** - ...Also Sunday afternoon, Malte Schrodl bought part of my World GDP shares (at 67%). It feels bad to sell them at a loss, but I guess that's the sunk cost fallacy in action. Other than that, Salem has been remarkably quiet.

## The waiting game

> **28.06.23**

> **07:06** - Tuesday morning, I again closely followed the Supreme Court decisions, but it ended at 7:13 with only three decisions released. I was surprised since the 27th was the last day on the calendar, but they later added the 29th. It seems like they're just going to keep releasing 3-4 decisions a day until they're done, adding days to the calendar as necessary, and it is impossible to know when the last day will be.


## Affirmative action

On the 29th, I successfully managed to be the first to bet on the Supreme Court's affirmative action decision. However, for some bizarre reason, everyone bet *against* me, leading to an extremely terrifying two hours while I wondered whether I would finally be knocked out of the contest on a dumb technicality after having come so far against such long odds.

In fact, the experience was so terrifying that I resolved to never bet my entire balance again in order to avoid that fear. I decided to only bet part of my money in the future, so that even if I lost, I'd still be guaranteed third place. (Of course, this was largely only possible because the AA win also gave me a much larger margin for error ahead of fourth place.) I did fudge that limit somewhat (putting 5.1k into the other Supreme Court market the next day, and a bit more during the GDP fight in late July, but I didn't invest *most* of my money again until minutes before the end of the contest.


> **29.06.23**

> **07:13** - Well the die is cast. Either I'm completely dead on Salem, or I'll have marginally closed the gap towards second place. The Supreme Court decisions came out faster than normal this morning, and I put all my money down on YES for "Supreme Court Ban Race in College Admissions?". I was pretty nervous, since there's always the risk of some gotcha like with the debt ceiling debacle, but based on the resolution criteria, I think it will probably resolve YES. However, I'm especially nervous because Johnny, Malte, and Mark are all betting NO on the market even after the decision was released. I guess either way I'll find out soon. It's pretty hard to concentrate on anything right now though and my heart is pounding.

> Update: zubby just put in $350 on YES (72->76%), so I guess that's a positive sign. Of course I feel like a chump for buying it up to 95% on the assumption that I was racing everyone else for YES votes.

> ... and now it's down to 60%. It will be pretty frustrating if this is what knocks me out of Salem after so many months and several turns of extreme luck.

> **30.06.23**

> **06:40** - Salem update time. Yesterday morning before 7, I once again opened up my Python script and ran the numbers to determine the optimal bet allocation for all four possible combinations of market outcomes. However, it occurred to me that it was pointless because I wouldn't actually know both market outcomes at once as the opinions are announced one by one. I decided to use the larger number (i.e. as if the other market resolved NO) to be conservative.

> Thus at 7:04, I put in 4715 (68->89%). I was a bit worried about whether the outcome would actually resolve YES, but I thought it probably would and that I was racing Johnny and zubby to bet. At 7:06, 50P put in $100, and then at 7:09, when it was clear that there were no more opinions that day, I put in the rest of my money, 4354 (90->95%). Unfortunately, then everyone started betting NO for some reason.

> Johnny only put in 170. Malte put in a lot more, but sold part of his stake for a profit later. The big loser was Mark, who kept betting NO the entire time. Interestingly, David Hasset later showed up and bet YES with his free money, which was surprising since he'd barely done anything since getting hammered over the Chicago Mayor election nearly three months ago.

> As mentioned, my heart was pounding, and I couldn't concentrate on anything, so I spent the rest of the morning reading some blog posts while watching the flurry of comments come in, with people arguing about whether the market should resolve YES or NO.

> At breakfast, I started thinking of custom card designs and quickly posted one after getting to the office, and thus discovered that it had resolved YES, which was a huge relief. (My custom card didn't get any comments at all, but that's a minor disappointment compared to the crushing loss that getting kicked out of Salem would have been.)

> At around 9pm yesterday, I checked the standings with my Python script again. The relevant changes since that morning were:

> Me: 12089 -> 13448

> Johnny: 16919 -> 15962

> Malte: 8048 -> 7866

> Mark: 9123 -> 6739

> % behind Johnny: 40.0% -> 18.7%

> Johnny only actually lost around 400 in the market (170 that morning and 227 already on NO) but there were other market movements yesterday, notably the World GDP jumping up to 85%. Likewise, I'd only actually made 1280 in the affirmative action market but also got a minor boost from my remaining shares in World GDP.

> It was amazingly good news, since Johnny was now realistically in reach if I just got lucky one or two more times. And even better, Mark took a massive hit and dropped out of contention, and Malte went down a bit too. With the competition farther behind me, it means I can afford to be more aggressive with my betting and still be in 3rd place if I lose.

## My GDP blunder

> Sadly, it's not all good as I made a stupid mistake then. This morning, I got up to emails saying that the World GDP and China GDP markets had resolved (YES and NO respectively). In all the excitement over the Supreme Court rulings, I'd completely forgotten that the China GDP market was supposed to resolve around now, and should have put my money in for a bit of extra return.

> As of this morning, the standings are now

> Me: 13448 -> 13544

> Johnny: 15962 -> 16114

> Malte: 7866 -> 7998

> % behind Johnny: 18.7% -> 19.0%

> I got a minor boost from my remaining World GDP shares resolving, but Johnny got a bigger boost from his China GDP shares. I definitely missed out there. Of course, in retrospect I also regret selling half my World GDP shares at 67%. And of course I really missed out yesterday morning too, because if I had waited a bit before betting, I could have made massively more money after Malte and Mark jumped in. But there was no way to know that would happen. Oh well.

> Anyway, that was a bit disappointing, but I'm still far closer to reaching Johnny than ever before. And it's now 6:56, so the Supreme Court decisions will be starting in a few minutes again, my best shot at closing the gap. Hopefully the debt forgiveness decision is less ambiguous. I'm also conflicted about whether to go all in or just bet 4000 to be safe (which would keep me in 3rd if I lost), since confronting the possibility of being out of Salem entirely yesterday was really scary. I'll probably still go all in though.

## Student debt relief

> **07:41** - Well that was interesting, over half an hour of extreme boredom followed by an incredibly wild minute. While the opinions were released faster than usual yesterday, the opposite happened today, with them taking forever to read the 303 opinions, and I so I sat there for over half an hour checking the livestream and getting increasingly bored (I started checking Reddit, etc. in between, but there wasn't much to read there.)

> Around 7:34, they finally got to the student loan cases, and the liveblog announced that the first case was unanimously ruled "no standing". I decided not to bet, since there were two student debt cases outstanding, but others were not so cautious, and I worried that I'd missed my opportunity.

Note: I only knew there were two cases outstanding thanks to the liveblog. It was a really good source.

> At 7:33, Malte bought NO 72->67%, then zubby dumped in $1000 (67->39%) and PPPP sold 39->19% (there were also some trivial bets from 50P mixed in). Then immediately afterward (7:35 by now), zubby sold 20->31% and Malte bought 31->38%. I put in $100 on YES (38->41%) because the liveblog had just announced a 6-3 decision in the second case (but not the outcome), but it was probably a repeal given the votes.

> Malte bought 41->43%, and then I dumped in 3000 (43->85%), having now had a chance to glance at the decision and confirm. A couple minutes later, I decided to put in another 2k (93->95%), 50P and zubby having brought it back up to 93%. It's now at 97%.

> Edit: Just as I was writing this, the market resolved YES. So that's a relief. It looks like I made a total profit of 1582. But more importantly, this seems like the best possible outcome, better than I could have even imagined. The dip down allowed me to make a much larger profit than expected while still betting on YES and only putting in the money I could afford to lose. And since it resolved YES, Johnny lost the $640 he put down on NO this morning before the decisions were released, while still granting me a much larger profit than would have normally been expected had it resolved YES normally. Time to check the standings again.

> I'm now only 3.67% behind Johnny! Callooh callay, o frabjous day! I'm now within the margin that I could plausibly make up with smart trading over the next month. With only 17 markets and a month left in the contest, I was worried that I would end up, say, 15% behind Johnny and it would be a tall order to make that up (especially since Johnny will be gaining over time as well). But 3.67% certainly seems doable. I'm sure I'd already be ahead if it weren't for the debt ceiling debacle, but it's not healthy to think about things like that, and I've been enormously lucky three times over in the last couple weeks, first with the ceasefire bump and then the two SC decisions, so it's not sensible to curse the few dark spots of my luck, as crushing as it seemed at the time.

> **17:13** - While it is at least possible for me to overtake Johnny now, it will still be an uphill battle. As of 5pm this afternoon, he is back up to 5.12% ahead of me. Part of that is due to Third Trump Indictment (which I bet NO on and Johnny YES) spiking up to 59% and part of it is that Johnny has a large fraction of his portfolio invested and most of the markets moved closer to 0/100 today as people reinvested their winnings from all the markets that resolved recently.

> I simulated what would happen if every market <15% immediately went to 0 (and vice versa over 85), and in that case, Johnny would be 9.79% ahead of me, so that's a better picture of what I have to beat. I still need some unexpected event to go in my favor, and there are very few opportunities left for that to happen.

> **21:01** - I went to bed at 11:23 Wednesday night. I set an alarm for 6:10 to make sure I'd have enough time to go through Wanikani and then check the Salem script and calculate the optimal bet allocations before the SC opinions started at 7am, but I ended up not needing it, as I woke up at 6:01/6:08.

(And of course the Python script thing ended up being completely pointless anyway, as I only realized that morning and explained above.)


# July 1-19
![Score graph](/img/salem2/july1.png)

For one heady moment the morning of June 30th, it seemed like I was about to overtake Johnny and snag second place against the odds, but reality soon set in. I was close after the Supreme Court wins, but still too far to easily pass him, and would require a lot more things to go my way in order to close the gap. It didn't help that immediately afterwards, I lost money in the Trump Indictment market, widening Johnny's lead. In fact, I somehow managed to buy NO low and then sell at the peak *twice in a row*.

I noticed that Johnny had large contrarian NO bets on several markets and concluded that my best hope of catching up to him would be if they all went against him. In particular, I would need Trump to stay off Twitter, and then either ATACMS or Ukraine To Take Major City to resolve YES. Unfortunately, Johnny sold his YES bet on Twitter early, limiting his losses there, and the latter two never happened.

> **04.07.23**

> **07:07** - I went to bed at 11:29 Sunday, but soon woke up again and couldn't sleep... I finally went to bed again at 1:34 and got up at 5:36. I checked Salem Plus as usual and discovered market movements the previous day that should have triggered my bot. It turns out my bot froze all the way back on Friday night, so I had to restart it.

> **08:26** - I haven't mentioned how Salem has been going. In short, not well. Saturday afternoon, I again asked Salem for clarification about whether a superseding indictment would count for the "Third Trump Indictment" market, and this time they responded, saying it would count, so I immediately sold my stake (59->64%). It was pretty painful to take a big loss like that, but I worried that after the Salem Center's comment, everyone would be rushing to push it up. Instead, it has been mostly bouncing around the 55->60% range for the last couple days.

> As of this morning, Johnny's lead is now up to 5.69% and if <15% markets are counted as 0, he would be 10.24% ahead. And even that understates the real magnitude, because I'd have to make up the difference using funds that aren't already invested, so the denominator should be my uninvested money, not the entire portfolio value.

> For a brief moment Friday morning, it looked like I might overtake him just through normal trading, but of course that was an illusion and things rapidly slipped out of my grasp again. I'm back to the point where I need to get lucky several times to actually beat him. Fortunately, I am in range where a couple of lucky breaks could still turn things around, but I do have to get lucky.

> First off, I need Trump to stay off Twitter. Since I have a large NO bet and Johnny a large YES bet, I have no hope of winning if it resolves YES (unless I somehow manage to get in first when it happens, which is very unlikely without the ability to write a bot, and even if I did, that would barely outweigh Johnny's profit.). Then I need one of the markets where Johnny has a large NO bet to resolve YES, such as "Ukraine to take Major City" or "Send ATACMS to Ukraine". ("Third Trump Indictment" resolving NO might work as well - I sold my stake but Johnny still has a sizable YES stake).

> But most likely, I'll just end up in third place. It's frustrating to be so close and yet not make it, but there are far worse fates. I did get pretty lucky on the Supreme Court markets, even if I've been continuously cursing myself for not going all in on the debt relief one, as the extra profit would be critical to closing the gap with Johnny (same with the China GDP market).

> **05.07.23**

> **22:33** - On the Salem front, Johnny sold part of his Twitter YES stake this morning (19.5->16.8%), which presumably improves my relative standing on paper a bit, although it decreases the eventual gain, if as seems likely, it ultimately resolves NO. Also, 50P massively bought up ATACMS today (29.3->37.5%) today, which should give me a nice relative boost on paper as well. On the other hand, some other markets moved downwards a bit, increasing Johnny's paper standings. Overall, things have continued to be really quiet. Which is unfortunate when I need a (lucky) upset to take the lead and there is increasingly little time left in the contest.

> **07.07.23**

> **08:08** - Afterward, I got on the desktop in order to check the Salem bot script and restart it, as I assumed the morning's internet outage would have killed it. I discovered that it had actually died all the way back on July 4th at 1:01pm due to some sort of https error.

> Meanwhile, still not much on the Salem front. Johnny put 250 more on NO for "Ukraine to Take Major City" on the 5th (32.3->28.1%) and it has continued to drop (now 24.87%), so that's bad news. Things have mostly been quiet, but of course no news is also bad news in my position. I just have to pray for a lucky upset on ATACMS, Third Trump Indictment, etc.

## Chromebooks and COVID

On July 8th, two non-Salem events in my life that would play a role in the remainder of the contest coincidentally happened on the same day.

The first is that I caught COVID for the first time and had a high fever for three days, and more importantly, had a persistent cough and thus worked from home for the remainder of the contest in order to avoid spreading it to coworkers at the office. (I'd previously been going into the office two or three days a week.)

The second is that I returned my Chromebook. As previously mentioned, I'd been using my Chromebook as my main computer, but all my Salem stuff was on my Linux desktop. However, when I worked from home, I used the same desk, monitor, keyboard, mouse, etc. with my work macbook, and it was a hassle to have to switch between the two. When I set up the bot, I started leaving my desktop *on* 24/7, but only plugged in the mouse, keyboard, etc. on the weekends.

However, my new Chromebook had a rapidly dwindling battery life, and in late June, I finally got fed up enough with it to research it online and realized that I just got unlucky with a defective battery and began the return process. Fortunately, it was just under a year since I'd bought it, so I was still able to return it. After a week or two of back and forth with customer service, I put the defective chromebook in the mail on July 8th, and coincidentally first had symptoms of COVID on the way back.

Thus, I was forced to switch to using my Linux desktop for everything. I would unplug it and plug in the macbook every morning before work, and do the reverse every evening after work. Even after the replacement Chromebook came in, I was no longer in the habit of using it, and only used it on the rare occasions when I needed to make a bet on Salem during the workday. I did check my custom Salem Plus website on the macbook frequently, but never bothered to log in to the actual Salem website, which in retrospect would have been simpler than having to get out the Chromebook to make my bets. But that only happened once or twice anyway.

## Iran nuclear deal

> **10.07.23**

> **14:50** - Also, there was some excitement on Salem yesterday, very slightly in my favor.

> First off, Noah Lafountain spiked ATACMS from 26->38% Sunday 15:52. I saw the bot email and bought it down to 34% at 16:15, figuring I could flip NO shares for a quick profit. At first it seemed to fail as Spencer bumped it back up to 37%, but then David bought it down to 30%.

> Also Sunday evening, Spencer spiked "Trump back on Twitter" from 16.6% up to 20.6%. A noname got in first, but I bought another $100 NO at 19.35->18.7%. (It's now at 15.78%)

> This morning (7:40am), PPPP bought $1004 YES on "US GDP Growth 1% or More in 2023 Q2", spiking it from 72.8->80.5%. At 10:20am, after seeing that GDPNow's latest forecast is up from 2.1% to 2.3%, I later put in $100 of YES myself (up to 81.2%).

> The most extreme movement came in the "New Iran Nuclear Deal" market though. Sunday at 15:52, Noah Lafountain dumped it from 17.6%->7.05%. I nervously put $20 down on YES at 16:17, since while it is a longshot, it doesn't seem that unlikely. I soon regretted my caution, as Johnny sold a large part of his stake, driving it up to 9.1%. This morning, David and some no names also sold out, leaving it at 13.85% currently, so I have made a small profit on-paper.

> Lastly, there were a few other minor market movements, some in Johnny's favor, some against him. For example, "Third Trump Indictment" is now back down to 48.1%. I really regret selling out at 64% now, but hindsight is 20/20.

> The end result is that I'm slightly closer to Johnny again now, though not enough to be game changing. At current market values, I'm 4.46% behind, while I'm 9.48% behind with <15% markets zeroed out. A lot hinges on the outcome of a few markets, such as Trump Twitter, ATACMS, Q2 GDP, and Third Trump Indictment. If I can get most of the major uncertain markets where we have opposite bets (or even the same bet but different amounts in the case of ATACMS now) to break my way, I have a decent chance of surpassing Johnny. But a lot could go wrong still as well.

> **15:27** - Out of curiosity, I wrote some code to see what would happen if all bets were frozen and each remaining market randomly resolved either yes or no according to its current probability. Under those circumstances, I have a 32.2% chance of coming out ahead of Johnny. However, a lot of that is near-certain markets that don't actually have any chance of failing. If I forcibly set a few already certain markets (Debt Ceiling, Nuclear Attack, Taiwan, Russia Takes Donbas, and Ukraine Ceasefire) to 0, my winning probability is only 30.0%. Still, there's at least a chance I'll get lucky.

> Also, David just bought NO on ATACMS again at 15:13, bringing it down to 28.0%. This means that I'm now behind Johnny by 4.57% at market rates.

> **12.07.23**

> **21:36** - After all that was done, I checked Salem Plus as usual and saw that Noah had spiked ATACMS (24.7->30.7%) at 8:22pm. I did a quick search and found a news article from almost exactly that time, suggesting that it was still under consideration. For a while, I was hoping for ATACMS to be the thing that let me triumph over Johnny, but recently, I've become increasingly pessimistic about it. I've still been irrationally reluctant to actually bet on the NO side though.

> Anyway, I would have normally jumped on a spike like that, but the article gave me enough uncertainty that I decided to continue staying out of it. Which is a shame as it is now down to 22.8%. Oh well.

> Also noteworthy is that Johnny sold part of his Trump Twitter stake yesterday (16.4->14.3%, it is now at 11.6%). If I were uncertain about the market, I'd be happy that he crystallized his losses, but as it is, it is bad news since I already thought it was almost sure to be NO and even if it wasn't, I have no chance if it does resolve YES so I have to act under the assumption that it is NO, and this means that Johnny basically just gained the money he got from selling for free compared to the alternative.

> I've made a sprinkling of minor bets recently, but I doubt it will matter. My main hope now is the GDP market, since while I haven't checked the numbers, I put 200 on YES (including the previous bet) and Johnny has been betting NO on it a lot.

> Also when I checked Salem Plus last night, I also noticed that Noah had sold a bunch of shares in Trump Indictment right before he got ATACMS, bumping it from 45.5 to 51.8 (I threw 100 on NO). One unanticipated benefit of Salem Plus is that it makes it easy to see where people sold shares in order to buy shares in a different market, assuming it happened recently, since those will be the top two markets on the page. For a long time, I could guess that people were selling shares in one market to buy another, but the only way I could actually tell is if I happened to notice the price change manually and manually investigate the transaction history of each website on the incredibly slow and battery hungry official Salem website.

> **14.07.23**

> **19:03** - ...I got back at 5:30, quickly hooked up the desktop to sell my Iran Nuclear Agreement shares on Salem ($30.55), as I had convinced myself to sell ASAP on the way home.

> **18.07.23**

> **06:55** - Well crap. The funny thing is that I'd been planning to check in on the current Salem standings last night, but was too lazy to do so. I think it would have been about the same as it has been for the last week though. I checked Salem Plus again when I woke up several times during the night, but there was relatively little action.

> And then when I checked after waking up this morning, Trump Indictment was up to 70%! (The spike began at 6:26, not long before I got up.) Even worse, it went up to 79% and Johnny sold all his YES shares, meaning he has now locked in his profit, and even if it ultimately resolves NO, it will barely help me.

> I'm now down to 8.3% behind Johnny at market prices, and with a 20% odds of victory according to the "resolve markets randomly based on current market probability" metric, which is probably really overstating things. Even assuming Trump Twitter resolves NO and Q2 GDP resolves YES, I'll still be 2.5% behind Johnny. For the last couple weeks, I was just one lucky break away from overtaking him, but now I need multiple miracles to occur again, which is not a good position to be in with only a couple weeks left in the contest.

> **07:05** - I went ahead and sold my shares (72->74%), getting just $47 for my original $100. I feel like at this point, I should stop even trying and worrying about Johnny and just accept my likely third place victory, but hope springs eternal. I suppose I can be glad I at least didn't put any additional money in on NO while it was hovering at 40% for the last week.

> **07:45** - There was more excitement on Salem from around 7:28-7:31, while I was doing Wanikani, as the Trump Indictment market swung all the way down to 60.8% and back up. It looks like Johnny bet on NO, while 50P and Zubby are still betting YES. Hopefully it resolves YES then, though that would still only put a tiny dent in Johnny's lead.

> **19.07.23**

> **20:12** - ...As for the **Salem** side, I had some minor wins yesterday, but also some bad news today. I continued checking Salem Plus periodically throughout the day, including on my work macbook.

> At 1:53pm yesterday, Johnny bought $50 more NO on Q2 GDP (80.3->78.9), so I decided to put in $100 on YES (->79.7%) when I saw it at 2:03. Yesterday's GDPNow forecast was up from 2.3% to 2.4%, but I keep worrying that Johnny knows something I don't. I know in the past, the GDPNow forecasts have often overshot, but not by that much. Still, it's convenient that he's betting against it, since him making bets I disagree with like that is the only hope I have of narrowing his lead (assuming I actually win them and he doesn't sell first).

> The big win (relatively speaking) came in the evening, as a no-name bought 200 NO for "Trump the Favorite in Summer 2023" (89.6->84.5) at 4:45pm. I happened to check at 4:55, again coincidentally ten minutes later, and put down $250 on YES.

> The same person also bought $200 YES on "Republicans Favored by Summer 2023" at 4:45, shooting it from 16.07% up to 23.73%. I quickly put down $500 NO, bringing it back down to 18.48%. I was nervous about it though, and quickly regretted my decision, castigating myself for going too deep and not buying 300 or 400 instead. However, it ended up working out for me, as I put down a 15% YES limit, which zubby cashed out for me this afternoon.

> Of course, that's only a tiny profit, but every little bit helps. The problem is that today brought some bad news, as Johnny sold his small stakes in Trump Twitter and Trump Favorite, meaning that's a bit less money that he won't be losing now if those markets resolve as I've been assuming. Oh well.

> Also notable is that zubby has been buying a lot of high probability markets over the last week or so, in order to try to invest his stash with a bit of return at the end, pushing many of the markets closer towards 0 in the process. The last bet was $500 NO on "Russia-Ukraine Ceasefire" this afternoon, bringing it down to 13.4%. I think those bets are at the end though, as he now has only $500 in cash, presumably as much as he wants to keep on hand. It doesn't really matter much, but it's good to know, since zubby already being fully invested decreases the rate that the markets are likely to decay further in the coming weeks.

> But overall, not much has changed. Overtaking Johnny will be a long shot and will rely on me getting lucky on the Trump Indictment and Q2 GDP markets (and taking the right gambles on those, and not losing any of the near-certain markets, etc.)


# July 20-26 (The final week)
![Score graph](/img/salem2/july2.png)

Obviously, July 20-26 wasn't *actually* the final week of the competition (it ended at midnight on July 31st), but it turned out to de-facto be the final week, as the only two remaining markets with any doubt towards their outcomes both happened to resolve on July 27th.

By late July, I realized that ATACMS wasn't going to save me. Fortunately, Johnny had started betting NO on GDP for some reason, and that alone was enough to account for a large part of the gap between us. If GDP went YES *and* I somehow managed to win on Trump Indictment, I'd probably pull ahead, but that is of course easier said than done.

I couldn't do much on the indictment side, other than check Twitter and hope for the best, but I did have a strategy for GDP. I was really worried about Johnny selling his NO stake early, and so I continually bought more YES shares in order to push up the price, in the hopes of persuading Johnny to buy more NO shares, or at least not sell the ones he already had. And of course, buying more YES shares would marginally increase the winnings on my own account as well. Fortunately, this part worked like a charm.

Additionally in late July, I started checking Salem (via Salem Plus) increasingly frequently, in the hopes of getting lucky and randomly happening to be the first person to see a good deal. By the end, I was checking it every 15-40 minutes throughout the day, depending on how bored/busy I was, and I took advantage of my tendency to wake up frequently during the night by *also* getting up during the night to quickly check Salem Plus, just in case.


> **20.07.23**

> **07:54** - There have been no bets at all on Salem since 5:01pm yesterday, so the standings are the same as before, but I might as well mention them now. I'm currently 7.32% behind Johnny at market prices, although that of course understates his true lead.

> On the bright side, I discovered that his NO bet on GDP is much larger than I had thought, currently worth $709 compared to a total gap of around 1126 between us. This means that if it were to immediately resolve YES, I'd only be 2.2% behind him. Of course, history shows that he'd probably sell his stake long before that and take only a minor loss, and that's assuming it even resolves YES in the first place.

> On the other hand, his NO stake on Third Trump Indictment is relatively small, so I won't gain much from that unless I actively bet on it myself (and manage to get it right *and* somehow get in earlier on the news than Johnny himself, a triply tall order.) But for now, it seems like all I can do is continue sitting and praying for a miracle.

> My "winning probability" assuming markets resolve at random according to the current probabilities is just under 20%. However, that is presumably almost all based on longshots that won't actually happen. The market probabilities are structurally biased away from 0/100 thanks to limited capital.

> If I add/subtract 2% from every market probability to make up for that, my "chance of winning" goes to 18%, failing almost exactly 2%, so it really is a made up number. The problem is that right now, there is no longer any combination markets that are actually plausibly in doubt that would net me the victory. Of course things could still change, but it means that I have to get a lucky break somehow or other, probably multiple lucky breaks.

> **21.07.23**

> **07:27** - Salem-wise, I put down $100 on Q2 GDP Thursday morning. I wouldn't have normally invested at this time, but I was hoping to goad Johnny into betting more on the NO side (in addition to slightly raising my own winnings in the event of YES). Unfortunately, that was a failure, and it ended up being one step forward, two steps back. At 3:35pm, Malte Schrodl put down $50 on NO, and I immediately put $100 more in when I saw it (4:04pm). I figured it was important to keep the price up to reduce the temptation for Johnny to sell his shares.

> ...One thing I forgot to mention is that on Tuesday when I made a couple Salem bets during the day, I used my Chromebook. Prior to getting the replacement Chromebook, I would have had to quickly unplug my Macbook and plug in my personal desktop (and then the reverse), which is a huge pain. I've only used my Chromebook for a few minor things like that so far though. It's hard to get back into the old routine once it is disrupted and I'm used to using the desktop.

> ...Also, around 7:50 while I was working on this journal, I checked Salem Plus once just for the heck of it, and discovered that at 7:30, Malte had dumped Trump Indictment (68.4->66.4%). That market had been edging down slowly in recent days due to repeated tiny sales from 50P. Ironically, 50P saw the dip first and bought $10 YES at 7:34.

> Anyway, I'd been thinking about buying some YES and that dip seemed like a big enough push to justify it, so I put down $25 on YES myself. Especially with the GDP market setback, I've been thinking that the only way I can win is if GDP goes YES and I somehow massively profit off Trump Indictment as well.

> Signs still point to an indictment coming soon, but there's also little time left, making it risky. I'd planned to wait until I found positive news of an indictment to pile in on YES, but of course the problem with that is that Johnny is way better at following the news and will almost certainly beat me.

> Speaking of which, I checked the Kalshi GDP market last night and the forecast went from 1.5% to 1.7% over the last couple days (between Johnny's last buy and his sale at near identical price last night) which might explain why he's dumping it now, even though the Salem market price barely moved. The >0.9% market on Kalshi is now at 87%, for whatever that's worth. It made me think I'll have to push up the Salem price even more to stop Johnny from selling further, but I plan to wait a bit more for that, and my firepower is limited. I can't just risk all my money, because then I'd stand the risk of not even being third place anymore.

> **08:17** - As far as Salem goes, I am now down to 6.76% behind Johnny at market prices, although the apparent improvement is just an illusion, since it is presumably a consequence of Johnny selling a bunch of GDP shares and bumping up the prices which both improves my standings at current market prices *and* worsens my *actual* position assuming the market resolves YES. The also meaningless "win probability" is up from 18% to 20.9%.

> Meanwhile, if GDP resolves YES, I'll now still be 2.71% behind (and that's despite investing $200 more into it myself). If Trump Indictment also resolves YES, I'd still be 1.58% behind under the current circumstances. Of course, as usual things can always change, with people making various bets at any time. The problem is that the most likely change (Johnny selling more of his shares) is really bad for me, but there's always the slight chance that I manage to profit handsomely off indictment or some no-namer YOLO-bets and I manage to profit off that.

> But in the meantime, there's basically nothing I can do other than continuing to periodically check Salem Plus and hope I get really lucky and see an actionable bet.

> **20:42** - On the Salem front, as usual there were a bunch of minor transactions that ultimately meant nothing, and some more bad news at the end. First off, I put down $100 more on GDP (82.8->83.4%) at 10:54am in an attempt to further discourage Johnny from selling.

> I also continued checking Salem Plus frequently throughout the day. It was mostly 50P up to his usual tricks, but zubby also surprisingly stepped in. For some reason, 50P tends to buy small amounts of shares and then sell part of them back soon afterwards. The repeated small sales are presumably due to using the "buy 10 shares button" as they previously explained, but that doesn't explain at all why they keep seemingly overshooting their intended buy and selling back part of it soon afterwards.

> In any case, the first major jump was 50P buying ATACMS up to 17.3% around 12:22. I considered buying some, but decided the jump wasn't big enough to justify the effort and risk. Just minutes later, 50P sold back part of their shares.

> Then, at 1:17, zubby jumped in with $100 YES and 50P sold some then immediately bought more, spiking it up to a high of 22.1% at 2:07, although they'd already sold back down to 20.1% by the time I happened to check Salem Plus. I considered buying in again, but zubby's involvement made me nervous, and I thought there was a risk it would actually resolve YES.

> Later this evening, 50P and zubby sold it back, and it now down to 16.6% again. Zubby also dumped Trump Twitter from 11.1% to 7.9% this evening.

> The other main action was in Third Trump Indictment. As mentioned, this morning I saw it go down and bought $25 YES. This evening, 50P sold it some more, down to 65.0% and I hesitantly bought $15 more YES. I got back from the ice cream trip to discover that zubby had dumped it all the way to 48.56%.

> That is major bad news, since it means that not only has the market value of my shares declined, but there's a high chance that Johnny will sell his NO shares and lock in a large profit. I'm also worried that the market will resolve NO now, since my only path to victory relies on it resolving YES next week. And as usual, my decision to panic sell when it originally spiked last week is looking dumber and dumber by the day. I don't know how I managed to get caught out multiple times in the *same market* panic selling at a big loss, but it's going to make it very hard for me to overtake Johnny.

> Oh well, I guess I just have to keep trying and hope for the best. For what it's worth, I'm currently 7.0% behind at market value, 3.0% with GDP=YES and 1.14% if Trump also gets indicted. But the latter is now looking dubious, and in any case, there's a big risk of Johnny making additional trades. I really wish I knew what zubby was thinking as well.

> **23.07.23**

> **10:24** - Friday night, I went to bed at 11:41. I slept comparatively well, only waking up briefly around 4:37, IIRC. I checked Salem Plus, but fortunately no rude surprises from Johnny this time, just Malte Schrodl dumping Trump Indictment at 4:21am (down to 45.8%)

> I woke up at 6:22/6:27 Saturday morning. Saturday morning, Malte did a bunch more transactions, pushing "near certain" markets a bit further towards 0. Nothing important, although it is a little disappointing, since my path to victory was relying on being able to invest my money in near certain markets to make up the last percent or two once victories on GDP and Trump Indictment got me back within striking distance and the more people who buy into them first, the lower the margins remaining will be. Still, it barely matters compared to the major upsets of previous days, and Salem has been very quiet since then.

> ...I didn't make it to bed until 11:52 Saturday night, and unfortunately had considerable trouble sleeping. ...I also vaguely remember waking up other times, including around 4:30ish, which seems to have become an almost nightly ritual for me lately. This time however, I didn't even bother getting out of bed and checking Salem Plus most of the times I woke up, which is just as well, since there were literally no transactions overnight this time.

> As far as Salem goes, I put another $100 down on GDP last night (84.0->84.5%) to further slightly increase my potential winnings and discourage Johnny from selling. Kalshi is still at 87%. I was really worried Johnny would sell on the Trump Indictment market, but he hasn't done anything yet. Of course, I'm also worried that the market will end up NO. In order to win, I need everything to go right for me.

> This morning, there was brief excitement when a no-name bought up Trump Indictment (46.5->56.6) at 6:27, followed by zubby buying it back down to 50.0 at 7:04. But other than that, the markets have been very quiet the last couple days, and the few transactions that did occur were just stuff like 50P buying and selling tiny bets.

> Oh, I guess there's one other thing worth noting. Friday evening, zubby suddenly dumped Trump Twitter from 11.07% down to 7.92%. I put in a YES limit at 7%, hoping to free up capital, since the other markets were still in the 12-15% range, but so far no such luck (it's currently 7.71%).

> **24.07.23**

> **07:35** - I went to bed at 11:35, and again had trouble sleeping... I do remember waking up around 4:11 and checking Salem Plus. Nothing of note had happened, just some minor purchases in several markets by 50P at 3:40am, but I had trouble sleeping again anyway somehow, constantly waking up from bizarre dreams about Salem. I think I eventually got up once or twice more to check Salem Plus, but nothing further happened.

> Anyway, I woke up at 6:16/6:25 this morning.

> As for Salem, it has been frustratingly quiet. Last night I checked Kalshi again and saw that >0.9% was now up to 91%, so I put 200 more on YES (84.5->85.6%). So far, there's fortunately been no sign of activity from Johnny. I'm more surprised that he hasn't sold his shares in Trump Indictment or "Republicans Favored by Summer 2023?", but I'll take what little good news I can get. (Hopefully I didn't just jinx it).

> Also, one of 50P's 3:40am purchases bumped Trump Twitter back up to 8.086%, meaning I can now place limits at 8%, so I replaced my $64 7% YES limit with a $73 limit at 8%.

> The real problem though is that everything hinges on Trump Indictment. It's at 49.2% right now, almost a coin flip. If I knew how it would resolve in the end, I could make a killing either way. I haven't actually checked the numbers, but I'm guessing that if I magically knew the outcome and beat heavily on it, that alone would be enough to overtake Johnny (assuming the other markets go my way of course). Meanwhile, if I don't get it right, I'll have no chance of winning, no matter what else happens (barring some extreme lucky break). It's a bit frustrating, since I have the possibility of winning still, but there's nothing I can actually do. Well other than keep checking the markets for the increasingly slim chance of a YOLO whale that I can profit off of.

> **08:06** - I did some calculations, projecting my cash balance assuming that GDP resolves YES, and comparing it to the difference in scores between Johnny and I assuming all other markets resolve as expected. Because after all, being 3% behind is useless in a vacuum, since Johnny has a lot invested in markets that will continue to tick up, and I have to make up that gap using only my uninvested funds (including winnings from GDP).

> If Trump Indictment goes YES (and nothing else changes), the difference would be 14.47% of my uninvested cash, which would be impossible to make up since the remaining markets are mostly in the 10-12% range and will continue to go down over time. If Trump Indictment goes NO, the difference would be 19.55%, which is extra impossible.

> So not only do I have to get really lucky on the coin flip (in addition to winning GDP, etc.), but I have to somehow call it in advance and make a large profit on it to even have a hope of catching up. (Well, there's always the longshot possibility of ATACMS going YES, but I don't think that's going to happen now and I certainly can't count on it.)

> Anyway, that's pretty disappointing to learn that my odds are far worse than the market value ratios had made it seem. Oh well.

> **08:19** - I just put $100 more down on GDP and "Republicans to be favorites in 2023", bringing the ratios down to 14.31%/19.44%. But of course that's just pointless fiddling around the edges that will be swamped by whatever happens in the Trump Indictment market or any adverse actions that occur, and there's barely any point in even bothering. (Note that the latter market was at 13.93%, so that was actually below par, especially after transaction fees, but I figured I should put a bit in anyway, because that's the best offer available right now (apart from GDP and Trump Indictment) and because Johnny has a few YES shares there and pushing down the price makes him less likely to sell.)

> **18:07** - Well I guess I finally got my wish for players to YOLO bet on Salem, just not in a way that I was able to actually profit off of. The day started fairly quiet, just with Jack jumping in at 11:21am to buy down some markets a bit, followed by Malte at 1:03.

> At 1:12 (well really a series of spam bets from 1:12-1:15), 50P bought Trump Indict up to 54.3%, $10 at a time like usual. I noticed this relatively quickly, but didn't have any firm opinions to merit trading against it, especially since I was still praying that the market would actually resolve YES. 50P then partially sold it back at 1:43 for some reason (53.1%), as 50P tends to do.

> The real action, however, happened at 2:19pm, when PPPP suddenly spiked it 53.1->63.8%. I hadn't been checking Salem Plus that often, perhaps every 15-40 minutes, depending on how bored I was at the time, but by pure coincidence, I happened to check at 2:20, and thus saw it right after it happened.

> I considered whether to buy NO on indictment, but decided to continue staying out of it. A minute later, I noticed that PPPP had sold $507 of GDP in order to fund their bet (as well as a bit of ATACMS and Trump Twitter, it looks like), so I quickly put down $500 YES on GDP, bringing it almost all the way back up to 86%.

> I was shocked when I refreshed Salem Plus immediately afterwards and discovered a betting frenzy in the indictment market. PPPP's bet there was at 14:19:15, and at 14:21:35, barely two minutes later, Johnny bought some NO in the market, followed by zubby at 14:21:35, and then Johnny again at 14:21:49.

> It was shocking on multiple levels. For one thing, Johnny hadn't done anything in days, and I'd been hoping that he was pretty much checked out at this point, so seeing him pounce on a bet in two minutes was dismaying. It was also dismaying because it meant that his bot is still active and he will easily sweep any profit opportunities that arise (assuming they trigger his bot). There was one that he missed last month, so I'd been hoping that his bot was no longer working or something, but no such luck. My theory is just that he had the threshold set high enough that the one last month didn't trigger it, but if so, that means it would require a very specific kind of profit opportunity for it to even be possible for me to snag the prize.

> And of course, it also shows that zubby was hot on his heels with his own bot. I'd only seen zubby act with such speed once before (not counting the pre-bot time he just got lucky), so I'd assumed that he'd given up on the bot or something. It's disheartening to see that they both still have bots and they're both way better and faster than my bot. Of course, I wouldn't have acted on this anyway. due to indecision over the fair value of the indictment market, but it's still a bad sign.

> For reference my own GDP bet was at 14:22:09, *after* their bets, though to be fair, it took me a minute to even notice that the GDP market was down. And that's despite me getting incredibly lucky on the timing and just happening to check Salem Plus at the right time.

> That wasn't all though. I checked Salem Plus again around 2:55 and discovered that I'd just missed another bout of excitement.

> At 14:53:06, a no-namer (DfromBham) yolo'd even more (973, compared to 547 from PPPP earlier) into indictment, spiking it from 54.3 to **70.9%**! And then just seconds later at 14:53:28, zubby bought it back down to 60.7% (followed by another buy from Johnny at 14:56:49, the slowpoke).

> I couldn't believe it. Zubby somehow managed to bet only 22 seconds after DfromBham. I wouldn't have been able to manage that even if I had happened to check Salem at the exact right time. Heck, even my *bot* only checks Salem every 15 seconds, and there's a delay of several seconds before the server returns updated data as well.

> I left a comment, and zubby replied "Just running a page monitor and was at my computer.", so I guess that explains that. Maybe I should consider modifying Salem Plus to autorefresh and then leaving it open onscreen somewhere all the time. Of course, that would probably cause it to drain battery rapidly, like the actual Salem website does, but that wouldn't be a problem if I only use it on my desktop and macbook. Of course, screen real estate would still be a big limitation, plus I'd have to actually implement that. And even then, it would probably take me more than 22 seconds just to get out my Chromebook and actually make the bet, let alone make the decision to do so.

> Lastly, DfromBham also sold some markets to fund their big bet, in particular selling 319 of GDP. I quickly put yet another 100 down on GDP, but that only brought it back up to 84.8%. I'm nervous to put in more though, because I'm down to only $9098 in uninvested cash. I was hoping to stay above 9026, because that's how much Connor has, and thus keeping more than that in cash would guarantee I stay above him no matter how perversely the markets resolve, and hence nearly guarantee me third place at worst. But I suppose there's not that much risk of market upsets, and I'll have to take more of a gamble if I want to overtake Johnny.

> Anyway, the silver lining of all this is that it meant Johnny put a lot more down on NO for Trump Indictment, which means that the outcomes are a lot more polarized. He'll make a killing if it resolves NO, and lose a lot if it resolves YES, and thus I have a decent chance of overtaking him if only that somehow happens.

> Using the same methodology as this morning's numbers, the afternoon's chaos resulted in the uninvested cash ratio to Johnny changing to 9.59% YES/22.84% NO (compared to 14.31/19.94 this morning).

> However, I realized there were two mistakes in the original calculation. First, I forgot to include the (negligible) winnings from indictment as investable cash in the YES scenario (dropping the ratio from 9.59 to 9.54%). More importantly, I forgot to subtract Johnny's adjustment.

> Ironically, Johnny was the one player whose adjustment I was unable to nail down exactly (it's either 847.7 or 852.8). To be conservative, I'm using the lower figure. This brought down the ratios to 1.951%/15.20%. So if the indictment somehow comes down in time, I'll be well within striking distance, while if it resolves NO, he'll be out of shot, but tantalizingly close. (The current best market price is 13.2% on Russia-Ukraine Ceasefire, but there are also transaction fees, and more importantly, the market prices go way down when you (or anyone else) buy them, so 15% is definitely still impossible, barring surprises.)

> Also, PPPP cashed out a bit of my Twitter shares at 8% while selling to fund their bet.

> Anyway, it's now 6:39, so I just spent a whole 32 minutes just talking about the afternoon's Salem excitement. At least the non-Salem news today should be shorter.

> **18:42** - P.S. zubby previously sold a bit of their indictment NO stash at 15:51 and at 16:18, and sold a bit more at 18:31, while I was writing this. (Market price now up to 61.4%). I guess it's good news, since it means that zubby thinks that Johnny is overconfident on the NO shares. Johnny never sold his even when it dipped below 50% and bought more NO shares as low as 58.2% this afternoon.

> **25.07.23**

> **07:30** - ...After Wanikani this morning (and brushing my teeth), I modified Salem Plus to update the data in the background every 15 seconds. I didn't program it to have any obtrusive indicators of new data though, so I'll still have to just happen to notice the changes while looking at it, but it's better than nothing. As far as Salem goes, I put 100 more into GDP last night, and there have been no other transactions at all since zubby's little sale at 6:30pm last night. Today's probably going to be a volatile day though, since either Trump gets indicted, or the chances go down significantly.

> ...Anyway, it's now 7:58, so all that ranting took almost half an hour. In the past, I would have tabbed over to Salem Plus and refreshed it, but now I can just glance over and see it hasn't changed at all, so that's nice.

> **22:18** - The new Salem Plus worked reasonably well, though it still has some minor issues. However, today turned out to be pretty quiet anyway, especially compared to yesterday.

> The biggest action was early in the morning, when Spencer Henderson bought $214 NO on GDP, pushing it down to 79.8%, despite my limit. I quickly bought 200 more YES, bumping it back up to 81.3%. That's still much lower than it'd been before, but fortunately, Johnny doesn't seem particularly interested in selling (knock on wood). Also, I had previously set a 100 YES limit at 82% back when I first started manipulating it upwards, which Spencer blew through this morning, so I effectively bought $300 YES this morning.

> Other than that, there were a few minor buys, pushing near-certain markets further down (or occasionally up slightly, when people sold one to buy another). At 2:01, 50P sold a tiny bit of Trump Indictment. The only other big action was at 7:54pm when Stevie Miller bought 50 NO on Indictment, pushing it down to 59.8%.

> Overall today, I had some minor good news on the GDP front, in the sense that I was able to buy shares at a slightly higher margin and Johnny still hasn't sold any, but bad news on the indictment front. It really seemed like they were going to indict today, but instead the grand jury didn't even meet today. There's still a good chance they do it on Thursday, but it's less certain than it seemed yesterday, when I'd really gotten my hopes up.

> Anyway, this evening, I did some calculations to try to figure out what would happen if I split the difference between the YES and NO scenarios on indictment by buying a bunch of NO shares myself, so I'd have the same relative position either way. It was hard to calculate exactly, particularly because it turns out that Johnny has a YES limit at 50%, and thus buying NO shares at the margin would also result in him selling some, magnifying the effect. Also, Stevie tanked the market while I was working on this, annoyingly forcing me to redo the calculations.

> In any case, I estimated it would take a buy of $600-700 NO, and I'd have a margin of 7% to make it up either way. 7% is possibly doable, but it would be really tough. Still, I wasn't planning on actually following through, I just calculated it out of curiosity. It's not something that can really be estimated in advance, because no matter which way the market goes in the end, some people at least will make a huge profit or loss on it.

> For example, if the indictment does come down, the market will spike before resolution, and whoever breaks the news first will make a killing (hopefully me, rather than Johnny), with people coming later still making a small profit. Meanwhile, under the assumption that it does resolve NO at the end, it would be by far the most profitable market to do so, at 60% compared to only 12.5% for the best of the near-certain markets (they keep going down because people who aren't me just have to go and invest in them.) :( And that means that the calculations about what kind of final margin could be overcome would be hopelessly skewed by the question of who invests how much and when in the indictment market. Still, it was interesting just to see the numbers.

> **26.07.23**

> **19:59** - ...As for Salem, I put another 100 on GDP down last night. Under normal circumstances, I would have waited for the final GDPNow report this morning, but the same is true of all my previous bets. I was already so heavily invested in the market that there's no point in trying to hedge my bets and no plausible information that could actually change my strategy. (As it turned out, the final GDPNow forecast was unchanged at 2.4% anyway.)

> Anyway, today was mostly quiet, just the usual occasional minor buys, with one major exception. Just after midnight, a no-namer bought 50 YES on GDP, and then at 2:12pm, zubby bought 549 YES (82.4->85.5%).

> It's funny because since July 11th, I'd been the only person to buy YES shares. The only other YES bet at all was that one time Johnny sold part of his NO shares. Other than that, I've been repeatedly buying YES these last two weeks while other people would throw out the occasional NO bet. It's so weird to see people suddenly buy YES today for a change, and two different people at that.

> It was a bit annoying since it meant I would get a lot less profit off of my final YES buys tonight, but on the other hand, I guess it's nice to have help keeping the price high to reduce the risk of Johnny selling, and the vote of confidence from zubby.

> This evening, I put in 500 more on YES (85.5->87.8%), netting a potential profit of only $69 over 500. But that's still a lot better than nothing, especially when the margins are so close.

> I was originally planning to leave it at that. I'd already dipped slightly past the Connor cash limit. I'm still guaranteed to stay ahead of him even if the biggest markets (Ukraine Ceasefire and GDP) both go against me, but no longer if every market somehow goes against me. But that's not a realistic concern, and every little bit helps when trying to catch up to Johnny.

> In fact, I'm planning to put more in later after running the script again this evening and realizing how close we are. Following my last purchase, I would only be around $40 behind Johnny if GDP resolves YES and nothing else changes. The actual margin ratio would still be higher because I also have to make up the margin from all his near-certain bets with my own in order to stay ahead of him at the end of the contest. But it occurred to me that this puts in sight an intermediate goal - to simply get ahead of Johnny on the leaderboard at all tomorrow morning, even if it is only temporary. That would be worth a lot of bragging rights, even if I ultimately failed (most likely due to losing on indictment).

> Anyway, I guess tomorrow is the big day with Salem. In just a little bit, it will all be over. I'll find out if I won on GDP or am out of the running. And most likely we'll also find out if Trump is going to be indicted tomorrow morning. If he doesn't get indicted tomorrow, he could theoretically still be indicted before August, but it would be much less likely, so tomorrow is a pivotal day for both remaining uncertain markets.

> **22:43** - Well, here goes nothing. I just put one last $500 down on GDP (87.8->89.5%), with a potential $57 profit. The marginal profit isn't great, but every little bit helps. Assuming no other transactions happen before tomorrow morning (admittedly a big if) and GDP resolves YES, that should be enough to temporarily put me ahead of Johnny. Also, I happened to notice just now that zubby and Johnny have nearly the exact same number of NO shares on Trump Indictment. It's probably coincidence, but it made me wonder if zubby deliberately sold the extras in order to match their positions.


# July 27th (Decision Day)
![Score graph](/img/salem2/july3.png)


> **27.07.23**

> **04:04** - I went to bed at 11:33, and as usual, woke up several times during the night and checked Salem Plus each time, just in case. Nothing happened until around 3:30am, when I woke up for what would normally have been very briefly.

> This time however, I decided to get out of bed and check Salem Plus just in case, and unusually, there had been a flurry of activity. At 1:41, Johnny bought 80 NO on GDP, then sold 43.9 of YES on Republicans Favored at 2:46. Meanwhile, at 2:48 and 2:55 respectively, 50P and Malte Schrodl randomly bought YES on Trump Indictment, leaving it at 62.6%. (50P also sold $2 of Trump Twitter, not that that matters at all.)

> Johnny finally selling his Republicans Favored shares was unfortunate, but more than made up for by him deciding to buy even more NO shares on GDP. And the increased market price on Trump Indictment also flatters my relative position, and thus if GDP resolves YES, I'll now have a much more comfortable (temporary) lead over Johnny, around $243.

> Anyway, I quickly went back to bed, but unfortunately, despite constantly trying to force myself to... not think about Salem, the excitement had still been enough to render me incapable of sleeping. At 3:56, I gave up and got on the computer, did a JPDB session, then wrote this. Now it's 4:13, and I still have no idea how I'm going to get back to sleep again. (No further transactions on Salem since 2:56am.)

> **05:51** - I ended up spending quite a while on the computer. ...I finally went back to bed at 5:07, and even though Salem was now far removed from my thoughts, it was still hard to fall asleep and in any case, I quickly woke up again at 5:21 and again at 5:35. I stayed in bed, trying to fall back asleep, but 5:42, I gave up and got up to see how I did on GDP. I still wore my orange glasses though, in the hope of that making it easier to fall asleep later this morning, since I'm likely going to be very sleepy.

> Anyway, the good news is that I won! I immediately went to the leaderboard page and took a screenshot of myself now being in 2nd place.

> Then I tried to figure out what to do about Trump Indictment, and whether I could hedge my bets by buying NO to ensure that I came out on top either way, now that I had a small lead over Johnny. However, his 50% YES limit still made it too complicated to try to figure out, and in any case, I reasoned that there will be a lot of volatility which would make a mockery of my attempts to hedge, so I wrote this instead.

> Ironically, just as I was writing this, there was a sudden burst of volatility at 5:53. It looks like Mark bought a huge amount of NO tanking it from 62.6% to 50%, where Johnny had his limit and cashing out most of Johnny's limit. Then 50P bought a bunch of YES, zubby sold some NO, and 50P bought more. And then at 5:57, just as I was writing this, Mark bought more NO and zubby sold more NO. Also, Mark just bought a bunch of NO on "Republicans Favored by Summer".

> Anyway, it looks like Trump Indict is currently at 56.8%, but seemingly every time I write about it, it changes. 50P is currently buying more, bit by bit as usual. And I have no idea what the positions even are, now that Johnny's mostly been cashed out, although it is bad news since it means he locked in a profit. Oh well. It sure is ironic though that everything went to chaos right after I considered buying/selling but didn't. It's a real shame I didn't sell my YES shares at 62 at least though.

> **06:04** - As soon as I said that, 50P stopped buying, and it quieted down again for now. I noticed that Mark also bought NO on a bunch of other markets. Presumably this is the thing where he got a bunch of money from the GDP resolution and immediately decided to reinvest it. Shame he decided to put so much on Trump Indictment.

> I thought about buying, say, 200 NO to try to hedge my bets, which wouldn't keep up with Johnny if it does go NO, but would at least lower the amount I'm behind by. But it doesn't really seem worth it to me. I think I just have to wait and see how the indictment goes and hope that I manage to profit off it (and profit off it more than Johnny does). But in any case, I managed to get ahead of Johnny on the leaderboard, at least for a little while, which is a huge achievement by itself, and something I never expected to happen. I'm actually still ahead of him for now, but just barely, thanks to swing on Trump.

> **06:12** - At 6:09, another burst of activity began, still ongoing, where some no-names as well as Johnny made large NO bets on various near-certain markets, and one no-name also bought 300 NO on indictment (followed by 100 YES from 50P). It's annoying that this means there will be a lot less profit opportunity left in the near-certain markets, but it's really going to all come down to indictment anyway. For now, I just have to wait for the smoke to clear (also 50P just bought another 99 while I was writing this.) It sure is funny how I seemingly woke up early enough to beat the huge rush as people got up in the morning and started investing, but my being early didn't actually help me at all, since I had no idea what to do about it, or what other people were going to do or when.

> **06:34** - Well this is weird. I just ran my script again and it now shows that Johnny should be ahead of me, by about $5. Since the uncertainty in his adjustment is only about 5 (i.e. +-2.5), he should be ahead of me either way. However, when I go to the leaderboard, it still shows me in 2nd, no matter how much I refresh it. I guess this means that despite all the data and effort I put into it, my adjustment values still aren't quite right, although I'm not sure how that could have possibly happened, since it was pretty locked down. Oh well, it's a good thing the discrepancy seems to be in my favor.

> Also, it sounds like the grand jury is at least meeting today, so that's a somewhat promising sign.

> **07:05** - Well I just officially gave up on wearing the orange glasses and going back to bed at some point. It's pretty late now, and there's no way I'd be able to sleep with all the Salem excitement anyway. Right now, it feels like I have to keep watching the markets and Twitter and so on in the hopes of jumping on any indictment news. But for now, I plan to fix some of the previous bugs in Salem Plus, like the fact that the background refresh doesn't update the market prices, meaning you have to hard refresh the page to see the current market prices. It's a bit late now that the competition is practically over, but I might as well.

> **07:12** - That turned out to be a trivial fix. Now I guess I'll try to study Japanese for a while to pass the time.

> **07:26** - P.S. Around 6:49, I invested 2000, using my bet allocation script to distribute it optimally between all the remaining unresolved non-indictment markets (which involved bets in quite a few markets since they're so even now). And then another 2000 around 7:21. It is a risk, but I figured if I'm going to do that, I might as well do it now while I still can. I really regret not doing it earlier this morning before the others bought down the markets a bunch. In fact, right at 6:48 while I was doing the original calculation, a no-name bought down one market a bunch, forcing me to redo the calculations.

> Anyway, I left some money on the table there, and my "NO" ratio is back up to 11%, which is obviously unachievable when my purchases brought down the maximum market price to 9.5%. But hopefully that won't happen anyway, or if it does, I'll manage to profit off of it. It's still all going to come down to the indictment, but I figured I should at least try to eke out a little margin where I can.

Here are my bets from the first round of 2000 using the optimal bet allocation script. Note that the final market prices are slightly different in the different markets (ranging from 10.10% to 10.20%).

```
2023-07-27 06:48:17 Russia-Ukraine Ceasefire by 7/31/2023?
  $196 for 216.650 NO shares (market price 10.75% -> 10.16%)
2023-07-27 06:48:35 New Iran Nuclear Deal by End of July 2023?
  $237 for 262.168 NO shares (market price 10.90% -> 10.14%)
2023-07-27 06:48:55 Chinese Military Action against Taiwan?
  $59 for 65.127 NO shares (market price 10.48% -> 10.19%)
2023-07-27 06:49:13 Recognition of the Taliban by End of July 2023?
  $40 for 44.118 NO shares (market price 10.31% -> 10.20%)
2023-07-27 06:49:33 Bolsonaro Kicked out of the US?
  $221 for 244.296 NO shares (market price 10.76% -> 10.16%)
2023-07-27 06:49:58 No-Confidence Vote on McCarthy?
  $413 for 457.772 NO shares (market price 11.31% -> 10.11%)
2023-07-27 06:50:19 Biden the Favorite in Summer 2023?
  $355 for 393.126 YES shares (market price 88.88% -> 89.88%)
2023-07-27 06:50:35 Send ATACMS to Ukraine?
  $464.708716906 for 515.300 NO shares (market price 11.42% -> 10.10%)
```

You might naively expect that the optimal bet allocation would involve buying each market so the final prices are the same. However, this is actually not the case due to the way the transaction fees are calculated. Transaction fees are calculated based on the *final* market price after your bet, or more precisely, what the final price would be if there were no fees, and the *same rate* is applied to your *entire* bet.

This means that the marginal $1 increasing the size of a bet profits you not just from the additional profit at the marginal market price, but *also* by very slightly reducing transaction fees on the *rest* of the bet. This means that the optimal bet allocation involves *overshooting* on market price slightly, with the difference larger the higher the original price was (and thus the larger your bet). Fortunately, I had a script to calculate that all for me.

Of course, none of this *really* matters, since the differences involved are extremely tiny, but I figured it was worth pointing out anyway, just due to the interesting way the math works out.


> **12:20** - Well crap, so much for that. I had trouble focusing on anything all morning, desperately waiting for news about the indictment. Around 11:36, Johnny bought down to 54% with a limit order, which 50P and zubby traded against, racking up his leverage.

> My stomach jumped when I saw it suddenly go from 54% to 33%, as 50P, who had been buying it all morning, mass sold at 11:57:39. I didn't see any news on Twitter or Google, and quickly got out the Chromebook and bought 50 YES, hoping it was a dumb trade.

> Johnny got in first though, selling at 11:57:53 (and locking in yet another huge profit), so my buy at 11:58:18 went from 38.5->39.9%. At 11:58:23, zubby bought 256 NO, followed by 100 YES from 50P 30 seconds later, and then nothing.

> Ordinarily, I would have bought a lot more, assuming it was a big profit opportunity, but the fact that zubby and Johnny both seemed to think the 30s were a fair price, and in particular the fact that they weren't buying it up themselves when they're so much faster than me about such things gave me pause, so I stayed out. I soon found messages on Twitter saying that a clerk had reported that no indictment was filed today.

> I don't know what the numbers look like now, but I don't have to check to know they're really bad for me, especially after Johnny bought a lot more NO at 54% this morning, and my foolish YES buy. At least I didn't go in more than that, I guess. There's still a slight possibility of a sealed indictment announced tomorrow or something, but for now, it seems that my hopes of finishing in second are dead.

> ...Oh well, at least I can stop worrying about refreshing Twitter for news now. It will be hard to stop thinking about the Salem disappointment for a while, but I'm sure I'll get over it eventually.

> **15:21** - I pretty much gave up hope on Salem, so my jaw dropped slightly when I happened to notice at 3:20 that Trump Indictment was back up to 62.6%. It looks like zubby started massively buying it up at 3:16, with 50P selling a bit in response. In fact, zubby is currently selling shares in other markets (e.g. Ukraine ceasefire) and even just now, it is up to 70%. I feel like I should do something, but I have no idea what is going on.

> Update: Now 54.3%, courtesy of 50P.

> **15:28** - After writing that last entry, I checked Twitter for news (in retrospect, I really should have done that *first*) and saw mentions of a superseding indictment against Trump for the Mar-a-lago case. I dithered for several minutes about what to do, but ultimately decided to tentatively put in 100 on YES, since after all, I had no real chance of winning if it didn't resolve YES anyway.

> Sadly, by then, 50P had seen the news too and bought it up to 74.8%. And following my bet, zubby put in 446 more (74.8->79.8%). I really wish I had access to my linux desktop so I could run the script and see what the relative position with Johnny is, so I know how much I need to buy to get ahead of him if this does go YES.

> **15:35** - I quickly plugged in my desktop just to check (not bothering to move the monitors into place, just plugging in the keyboard and mouse.) It turns out that at current market prices, I'm already way ahead of Johnny, though perhaps he could catch up if he immediately sold everything and bought lots of YES.

> Even better, I ran the hypotheticals to see what the rankings would be if it resolves YES or NO, and either way, I'd be in second under current circumstances! Zubby loaded up on so many YES shares that he'll sink to 3rd place if it were to immediately resolve NO. The normal instinct would be to load up on more shares myself to maximize profits, but only the ordinal position really matters, so I guess I'll just sit tight and hope for the best. Now I'm REALLY glad that I didn't try to load up on NO at 38% in a futile attempt to catch up with Johnny earlier.

> **15:39** - Just got the resolution email. I guess that's that. I can't believe that miracle came through for me at the end. I was pretty dejected earlier this afternoon, feeling like I came so far and saw so many miraculous successes only to falter at the last obstacle. But it's all over now. I can't believe it.


> **28.07.23**

> **07:27** - One other thing I didn't mention - I discovered a bug in Salem Plus when Johnny placed his 54% limit at 11:36. I was looking at Salem Plus and noticed zubby and 50P both bought at exactly 54%, which implied that someone had added a limit order, so I went to Salem to check, and discovered there was a transaction from Johnny that didn't appear on Salem Plus at all.

> Back when I edited Salem Plus that one time while on vacation in Georgia, I modified Salem Plus to filter out limit orders, since it's generally not useful to bump markets up to the top just because someone placed a new limit order, and not useful to clog up the betting history with $0 bets at weird prices and so on.

> However, in this case, Johnny placed an "in the money" limit order, which meant that it was partially filled with a normal buy from the current market price down to 54%, and then the rest would be filled as a limit order whenever people (i.e zubby and 50P) traded against it.

> Unfortunately, this meant that Johnny effectively had a massive NO buy that didn't show up in Salem Plus at all, as I didn't account for that possibility. But when it comes to Salem Plus fixes, I figured there was no point in trying to fix it now, given how the competition was almost over anyway.

> There's another bug in Salem Plus that I've known about for months, but never got around to fixing. Whenever someone buys YES while holding NO shares or vice versa, Manifold will insert two extra transactions into the history for some reason, showing them immediately selling the YES and then the NO (or vice versa) in the amounts that canceled out. This clogs up the bet history (as Salem Plus only shows the last 10 bets for each market) and makes it harder to see the real trades, but it seemed complicated to detect and I never got around to actually fixing it, and by this week, the end of the competition was so close that it didn't seem worth the effort.

> ...As for Salem, once the indictment market resolved, I was firmly in second place again. My lead over Johnny was huge, around 2k IIRC, I'd made a little profit off my YES shares, but it was mostly due to Johnny holding huge amounts of NO shares.

> As I commented later on Salem, the competition was effectively over for us, with huge gaps between the top players (and no markets left with real uncertainty). In order for Johnny to overtake me, it would take something really surprising like a Ukraine ceasefire deal and Bolsonaro getting deported in the next four days. That or someone pulling another Josiah Neeley.

> I continued keeping an eye on the markets to try to guard against the unlikely event of someone pulling a Josiah, but I was watching them a lot less intently and desperately than before, and didn't plan to bother checking them at all when I woke up in the middle of the night. Of course, past experience showed that Johnny and zubby are way faster than me and would likely take any profit opportunities that did arise, but I might as well keep watching, just in case.

> Following my win, I was filled with euphoria for a while, and if I hadn't been at work, I might have very well went out to Salt and Straw right then, in the middle of the afternoon. As it is, I often got distracted and kept checking for new comments on Salem (among other things, zubby congratulated me on the win and PPPP jokingly proposed a *fourth* Trump Indictment market.)

> After work, I spent a while on Salem, looking through the comments and betting history on the Supreme Court markets to reminisce about past glories, and then finally left for Salt and Straw [to celebrate] at 5:46pm.

> ...Thursday evening, I marveled at how much things had changed over the last 24 hours. Wednesday evening, I was still desperately watching Salem and hoping I would somehow manage to catch up to Johnny, and a day later, everything was over and I miraculously did win. Incidentally, the indictment win propelled DfromBham onto the leaderboards (19th place), so he's no longer a "no-name" and I added him to my scripts, even though it doesn't matter now.

# July 28-Aug 1

![Score graph](/img/salem2/july4.png)

Even with the contest effectively over, I knew there was a slight risk of someone pulling a Josiah Neeley and putting Johnny back into the lead at the last minute, so I still had to keep watching Salem Plus, if not quite as intently as before. As it turned out, this actually happened twice on Friday, but then there was no more notable activity for the rest of the contest, just random people putting last minute money into the near-certain markets.

I also started researching more about the contest online and came across an extra prize announced back in February that I had no idea about. I also learned more about Johnny and Zubby, particularly the latter, who got profiled in a news article (apparently he has made six figures trading the *real money* prediction markets in the past.)


> I went to bed at 10:31/10:53, still earlier than usual. I didn't plan to check Salem Plus if I woke up during the night like I'd been doing, but I was hoping to get up for a different reason - Wanikani...

> Anyway, I slept better than usual, presumably due to the extreme lack of sleep the night before. In particular, this was the one night that I didn't wake up between 3 and 5am. I think I woke up around 2, but stayed in bed, and didn't wake up again until 5:24.

> I got up to start the WK session as planned so that at least it wouldn't be polluted by the 6am reviews, and naturally looked at Salem Plus, and sank when I saw that ATAM CMS had spiked.

> At 3:58:52, Stevie Miller decided to do a Josiah impression and bought 551 YES on ATACMS, spiking from 9.3% up to 23.0%. And Johnny, who presumably has a bot alerting him at all hours of the day (and tends to trade in the early AM hours a fair bit anyway), bought 1700 NO (23.0->13.0%) just two minutes later at 04:01:39.

> I quickly ran the python script and discovered that fortunately, the standings hadn't changed much. Fortunately, I had had such a huge lead over Johnny that this barely made a difference. IIRC, my "uninvested cash ratio" was negative 22-something% when I checked yesterday evening, and was now down to "only" -17.8%. Still, it was a reminder that the contest isn't over yet, and Johnny still could potentially get really lucky and win, if someone pulls a *real* Josiah.

> I quickly went back to bed, but the Salem scare meant I had no hope of sleeping if I ever did, and I got back up at 5:35.

> I spent a long time pondering Salem, looking at Johnny and my positions with the script, etc. and ultimately decided to buy 1000 NO (at 6:07, 13.0->10.0%). I figured that now that Johnny was holding a much larger position than me (3163 NO shares), there was little risk in buying ATACMS, since Johnny would lose more than me if it went YES. And while I didn't bother to calculate it, I figured that even if he sold and then it went YES, he would probably lose so much on the sales that he would still be behind. And of course, the ATACMS price was still elevated and way above the other markets, and that little bit of extra profit would provide an additional buffer in case other fortunes drop into Johnny's lap.

> Coincidentally, less than a minute after my purchase, zubby also made some buys, grabbing 500 NO in three other markets (Taiwan, Iran, and Ukraine Ceasefire.) I wonder why he's even bothering, since he's guaranteed to take first almost no matter what happens, and investing his money just increases his downside risk in the event of an upset. And the amounts don't seem designed to maximize profits either (he should have gone for ATACMS, which was still the highest at just under 10% and would also correlate his position more strongly with mine, to boot, reducing the risk of an upset.) But whatever.

> **08:29** - P.S. my ATACMS NO buy increased my uninvested cash ratio over Johnny back up to 22.0%. Of course, my cash is basically meaningless to Johnny's chances. A more useful number to track is what my lead will be (assuming all the markets go as expected). That number is up to 1570 (compared to a lead of around 1933 at current market prices, as he has more invested than me.)

> **29.07.23**

> **11:46** - During breakfast yesterday, it struck me just how much things had changed for the day before. On Thursday morning, even while eating breakfast, I would walk over and check Salem Plus on the computer in between bites, as the indictment news could come at any time. Of course, that's partly because it takes a lot of chewing to eat the apple and overnight oats. On Friday, I paced around the room a bit and adjusted the window blinds twice while eating breakfast, but only bothered to look at Salem Plus on the computer once.

> ...I randomly decided to google "salem center prediction market contest" to see if people had said anything about it. I expected lots of posts from the beginning of the contest and nothing since, which was mostly the case. However, I came across an announcement from February of an extra prize.

> In order to try to fight the declining participation rate in the contest, they announced an additional $5000 prize for the person with the highest percent increase in their portfolio value from February 15th 6am until the end of the contest (which also requires you to end with at least $2000 and bet at least $1000). They hoped that rewarding people for a large increase ratio would encourage participation among people who had a low net worth (and thus could most easily increase it) and had no chance of winning the main contest.

> It was announced back in February, but I'd never heard of it until now. At first, I figured that I had probably won it just by chance, because the China COVID market fiasco would have greatly suppressed my net worth in February, and I made massive gains since then. However, I tried my best to temper my hopes, reasoning that I had no idea when in February the COVID market tanked and also that one of the newer rising stars like Malte Schrodl might have a much larger ratio than me either way.

> After lunch, I got back to the computer to see a second surprise. At 14:41:53 a no-name (Greg Simitian) had suddenly bought 1000 YES on  "US Debt Limit Raised", spiking it from 7.0 to 28.4%. Zubby had already bought 571 NO (to 22.3%) at 14:43:05.

> I quickly got out my chromebook and went to Salem and bought 200 NO (at 14:46:51) followed by 1000 more at 14:49:19, down to 14.2%. In the process of checking the bet history on Salem, I discovered that Greg had actually bought it $10 at a time, over the course of a minute or two. Clicking the "bet 10" button a hundred times must have taken some dedication. I'll never understand why 50P and the like always spam that instead of making bets the normal way, but this is by far the most extreme I've seen of that. It also means that zubby was even faster at responding to the spike than it looked like from the timestamps on Salem Plus (which only shows when the transactions started if someone spams a bunch in a row).

> I also discovered that Malte Schrodl was a major beneficiary, as he had coincidentally put a number of NO limit orders down at 13, 15, and 20% at 11:24am. (He later explained that he put the limit orders down after seeing the Stevie ATACMS spike that morning, just in case someone else did the same thing, which was good thinking.)

> It seemed a bit suspicious to me, since it made no sense that a new player would join just three days before the end of the contest and put all their money down on one market. Although I guess if you're going to join right before the contest ends, that's the way to do it, since you have no hope of reaching the leaderboard otherwise. Not that you'd actually be eligible to win, since they'd obviously exclude people who just yolo'd one bet and got lucky.

> The circumstances made me suspicious of cheating, but I figured if someone were actually cheating by creating an alt account, they would have had their main account ready to buy the spike, and there was no sign of that.

> I put down the extra 1000 on NO because I figured that if I didn't do it, Johnny would come along and take that profit instead. And I figured that it was a relatively safe bet since Johnny already had a large number of debt ceiling shares and thus wouldn't jump ahead of me if it somehow resolved YES (not as many as I assumed it turns out, only 900 or so.)

> The thing I found weird was why zubby and Johnny didn't jump on the spike, when they usually do so so quickly, much faster than I ever could. And it got even weirder when I left it at 14% and the minutes dragged on with noone touching the market.

> I knew that zubby had been 100% invested when I checked in the morning, and probably didn't want to sell too much to buy the spike, but that didn't explain Johnny. I'd long suspected that his market spike bot was not as sensitive as mine, and it might miss movements that happened as a long series of bets rather than one giant one. Or maybe he was just in the bathroom at the time or something, though that excuse wore thin as time stretched on.

> It was even weirder when Johnny left a comment on the market at 3:34pm, showing that he'd seen it, but still didn't invest. The first person to buy it was PPPP at 4:14. Maybe Johnny has just given up. After all, my lead is way too big for him to catch me even at a 14% margin, though that doesn't explain why he bothered with the Stevie spike the previous night. Oh well.

> Speaking of the debt ceiling, the February 15th announcement post also commented on some of the markets and wrote

> *The debt limit standoff is one of the main issues in Washington, with both sides seemingly unwilling to compromise. The market seems optimistic about finding a solution, with 77% thinking that the debt ceiling will be raised by the end of July.*

> So that shows/implies that even *Richard Hanania himself*, the *organizer* of the contest, was also misled by the trick question on the Debt Ceiling market, treating it as "will congress come to a deal to avert the debt ceiling default", the natural question and the one that was on everyone's mind, rather than "what color will the resulting law happen to be", the question it actually turned out to be about. I think it's pretty ridiculous to have a trick question that even the founder didn't understand, but whatever. I still managed to get second place in the end in spite of that.

> In further Salem news, after work I quickly got on my computer and modified my script to figure out who would win the Feb 15th prize. It turns out that under current circumstances, I'll only be fifth, after Malte Schrodl, Sid Sid, DfromBham, and PPPP.

> However, I would have won if they used February 7th as the reference point instead of the 15th, and also would have won if they used the 21st. Unfortunately, February 15th was basically smack in the middle of a dip between the two peaks of the market. Oh well, it's not like I needed the money, and the outcome was pretty much pure luck based on the exact starting date used anyway.

> In the process of calculating that, I noticed another interesting statistic. As of yesterday evening, there were exactly 999 players who had placed at least one bet. However, Greg was actually not even the most recent. He was the second most recent (the 998th), with the 999th player being someone named Lorenzo Buonanno. Lorenzo was smarter and split his bets among multiple markets and bought NO instead of YES, though that of course ensures that he'll only end 5-10% above where he started. I can't imagine why anyone would bother joining the tournament three days before the end, and it seems even more pointless if you're just going to bet conservatively like that. Oh well.

> I commented on Salem with the statistics I found about the Feb 15th contest, and zubby responded "That was announced a long time ago! Also, totally wild that some of you guys knew how much money everyone had the whole time." while PPPP said "how did you know how much each player had on 2/15?".

> I explained that the bet data is publicly available, so I just wrote a Python script to add it up, and that I'd assumed all the top players had done the same thing, since Johnny had alluded to doing it as well. I'm surprised that zubby seemingly never did. It's extra amazing that he managed to win without having any idea what the margins were.

> After that, I went to Manifold out of curiosity, and spent a while searching for all the Salem contest related questions there. There were a bunch of questions related to the Salem contest, mostly created around when it first started, though some people (Johnny mostly) had created a lot of more recent low-activity markets about e.g. "will Johnny win" or "will zubby win", "who will be in the top 5", "what will be the final score for the top player", etc.

> Most of the markets had little activity and no comments, but a couple of the early ones did have extended discussion in the comments, and in particular, there was one discussion between Johnny and Henri Lemoine (well I assume it's Henri, his avatar is the same as on Salem anyway) about the possibility of writing scripts to figure out everyone's stats from the public api data, and that sort of thing.

> At one point, Johnny talked about how he keeps a spreadsheet with his subjective probabilities for each market, and has a script to highlight the markets with the best return relative to his estimates, and even posted the code of a Jupyter Notebook that he wrote to do this.

> This was all the way back in the first month of the contest. I wish that it had occurred to me to check Manifold before, because I could have gotten some valuable intelligence on Johnny. I do wonder if he continued doing the spreadsheet thing after August. Myself, I almost never tried to put my subjective beliefs into concrete numbers, and I only occasionally made speculative bets on "undervalued" possibilities that I didn't think were guaranteed to actually happen. I think putting your beliefs into numbers and trying to trade on that might actually be a trap, since the nature of transaction fees makes it impossible to profit from small market swings, even if you're right.

> One comment also linked to the source code for Salem, which is apparently on Github. I'd looked at the Manifold source code back in November, but it never occurred to me that Salem was a code fork of Manifold and that source code was also publicly available. I knew pretty much how things worked, and the formulas and so on, but I didn't know the exact value they had the transaction fees set to, and only bothered to reverse engineer that in early January. If I'd known about the source code, I probably could have found the value there and saved myself some trouble.

> **02.08.23**

> **18:13** - Ever since I started the contest, or at the very latest since November, I'd often found myself mentally narrating my history in the Salem contest, as if I won and people actually cared what I did, and that of course grew more frequent over time, as I rose through the ranks.

> I'd long planned to write a giant blog post about my experiences in the contest, and had originally been hoping to write it the previous weekend (the 22-23rd). Of course, I didn't know quite how things would turn out at that point, but I knew I'd end in either third or possibly second place, and could write most of the post and fill in the end later. But of course, I got busy with the Dave Barry stuff and never even started the blog post, and thus it fell to the final weekend.

> And of course even on the final weekend, I procrastinated until Sunday afternoon and didn't start work on it until 12:10pm. I worked on it all afternoon and evening and didn't stop work until 10:55pm (or arguably more like 11:08pm, since I naturally kept thinking about it for a while afterwards). Of course, I did take a few breaks during those 11 hours, but even during the breaks I would naturally be thinking about the blog post the whole time. It was hard work, but I really wanted to have it ready for the end of the contest, and that Sunday was the last opportunity.

> I went to bed at 11:48 on Sunday and then continued working on it all morning Monday before work. My original plan was to have two sections in the post, first a "quick" list of major lessons I learned during the contest, and then a detailed chronological account of the contest. However, after spending all Sunday and Monday morning, I still hadn't even finished the former, so it was clear that I wouldn't be able to finish it all on time. Instead, I decided to break it into the two parts and just try to finish the first before the contest ended.

> Anyway, I continued working on the blog post after work Monday evening. I'd mostly finished part 1, but still had the last two sections to write, and then I needed to proofread and edit it. It was a bit more relaxed though - I didn't finish it until ~11:30pm, but I also took a couple breaks...

> ...As for Monday night, I was up late due to working on the blog and all the excitement around the end of the contest and so on. I'd originally planned to keep my remaining cash uninvested, just to reduce the tail risks, since increasing my score couldn't actually affect the ranks at all, but I figured that I might as well make a little extra profit with negligible risk, since if/when they revealed the final scores, having my number be slightly bigger might look slightly more impressive to people, even if it couldn't change the rank.

> Since it was so close to the end of the contest (midnight Pacific time), there was effectively no chance of any risk from the *outcomes* (unless someone on Salem was say, actively conspiring with Trump to post on Twitter right before midnight in order to win the contest), but there was a slight tail risk that Salem would arbitrarily decide to resolve some of the markets incorrectly or something, so I wouldn't be completely secure until they actually resolved the markets and announced the winners.

> Thus around 11:45, I used my optimal bet allocation script one last time and invested my final $5939 for an extra $360.8 of profit. I was really surprised when Johnny had the same idea a few minutes later, especially since he hadn't made any bets since the Stevie spike early Friday morning, and I'd assumed that he'd just given up. And then a few minutes later, midnight rolled around, and that was that.

> I felt like posting the blog post before the markets resolved was tempting fate, since there was still the slight chance that Salem screwed up the resolutions, and thus planned to wait until everything was officially announced. I didn't go to bed until 12:16 Monday night, and slept fitfully. Every time I woke up during the night (more often than usual), I would quickly check the Gmail app on my phone to see if the resolution emails had come in yet.

> I also got out of bed a couple times, just to use the bathroom or get a drink of water, but one time, around 4:09am, I decided to get on the computer for a while. Coincidentally, Zubby had just left a comment at 4:03am saying "Great contest everyone!", good luck, etc. PPPP and Johnny would later respond an hour or two later.

> **19:44** - I initially assumed that the markets would resolve by 5:30-6am, if not sooner, since that's when they'd often resolved in the past, so I was increasingly surprised when they didn't resolve all morning. Eventually, I gave up and decided to just go ahead and publish the blog post but not link it anywhere, so I could link to it later once they finally did resolve.

> Apart from that, I mostly spent the morning searching for news about Salem. I expected at least a bunch of perfunctory posts announcing the end of the contest, and probably mentions on prediction market focused sites like LW, ACX, etc. Thus I was very surprised by the complete radio silence. It was very eerie, how nobody was talking about it at all.

> Salem didn't put out a single post about the contest, nor did Hanania, etc. Also disappointing was that Scott Alexander wrote a "Manic Mondays" post on ACX (posts that focus on prediction markets) and didn't even mention Salem at all.

> ...Throughout the day, I checked Gmail on my phone to see if the markets had resolved yet. I finally got fed up and tired of waiting, and went ahead and linked my blog in the comments on Salem at 3:19pm, and also posted it to r/slatestarcodex on Reddit. It's not a subreddit I've ever frequented, but it seemed appropriate since Scott loves prediction markets and I only found out about the contest via ACX.

> Also, I found Zubbybadger's Twitter and read through the last year of posts. Apparently he is really active on Kalshi and even a community manager for Kalshi, but he also spent a lot of time tweeting about the debt ceiling predictions, and back in November, about forecasting the midterms. I guess it would make sense that he did so well when he already has tons of experience and is highly active in forecasting.

> I arrived home from work to a pleasant surprise - the barrage of emails from Salem that they had finally resolved all the remaining markets. It looks like they resolved at 4:35pm, which was odd, since I could have sworn I checked my phone after that before leaving work, but whatever. I also got an email for a comment left by PPPP on Salem, responding to my blog post. I was surprised that people actually read it, and so quickly. Later on, I got comments praising the blog post from Zubby and DfromBham as well.

# On the number of players

As mentioned, on Friday, July 28th, two new users joined, bringing the total number of users who had placed at least one bet to exactly 999. However, while going through the data while working on my first blog post, I discovered that the first of those 999 users was actually Salem Markets itself, which placed a number of bets in the week before the contest started for some reason, and thus there were only 998 "real" users. Fortunately, on the very last day of the contest, another user joined, bringing the total back up to 999, or a round thousand if Salem Markets is included.

Note that three of these users *placed* a bet but never had a bet *filled*. Presumably, they placed a limit order, canceled it, and then never did anything else during the contest and thus stayed at the starting $1000. So the total number of real users who had a bet go through is only 996.

# Conclusion

It's amazing how much the Salem contest occupied my life over the last year, as demonstrated by the sheer volume of journal entries I wrote about it. I knew I'd been spending massive amounts of time on it, but it was only by compiling this post that I realized just how much I'd written about it as well.

It was an interesting experience to do once, but I'm not eager to try it again due to the sheer time investment required and the amount of luck involved. Still, it was a fun adventure, and it's really amazing how everything lined up for me to rise through the ranks.

In case you're curious, here are the final rankings. For users subject to score adjustment, the adjusted score is in parenthesis next to the raw score.

```
1) zubbybadger  23182.0525265
2) Robert  17820.5689235
3) Johnny Ten-Numbers 16622.399872 (15772.1474041)
4) David Hassett  9554.89409126 (9366.72822662)
5) Malte Schrodl  9049.16293444
6) Connor Pitts 9026.83812428
7) Ben  7791.8542649
8) Mark 7852.03582088 (7414.1097106)
9) ussgordoncaptain 6633.64996396 (6629.13922078)
10) PPPP  5592.71033033
11) Sid Sid 4244.47124376
12) Jack  4061.42438528
13) Krum-Dawg Millionaire 3821.79230486
14) Henri Lemoine 3844.80835926 (3808.41219121)
15) Alvaro de Menard  3521.88368323
16) Jack G-W  3518.11552372
17) Asher Gabara  3307.75799278
18) Oliver S  3248.5177568
19) DfromBham 3135.85072837
20) Henry A Long  2836.65664724
21) KbBFc7EDIThLfHZlXDubsLbO4Sn1  2571.08099949
22) Alex Radcliffe  2560.22134358
23) 50P 2527.33043929
24) xUhM61t0YrfOzqs6WsG1Ri9Puyl1  2472.42382728
25) Charles Paul  2458.1823912
```

The top player, Zubbybadger, has years of experience [and has made over $150,000 of real money on PredictIt](https://washingtonmonthly.com/2022/04/03/the-art-of-the-pump/), constantly watching C-Span and the like to get an edge on predicting political questions. Meanwhile, the third place player, Johnny Ten-Numbers, is an active participant on Manifold Markets, the play-money prediction site that Salem was based on. I think it's especially amazing that I managed to reach second place despite having no experience with prediction markets at all when the contest started.

Two other active players on Manifold, Henri Lemoine and Adrian Kelley, also joined the Salem contest and thus were considered early favorites. However, they only finished in 14th and 47th place respectively.



