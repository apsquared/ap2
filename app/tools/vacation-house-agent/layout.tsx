import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL('https://apsquared.co'),
  title: "Vacation House Finder AI Agent",
  alternates: {
    canonical: "https://www.apsquared.co/tools/vacation-house-agent",
  },
  description: "Find your perfect vacation house with our AI-powered search tool. Get personalized recommendations based on your preferences, location, and desired features.",
  keywords: [
    "vacation house finder",
    "vacation rental search",
    "holiday home finder",
    "vacation property search",
    "rental property finder",
    "vacation home recommendations",
    "AI property search",
    "vacation rental tool"
  ],
  openGraph: {
    title: "Vacation House Finder AI Agent",
    description: "AI-powered tool to find your perfect vacation house based on your preferences and requirements",
    type: "website",
    images: [{
      url: "/og-vacation-house.png",
      width: 1200,
      height: 630,
      alt: "Vacation House Finder Tool"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Vacation House Finder Tool",
    description: "AI-powered tool to find your perfect vacation house based on your preferences and requirements",
    images: ["/og-vacation-house.png"]
  }
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 