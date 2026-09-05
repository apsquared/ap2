# Teach a project's marketing agent the new task format

One-off, run **once per scaffolded project repo**. It updates that repo's own
instructions so every task the agent files **from now on** carries a `Prompt:`
block — the task-specific execution steps for the AI agent that will work it.

Existing tasks are left exactly as they are. The admin board falls back to generic
per-category steps for any task without a `Prompt:` block, so the old queue keeps
working untouched.

**How to use:** open Claude Code or Codex with the project repo as the working
directory, then paste everything below the horizontal rule as one message. Run it
in each project listed in `MY_PROJECTS.md` that has a `marketing/TASKS.md`.

---

You are this repo's marketing agent, doing one small maintenance pass **on your own
instructions**. This is not a marketing run: file nothing, post nothing, publish
nothing. Do not touch a single existing task.

**What changed.** The APSquared admin board now turns each task in
`marketing/TASKS.md` into a paste-ready prompt for Claude or Codex. The board
already supplies the framing, the product and repo context, the `Materials:`
verbatim, instructions to use real browser tooling, the hard stops (never spend
money, never enter credentials, never post publicly without approval), and the
closing report step. The one part it cannot write is the **task-specific execution
steps** — that is the new `Prompt:` field, and it replaces the board's generic
per-category steps.

Your job is to update two files so future runs file tasks in that format.

## 1. `marketing/TASKS.md` — the header only

Update the format block at the top of the file so it reads:

    ```
    - [ ] T-001 | YYYY-MM-DD | P1|P2|P3 | directory|outreach|account|other | Short imperative title
          URL: <exact url>
          Materials: <everything needed, inline>
          Prompt: <task-specific execution steps for the AI agent that will work it>
    ```

and add this note directly beneath it (adapt the wording to match the file's
existing tone, keep the substance):

> Every task is handed to an AI agent from the admin board, which assembles a
> paste-ready prompt from the task: the materials verbatim, an instruction to use
> real browser tooling, and hard stops before any payment, credential, or public
> post. Those are always supplied — never restate them here.
>
> `Prompt:` is the one part the board can't write: the task-specific execution
> steps, which replace its generic per-category steps. Write 3–8 numbered lines
> covering what will block the agent (login wall, moderation queue, listing fee),
> the exact repo-grounded values (verified asset paths, account handles, files to
> edit, category choices), what "done" looks like, and when to skip instead of act.
> Anything you'd write identically on ten tasks is boilerplate — leave it out.
> Never instruct the agent to pay, create an account, or post publicly without
> approval.
>
> Format: `Prompt:` comes last, indented like `URL:` and `Materials:`. A parser
> reads this file, so never begin a line inside the block with `URL:` or
> `Materials:` (write "Target URL —" instead), and never with `- [ ]` or `## `.

**Everything below `## Open` stays byte-for-byte identical.** Do not backfill,
reformat, renumber, complete, or reorder any existing task, and do not touch
`## Done`.

## 2. `.claude/skills/marketing-run/SKILL.md` — the task-filing step

Find the step under "Log, commit, push" about filing new human tasks in
`marketing/TASKS.md`. Fold this requirement into it:

> Assume every task will be worked by an AI agent: the admin board turns each one
> into a paste-ready prompt, so **the materials must be self-contained** (exact
> URL, every value the form or reply needs, verified repo-relative asset paths).
> Add a `Prompt:` block with 3–8 lines of task-specific execution steps — what will
> block the agent, the exact values and paths, what "done" looks like. The board
> already supplies the framing, browser instructions, and the hard stops (no
> spending, no credentials, no publishing without approval), so never restate
> those. See the format note at the top of `TASKS.md`.

If your copy of the skill has diverged from the shared template, keep your local
wording and phrasing — fold the requirement in rather than pasting over what's
there. The requirement is what matters, not the sentence.

While you're in the file, check the hard-rules section still reflects that you
never spend money, create accounts, or submit logged-in forms yourself — a task is
filed instead. Leave it alone if it already does.

## 3. Nothing else

No other file changes. No new tasks, no posts, no content, no logs — this pass
produces no activity-log entry because no marketing activity happened.

## 4. Verify, then commit

- `git status` shows exactly two modified files: `marketing/TASKS.md` and
  `.claude/skills/marketing-run/SKILL.md`.
- `git diff marketing/TASKS.md` touches **only** the header above `## Open`. If a
  single task line appears in that diff, undo it.
- The `- [ ]` and `- [x]` line counts are unchanged.

Then commit `chore(marketing): require execution prompts on new tasks` and push,
the same way you push any marketing-state change.

## 5. Report

Two lines: what changed in each file. Note whether your skill file's wording had
diverged enough that you had to adapt the requirement rather than paste it.
