# Marketing Agent — <PRODUCT NAME>

The brain for this repo's marketing agent. Read top-to-bottom before every run. The run loop itself lives in `.claude/skills/marketing-run/SKILL.md`; this file holds all product judgment. Keep this file current — it is the only place the agent learns product facts from.

## Product

<One paragraph: what it is, who it's for, the one-line pitch. COPY real facts (user counts etc.) from ap2/MY_PROJECTS.md at scaffold time — the agent never reads other repos at runtime.>

- Site: <https://...>
- Canonical docs in this repo: <list, e.g. docs/BRAND_GUIDE.md — reference, don't duplicate>
- Real metrics the agent may cite: <e.g. "3,000+ users, 17,000+ cocktails" — ONLY verified facts>

## Audience & Voice

- Audience: <who we're talking to>
- Voice: <first person? brand voice? conversational rules. Steal the good parts of ap2/social/x-growth-prompt.md at scaffold time: concrete beats general, vary shape/length across a batch, no AI-sounding prose.>
- Post categories to rotate: <e.g. tip / lesson / question / opinion / project — adapt to this product's audience>
- Ratio: roughly 4 of 5 posts pure value/community; ~1 in 5 mentions the product, softly.

## Channels

Priority order. The run-loop rotation picks the longest-idle type; this table sets cadence expectations and accounts.

| Activity | Cadence target | Accounts / destination | Notes |
|---|---|---|---|
| social | <e.g. 3 posts, 2-3x/week> | Post Bridge IDs: <X: NNNNN, IG: NNNNN, FB: NNNNN> | IG/FB need an image |
| pseo | <e.g. 1 batch/week> | <where pages go> | |
| blog | <e.g. 1 post / 2 weeks> | <blog system location> | |
| directory | <e.g. 1-2 preps/week until list exhausted> | link-tracker.md | |
| engagement | <e.g. 1 sweep/week> | TASKS.md drafts only | |

Default post times: 9am / 1pm / 6pm Eastern, next day, ±20 min jitter.

## Content locations (whitelist — agent may only write here + marketing/)

- <path> — <what goes here, format/pattern to follow>
- <path> — <...>

## Media / images

- <How to get images for social posts: OG-image routes, public/ assets, generation guide, etc.>

## Seasonal / timely

Checked first every run. Lead time = start posting this many days ahead.

| Window | Topic | Channels | Lead time |
|---|---|---|---|
| <e.g. Dec 26–Jan 31> | <Dry January> | social, blog | 7d |

## Run budgets (overrides of skill defaults, if any)

<Leave empty to use skill defaults: social 2–3 posts, pseo 3–5 pages, blog 1, directory 1–2, engagement 1 sweep.>

## Never do (product-specific rails, in addition to the skill's hard rules)

- <e.g. no health claims, no competitor bashing, platform-specific rules>
