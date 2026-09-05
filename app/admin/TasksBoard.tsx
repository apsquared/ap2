'use client';

import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  ASSIGNEES,
  type MarketingTask,
  type Resolution,
} from '@/utils/db/marketingTasksShared';
import { buildAgentPrompt, hasRepoSteps, involvesPayment } from '@/utils/marketingTaskPrompt';

type EffStatus = 'open' | 'completed' | 'skipped' | 'archived';
type StatusFilter = EffStatus | 'all';

/**
 * Effective status shown in the UI: an admin resolution (completed/skipped)
 * wins over the swept status; otherwise a repo-swept `done` reads as completed,
 * `archived` as archived, and everything else is still open (to do).
 */
function effStatus(t: MarketingTask): EffStatus {
  if (t.resolution === 'skipped') return 'skipped';
  if (t.resolution === 'completed' || t.status === 'done') return 'completed';
  if (t.status === 'archived') return 'archived';
  return 'open';
}

// A draft is introduced by a label that ends in a colon and is immediately
// followed by the opening quote — "Reply:", "DM <name> (<context>):",
// "Draft reply (post as-is…):", "Suggested first touch:", "New issue to X:".
const DRAFT_LABEL = /\b(?:reply|dm|draft reply|suggested first touch|new issue|message|comment)\b[^:\n]{0,80}:\s*(?=["“])/gi;

/**
 * Pull the draft message out of an outreach task's materials.
 *
 * The agents write drafts as a labelled, quoted block, usually with context
 * before it ("Why it fits: …") and a caveat after it ("Note: …"). Straight
 * quotes also appear *inside* the draft, so pairing quotes up is unreliable —
 * anchor on the last draft label and take the outermost span after it.
 * Returns null when there is nothing that looks like a quoted message.
 */
function extractOutreachMessage(materials: string): string | null {
  const text = (materials || '').trim();

  // Last label wins: the surrounding context can quote the thread it replies to.
  let labelEnd = -1;
  DRAFT_LABEL.lastIndex = 0;
  for (let m = DRAFT_LABEL.exec(text); m; m = DRAFT_LABEL.exec(text)) {
    labelEnd = m.index + m[0].length;
  }

  const first = labelEnd >= 0 ? labelEnd : text.search(/["“]/);
  if (first < 0) return null;
  let last = -1;
  for (let i = text.length - 1; i > first; i--) {
    if (text[i] === '"' || text[i] === '”') {
      last = i;
      break;
    }
  }
  if (last <= first) return null;
  // Drafts are indented under a bullet; strip that so the paste is clean.
  const message = text
    .slice(first + 1, last)
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
  return message || null;
}

/**
 * Clipboard fallback for when the async API is unavailable — an insecure
 * context (navigator.clipboard undefined) or a denied clipboard-write
 * permission. Still requires a user gesture, which a click handler satisfies.
 */
function legacyCopy(text: string): boolean {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

/**
 * Every task gets a paste-ready agent prompt, assembled from its own fields plus
 * any execution steps its repo's agent wrote. Building 100+ of them per render would
 * be wasted work, so they are built on first use and cached by task id (the
 * task list is only mutated through `patch`, which never touches prompt inputs).
 */
const promptCache = new Map<string, string>();

function promptFor(task: MarketingTask): string {
  const hit = promptCache.get(task._id);
  if (hit) return hit;
  const built = buildAgentPrompt(task);
  promptCache.set(task._id, built);
  return built;
}

function CopyButton({
  text,
  label,
  title,
  emphasis = false,
}: {
  // A thunk defers building the (long) agent prompt until it is actually copied.
  text: string | (() => string);
  label: string;
  title?: string;
  emphasis?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy(e: React.MouseEvent) {
    e.stopPropagation();
    const value = typeof text === 'function' ? text() : text;
    let ok = false;
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch {
      ok = legacyCopy(value);
    }
    if (!ok) {
      alert('Could not copy to the clipboard.');
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={title}
      aria-label={label}
      className={`rounded-lg border bg-black/20 dark:bg-white/5 px-2.5 py-1.5 text-xs font-medium outline-none transition-colors ${
        copied
          ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-300'
          : emphasis
            ? 'border-indigo-500/40 text-indigo-600 dark:text-indigo-300 hover:border-indigo-400'
            : 'border-soft text-muted hover:border-indigo-400'
      }`}
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}

const EFF_LABELS: Record<EffStatus, string> = {
  open: 'To do',
  completed: 'Completed',
  skipped: 'Skipped',
  archived: 'Archived',
};

const EFF_STYLES: Record<string, string> = {
  completed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  skipped: 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/30',
  archived: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const PRIORITY_STYLES: Record<string, string> = {
  P1: 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/30',
  P2: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  P3: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
};

const ASSIGNEE_STYLES: Record<string, string> = {
  Frank: 'text-indigo-600 dark:text-indigo-300 border-indigo-500/40',
  Mike: 'text-teal-600 dark:text-teal-300 border-teal-500/40',
  '': 'text-muted border-soft',
};

// Solid fills for the avatar chip shown on the collapsed row.
const ASSIGNEE_AVATAR: Record<string, string> = {
  Frank: 'bg-indigo-500 text-white',
  Mike: 'bg-teal-500 text-white',
  '': 'bg-transparent text-muted border border-dashed border-soft',
};

const RESOLUTION_STYLES: Record<string, string> = {
  '': 'text-muted border-soft',
  completed: 'text-emerald-600 dark:text-emerald-300 border-emerald-500/40',
  skipped: 'text-slate-500 dark:text-slate-400 border-slate-500/40',
};

function Avatar({ name }: { name: string }) {
  const initial = name ? name[0].toUpperCase() : '·';
  return (
    <span
      title={name || 'Unassigned'}
      aria-label={name || 'Unassigned'}
      className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-semibold shrink-0 ${
        ASSIGNEE_AVATAR[name] ?? ASSIGNEE_AVATAR['']
      }`}
    >
      {initial}
    </span>
  );
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function StatTile({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="glass rounded-2xl border-soft p-4">
      <div className={`font-display text-3xl font-bold ${accent ?? ''}`}>{value}</div>
      <div className="mt-1 text-xs text-muted uppercase tracking-wide">{label}</div>
    </div>
  );
}

/**
 * Who gets credit for a completed task: the resolver when the admin recorded
 * one, otherwise the current assignee (tasks swept as `done` from a repo have
 * no resolver). Empty string when nobody can be credited.
 */
function creditedTo(t: MarketingTask): string {
  return t.resolvedBy || t.assignedTo || '';
}

type PersonStats = {
  name: string;
  assigned: number; // every task currently assigned to them
  open: number; // …of those, still to do
  completed: number; // completions credited to them
};

const PERSON_ACCENTS: Record<string, string> = {
  Frank: 'text-indigo-600 dark:text-indigo-300',
  Mike: 'text-teal-600 dark:text-teal-300',
};

function PersonCard({ stats }: { stats: PersonStats }) {
  const { name, assigned, open, completed } = stats;
  const pct = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
  const accent = PERSON_ACCENTS[name] ?? 'text-muted';
  return (
    <div className="glass rounded-2xl border-soft p-4">
      <div className="flex items-center gap-2">
        <Avatar name={name} />
        <span className="font-medium">{name}</span>
        <span className="ml-auto text-xs text-muted">{pct}% done</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className={`font-display text-2xl font-bold ${accent}`}>{assigned}</div>
          <div className="mt-0.5 text-[11px] text-muted uppercase tracking-wide">Assigned</div>
        </div>
        <div>
          <div className="font-display text-2xl font-bold">{open}</div>
          <div className="mt-0.5 text-[11px] text-muted uppercase tracking-wide">To do</div>
        </div>
        <div>
          <div className="font-display text-2xl font-bold text-emerald-500 dark:text-emerald-400">
            {completed}
          </div>
          <div className="mt-0.5 text-[11px] text-muted uppercase tracking-wide">Completed</div>
        </div>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-black/20 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

/**
 * The paste-into-an-agent prompt for a task. Kept collapsed by default — it runs
 * a couple of screens long — but the copy button works without expanding it,
 * which is the common case: copy, paste into Claude or Codex, go.
 */
function AgentPrompt({ task }: { task: MarketingTask }) {
  const [show, setShow] = useState(false);
  const fromRepo = hasRepoSteps(task);
  const payment = involvesPayment(task);

  return (
    <div className="mt-2 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.06] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
          Agent prompt
        </span>
        <Badge className="border-soft text-muted">
          {fromRepo ? 'steps from the repo' : 'generated'}
        </Badge>
        {payment && (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
            ⚠ payment step — the prompt stops before paying
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShow((v) => !v);
            }}
            className="rounded-lg border border-soft bg-black/20 dark:bg-white/5 px-2.5 py-1.5 text-xs font-medium text-muted hover:border-indigo-400"
          >
            {show ? 'Hide' : 'Show'}
          </button>
          <CopyButton text={() => promptFor(task)} label="Copy prompt" emphasis />
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">
        Paste into Claude or Codex as-is. It carries the materials, tells the agent to use its
        browser tools, and hard-stops before any payment, credential, or public post.
      </p>
      {show && (
        <pre className="mt-3 max-h-96 overflow-auto rounded-lg border border-soft bg-black/20 dark:bg-black/30 p-3 text-[11px] leading-relaxed whitespace-pre-wrap break-words">
          {promptFor(task)}
        </pre>
      )}
    </div>
  );
}

export default function TasksBoard({ tasks }: { tasks: MarketingTask[] }) {
  const [list, setList] = useState<MarketingTask[]>(tasks);
  const [status, setStatus] = useState<StatusFilter>('open');
  const [project, setProject] = useState<string>('all');
  const [priority, setPriority] = useState<string>('all');
  const [assignee, setAssignee] = useState<string>('all'); // 'all' | 'Unassigned' | name
  const [query, setQuery] = useState<string>('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const projects = useMemo(() => Array.from(new Set(list.map((t) => t.project))).sort(), [list]);

  async function patch(id: string, payload: Partial<MarketingTask>, body: Record<string, unknown>) {
    const prev = list;
    setList((l) => l.map((t) => (t._id === id ? { ...t, ...payload } : t)));
    setSaving((s) => ({ ...s, [id]: true }));
    try {
      const res = await fetch(`/api/admin/tasks/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch {
      setList(prev); // revert on failure
      alert('Failed to save. Please try again.');
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  }

  function assign(id: string, value: string) {
    patch(id, { assignedTo: value as MarketingTask['assignedTo'] }, { assignedTo: value });
  }

  function resolve(id: string, value: string) {
    const task = list.find((t) => t._id === id);
    const resolution = value as Resolution;
    patch(
      id,
      {
        resolution,
        // Credit the current assignee ("assume they did it").
        resolvedBy: resolution ? task?.assignedTo || '' : '',
        resolvedAt: resolution ? new Date().toISOString() : undefined,
      },
      { resolution: value }
    );
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((t) => {
      if (status !== 'all' && effStatus(t) !== status) return false;
      if (project !== 'all' && t.project !== project) return false;
      if (priority !== 'all' && t.priority !== priority) return false;
      if (assignee !== 'all') {
        const who = t.assignedTo || 'Unassigned';
        if (who !== assignee) return false;
      }
      if (q) {
        const hay = `${t.title} ${t.materials} ${t.category} ${t.taskId}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [list, status, project, priority, assignee, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, MarketingTask[]>();
    for (const t of filtered) {
      if (!map.has(t.project)) map.set(t.project, []);
      map.get(t.project)!.push(t);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const openTasks = list.filter((t) => effStatus(t) === 'open');
  const openCount = openTasks.length;
  const p1 = openTasks.filter((t) => t.priority === 'P1').length;
  const completed = list.filter((t) => effStatus(t) === 'completed').length;
  const skipped = list.filter((t) => effStatus(t) === 'skipped').length;

  // Per-person KPI: what each of them is carrying and what they have closed
  // out. Counts the whole board, not the current filters.
  const perPerson = useMemo<PersonStats[]>(
    () =>
      ASSIGNEES.map((name) => {
        const mine = list.filter((t) => t.assignedTo === name);
        return {
          name,
          assigned: mine.length,
          open: mine.filter((t) => effStatus(t) === 'open').length,
          completed: list.filter((t) => effStatus(t) === 'completed' && creditedTo(t) === name)
            .length,
        };
      }),
    [list]
  );

  const selectClass =
    'rounded-lg border border-soft bg-black/20 dark:bg-white/5 px-3 py-2 text-sm outline-none focus:border-indigo-400';
  const chipSelect =
    'rounded-lg border bg-black/20 dark:bg-white/5 px-2.5 py-1.5 text-xs font-medium outline-none focus:border-indigo-400 disabled:opacity-50';

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <StatTile label="To do" value={openCount} accent="gradient-text" />
        <StatTile label="P1 to do" value={p1} accent="text-rose-500 dark:text-rose-400" />
        <StatTile label="Completed" value={completed} accent="text-emerald-500 dark:text-emerald-400" />
        <StatTile label="Skipped" value={skipped} accent="text-slate-400" />
      </div>

      {/* Per-person KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {perPerson.map((p) => (
          <PersonCard key={p.name} stats={p} />
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl border-soft p-4 mb-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search title or materials…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${selectClass} flex-1 min-w-[200px]`}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className={selectClass}>
          <option value="open">To do</option>
          <option value="completed">Completed</option>
          <option value="skipped">Skipped</option>
          <option value="archived">Archived</option>
          <option value="all">All statuses</option>
        </select>
        <select value={project} onChange={(e) => setProject(e.target.value)} className={selectClass}>
          <option value="all">All projects</option>
          {projects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass}>
          <option value="all">All priorities</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
        </select>
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={selectClass}>
          <option value="all">Anyone</option>
          <option value="Unassigned">Unassigned</option>
          {ASSIGNEES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted ml-auto">{filtered.length} shown</span>
      </div>

      {/* List */}
      {grouped.length === 0 ? (
        <div className="glass rounded-2xl border-soft p-10 text-center text-muted">
          No tasks match these filters.
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([proj, items]) => (
            <section key={proj}>
              <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
                {proj}
                <span className="text-sm font-normal text-muted">({items.length})</span>
              </h2>
              <div className="space-y-3">
                {items.map((t) => {
                  const isOpen = expanded[t._id];
                  const toggle = () => setExpanded((s) => ({ ...s, [t._id]: !s[t._id] }));
                  const eff = effStatus(t);
                  const resolved = eff === 'completed' || eff === 'skipped';
                  // Outreach tasks carry a draft message meant to be pasted
                  // into Reddit/X/email; give it a one-click copy.
                  const message =
                    t.category === 'outreach' ? extractOutreachMessage(t.materials) : null;
                  return (
                    <div key={t._id} className="glass gradient-border rounded-2xl overflow-hidden">
                      <div className="p-4 flex items-start gap-3">
                        <div
                          onClick={toggle}
                          className={`flex items-start gap-3 flex-1 min-w-0 cursor-pointer ${
                            resolved ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <Badge className={PRIORITY_STYLES[t.priority] || 'border-soft text-muted'}>
                              {t.priority}
                            </Badge>
                            <Badge className="border-soft text-muted">{t.category}</Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium leading-snug ${resolved ? 'line-through' : ''}`}>
                              {t.title}
                            </div>
                            <div className="mt-1 text-xs text-muted flex flex-wrap gap-x-3 gap-y-1 items-center">
                              <span>{t.taskId}</span>
                              <span>filed {t.filedDate}</span>
                              {eff !== 'open' && (
                                <Badge className={EFF_STYLES[eff] || 'border-soft'}>
                                  {EFF_LABELS[eff]}
                                  {eff === 'completed' && t.resolvedBy ? ` · ${t.resolvedBy}` : ''}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
                          <CopyButton
                            text={() => promptFor(t)}
                            label="Copy prompt"
                            emphasis
                            title="Copy a ready-to-paste prompt for Claude or Codex"
                          />
                          {message && (
                            <CopyButton
                              text={message}
                              label="Copy message"
                              title={message}
                            />
                          )}

                          <label className="sr-only" htmlFor={`resolution-${t._id}`}>
                            Task status
                          </label>
                          <select
                            id={`resolution-${t._id}`}
                            value={t.resolution || ''}
                            disabled={saving[t._id]}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => resolve(t._id, e.target.value)}
                            className={`${chipSelect} ${RESOLUTION_STYLES[t.resolution || '']}`}
                          >
                            <option value="">To do</option>
                            <option value="completed">✓ Completed</option>
                            <option value="skipped">Skipped</option>
                          </select>

                          <Avatar name={t.assignedTo || ''} />
                          <label className="sr-only" htmlFor={`assignee-${t._id}`}>
                            Assign task
                          </label>
                          <select
                            id={`assignee-${t._id}`}
                            value={t.assignedTo || ''}
                            disabled={saving[t._id]}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => assign(t._id, e.target.value)}
                            className={`${chipSelect} ${ASSIGNEE_STYLES[t.assignedTo || '']}`}
                          >
                            <option value="">Unassigned</option>
                            {ASSIGNEES.map((a) => (
                              <option key={a} value={a}>
                                {a}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={toggle}
                            aria-label={isOpen ? 'Collapse' : 'Expand'}
                            className="text-muted text-sm w-6 h-6 flex items-center justify-center"
                          >
                            {isOpen ? '−' : '+'}
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="px-4 pb-4 -mt-1">
                          {t.actionUrl && (
                            <a
                              href={t.actionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-ghost text-sm mb-3 break-all"
                            >
                              Open action link ↗
                            </a>
                          )}
                          <AgentPrompt task={t} />
                          {message && (
                            <div className="mt-2 rounded-xl border border-soft bg-black/10 dark:bg-white/5 p-3">
                              <div className="flex items-center justify-between gap-3 mb-2">
                                <span className="text-[11px] uppercase tracking-wide text-muted">
                                  Message to send
                                </span>
                                <CopyButton text={message} label="Copy" />
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{message}</p>
                            </div>
                          )}
                          {t.materials && (
                            <div className="prose prose-sm dark:prose-invert max-w-none mt-2 border-t border-soft pt-3">
                              <ReactMarkdown>{t.materials}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
