#!/usr/bin/env node
/**
 * sweep-tasks.mjs
 *
 * Sweeps the human task queue (`marketing/TASKS.md`) from every project listed
 * in ap2's MY_PROJECTS.md and upserts each task into a MongoDB collection so a
 * front end can track them.
 *
 * - Reads the authoritative project list from MY_PROJECTS.md (never hardcoded).
 * - Parses each repo's marketing/TASKS.md (both the ## Open and ## Done blocks).
 * - Upserts one document per task, keyed by `${projectSlug}:${taskId}`.
 * - Reconciles per project: a task that a SCAFFOLDED repo no longer lists is
 *   marked status "archived" (it was deleted from the file). Reconciliation is
 *   scoped to projects that were read successfully, so a bad path never wipes
 *   another project's tasks.
 *
 * Env (loaded from .env.local via dotenv):
 *   MONGODB_URI                 required — the shared apsquared cluster
 *   MARKETING_TASKS_DB          optional — default "apsquared"
 *   MARKETING_TASKS_COLLECTION  optional — default "marketing_tasks"
 *
 * Flags:
 *   --dry-run   parse and report only; make no writes to Mongo.
 *   --repo-root <path>  ap2 repo root (default: two levels up from this script).
 */

import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- args ----------------------------------------------------------------
const argv = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const repoRootFlag = argv.indexOf('--repo-root');
const REPO_ROOT =
  repoRootFlag !== -1 && argv[repoRootFlag + 1]
    ? path.resolve(argv[repoRootFlag + 1])
    : path.resolve(__dirname, '..', '..', '..', '..'); // .../ap2

dotenv.config({ path: path.join(REPO_ROOT, '.env.local') });

const DB_NAME = process.env.MARKETING_TASKS_DB || 'apsquared';
const COLLECTION = process.env.MARKETING_TASKS_COLLECTION || 'marketing_tasks';

// ---- helpers -------------------------------------------------------------
function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse the MY_PROJECTS.md markdown table.
 * Returns [{ name, url, sourceDir }] from the row with columns
 * | Project | URL | Source Directory | Description |.
 */
function parseProjects(md) {
  const rows = [];
  const lines = md.split('\n');
  let inTable = false;
  for (const line of lines) {
    if (/^\|\s*Project\s*\|/i.test(line)) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    if (!line.trim().startsWith('|')) {
      if (rows.length) break; // table ended
      continue;
    }
    if (/^\|[\s|:-]+\|?$/.test(line)) continue; // separator row
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 3) continue;
    const [name, url, sourceRaw] = cells;
    const sourceDir = sourceRaw.replace(/`/g, '').trim();
    if (!name || !sourceDir) continue;
    rows.push({ name, url: url === '—' ? '' : url, sourceDir });
  }
  return rows;
}

/**
 * Classify a project's scaffold state, mirroring the my-marketing-tasks skill.
 * Returns one of: 'scaffolded' | 'partial' | 'not-scaffolded' | 'unreadable'.
 */
function classify(sourceDir) {
  const tasksFile = path.join(sourceDir, 'marketing', 'TASKS.md');
  if (existsSync(tasksFile) && statSync(tasksFile).isFile()) return 'scaffolded';
  const marketingDir = path.join(sourceDir, 'marketing');
  const skillFile = path.join(sourceDir, '.claude', 'skills', 'marketing-run', 'SKILL.md');
  if (existsSync(marketingDir) || existsSync(skillFile)) return 'partial';
  if (existsSync(sourceDir) && statSync(sourceDir).isDirectory()) return 'not-scaffolded';
  return 'unreadable';
}

const TASK_HEADER =
  /^- \[( |x|X)\]\s*(T-\d+)\s*\|\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[^|]*?)\s*\|\s*(P\d)\s*\|\s*([^|]+?)\s*\|\s*(.+?)\s*$/;

/** Remove the common leading indentation from a block of lines. */
function dedent(lines) {
  const indents = lines
    .filter((l) => l.trim())
    .map((l) => (l.match(/^[ \t]*/) || [''])[0].length);
  const base = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(base)).join('\n').replace(/\s+$/, '');
}

/**
 * Parse a TASKS.md body into task objects. Captures both ## Open and ## Done.
 * Each task header is followed by indented continuation lines; a `URL:` marker
 * begins the action URL and a `Materials:` marker begins the materials block
 * (which may be an inline value and/or a multi-line bullet list). Lines are
 * routed to whichever field is currently active, so a bare `Materials:` line
 * followed by bullets is captured correctly.
 */
function parseTasks(md) {
  const lines = md.split('\n');
  const tasks = [];
  let section = null; // 'open' | 'done' | null
  let current = null;
  let field = null; // 'url' | 'materials' | null

  const flush = () => {
    if (current) {
      const inline = current._matInline;
      const block = dedent(current._matLines);
      current.materials = [inline, block].filter((s) => s && s.trim()).join('\n').trim();
      current.actionUrl = current.actionUrl.trim();
      delete current._matInline;
      delete current._matLines;
      tasks.push(current);
    }
    current = null;
    field = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    const header = line.match(/^##\s+(.+?)\s*$/);
    if (header) {
      flush();
      const h = header[1].toLowerCase();
      section = h.startsWith('open') ? 'open' : h.startsWith('done') ? 'done' : null;
      continue;
    }
    if (section == null) continue;

    const m = line.match(TASK_HEADER);
    if (m) {
      flush();
      const checked = m[1].toLowerCase() === 'x';
      current = {
        checked,
        taskId: m[2],
        filedDate: m[3].trim(),
        priority: m[4].trim(),
        category: m[5].trim(),
        title: m[6].trim(),
        actionUrl: '',
        materials: '',
        // Open + unchecked = live. Anything checked, or under ## Done, is done.
        status: section === 'done' || checked ? 'done' : 'open',
        rawSection: section,
        _matInline: '',
        _matLines: [],
      };
      field = null;
      continue;
    }

    if (!current) continue;

    const trimmed = line.trim();
    const urlM = trimmed.match(/^URL:\s*(.*)$/i);
    const matM = trimmed.match(/^Materials:\s*(.*)$/i);
    if (urlM) {
      current.actionUrl = urlM[1].trim();
      field = 'url';
    } else if (matM) {
      current._matInline = matM[1].trim();
      field = 'materials';
    } else if (field === 'materials') {
      current._matLines.push(line); // keep raw indent for dedent
    } else if (field === 'url' && trimmed) {
      current.actionUrl += (current.actionUrl ? ' ' : '') + trimmed;
    }
  }
  flush();
  return tasks;
}

// ---- main ----------------------------------------------------------------
async function main() {
  const projectsMd = await readFile(path.join(REPO_ROOT, 'MY_PROJECTS.md'), 'utf8');
  const projects = parseProjects(projectsMd);
  if (!projects.length) {
    throw new Error('No projects parsed from MY_PROJECTS.md — check the table format.');
  }

  const now = new Date();
  const sweepId = now.toISOString();
  const perProject = [];
  const allDocs = [];

  for (const p of projects) {
    const slug = slugify(p.name);
    const state = classify(p.sourceDir);
    const entry = { ...p, slug, state, open: 0, done: 0, docs: [] };

    if (state === 'scaffolded') {
      const md = await readFile(path.join(p.sourceDir, 'marketing', 'TASKS.md'), 'utf8');
      const tasks = parseTasks(md);
      for (const t of tasks) {
        const doc = {
          _id: `${slug}:${t.taskId}`,
          project: p.name,
          projectSlug: slug,
          projectUrl: p.url,
          sourceDir: p.sourceDir,
          taskId: t.taskId,
          filedDate: t.filedDate,
          priority: t.priority,
          category: t.category,
          title: t.title,
          actionUrl: t.actionUrl,
          materials: t.materials,
          status: t.status,
          checked: t.checked,
          lastSweptAt: now,
          sweepId,
        };
        entry.docs.push(doc);
        allDocs.push(doc);
        if (t.status === 'open') entry.open++;
        else entry.done++;
      }
    }
    perProject.push(entry);
  }

  // ---- report (always) ----
  const totalOpen = perProject.reduce((n, e) => n + e.open, 0);
  const scaffolded = perProject.filter((e) => e.state === 'scaffolded');
  console.log(
    `Parsed ${totalOpen} open task(s) across ${scaffolded.filter((e) => e.open > 0).length} of ${projects.length} project(s).`
  );
  for (const e of perProject) {
    const tag =
      e.state === 'scaffolded'
        ? `${e.open} open / ${e.done} done`
        : e.state === 'partial'
          ? 'agent mid-setup (no TASKS.md)'
          : e.state === 'not-scaffolded'
            ? 'no agent yet'
            : 'UNREADABLE — check path in MY_PROJECTS.md';
    console.log(`  - ${e.name} [${e.state}]: ${tag}`);
  }

  const unreadable = perProject.filter((e) => e.state === 'unreadable');
  if (unreadable.length) {
    console.warn(
      `\n! ${unreadable.length} unreadable source dir(s): ${unreadable.map((e) => e.name).join(', ')} — not reconciled.`
    );
  }

  if (DRY_RUN) {
    console.log('\n[dry-run] No writes performed.');
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not set — add it to .env.local before sweeping.');
  }

  // ---- write ----
  const client = new MongoClient(process.env.MONGODB_URI, {
    family: 4,
    connectTimeoutMS: 60000,
    serverSelectionTimeoutMS: 60000,
  });
  await client.connect();
  try {
    const col = client.db(DB_NAME).collection(COLLECTION);

    // Indexes for the tracking front end's common queries (idempotent).
    await col.createIndex({ status: 1, priority: 1 });
    await col.createIndex({ projectSlug: 1, status: 1 });

    let upserts = 0;
    if (allDocs.length) {
      const ops = allDocs.map((doc) => ({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: doc,
            $setOnInsert: { firstSeenAt: now },
          },
          upsert: true,
        },
      }));
      const res = await col.bulkWrite(ops, { ordered: false });
      upserts = (res.upsertedCount || 0) + (res.modifiedCount || 0) + (res.matchedCount || 0);
    }

    // Reconcile per successfully-read project only. Any doc for that project
    // NOT touched by this sweep was removed from the file → archive it.
    let archived = 0;
    for (const e of scaffolded) {
      const res = await col.updateMany(
        { projectSlug: e.slug, sweepId: { $ne: sweepId }, status: { $ne: 'archived' } },
        { $set: { status: 'archived', archivedAt: now, sweepId } }
      );
      archived += res.modifiedCount || 0;
    }

    console.log(
      `\nWrote to ${DB_NAME}.${COLLECTION}: ${allDocs.length} task doc(s) upserted, ${archived} stale doc(s) archived.`
    );
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('sweep-tasks failed:', err.message);
  process.exit(1);
});
