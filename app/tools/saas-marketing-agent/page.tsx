"use client";

import { useState, useEffect } from "react";
import type { MarketingPlanState, Persona, Competitor } from "@/utils/marketing-agent/types";
import { AgentState, AgentStatus } from "@/utils/agentclient/schema/schema";

const LoadingMessage = ({ currentState }: { currentState: Partial<MarketingPlanState> | null }) => {
  const pendingTasks = [];
  
  if (!currentState?.appDescription) pendingTasks.push("Analyzing your app");
  if (!currentState?.keyfeatures) pendingTasks.push("Identifying key features");
  if (!currentState?.value_proposition) pendingTasks.push("Crafting value proposition");
  if (!currentState?.personas || currentState.personas.length === 0) pendingTasks.push("Researching target personas");
  if (!currentState?.competitors || currentState.competitors.length === 0) pendingTasks.push("Analyzing competitors");
  if (!currentState?.keywords || currentState.keywords.length === 0) pendingTasks.push("Generating keywords");
  if (!currentState?.tagline) pendingTasks.push("Creating tagline");
  if (!currentState?.marketing_suggestions || currentState.marketing_suggestions.length === 0) pendingTasks.push("Generating marketing suggestions");
  if (!currentState?.subreddits || currentState.subreddits.length === 0) pendingTasks.push("Finding relevant communities");

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
    let pollInterval: NodeJS.Timeout;

    const pollStatus = async () => {
      if (!runId) return;

      try {
        const response = await fetch(`/api/marketing-agent/status/${runId}`);
        const data:AgentState = await response.json();

        if (response.ok) {
          setCurrentState(data.current_state as MarketingPlanState);
          if (data.status === AgentStatus.COMPLETED || data.status === AgentStatus.ERROR) {
            setResult(data.current_state as MarketingPlanState);
            clearInterval(pollInterval);
            setLoading(false);
          }
        } else {
          setError("Failed to fetch status");
          clearInterval(pollInterval);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error polling status:", error);
        setError("Error polling status");
        clearInterval(pollInterval);
        setLoading(false);
      }
    };

    if (runId && loading) {
      pollInterval = setInterval(pollStatus, 5000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [runId, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    
    try {
      const response = await fetch("/api/marketing-agent/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data:AgentState = await response.json();
      if (response.ok && data.run_id) {
        setRunId(data.run_id);
      } else {
        setError("Failed to start marketing agent");
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
      <p className="mb-4">Enter your product details to generate marketing content and analysis.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">App Name</label>
          <input
            type="text"
            value={formData.appName}
            onChange={(e) => setFormData(prev => ({ ...prev, appName: e.target.value }))}
            placeholder="Your SaaS app name"
            className="w-full p-2 border rounded dark:bg-slate-800"
            required
          />
        </div>

        <div>
          <label className="block mb-2">App URL</label>
          <input
            type="url"
            value={formData.appUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, appUrl: e.target.value }))}
            placeholder="https://your-app.com"
            className="w-full p-2 border rounded dark:bg-slate-800"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Max Personas</label>
          <input
            type="number"
            value={formData.max_personas}
            onChange={(e) => setFormData(prev => ({ ...prev, max_personas: parseInt(e.target.value) }))}
            min="1"
            max="5"
            className="w-full p-2 border rounded dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="block mb-2">Competitor Hint (Optional)</label>
          <input
            type="text"
            value={formData.competitor_hint}
            onChange={(e) => setFormData(prev => ({ ...prev, competitor_hint: e.target.value }))}
            placeholder="Main competitor name or URL"
            className="w-full p-2 border rounded dark:bg-slate-800"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !formData.appName || !formData.appUrl}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
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
          <div>
            <h2 className="text-xl font-semibold mb-2">App Overview</h2>
            <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded">
              <p className="font-bold">{result.tagline}</p>
              <p className="mt-2">{result.appDescription}</p>
              <p className="mt-2 font-semibold">Value Proposition:</p>
              <p>{result.value_proposition}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Key Features</h2>
            <ul className="list-disc pl-5">
              {result.keyfeatures?.map((feature: string, i: number) => (
                <li key={i} className="mb-1">{feature}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Target Personas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.personas?.map((persona: Persona, i: number) => (
                <div key={i} className="p-4 bg-gray-100 dark:bg-slate-800 rounded">
                  <h3 className="font-bold">{persona.name}</h3>
                  <p>{persona.description}</p>
                </div>
              ))}
            </div>
          </div>

          {result.competitors?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Competitor Analysis</h2>
              <div className="space-y-4">
                {result.competitors.map((competitor: Competitor, i: number) => (
                  <div key={i} className="p-4 bg-gray-100 dark:bg-slate-800 rounded">
                    <h3 className="font-bold">{competitor.name}</h3>
                    <p className="text-sm text-gray-500">{competitor.url}</p>
                    <p className="mt-2">{competitor.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-2">Marketing Suggestions</h2>
            <ul className="list-disc pl-5">
              {result.marketing_suggestions?.map((suggestion: string, i: number) => (
                <li key={i} className="mb-2">{suggestion}</li>
              ))}
            </ul>
          </div>

          {result.keywords?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((keyword: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.subreddits?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Relevant Subreddits</h2>
              <ul className="list-disc pl-5">
                {result.subreddits.map((subreddit: string, i: number) => (
                  <li key={i}>{subreddit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
