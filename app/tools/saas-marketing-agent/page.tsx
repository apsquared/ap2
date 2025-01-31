"use client";

import AgentPage, { CompletedSection } from '@/app/components/agent/AgentPage';
import type { Persona, Competitor, MarketingPlanState, MarketingAgentState } from "@/utils/marketing-agent/types";
import { Suspense } from 'react';
import ReactMarkdown from "react-markdown";



const SAMPLE_SEARCHES = [
  {
    title: "Product Discovery",
    description: "A modern Product Hunt Alternative",
    formData: {
      appName: "Uneed.best",
      appUrl: "https://uneed.best",
      max_personas: 3,
      competitor_hint: "Product Hunt"
    }
  },
  {
    title: "Social Media Management",
    description: "AI-Powered Social Media Management",
    formData: {
      appName: "SkyAssistant",
      appUrl: "https://www.skyassistant.app",
      max_personas: 3,
      competitor_hint: "Typefully"
    }
  },
  {
    title: "Email Marketing Platform",
    description: "A MailChimp Alternative",
    formData: {
      appName: "Brevo",
      appUrl: "https://www.brevo.com",
      max_personas: 2,
      competitor_hint: "MailChimp"
    }
  }
];

const FORM_FIELDS = [
  {
    name: "appName",
    label: "App Name",
    placeholder: "Enter your app name",
  },
  {
    name: "appUrl",
    label: "App URL",
    placeholder: "Enter your app URL",
  },
  {
    name: "max_personas",
    label: "Maximum Number of Personas",
    type: "number",
    placeholder: "Enter maximum number of personas",
  },
  {
    name: "competitor_hint",
    label: "Main Competitor",
    placeholder: "Enter a main competitor",
  }
];

const renderResults = (state: MarketingAgentState) => {
  console.log("renderResults", JSON.stringify(state));
  const { current_state } = state;
  return (
    <div className="space-y-8">
      App Description
      {current_state.appDescription && (
        <CompletedSection title="App Description">
          <ReactMarkdown>{current_state.appDescription}</ReactMarkdown>
        </CompletedSection>
      )}

      {current_state.value_proposition && (
        <CompletedSection title="Value Proposition">
            <ReactMarkdown>{current_state.value_proposition}</ReactMarkdown>
        </CompletedSection>
      )}

      {current_state.tagline && (
        <CompletedSection title="Tagline">
          <p className="text-lg font-medium">{current_state.tagline}</p>
        </CompletedSection>
      )}

      {current_state.keyfeatures && current_state.keyfeatures.length > 0 && (
        <CompletedSection title="Key Features">
          <ul className="list-disc list-inside space-y-2">
            {current_state.keyfeatures.map((feature, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">
                {feature}
              </li>
            ))}
          </ul>
        </CompletedSection>
      )}

      {current_state.personas && current_state.personas.length > 0 && (
        <CompletedSection title="Target Personas">
          <div className="grid grid-cols-1 gap-6">
            {current_state.personas.map((persona: Persona, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">{persona.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{persona.description}</p>
              </div>
            ))}
          </div>
        </CompletedSection>
      )}

      {current_state.competitors && current_state.competitors.length > 0 && (
        <CompletedSection title="Competitor Analysis">
          <div className="grid grid-cols-1 gap-6">
            {current_state.competitors.map((competitor: Competitor, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">{competitor.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{competitor.description}</p>
                <a href={competitor.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                  Visit Website
                </a>
              </div>
            ))}
          </div>
        </CompletedSection>
      )}

      {current_state.keywords && current_state.keywords.length > 0 && (
        <CompletedSection title="Keywords">
          <div className="flex flex-wrap gap-2">
            {current_state.keywords.map((keyword, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                {keyword}
              </span>
            ))}
          </div>
        </CompletedSection>
      )}

      {current_state.marketing_suggestions && current_state.marketing_suggestions.length > 0 && (
        <CompletedSection title="Marketing Suggestions">
          <ul className="list-disc list-inside space-y-2">
            {current_state.marketing_suggestions.map((suggestion, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">
                {suggestion}
              </li>
            ))}
          </ul>
        </CompletedSection>
      )}

      {current_state.subreddits && current_state.subreddits.length > 0 && (
        <CompletedSection title="Relevant Communities">
          <ul className="list-disc list-inside space-y-2">
            {current_state.subreddits.map((subreddit, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">
                {subreddit}
              </li>
            ))}
          </ul>
        </CompletedSection>
      )}
    </div>
  );
};

const renderLoadingState = (state: Partial<MarketingAgentState>) => {
  const completedTasks: string[] = [];
  const pendingTasks: string[] = [];
  
  const tasks = [
    { key: 'appDescription', label: 'Analyzing your app' },
    { key: 'keyfeatures', label: 'Identifying key features' },
    { key: 'value_proposition', label: 'Crafting value proposition' },
    { key: 'personas', label: 'Researching target personas', checkEmpty: true },
    { key: 'competitors', label: 'Analyzing competitors', checkEmpty: true },
    { key: 'keywords', label: 'Generating keywords', checkEmpty: true },
    { key: 'tagline', label: 'Creating tagline' },
    { key: 'marketing_suggestions', label: 'Generating marketing suggestions', checkEmpty: true },
    { key: 'subreddits', label: 'Finding relevant communities', checkEmpty: true }
  ];

  tasks.forEach(task => {
    const value = state.current_state?.[task.key as keyof MarketingPlanState] ?? null;
    const isEmpty = task.checkEmpty && Array.isArray(value) && value.length === 0;
    
    if (value && !isEmpty) {
      completedTasks.push(task.label);
    } else {
      pendingTasks.push(task.label);
    }
  });

  return (
    <div className="space-y-4">
      {completedTasks.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Completed:</h3>
          <ul className="list-disc list-inside space-y-1">
            {completedTasks.map((task, index) => (
              <li key={index} className="text-green-600 dark:text-green-400">
                {task}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {pendingTasks.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">In Progress:</h3>
          <ul className="list-disc list-inside space-y-1">
            {pendingTasks.map((task, index) => (
              <li key={index} className="text-blue-600 dark:text-blue-400">
                {task}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function SaasMarketingAgent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgentPage<MarketingAgentState>
        agentName="marketing-agent"
        sampleSearches={SAMPLE_SEARCHES}
        formFields={FORM_FIELDS}
        >
        {{
          renderResults,
          renderLoadingState
        }}
      </AgentPage>
    </Suspense>
  );
}
