import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL('https://apsquared.co'),
  title: "Baseball Team Research AI Agent",
  alternates: {
    canonical: "https://www.apsquared.co/tools/team-roster-agent",
  },
  description: "Research college baseball teams and analyze rosters with our AI-powered tool. Get detailed insights about team compositions, player statistics, and program details to help players evaluate team fit and opportunities.",
  keywords: [
    "baseball team research",
    "college baseball rosters",
    "baseball player stats",
    "team composition analysis",
    "baseball program evaluation",
    "player scouting",
    "baseball analytics",
    "college baseball research"
  ],
  openGraph: {
    title: "Baseball Team Research AI Agent",
    description: "AI-powered tool to research baseball teams, analyze rosters, and evaluate player opportunities",
    type: "website",
    images: [{
      url: "/og-team-roster.png",
      width: 1200,
      height: 630,
      alt: "Baseball Team Research Tool"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Baseball Team Research Tool",
    description: "AI-powered tool to research baseball teams, analyze rosters, and evaluate player opportunities",
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