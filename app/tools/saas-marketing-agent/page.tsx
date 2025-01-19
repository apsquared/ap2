"use client";

import { useState, useEffect } from "react";
import type { MarketingPlanState, Persona, Competitor } from "@/utils/marketing-agent/types";
import { AgentState, AgentStatus } from "@/utils/agentclient/schema/schema";

// Components
const CompletedSection = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={className}>
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded">
      {children}
    </div>
  </div>
);

const LoadingMessage = ({ currentState }: { currentState: Partial<MarketingPlanState> | null }) => {
  const completedTasks: string[] = [];
  const pendingTasks: string[] = [];
  
  // Track completed and pending tasks
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
    const value = currentState?.[task.key as keyof MarketingPlanState];
    const isEmpty = task.checkEmpty && Array.isArray(value) && value.length === 0;
    
    if (value && !isEmpty) {
      completedTasks.push(task.label);
    } else {
      pendingTasks.push(task.label);
    }
  });

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTaskIndex((prev) => (prev + 1) % pendingTasks.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [pendingTasks.length]);

  if (pendingTasks.length === 0) return null;

  return (
    <div className="mt-8 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-lg font-medium text-center">
        <div className="h-8 flex items-center justify-center">
          <span className="animate-fade-in">
            {pendingTasks[currentTaskIndex]}...
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {pendingTasks.length} tasks remaining
        </div>
      </div>
      {completedTasks.length > 0 && (
        <div className="text-sm text-green-600 dark:text-green-400">
          ✓ {completedTasks.length} tasks completed
        </div>
      )}
    </div>
  );
};

export default function SaasMarketingAgent() {
  const [formData, setFormData] = useState({
    appName: "",
    appUrl: "",
    max_personas: 3,
    competitor_hint: "",
  });
  const [runId, setRunId] = useState<string | null>(null);
  const [result, setResult] = useState<MarketingPlanState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentState, setCurrentState] = useState<Partial<MarketingPlanState> | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const pollStatus = async () => {
      if (!runId) return;

      try {
        const response = await fetch(`/api/marketing-agent/status/${runId}`);
        const data: AgentState = await response.json();

        if (response.ok) {
          setCurrentState(data.current_state as MarketingPlanState);
          if (data.status === AgentStatus.COMPLETED || data.status === AgentStatus.ERROR) {
            setResult(data.current_state as MarketingPlanState);
            setRunId(null); 
            setLoading(false);
          } else {
            // Schedule next poll 5 seconds after this response
            timeoutId = setTimeout(pollStatus, 5000);
          }
        } else {
          setError("Failed to fetch status");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error polling status:", error);
        setError("Error polling status");
        setLoading(false);
      }
    };

    if (runId && loading) {
      pollStatus();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [runId, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setCurrentState(null);
    
    try {
      const response = await fetch("/api/marketing-agent/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data: AgentState = await response.json();
      if (response.ok && data.run_id) {
        setRunId(data.run_id);
      } else {
        setError((data as any).error || "Failed to start marketing agent");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">SaaS Marketing Content Generator</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        Enter your product details to generate comprehensive marketing content and analysis powered by AI.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm">
        <div>
          <label className="block mb-2 font-medium">App Name</label>
          <input
            type="text"
            value={formData.appName}
            onChange={(e) => setFormData(prev => ({ ...prev, appName: e.target.value }))}
            placeholder="Your SaaS app name"
            className="w-full p-2 border rounded dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">App URL</label>
          <input
            type="url"
            value={formData.appUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, appUrl: e.target.value }))}
            placeholder="https://your-app.com"
            className="w-full p-2 border rounded dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Max Personas</label>
          <input
            type="number"
            value={formData.max_personas}
            onChange={(e) => setFormData(prev => ({ ...prev, max_personas: parseInt(e.target.value) }))}
            min="1"
            max="5"
            className="w-full p-2 border rounded dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">Number of target personas to generate (1-5)</p>
        </div>

        <div>
          <label className="block mb-2 font-medium">Competitor Hint (Optional)</label>
          <input
            type="text"
            value={formData.competitor_hint}
            onChange={(e) => setFormData(prev => ({ ...prev, competitor_hint: e.target.value }))}
            placeholder="Main competitor name (e.g. Product Hunt)"
            className="w-full p-2 border rounded dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">Help us understand your market better</p>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.appName || !formData.appUrl}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-600 transition-colors"
        >
          {loading ? "Generating..." : "Generate Marketing Plan"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
          {error}
        </div>
      )}

      {loading && <LoadingMessage currentState={currentState} />}

      {result && (
        <div className="mt-6 space-y-6">
          <CompletedSection title="App Overview">
            <p className="font-bold text-lg">{result.tagline}</p>
            <p className="mt-2">{result.appDescription}</p>
            <p className="mt-4 font-semibold text-blue-600 dark:text-blue-400">Value Proposition:</p>
            <p className="mt-1">{result.value_proposition}</p>
          </CompletedSection>

          <CompletedSection title="Key Features">
            <ul className="list-disc pl-5 space-y-2">
              {result.keyfeatures?.map((feature: string, i: number) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </CompletedSection>

          <div>
            <h2 className="text-xl font-semibold mb-2">Target Personas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.personas?.map((persona: Persona, i: number) => (
                <div key={i} className="p-4 bg-gray-100 dark:bg-slate-800 rounded hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-blue-600 dark:text-blue-400">{persona.name}</h3>
                  <p className="mt-2">{persona.description}</p>
                </div>
              ))}
            </div>
          </div>

          {result.competitors?.length > 0 && (
            <CompletedSection title="Competitor Analysis">
              <div className="space-y-4">
                {result.competitors.map((competitor: Competitor, i: number) => (
                  <div key={i} className="p-4 bg-white dark:bg-slate-900 rounded shadow-sm">
                    <h3 className="font-bold text-blue-600 dark:text-blue-400">{competitor.name}</h3>
                    <a href={competitor.url} target="_blank" rel="noopener noreferrer" 
                       className="text-sm text-gray-500 hover:text-blue-500 transition-colors">
                      {competitor.url}
                    </a>
                    <p className="mt-2">{competitor.description}</p>
                  </div>
                ))}
              </div>
            </CompletedSection>
          )}

          <CompletedSection title="Marketing Suggestions">
            <ul className="list-disc pl-5 space-y-2">
              {result.marketing_suggestions?.map((suggestion: string, i: number) => (
                <li key={i}>{suggestion}</li>
              ))}
            </ul>
          </CompletedSection>

          {result.keywords?.length > 0 && (
            <CompletedSection title="Keywords">
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((keyword: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                    {keyword}
                  </span>
                ))}
              </div>
            </CompletedSection>
          )}

          {result.subreddits?.length > 0 && (
            <CompletedSection title="Relevant Subreddits">
              <ul className="list-disc pl-5 space-y-2">
                {result.subreddits.map((subreddit: string, i: number) => (
                  <li key={i}>
                    <a href={`https://reddit.com/r/${subreddit.replace(/^r\//, '')}`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-blue-600 dark:text-blue-400 hover:underline">
                      {subreddit}
                    </a>
                  </li>
                ))}
              </ul>
            </CompletedSection>
          )}
        </div>
      )}
    </div>
  );
}
