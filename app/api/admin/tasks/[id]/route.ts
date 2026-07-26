import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/utils/db/mymongo';
import {
  MARKETING_TASKS_DB,
  MARKETING_TASKS_COLLECTION,
  normalizeAssignee,
  normalizeResolution,
} from '@/utils/db/marketingTasksShared';

// The /admin surface (pages + these APIs) is guarded by middleware.ts.
// This route updates admin-only fields — assignee and resolution — that the
// sweeper never writes, so they persist across re-sweeps.

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json().catch(() => ({}));

    // Build a $set stage from whichever fields were provided. Uses an
    // aggregation-pipeline update so resolvedBy can be derived from the task's
    // current assignee ("assume they did it").
    const set: Record<string, unknown> = {};

    if ('assignedTo' in body) {
      set.assignedTo = normalizeAssignee(body.assignedTo);
      set.assignedAt = '$$NOW';
    }

    if ('resolution' in body) {
      const resolution = normalizeResolution(body.resolution);
      set.resolution = resolution;
      // On resolve, snapshot who it was assigned to and when. On un-resolve, clear.
      set.resolvedBy = resolution ? '$assignedTo' : '';
      set.resolvedAt = resolution ? '$$NOW' : null;
    }

    if (Object.keys(set).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    const client = await clientPromise;
    const col = client.db(MARKETING_TASKS_DB).collection(MARKETING_TASKS_COLLECTION);

    const res = await col.updateOne({ _id: params.id as any }, [{ $set: set }]);

    if (res.matchedCount === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: params.id });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
