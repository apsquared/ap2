import { NextResponse } from 'next/server';
import { AgentState } from '@/utils/agentclient/schema/schema';
import { createOrUpdateAgentState } from '@/utils/db/dbsave';

export async function POST(request: Request) {
    try {
        const agentState = await request.json() as AgentState;
        
        const result = await createOrUpdateAgentState(agentState);
        
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error creating/updating agent state:', error);
        return NextResponse.json(
            { error: 'Failed to create or update agent state' },
            { status: 500 }
        );
    }
}
