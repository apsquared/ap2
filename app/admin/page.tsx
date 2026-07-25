import { getMarketingTasks, type MarketingTask } from '@/utils/db/marketingTasks';
import TasksBoard from './TasksBoard';
import LogoutButton from './LogoutButton';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin · Task Tracker',
  description: 'Marketing task queue across all APSquared projects.',
};

export default async function AdminTasksPage() {
  let tasks: MarketingTask[] = [];
  let error: string | null = null;
  try {
    tasks = await getMarketingTasks();
  } catch (e: any) {
    error = e?.message || 'Failed to load tasks';
    tasks = [];
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="text-xs uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 font-medium">
            Admin
          </div>
          <LogoutButton />
        </div>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">
          Marketing <span className="gradient-text">Task Tracker</span>
        </h1>
        <p className="mt-2 text-muted max-w-2xl">
          Human task queue swept from every project&rsquo;s{' '}
          <code className="text-sm">marketing/TASKS.md</code>. Refresh the data by running the{' '}
          <code className="text-sm">sweep-tasks-to-mongo</code> skill.
        </p>
      </div>

      {error ? (
        <div className="glass rounded-2xl border-soft p-6 text-red-500">
          Could not load tasks: {error}
        </div>
      ) : (
        <TasksBoard tasks={tasks!} />
      )}
    </div>
  );
}
