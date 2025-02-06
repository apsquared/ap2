import type React from "react"
import { PenToolIcon as Tool, Zap, Search, BarChart, Home } from "lucide-react"

export interface ToolItem {
  name: string
  description: string
  icon: React.ElementType
  link: string
  agentType: "langgraph" | "crewai"
}

export const tools: ToolItem[] = [
  {
    name: "SaaS Marketing Agent",
    description: "Generate a marketing plan for your SaaS product.",
    icon: Zap,
    link: "/tools/saas-marketing-agent",
    agentType: "langgraph"
  },
  {
    name: "College Finder Agent",
    description: "Find the best college for you.",
    icon: Search,
    link: "/tools/college-finder-agent",
    agentType: "langgraph"
  },
  {
    name: "Baseball Roster Agent",
    description: "Get insights on a college baseball roster.",
    icon: BarChart,
    link: "/tools/team-roster-agent",
    agentType: "langgraph"
  },
  {
    name: "Vacation House Agent",
    description: "Our agent finds the right city and home for your vacation house.",
    icon: Home,
    link: "/tools/vacation-house-agent",
    agentType: "crewai"
  }

]

