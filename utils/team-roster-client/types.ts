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

export interface TeamRosterState {
    college_name: string;
    roster_url: string | null;
    team: Team | null;
    summary: string | null;
}
