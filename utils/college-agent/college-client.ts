import { BaseAgentClient } from "../agentclient/base-agent-client";
import { AgentState } from "../agentclient/schema/schema";
import { CollegeFinderInput } from "./type";

const COLLEGE_AGENT = 'college-finder-agent';

export class CollegeClient extends BaseAgentClient {
    constructor() {
        super(COLLEGE_AGENT);
    }

    async startCollegeAgent(input: CollegeFinderInput): Promise<AgentState> {
        return this.startAgent(input);
    }

    async getCollegeAgentStatus(runId: string): Promise<AgentState> {
        return this.getStatus(runId);
    }
}

// Create a singleton instance
export const collegeClient = new CollegeClient();
