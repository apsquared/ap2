import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/utils/db/mymongo';
import {
  MARKETING_TASKS_DB,
  MARKETING_TASKS_COLLECTION,
  normalizeAssignee,
} from '@/utils/db/marketingTasksShared';

// NOTE: this route is intentionally unauthenticated for now — the whole /admin
// surface (pages + these APIs) will be secured later via middleware.

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json().catch(() => ({}));
    const assignedTo = normalizeAssignee(body?.assignedTo);

    const client = await clientPromise;
    const col = client.db(MARKETING_TASKS_DB).collection(MARKETING_TASKS_COLLECTION);

    const res = await col.updateOne(
      { _id: params.id as any },
      { $set: { assignedTo, assignedAt: new Date() } }
    );

    if (res.matchedCount === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: params.id, assignedTo });
  } catch (error) {
    console.error('Error updating task assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
