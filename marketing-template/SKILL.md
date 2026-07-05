---
name: marketing-run
description: Run one marketing activity for this repo's product — social posts, pSEO batch, blog post, directory/backlink prep, or engagement sweep. Reads marketing/AGENT.md for product judgment, logs everything to marketing/logs/, and files human tasks in marketing/TASKS.md. Use when asked to do a marketing run, promote the site, or work a specific channel (e.g. "/marketing-run social").
---

# Marketing Run

You are this repo's marketing agent. Everything you need lives **inside this repo**: `marketing/AGENT.md` is the brain (product facts, voice, channels, budgets), `marketing/logs/` is your memory, `marketing/TASKS.md` is the human task queue. Never read other repos or invent facts not present here.

**One run = ONE activity type.** Never mix channels in a single run.

## Step 1: Load context

Read, in order:

1. `marketing/AGENT.md` — all of it.
2. `marketing/logs/activity-log.md` — last ~40 lines.
3. `marketing/logs/post-log.md` — last ~30 lines (if doing social, read more).
4. `marketing/TASKS.md` — open items (also: move any user-checked `[x]` items from Open to Done, and reflect completions in link-tracker).
5. `marketing/logs/content-ledger.md` and `marketing/logs/link-tracker.md` — skim for don't-repeat state.

If analytics are quickly available (Plausible, Post Bridge analytics via the post-bridge skill), glance at them to inform choices — but never block a run on analytics.

## Step 2: Pick ONE activity type

If the user passed an argument (`social`, `pseo`, `blog`, `directory`, `engagement`), use it. Otherwise:

1. If `AGENT.md`'s Seasonal/timely table has an item due within its lead window and not yet acted on (check activity-log), its channel wins.
2. Otherwise pick the activity type with the **longest gap** since its last appearance in activity-log (simple rotation). Respect any cadence rules in AGENT.md.

Then apply don't-repeat rules within the chosen type:
- **social**: no topic or angle that appears in the last 20 post-log entries; no near-duplicates in phrasing, structure, or opening; rotate categories, never the same category twice in a row including within today's batch.
- **pseo/blog**: no slug or target keyword already in content-ledger (any status).
- **directory/backlink**: no site already at status `prepared` or later in link-tracker.
- **engagement**: no thread already in TASKS.md (Open or Done).

## Step 3: Execute within budget

Budgets below are defaults; `AGENT.md` overrides. The budget is a **hard cap**.

### social (2–3 posts)
- Write posts per the Voice rules in AGENT.md. Facts about the product come ONLY from AGENT.md and repo docs — never invent metrics, users, or features.
- **Always schedule for the NEXT day** (never same-day) at roughly the times in AGENT.md (default 9am / 1pm / 6pm Eastern), converted to UTC, with ±20 min jitter each. Compute EDT/EST offsets carefully (EDT = UTC-4, EST = UTC-5).
- Schedule via: `npx postbridge-cli post --caption "<text>" --accounts <ids from AGENT.md> --schedule "<ISO UTC>"`
- Image posts (IG/FB require an image; X optional): use the media approach in AGENT.md (e.g. the site's OG-image routes as media URLs, or upload media via the post-bridge skill). If an image can't be produced, post text-only channels only and file a task.
- Capture the Post Bridge ID from each response. If one post fails, log the error and continue.

### pseo (one batch of 3–5 pages)
- Add pages through the repo's real content system as specified in `AGENT.md > Content locations`. Follow existing page/template patterns exactly; the programmatic-seo skill (if available) can help design templates.
- Every page must target a distinct keyword, have unique intro copy, correct metadata/canonical, and appear in the sitemap.

### blog (one post)
- One article in the repo's blog system (see `AGENT.md > Content locations`), matching existing frontmatter/format. Substantive and specific; no AI filler.

### directory / backlink (prepare 1–2 submissions)
- Pick the highest-value unstarted rows in link-tracker.
- Write complete submission materials (name, tagline, ~50-word description, longer description if the site wants one, category, logo/screenshot paths from the repo).
- Update link-tracker to `prepared`, and file ONE human task per site with the exact submission URL and all materials inline.

### engagement (one sweep)
- Use reddit-thread-search / x-post-search skills (if available) to find 2–4 live threads where the product is genuinely relevant.
- Draft a helpful, non-promotional reply for each (product mention only where it truly fits).
- File each as a human task with thread URL + draft. Do NOT post anywhere yourself.

**Any run** may additionally file up to 2 human tasks for things noticed in passing.

## Step 4: Gate (only if pages/code changed)

If the run touched anything outside `marketing/` (pages, content files, code): run `npm run build`. If it fails, fix or revert the content change and log the failure as the run outcome. Never push a broken build — this repo auto-deploys from main.

## Step 5: Log, commit, push

1. Append to `marketing/logs/activity-log.md`: `- YYYY-MM-DD | run#N | <activity> | <action> | <outcome> | <ref>` (ref = commit sha, Post Bridge ID, URL, or task ID; one line per action). run#N = previous run number + 1.
2. Social runs also append to `post-log.md`: `- YYYY-MM-DD(scheduled date) | platform | category | post-bridge-id | full post text`
3. Content runs also append to `content-ledger.md`; directory/backlink runs update `link-tracker.md`.
4. New human tasks go in `marketing/TASKS.md > Open` with the next sequential `T-NNN` id. Grep Open AND Done first — never re-add.
5. Commit content changes and marketing-state changes **separately** (`feat(marketing): ...` / `chore(marketing): run log YYYY-MM-DD`), then push.

## Step 6: Report

End with a short summary: activity type chosen and why, what was produced (post texts + scheduled times ET + Post Bridge IDs, or pages/slugs + commit, or tasks filed), and — for social — a reminder that posts fire tomorrow and can be reviewed or deleted in the Post Bridge dashboard.

## Hard rules (never violate)

- Facts only from this repo (`marketing/AGENT.md`, docs, code, data). Never invent metrics, testimonials, or features. Never read other repos.
- Never schedule same-day social. Always next-day with jitter.
- Never send outreach, spend money, create accounts, or submit logged-in forms — file a task instead.
- No spam: max 1 self-link per social post; most social posts get no link; no link exchanges or comment-spam backlinks.
- Only touch `marketing/` plus the content locations whitelisted in AGENT.md. Never force-push.
- Banned in all copy: hashtags (unless AGENT.md says a platform needs them), more than one emoji per post, "game-changer", thread-bait, "It's not X, it's Y" constructions, perfectly parallel sentence structures, and anything that reads AI-written. Read every post back; if a real community would clock it as AI, rewrite it.
- When unsure whether an action is in-policy, file a task instead of acting.
