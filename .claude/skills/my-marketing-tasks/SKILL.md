---
name: my-marketing-tasks
description: Collect and report the open human tasks that this repo's marketing agents have filed across all tracked APSquared projects. Reads MY_PROJECTS.md for the project list, then each project's marketing/TASKS.md, and reports the open items grouped by project. Use when asked "what are my marketing tasks", "any marketing tasks", "what do the marketing agents need from me", or to review the task queue across projects. Read-only — never edits or commits.
---

# My Marketing Tasks

You are the central task-collector for Frank's per-repo marketing agents. Each tracked project runs its own `/marketing-run` agent (see `marketing-template/SKILL.md`) that files human tasks into its own `marketing/TASKS.md`. This skill sweeps every project and reports back the open items in one place.

**This skill is read-only.** Never edit, create, commit, or run `/marketing-run` in any repo. You only read and report. If Frank wants to act on or complete a task, that happens in the owning repo's own agent.

## Step 1: Get the project list

Read `MY_PROJECTS.md` in this repo (ap2). The **Source Directory** column of the projects table is the authoritative list of tracked project repos. Extract each project's name and its source directory path.

Do not hardcode paths or invent projects — always read the current table, since projects get added over time.

## Step 2: Sweep each project's tasks

Determine each project's scaffold state with **one deterministic pass** rather than ad-hoc per-file checks — a flaky existence probe once mislabeled fully-scaffolded projects as missing. For every source dir from Step 1, classify it into exactly one of three states and print the `Open` section in the same command, e.g.:

```bash
for dir in <source-dir-1> <source-dir-2> ...; do
  f="$dir/marketing/TASKS.md"
  echo "########## $dir ##########"
  if [ -f "$f" ]; then
    echo "[SCAFFOLDED]"
    awk '/^## Open/{p=1;next} /^## Done/{p=0} p' "$f"
  elif [ -d "$dir/marketing" ] || [ -f "$dir/.claude/skills/marketing-run/SKILL.md" ]; then
    echo "[PARTIAL] has marketing/ or marketing-run skill but no TASKS.md"
  elif [ -d "$dir" ]; then
    echo "[NOT-SCAFFOLDED] repo exists, no marketing agent"
  else
    echo "[UNREADABLE] source dir not found — do NOT report as not-scaffolded"
  fi
done
```

Then interpret the output:

- **`[SCAFFOLDED]`:** parse the `## Open` block. Each open task is a `- [ ]` line:
  ```
  - [ ] T-NNN | YYYY-MM-DD | P1|P2|P3 | directory|outreach|account|other | Short title
        URL: <exact url>
        Materials: <inline>
  ```
  Also note any `- [x]` items still sitting in `## Open` — done-but-not-yet-swept (the owning agent moves them to Done on its next run). Flag those as "awaiting sweep".
- **`[PARTIAL]`:** the agent is mid-scaffold. Report it distinctly — do not lump it with fully-missing projects.
- **`[NOT-SCAFFOLDED]`:** the repo is there but has no marketing agent. Normal — report as "no agent yet".
- **`[UNREADABLE]`:** the source dir couldn't be found/read. This is an **error, not a "not scaffolded" verdict** — surface it explicitly so a bad path or permissions issue never masquerades as a missing agent. Do not silently drop it.

Read only `marketing/TASKS.md` (plus the existence checks above) in each repo. Do not traverse the rest of the project, and do not read any repo not listed in `MY_PROJECTS.md`.

## Step 3: Report

Lead with a one-line summary: total open tasks across N projects (e.g. "5 open marketing tasks across 2 of 6 projects").

Then, **only for projects that have open tasks**, list them grouped by project, sorted by priority (P1 → P3):

```
### <Project Name> (<N> open)
- **T-001** · P1 · outreach · Short title
  <exact url>
  <one-line gist of the materials>
```

Keep each task tight — Frank should be able to scan the whole queue fast. Include the exact URL (it's usually the action) and a short gist of the Materials; don't paste long material blocks verbatim unless asked. Preserve the `T-NNN` id and priority so Frank can find it in the owning repo.

After the grouped tasks, add a short **Status** footer:
- Projects with an empty queue: list names as "clear".
- Projects not scaffolded yet (`[NOT-SCAFFOLDED]`): list names as "no agent yet".
- Partially scaffolded (`[PARTIAL]`): list names as "agent mid-setup (no TASKS.md yet)".
- Any `[x]` items awaiting sweep: note the project and count.
- Any `[UNREADABLE]` source dirs: call them out explicitly as **could not read — check the path in MY_PROJECTS.md**. Never fold these into "no agent yet".

If there are zero open tasks anywhere, say so plainly and list which projects were checked.

## Hard rules

- Read-only. Never edit, check boxes, move items, commit, or push. Completing/moving tasks is the job of each repo's own `/marketing-run`.
- Only read `MY_PROJECTS.md` (this repo) and each listed project's `marketing/TASKS.md` (plus the lightweight existence checks in Step 2). Nothing else.
- A missing `marketing/` directory is normal (not every project is scaffolded) — report it, don't treat it as an error. But a source dir you **cannot read** is an error, not a "not scaffolded" verdict — surface it (`[UNREADABLE]`).
- Trust the deterministic Step 2 pass. If a result looks surprising (a known-scaffolded project reports missing), re-run the check before reporting rather than accepting a single flaky probe.
- Don't invent tasks, priorities, or URLs. Report exactly what the files contain.
