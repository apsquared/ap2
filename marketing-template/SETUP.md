# Scaffolding a Marketing Agent into a Project Repo

One-time checklist. After this, the repo is fully self-contained: its agent never reads ap2 or any other repo. Improvements discovered in a repo get back-ported here manually when generic.

## Steps

1. **Copy the skill**: `marketing-template/SKILL.md` → `<repo>/.claude/skills/marketing-run/SKILL.md` (verbatim — it's generic; the repo may let it diverge later).
2. **Create `marketing/`** in the repo:
   - `AGENT.template.md` → `marketing/AGENT.md`, then fill every `<placeholder>`:
     - Product paragraph + **real metrics** copied from `ap2/MY_PROJECTS.md` (this is the copy step — the agent never reads MY_PROJECTS.md at runtime).
     - Post Bridge account IDs from `ap2/MY_PROJECTS.md` social table.
     - Audience/voice + post categories (adapt from `ap2/social/x-growth-prompt.md`).
     - Content locations whitelist (real paths + pattern each follows).
     - Media/images approach (OG routes, public assets, generation guide).
     - Seasonal table relevant to the product.
   - `TASKS.template.md` → `marketing/TASKS.md` (fill product name).
   - `logs/*.md` → `marketing/logs/` (fill product name in headers).
3. **Seed `marketing/logs/link-tracker.md`** with `todo` rows relevant to this product, copied from `marketing-agent/website-product-submission-sites.md` (worthy + conditional-if-relevant) and any repo-local directory docs.
4. **Wire discovery**: add a short pointer in the repo's `CLAUDE.md` (create a minimal one if missing): "This repo has a marketing agent: run `/marketing-run` — see `marketing/AGENT.md`."
5. **Commit** everything to the repo.
6. **First supervised run**: `/marketing-run` with Frank watching. Verify: one activity type only, logs formatted right, build green before any content commit, next-day posts visible in Post Bridge dashboard, TASKS items executable in <5 min. Fix the repo's skill/AGENT.md from friction; back-port generic fixes here.

## Notes

- WordSmash shares X account 11494 (APSquaredDev) — its AGENT.md must carry the "≤1 project post per day, 3+ posts apart" rule and coordinate via its own post-log.
- WordSmash also needs basic SEO plumbing first (next-sitemap, metadata, plausible) before its agent can do content work.
