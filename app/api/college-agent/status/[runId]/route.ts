import { NextResponse } from 'next/server';
import { getCollegeAgentStatus } from '@/utils/college-agent/college-client';

export const maxDuration = 30;

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { runId: string } }
) {
    try {
        const status = await getCollegeAgentStatus(params.runId);
        console.log("Agent status:", JSON.stringify(status, null, 2));
        return NextResponse.json(status);
    } catch (error: any) {
        console.error('Error getting run status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get run status' },
            { status: 500 }
        );
    }
} 