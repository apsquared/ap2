import { AgentState } from "../agentclient/schema/schema";

/**
 * Represents a user persona with name and description
 */
export interface Persona {
    name: string;
    description: string;
  }
  
  /**
   * Represents a competitor with name, description and URL
   */
  export interface Competitor {
    name: string;
    description: string;
    url: string;
  }
  
  /**
   * Input parameters for marketing plan generation
   */
  export interface MarketingInput {
    appName: string;
    appUrl: string;
    max_personas?: number; // Optional with default value of 2
    competitor_hint?: string | null;
  }
  
  /**
   * Represents the complete state of a marketing plan
   */
  export interface MarketingPlanState {
    appName: string; 
    appUrl: string | null;
    competitor_hint: string | null;
    appDescription: string;
    keyfeatures: string[];
    value_proposition: string;
    max_personas: number;
    human_feedback: string;
    personas: Persona[];
    competitors: Competitor[];
    keywords: string[];
    tagline: string;
    subreddits: string[];
    marketing_suggestions: string[];
    search_results: any[];
  }
  
  export interface MarketingAgentState extends AgentState {
    current_state: MarketingPlanState;
}