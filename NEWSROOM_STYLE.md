# House Style — reverse-engineered from FXStreet

I read a set of live FXStreet pieces across every story type and pulled out the
patterns that actually make them read like a professional desk. This is the
evidence base for the new prompts.

Articles studied:
- `EUR/USD Price Forecast: Looks set to extend advance beyond 1.1600` (daily series)
- `CPI preview (JPM, GS and BBG): A blistering inflation print supercharged by memory prices` (multi-source preview)
- `CPI day puts inflation back in focus` (scenario piece)
- `USD: Inflation pressures stay firm – Wells Fargo` (single-institution note)
- `US: CPI inflation pulse and Fed path – TD Securities`
- `Week ahead – US inflation data eyed amid Iran peace hopes`
- `1.1560: Why the Euro's recovery is facing its biggest technical hurdle` (two-house synthesis)

---

## 1. The single most important finding

**FXStreet's sources are institutional research notes, not other news outlets.**

Their pieces quote TD Securities, Commerzbank, UOB Group, Wells Fargo, JP Morgan,
Goldman Sachs, Bloomberg Economics — with direct quotes and named economists.
That is *why* the articles feel authoritative and original rather than like a
rewrite of someone else's story.

Our agent currently reads news-outlet RSS headlines and paraphrases them. That is
structurally a lower tier of journalism, and no amount of prompt tuning fixes it.
To reach their level we need source material that carries **analyst views and
hard numbers**, not just headlines.

## 2. Their headline formulas

| Type | Formula | Example |
| --- | --- | --- |
| Daily series | `INSTRUMENT Price Forecast: <directional thesis with a level>` | "EUR/USD Price Forecast: Looks set to extend advance beyond 1.1600" |
| Institution note | `ASSET: <thesis> – <Institution>` | "USD: Inflation pressures stay firm – Wells Fargo" |
| Multi-source preview | `<EVENT> preview (<banks>): <colourful thesis>` | "CPI preview (JPM, GS and BBG): A blistering inflation print…" |
| Level-led analysis | `<LEVEL>: Why <subject> <situation>` | "1.1560: Why the Euro's recovery is facing its biggest technical hurdle" |
| Recap | `<Region> <indicator> <verb> to <figure>` | "United States CPI inflation rises to three-year high at 4.2% in May" |

Note: a **specific number in the headline** is the norm, not the exception.

## 3. Headings are claims or questions — never labels

Real FXStreet headings:
- "Will the US CPI report matter?"
- "Core and headline CPI set to firm"
- "Fed data-dependency and rate-hike risks prompt Commerzbank EUR/USD forecast cut"
- "EUR/USD technical analysis"

Compare with what our prompt currently forces on every article: `Introduction`,
`Market Context`, `Analysis`, `Market Takeaway`. Those are labels from an essay
template, and they are the main reason the output feels robotic.

## 4. Technical analysis appears in exactly one place

In the price-forecast piece TA is its own section with a real ladder of levels:
trend-line break at 1.1538, 20-EMA at 1.1472, RSI at 64, downside to the July low
at 1.1353, upside to 1.1600 then the May 29 high at 1.1686.

In **every** CPI/macro piece there is **no technical section at all**.

That is precisely the bug you spotted. Confirmed by their practice.

Also worth copying: FXStreet appends a disclosure —
*"The technical analysis of this story was written with the help of an AI tool."*
Good precedent for how we disclose ours.

## 5. The scenario tree (what you asked for)

From "CPI day puts inflation back in focus":

> If CPI comes broadly in line with expectations, markets may interpret the data
> as manageable rather than alarming. In that scenario, the Fed would likely
> maintain its current cautious approach… Treasury yields could stabilise, the US
> dollar may struggle to extend gains aggressively…
>
> A hotter-than-expected print, however, would likely force markets to further
> push back Fed rate-cut expectations. That could trigger a sharp move higher in
> Treasury yields, especially on the front end of the curve…

Structure: **each scenario → policy implication → yields → dollar → equities/gold.**
Consistently hedged ("may", "could", "likely"). This becomes a reusable outline.

## 6. Opening pattern of a daily forecast

1. Instrument + **live level** + session + the driver
   ("The Euro trades broadly firm at around 1.1555 … during the Asian trading session on Thursday")
2. DXY **at press time**
3. The data point that caused it, with **actual vs consensus vs prior**
   ("ADP reported 44K … lower than estimates of 70K and the prior release of 98K")
4. An institutional forecast, quoted
5. What's next on the calendar, with the **GMT time**
6. `### <INSTRUMENT> technical analysis` — levels ladder
7. An evergreen "Economic Indicator" explainer box (what ADP is, why traders care)

Every one of those is mechanical and reproducible.

---

## 7. What this means for our build

### 7a. Compute technicals in code, let the model narrate
`src/lib/markets.ts` already pulls real OHLC from Yahoo
(`/v8/finance/chart/{symbol}?range=5d&interval=1d`) and CoinGecko. So we can
compute — deterministically, in TypeScript — the live price, 20/50-EMA, RSI,
recent swing high/low, and prior-day range, then pass those **as facts** to the
model with a hard instruction that it may not state any level not in that list.

This is the correct division of labour: **code does arithmetic, the model does
prose.** It makes fabricated support/resistance structurally impossible, which is
what makes a daily "Gold Price Forecast" series safe to automate.

### 7b. Upgrade the source mix
Add feeds that carry analyst commentary and hard data rather than headlines only,
so the model has real substance to work with instead of padding:
- **ActionForex** — publishes bank research notes, free RSS
- **Reuters / Investing.com** markets feeds — numbers-dense
- **FRED** — official releases with actual/consensus/prior
- **Central-bank RSS** (Fed, ECB, BoE press releases) — primary sources, free
- ForexLive stays, it does carry desk commentary

Primary sources also solve the attribution problem entirely: quoting an ECB press
release or an FRED release is not derivative of anyone's reporting.

### 7c. Prompt architecture
One shared **voice contract** (banned phrases, sentence rhythm, hedging rules,
attribution rules, heading rules) + one **outline per story type**, selected at
runtime. No global skeleton. Sections are conditional:

| Story type | Sections | TA |
| --- | --- | --- |
| `data-release` | print vs consensus vs prior → what drove it → policy read-through → cross-asset reaction | no |
| `data-preview` | consensus & range → what each house expects and why → scenario tree → what to watch | no |
| `central-bank` | decision → language shift → dissents → rate path → cross-asset | no |
| `price-forecast` | live level + driver → catalyst data → calendar ahead → **technical levels** | **yes** |
| `earnings` | numbers vs guidance → segments → margin/valuation read | only if the chart is the story |
| `regulation` | what changes → who's affected → timeline → precedent | no |
| `week-ahead` | themes bullets → per-event sections as questions | no |

### 7d. Banned-phrase list (the AI tells)
"In conclusion", "It's important to note", "In the world of", "delve", "landscape",
"navigate", "testament to", "tapestry", "ever-evolving", "plays a crucial role",
"it remains to be seen", "only time will tell", "as we look ahead",
"in today's fast-paced market", plus any heading that is a bare label.

Plus: no em-dash-heavy rhythm, no three-item lists everywhere, no paragraph that
restates the bullet points, and never open with a summary of the article.
