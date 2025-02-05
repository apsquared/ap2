import { AgentState } from "../agentclient/schema/schema";

export interface VacationHousePlanState {
    search_query: string;
    raw: string;
}

export interface VacationHouseAgentState extends AgentState {
    current_state: VacationHousePlanState;
}