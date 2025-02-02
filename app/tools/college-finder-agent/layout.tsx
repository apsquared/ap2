import { Metadata } from "next";

export const metadata: Metadata = {
  title: "College Finder AI Agent",
  alternates: {
    canonical: "https://www.apsquared.co/tools/college-finder-agent",
  },
  description: "Find the perfect college match with our AI-powered college finder tool. Get personalized college recommendations based on your preferences, major, location, and budget.",
  keywords: [
    "college finder",
    "university search",
    "college recommendations",
    "education planning",
    "college search tool",
    "university finder",
    "college matching",
    "academic planning"
  ],
  openGraph: {
    title: "College Finder AI Agent",
    description: "AI-powered tool to find your perfect college match based on your preferences and requirements",
    type: "website",
    images: [{
      url: "/og-college-finder.png",
      width: 1200,
      height: 630,
      alt: "College Finder Tool"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "College Finder Tool",
    description: "AI-powered tool to find your perfect college match based on your preferences and requirements",
    images: ["/og-college-finder.png"]
  }
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 