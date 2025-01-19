import { NextResponse } from 'next/server';
import { getMarketingAgentStatus } from '@/utils/marketing-agent/marketing-client';


export async function GET(
    request: Request,
    { params }: { params: { runId: string } }
) {
    try {
        const status = await getMarketingAgentStatus(params.runId);
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