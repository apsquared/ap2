import { BaseAgentClient } from "../agentclient/base-agent-client";
import { MarketingAgentState, MarketingInput, MarketingPlanState } from "./types";



const MARKETING_AGENT = 'marketing-agent';

export class MarketingClient extends BaseAgentClient {
    constructor() {
        super(MARKETING_AGENT);
    }

    async startMarketingAgent(input: MarketingInput): Promise<MarketingAgentState> {
        const response = await this.startAgent(input);
        return response as MarketingAgentState;
    }

    async getMarketingAgentStatus(runId: string): Promise<MarketingAgentState> {
        const response = await this.getStatus(runId);
        return response as MarketingAgentState;
    }
}

// Create a singleton instance
export const marketingClient = new MarketingClient();
