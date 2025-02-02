import type React from "react"
import { PenToolIcon as Tool, Zap, Search, BarChart } from "lucide-react"

export interface ToolItem {
  name: string
  description: string
  icon: React.ElementType
  link: string
  sourceCodeLink?: string
  graphImageLink?: string
}

export const tools: ToolItem[] = [
  {
    name: "SaaS Marketing Agent",
    description: "Generate a marketing plan for your SaaS product.",
    icon: Zap,
    link: "/tools/saas-marketing-agent",
    sourceCodeLink: "https://github.com/apsquared/lg-agents/tree/main/src/agents/marketing_agent",
    graphImageLink: "https://github.com/apsquared/lg-agents/blob/main/marketing_agent_graph.png?raw=true",
  },
  {
    name: "College Finder Agent",
    description: "Find the best college for you.",
    icon: Search,
    link: "/tools/college-finder-agent",
  },
  {
    name: "Team Roster Agent",
    description: "Generate a team roster for your sports team.",
    icon: BarChart,
    link: "/tools/team-roster-agent",
  },

]

