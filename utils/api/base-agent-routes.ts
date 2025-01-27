import { NextResponse } from 'next/server';
import { BaseAgentClient } from '../agentclient/base-agent-client';

export const createStartRoute = (agentClient: BaseAgentClient) => {
    return async function POST(request: Request) {
        try {
            const body = await request.json();
            const response = await agentClient.startAgent(body);
            return NextResponse.json(response);
        } catch (error) {
            console.error('Error starting agent:', error);
            return NextResponse.json(
                { error: 'Failed to start agent' },
                { status: 500 }
            );
        }
    };
};

export const createStatusRoute = (agentClient: BaseAgentClient) => {
    return async function GET(
        request: Request,
        { params }: { params: { runId: string } }
    ) {
        try {
            const { runId } = params;
            const status = await agentClient.getStatus(runId);
            return NextResponse.json(status);
        } catch (error) {
            console.error('Error getting agent status:', error);
            return NextResponse.json(
                { error: 'Failed to get agent status' },
                { status: 500 }
            );
        }
    };
}; 