import { AgentClient } from "../agentclient/client/client";
import { AgentState } from "../agentclient/schema/schema";
import { MarketingInput } from "./types";


const baseUrl = process.env.AGENT_BASE_URL || 'http://localhost:8123';

const MARKETING_AGENT = 'marketing-agent'; 

export async function startMarketingAgent(input: MarketingInput):Promise<AgentState> {
    const client = new AgentClient(baseUrl, MARKETING_AGENT,30000, true);
    await client.updateAgent(MARKETING_AGENT);

try {
    // Ensure we have agent info
    //await client.retrieveInfo();

        // Start an agent run with a simple message
        console.log('Starting agent run...');
        const startResponse = await client.startAgentRun(
            null,
            input, 
            null, // use default model
            null  // no thread ID -- will get generated by agent
        );
        
        console.log('Run started with ID:', startResponse.run_id);
        return startResponse;
    } catch (error) {
        console.error('Error starting agent run:', error);
        throw error;
    }
}

export async function getMarketingAgentStatus(runId: string):Promise<AgentState> {
    const client = new AgentClient(baseUrl, MARKETING_AGENT,30000, true);
    await client.updateAgent(MARKETING_AGENT);
    
    return await client.getRunStatus(runId);
}
