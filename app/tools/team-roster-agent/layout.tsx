import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Roster AI Agent",
  description: "Generate optimized team rosters with our AI-powered tool. Get personalized team composition recommendations based on player stats, positions, and team requirements.",
  keywords: [
    "team roster",
    "roster generator",
    "team composition",
    "team planning",
    "roster optimization",
    "team management",
    "player selection",
    "sports analytics"
  ],
  openGraph: {
    title: "Team Roster AI Agent",
    description: "AI-powered tool to optimize your team roster based on player stats and team requirements",
    type: "website",
    images: [{
      url: "/og-team-roster.png",
      width: 1200,
      height: 630,
      alt: "Team Roster Tool"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Team Roster Tool",
    description: "AI-powered tool to optimize your team roster based on player stats and team requirements",
    images: ["/og-team-roster.png"]
  }
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 