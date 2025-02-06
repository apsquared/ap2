import { AgentState } from "../agentclient/schema/schema";


export interface BusinessInfo {
    name: string;
    address: string;
    type: string;
    distanceFromHome: string;
}

export interface VacationHomes {
    address: string;
    price: string;
    link: string;
    why_it_matches: string;
    walk_score: string;
    bars_and_restaurants: BusinessInfo[];
    coffee_shops: BusinessInfo[];
}

export interface CityInfo {
    city: string;
    state: string;
    price_range: string;
    why_it_matches: string;
    short_term_rental_info: string;
    homes: VacationHomes[];
}

export interface CandidateCities {
    cities: CityInfo[];
}

export interface HomeMatches {
    homes: VacationHomes[];
}

export interface ResultSummary {
    summary: string;
    candidate_cities: CityInfo[];
}

export interface VacationHousePlanState {
    raw: string;
    json_dict: ResultSummary;
}

export interface VacationHouseAgentState extends AgentState {
    current_state: VacationHousePlanState;
}