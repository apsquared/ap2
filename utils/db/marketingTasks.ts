import clientPromise from './mymongo';
import {
  MARKETING_TASKS_DB,
  MARKETING_TASKS_COLLECTION,
  normalizeAssignee,
  normalizeResolution,
  type MarketingTask,
} from './marketingTasksShared';

// Re-export the client-safe surface so existing server imports keep working.
export * from './marketingTasksShared';

/**
 * Load every task document from the marketing_tasks collection, serialized to
 * plain JSON-safe objects (Dates → ISO strings) so they can cross the
 * server→client boundary. Sorted by priority then filed date.
 *
 * Server-only: this imports the mongodb driver. Do not import it from a
 * client component — import from ./marketingTasksShared instead.
 */
export async function getMarketingTasks(): Promise<MarketingTask[]> {
  const client = await clientPromise;
  const col = client.db(MARKETING_TASKS_DB).collection(MARKETING_TASKS_COLLECTION);
  const docs = await col.find({}).sort({ priority: 1, filedDate: 1 }).toArray();

  return docs.map((d) => ({
    _id: String(d._id),
    project: d.project ?? '',
    projectSlug: d.projectSlug ?? '',
    projectUrl: d.projectUrl ?? '',
    sourceDir: d.sourceDir ?? '',
    taskId: d.taskId ?? '',
    filedDate: d.filedDate ?? '',
    priority: d.priority ?? '',
    category: d.category ?? '',
    title: d.title ?? '',
    actionUrl: d.actionUrl ?? '',
    materials: d.materials ?? '',
    agentPrompt: d.agentPrompt ?? '',
    status: d.status ?? 'open',
    assignedTo: normalizeAssignee(d.assignedTo),
    resolution: normalizeResolution(d.resolution),
    resolvedBy: normalizeAssignee(d.resolvedBy),
    resolvedAt: d.resolvedAt ? new Date(d.resolvedAt).toISOString() : undefined,
    checked: Boolean(d.checked),
    firstSeenAt: d.firstSeenAt ? new Date(d.firstSeenAt).toISOString() : undefined,
    lastSweptAt: d.lastSweptAt ? new Date(d.lastSweptAt).toISOString() : undefined,
  }));
}
