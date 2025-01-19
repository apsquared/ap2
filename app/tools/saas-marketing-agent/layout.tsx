import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SaaS Marketing AI Agent",
  description: "Generate comprehensive marketing content for your SaaS product. Get AI-generated personas, competitor analysis, value propositions, and marketing suggestions.",
  keywords: [
    "SaaS marketing",
    "AI marketing generator",
    "marketing content",
    "competitor analysis",
    "target personas",
    "value proposition",
    "marketing suggestions",
    "SaaS tool"
  ],
  openGraph: {
    title: "SaaS Marketing AI Agent",
    description: "AI-powered tool to generate comprehensive marketing content for your SaaS product",
    type: "website",
    images: [{
      url: "/og-marketing-agent.png",
      width: 1200,
      height: 630,
      alt: "SaaS Marketing Content Generator"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Marketing Content Generator",
    description: "AI-powered tool to generate comprehensive marketing content for your SaaS product",
    images: ["/og-marketing-agent.png"]
  }
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 