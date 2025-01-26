"use client";

import { useState, useEffect } from "react";
import type { TeamRosterState, Team } from "@/utils/team-roster-client/types";
import { AgentState, AgentStatus } from "@/utils/agentclient/schema/schema";
import ReactMarkdown from "react-markdown";
import { useSearchParams, usePathname } from "next/navigation";

const SAMPLE_SEARCHES = [
  {
    title: "Vanderbilt Baseball",
    description: "Top D1 Baseball Program",
    formData: {
      college_name: "Vanderbilt University",
    }
  },
  {
    title: "Arcadia University Baseball",
    description: "D3 Baseball Program",
    formData: {
      college_name: "Arcadia University",
    }
  },
  {
    title: "LSU Baseball",
    description: "SEC Baseball Program",
    formData: {
      college_name: "Louisiana State University",
    }
  }
];

// Components
const CompletedSection = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={className}>
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded">
      {children}
    </div>
  </div>
);

const LoadingMessage = ({ currentState }: { currentState: Partial<TeamRosterState> | null }) => {
  const completedTasks: string[] = [];
  const pendingTasks: string[] = [];
  
  const tasks = [
    { key: 'roster_url', label: 'Finding team roster' },
    { key: 'team', label: 'Processing player information', checkEmpty: true },
    { key: 'summary', label: 'Generating team summary' }
  ];

  tasks.forEach(task => {
    const value = currentState?.[task.key as keyof TeamRosterState];
    const isEmpty = task.checkEmpty && value === null;
    
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

export default function TeamRosterAgent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const jobId = searchParams.get('jobid');
  const [shareableLink, setShareableLink] = useState<string>("");
  
  const [formData, setFormData] = useState({
    college_name: "",
  });
  const [runId, setRunId] = useState<string | null>(jobId);
  const [result, setResult] = useState<TeamRosterState | null>(null);
  const [loading, setLoading] = useState(!!jobId);
  const [error, setError] = useState("");
  const [currentState, setCurrentState] = useState<Partial<TeamRosterState> | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const pollStatus = async () => {
      if (!runId) return;

      try {
        const response = await fetch(`/api/roster-agent/status/${runId}`);
        const data: AgentState = await response.json();

        if (response.ok) {
          setCurrentState(data.current_state as TeamRosterState);
          if (data.status === AgentStatus.COMPLETED || data.status === AgentStatus.ERROR) {
            setResult(data.current_state as TeamRosterState);
            setLoading(false);
            if (data.status === AgentStatus.ERROR) {
              setError("An Error has occurred, the agent did not complete.");
            }
          } else {
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
      const baseUrl = window.location.origin;
      setShareableLink(`${baseUrl}${pathname}?jobid=${runId}`);
      pollStatus();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [runId, loading, pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setCurrentState(null);
    setShareableLink("");
    
    try {
      const response = await fetch("/api/roster-agent/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data: AgentState = await response.json();
      if (response.ok && data.run_id) {
        setRunId(data.run_id);
        // Create shareable link with the run_id
        const baseUrl = window.location.origin;
        setShareableLink(`${baseUrl}${pathname}?jobid=${data.run_id}`);
      } else {
        setError((data as any).error || "Failed to start team roster agent");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleSampleClick = (sampleData: typeof formData) => {
    setFormData(sampleData);
    setLoading(true);
    setError("");
    setResult(null);
    setCurrentState(null);
    setShareableLink("");
    
    fetch("/api/roster-agent/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sampleData),
    })
    .then(async response => {
      const data: AgentState = await response.json();
      if (response.ok && data.run_id) {
        setRunId(data.run_id);
        // Create shareable link with the run_id
        const baseUrl = window.location.origin;
        setShareableLink(`${baseUrl}${pathname}?jobid=${data.run_id}`);
      } else {
        setError((data as any).error || "Failed to start team roster agent");
        setLoading(false);
      }
    })
    .catch(error => {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
      setLoading(false);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Team Roster AI Agent</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        Enter a college name to analyze their baseball team roster. Our AI will help you discover detailed information about the team and its players.
      </p>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Try these examples:</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_SEARCHES.map((sample, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSampleClick(sample.formData)}
            >
              <h3 className="font-medium mb-2">{sample.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{sample.description}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="college_name" className="block text-sm font-medium mb-1">
              College Name
            </label>
            <input
              type="text"
              id="college_name"
              value={formData.college_name}
              onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter college name..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Analyze Team Roster"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-8 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading && <LoadingMessage currentState={currentState} />}

      {shareableLink && (
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
          <h3 className="font-medium mb-2">Shareable Link</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareableLink}
              readOnly
              className="flex-1 p-2 bg-white dark:bg-slate-800 border rounded"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareableLink);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Copy
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Save this link to check the results later
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-8">
          {result.summary && (
            <CompletedSection title="Team Summary">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{result.summary}</ReactMarkdown>
              </div>
            </CompletedSection>
          )}

          {result.team && (
            <CompletedSection title="Team Roster">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-slate-700">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Position</th>
                      <th className="px-4 py-2 text-left">Height</th>
                      <th className="px-4 py-2 text-left">Hometown</th>
                      <th className="px-4 py-2 text-left">Handedness</th>
                      <th className="px-4 py-2 text-left">Velocity</th>
                      <th className="px-4 py-2 text-left">PG Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.team.players.map((player, index) => (
                      <tr key={index} className="border-b dark:border-slate-600">
                        <td className="px-4 py-2">{player.name}</td>
                        <td className="px-4 py-2">{player.position || '-'}</td>
                        <td className="px-4 py-2">{player.height || '-'}</td>
                        <td className="px-4 py-2">{player.hometown || '-'}</td>
                        <td className="px-4 py-2">{player.handedness || '-'}</td>
                        <td className="px-4 py-2">{player.velocity || '-'}</td>
                        <td className="px-4 py-2">{player.pg_grade || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CompletedSection>
          )}
        </div>
      )}
    </div>
  );
} 