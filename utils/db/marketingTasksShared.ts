// Client-safe constants and types for marketing tasks. This module must NOT
// import the mongodb driver (or anything that does), because it is imported by
// the client component app/admin/TasksBoard.tsx.

// Keep in sync with .claude/skills/sweep-tasks-to-mongo/scripts/sweep-tasks.mjs
export const MARKETING_TASKS_DB = process.env.MARKETING_TASKS_DB || 'apsquared';
export const MARKETING_TASKS_COLLECTION =
  process.env.MARKETING_TASKS_COLLECTION || 'marketing_tasks';

export type TaskStatus = 'open' | 'done' | 'archived' | string;

// Assignment lives only in Mongo (not in the repos' TASKS.md) and is never
// written by the sweeper, so it persists across re-sweeps. Empty = unassigned.
export const ASSIGNEES = ['Frank', 'Mike'] as const;
export type Assignee = (typeof ASSIGNEES)[number] | '';

/** Validate/normalize an incoming assignee value; anything else → '' (unassigned). */
export function normalizeAssignee(value: unknown): Assignee {
  return (ASSIGNEES as readonly string[]).includes(value as string)
    ? (value as Assignee)
    : '';
}

// Admin-controlled resolution, stored only in Mongo and never written by the
// sweeper, so it survives re-sweeps. '' = unresolved (still to do).
export const RESOLUTIONS = ['completed', 'skipped'] as const;
export type Resolution = (typeof RESOLUTIONS)[number] | '';

/** Validate/normalize an incoming resolution value; anything else → '' (to do). */
export function normalizeResolution(value: unknown): Resolution {
  return (RESOLUTIONS as readonly string[]).includes(value as string)
    ? (value as Resolution)
    : '';
}

export interface MarketingTask {
  _id: string;
  project: string;
  projectSlug: string;
  projectUrl?: string;
  sourceDir?: string;
  taskId: string;
  filedDate: string;
  priority: string; // P1 | P2 | P3
  category: string;
  title: string;
  actionUrl: string;
  materials: string;
  /**
   * Ready-to-paste agent prompt written by the filing agent (`Prompt:` in
   * TASKS.md). Optional — when absent the admin board generates one from the
   * task's fields via utils/marketingTaskPrompt.
   */
  agentPrompt?: string;
  status: TaskStatus;
  assignedTo: Assignee;
  resolution: Resolution;
  resolvedBy?: Assignee;
  resolvedAt?: string;
  checked?: boolean;
  firstSeenAt?: string;
  lastSweptAt?: string;
}
