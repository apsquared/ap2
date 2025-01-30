import { BaseAgentClient } from "../agentclient/base-agent-client";
import { RosterAgentInput, TeamRosterAgentState } from "./types";

const TEAM_ROSTER_AGENT = 'team-roster-agent';

export class TeamRosterClient extends BaseAgentClient {
    constructor() {
        super(TEAM_ROSTER_AGENT);
    }

    async startTeamRosterAgent(input: RosterAgentInput): Promise<TeamRosterAgentState> {
        const response = await this.startAgent(input);
        return response as TeamRosterAgentState;
    }

    async getTeamRosterAgentStatus(runId: string): Promise<TeamRosterAgentState> {
        const response = await this.getStatus(runId);
        return response as TeamRosterAgentState;
    }
}

// Create a singleton instance
export const teamRosterClient = new TeamRosterClient();

