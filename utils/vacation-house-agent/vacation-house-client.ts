import { BaseAgentClient, BaseAgentInput } from "../agentclient/base-agent-client";
import { VacationHouseAgentState } from "./types";

export interface VacationHouseInput extends BaseAgentInput {
    search_query: string;
}

export class VacationHouseClient extends BaseAgentClient {
    constructor() {
        super('vacation-house-agent');
    }

    async startVacationHouseAgent(input: VacationHouseInput) {
        return super.startAgent(input);
    }

    async getVacationHouseAgentState(runId: string): Promise<VacationHouseAgentState> {
        return super.getStatus(runId) as Promise<VacationHouseAgentState>;
    }
} 

export const vacationHouseClient = new VacationHouseClient();