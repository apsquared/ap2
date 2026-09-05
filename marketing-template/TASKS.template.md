# Marketing Tasks — <PRODUCT NAME>

Human task queue, written by the marketing agent for Frank. Every task must be executable in under 5 minutes: exact URL plus all materials inline. Sequential `T-NNN` ids, never reused.

Frank: check the box when done (add the live URL if there is one). The agent moves checked items to Done on its next run and updates `logs/link-tracker.md`.

Format:

```
- [ ] T-001 | YYYY-MM-DD | P1|P2|P3 | directory|outreach|account|other | Short imperative title
      URL: <exact url>
      Materials: <everything needed, inline>
      Prompt: <task-specific execution steps for the AI agent that will work it>
```

Every task is handed to an AI agent from the admin board (apsquared.co/admin), which
assembles a paste-ready prompt from the task: the materials verbatim, an instruction to
use real browser tooling, and hard stops before any payment, credential, or public post.
Those are always supplied — never restate them here.

`Prompt:` is the one part the board can't write: the **task-specific** execution steps,
which replace its generic per-category steps. Write 3–8 numbered lines covering what will
block the agent (login wall, moderation queue, listing fee), the exact repo-grounded
values (verified asset paths, account handles, files to edit, category choices), what
"done" looks like, and when to skip instead of act. Anything you'd write identically on
ten tasks is boilerplate — leave it out. Never instruct the agent to pay, create an
account, or post publicly without approval.

Format: `Prompt:` comes last, indented like `URL:` and `Materials:`. A parser reads this
file, so never begin a line inside the block with `URL:` or `Materials:` (write "Target
URL —" instead), and never with `- [ ]` or `## `.

## Open

## Done
