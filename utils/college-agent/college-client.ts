import { BaseAgentClient } from "../agentclient/base-agent-client";
import { AgentState } from "../agentclient/schema/schema";
import { CollegeFinderAgentState, CollegeFinderInput } from "./type";

const COLLEGE_AGENT = 'college-agent';

export class CollegeClient extends BaseAgentClient {
    constructor() {
        super(COLLEGE_AGENT);
    }

    async startCollegeAgent(input: CollegeFinderInput): Promise<CollegeFinderAgentState> {
        const response = await this.startAgent(input);
        return response as CollegeFinderAgentState;
    }

    async getCollegeAgentStatus(runId: string): Promise<CollegeFinderAgentState> {
        const response = await this.getStatus(runId);
        return response as CollegeFinderAgentState;
    }
}

// Create a singleton instance
export const collegeClient = new CollegeClient();
