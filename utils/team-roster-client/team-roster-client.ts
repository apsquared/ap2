import { BaseAgentClient } from "../agentclient/base-agent-client";
import { AgentState } from "../agentclient/schema/schema";
import { RosterAgentInput } from "./types";

const TEAM_ROSTER_AGENT = 'team-roster-agent';

export class TeamRosterClient extends BaseAgentClient {
    constructor() {
        super(TEAM_ROSTER_AGENT);
    }

    async startTeamRosterAgent(input: RosterAgentInput): Promise<AgentState> {
        return this.startAgent(input);
    }

    async getTeamRosterAgentStatus(runId: string): Promise<AgentState> {
        return this.getStatus(runId);
    }
}

// Create a singleton instance
export const teamRosterClient = new TeamRosterClient();

