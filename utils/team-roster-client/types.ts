import { AgentState, AgentStatus } from "../agentclient/schema/schema";

export interface Player {
    name: string;
    height?: string;
    hometown?: string;
    position?: string;
    handedness?: string;
    velocity?: string;
    pg_grade?: string;
    links: string[];
}

export interface Team {
    team_name: string;
    players: Player[];
}

export interface RosterAgentInput {
    college_name: string;
}

export interface TeamRosterState extends AgentState {
    run_id: string;
    thread_id: string;
    status: AgentStatus;
    start_time: Date;
    last_update: Date;
    current_state: Record<string, any>;
    college_name: string;
    roster_url: string | null;
    team: Team | null;
    summary: string | null;
}
