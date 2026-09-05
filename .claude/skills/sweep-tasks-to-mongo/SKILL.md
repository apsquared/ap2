---
name: sweep-tasks-to-mongo
description: Sweep the human task queues (marketing/TASKS.md) from every APSquared project listed in MY_PROJECTS.md and upsert them into a MongoDB collection so a front end can track the TODOs in one place. Reads the project list, parses each repo's Open and Done tasks, and writes one document per task with per-project reconciliation. Use when asked to "sweep tasks to mongo", "sync the todos to the database", "update the task tracker DB", or refresh the data behind the task-tracking front end. Writes to MongoDB — not read-only.
---

# Sweep Tasks to Mongo

Collect the human task queues that each APSquared project's marketing agent files into its own `marketing/TASKS.md`, and load them into a single MongoDB collection that a tracking front end reads. Unlike `my-marketing-tasks` (which only reports to chat), this skill **writes to the database**.

The heavy lifting is a deterministic Node script — do not re-implement parsing or Mongo writes by hand in chat.

## What it does

`scripts/sweep-tasks.mjs`:

1. Reads `MY_PROJECTS.md` in this repo (ap2) — the **Source Directory** column is the authoritative, never-hardcoded project list.
2. For every project, classifies scaffold state (`scaffolded` / `partial` / `not-scaffolded` / `unreadable`) exactly like the `my-marketing-tasks` skill.
3. For each `scaffolded` project, parses `marketing/TASKS.md` — both the `## Open` and `## Done` blocks — into one document per task, preserving the `URL:` action link, the full `Materials:` block (including multi-line bullet lists), and an optional `Prompt:` block.
4. Upserts each task into MongoDB keyed by a stable `_id` of `${projectSlug}:${taskId}` (e.g. `bargpt:T-001`), so re-running is idempotent and edits update in place.
5. **Reconciles per project:** any document for a successfully-read project that this sweep did not touch (the task was deleted from the file) is marked `status: "archived"`. Reconciliation is scoped per project, so a bad path or unreadable repo never wipes another project's tasks.

## How to run

From the ap2 repo root:

```bash
node .claude/skills/sweep-tasks-to-mongo/scripts/sweep-tasks.mjs
```

Preview parsing without writing anything:

```bash
node .claude/skills/sweep-tasks-to-mongo/scripts/sweep-tasks.mjs --dry-run
```

The script loads `MONGODB_URI` from `.env.local` (the shared `apsquared-template` cluster) via `dotenv`, and depends only on packages already in this repo (`mongodb`, `dotenv`). It prints a per-project summary and the write counts. Relay that summary to the user; call out any `unreadable` project explicitly (bad path in `MY_PROJECTS.md`) rather than treating it as "no agent yet".

## Storage

- **Database:** `apsquared` (override with `MARKETING_TASKS_DB`)
- **Collection:** `marketing_tasks` (override with `MARKETING_TASKS_COLLECTION`)

Document shape (one per task):

| Field | Meaning |
|---|---|
| `_id` | `${projectSlug}:${taskId}` — stable across sweeps |
| `project`, `projectSlug`, `projectUrl` | from MY_PROJECTS.md |
| `sourceDir` | repo path the task came from |
| `taskId` | `T-NNN` (unique within its project) |
| `filedDate` | `YYYY-MM-DD` the agent filed it |
| `priority` | `P1` / `P2` / `P3` |
| `category` | free text — e.g. `directory`, `outreach`, `engagement`, `account`, `other` |
| `title` | short imperative title |
| `actionUrl` | the exact URL to act on |
| `materials` | full inline materials block (markdown, newlines preserved) |
| `agentPrompt` | the task's `Prompt:` block — task-specific execution steps written by the owning repo's agent. Optional: the admin board assembles the full paste-ready prompt in `utils/marketingTaskPrompt.ts`, using these steps when present and generic per-category steps when not. |
| `status` | `open` (live), `done` (checked or under ## Done), or `archived` (removed from file) |
| `checked` | whether the checkbox was ticked |
| `firstSeenAt` | first sweep that saw this task (set once) |
| `lastSweptAt`, `sweepId` | most recent sweep timestamp / id |

Indexes created automatically: `{ status, priority }` and `{ projectSlug, status }`.

The front end should typically query `{ status: "open" }` sorted by `priority` then `filedDate`.

## Hard rules

- The **source of truth is the repos**, not Mongo. Each task's real state lives in the owning repo's `marketing/TASKS.md`; this collection is a projection refreshed by re-running the sweep. Never edit a repo's `TASKS.md` from this skill — completing/moving tasks is the job of each repo's own `/marketing-run`.
- Only read `MY_PROJECTS.md` and each listed project's `marketing/TASKS.md`. Do not traverse the rest of any repo, and never read a repo not listed in `MY_PROJECTS.md`.
- Never hardcode the project list or invent tasks, priorities, or URLs — the script parses exactly what the files contain.
- The script writes to the shared production cluster. If the user only wants to see what would change, use `--dry-run` first.
