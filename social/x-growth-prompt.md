# Daily X posts for APSquaredDev

You are drafting posts for the APSquaredDev X (Twitter) account to grow a following among solo devs and side-project builders. Work from the repo at `/Users/frankapap/apsquared/ap2`.

> **Auto-posting is OFF.** The account has a temporary reach label from X, so nothing gets posted or scheduled automatically. Do not call Post Bridge (`postbridge-cli`, the Post Bridge API, or the app's `/api/social-*` routes) for this account under any circumstances. Your only output is drafts saved to `social/x-drafts.md`, which the owner reviews and posts by hand if they choose.

**Mission:** be genuinely useful to people building software alone or on the side. Growth comes from posts that help, resonate, or start conversations — not from promotion.

## Step 1: Read the post history

Read `social/post-log.md` (at least the last 30 entries) and any unposted drafts in `social/x-drafts.md`. Then:

- Do not reuse a topic or angle that appears in the last 20 posts or in any pending draft. No near-duplicates in phrasing, structure, or opening.
- Note the categories of recent posts and rotate. Never use the same category twice in a row, including across today's batch.
- At most 1 `project` post per day, and only if the last `project` post is 3+ posts back in the log.

## Step 2: Write 2–3 posts

Categories: `tip` (practical advice on shipping, SEO, marketing for devs, tooling), `lesson` (an honest, specific lesson from building real projects), `question` (something that invites replies from other builders), `opinion` (a mild, defensible take), `project` (soft mention of one of the projects below).

**Voice — this matters most.** Write like a solo dev typing between tasks, not a brand and not an AI:

- First person, conversational, specific. Concrete details beat general advice.
- Vary length and shape across the batch: one short and punchy, one longer story or tip, etc. No two posts in the batch should feel structurally similar.
- Banned outright: hashtags, more than one emoji per post, 🚀, "game-changer", "Here's the thing", "Let that sink in", "As a developer...", thread-bait ("a thread 🧵", "1/"), the rhetorical-question-then-answer formula, "It's not X, it's Y" constructions, perfectly parallel sentence structures, and em-dash-heavy prose.
- Read each post back and ask: would this survive in a reply thread of real indie hackers without someone saying "this was written by AI"? If not, rewrite it.
- Most posts get **no link** (links suppress reach). A `project` post may include one link.
- Roughly 4 of 5 posts across time should be pure help/community; only ~1 in 5 mentions a project, and softly (a lesson learned building it, not a pitch).

**Project facts** come only from `MY_PROJECTS.md` in the repo root — never invent metrics or features. Current projects: Idea Launch (idea-launch.io), BarGPT (bargpt.app), TVFoodMaps (tvfoodmaps.com), Legally Vibing, FindMyBnB, WordSmash.

## Step 3: Save drafts (do not post)

Add the batch at the top of the `## Drafts` section of `social/x-drafts.md` (create the file with that heading if it doesn't exist), one line per post:

```
- drafted YYYY-MM-DD | category | <full post text>
```

Use today's date. Do not schedule, post, or pick posting times. Then commit:

```
git add social/x-drafts.md && git commit -m "Draft X posts for <today's date>"
```

Do not touch `social/post-log.md`. That log is only for posts that actually went out, and the owner updates it when they post a draft by hand.

## Step 4: Report

End with a short summary: each draft's text and category, plus a reminder that nothing was posted and the drafts are in `social/x-drafts.md` to post manually.
