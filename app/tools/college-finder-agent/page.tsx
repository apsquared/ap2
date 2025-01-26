"use client";

import { useState, useEffect } from "react";
import type { CollegeFinderState, College } from "@/utils/college-agent/type";
import { AgentState, AgentStatus } from "@/utils/agentclient/schema/schema";
import { useSearchParams, usePathname } from "next/navigation";

const SAMPLE_SEARCHES = [
  {
    title: "Computer Science",
    description: "Top Tech Schools in California",
    formData: {
      major: "Computer Science",
      location_preference: "California",
      max_tuition: "60000",
      min_acceptance_rate: "10",
      max_colleges: 5,
      sat_score: "1400",
      search_query: "Schools with strong tech industry connections"
    }
  },
  {
    title: "D3 Baseball Schools",
    description: "Northeast Schools w/ D3 Baseball",
    formData: {
      major: "Any",
      location_preference: "Northeast US",
      max_tuition: "75000",
      min_acceptance_rate: "50",
      max_colleges: 7,
      sat_score: "1200",
      search_query: "Division 3 baseball programs"
    }
  },
  {
    title: "Pre-Med Biology",
    description: "Top Medical Track Programs",
    formData: {
      major: "Biology Pre-Med",
      location_preference: "United States",
      max_tuition: "45000",
      min_acceptance_rate: "15",
      max_colleges: 5,
      sat_score: "1450",
      search_query: "Biology programs with strong pre-med tracks and research opportunities"
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

const LoadingMessage = ({ currentState }: { currentState: Partial<CollegeFinderState> | null }) => {
  const completedTasks: string[] = [];
  const pendingTasks: string[] = [];
  
  const tasks = [
    { key: 'search_query', label: 'Building search query' },
    { key: 'colleges', label: 'Finding matching colleges', checkEmpty: true },
    { key: 'recommendations', label: 'Generating recommendations', checkEmpty: true }
  ];

  tasks.forEach(task => {
    const value = currentState?.[task.key as keyof CollegeFinderState];
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

export default function CollegeFinderAgent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const jobId = searchParams.get('jobid');
  const [shareableLink, setShareableLink] = useState<string>("");
  
  const [formData, setFormData] = useState({
    major: "",
    location_preference: "",
    max_tuition: "",
    min_acceptance_rate: "",
    max_colleges: 5,
    sat_score: "",
    search_query: "",
  });
  const [runId, setRunId] = useState<string | null>(jobId);
  const [result, setResult] = useState<CollegeFinderState | null>(null);
  const [loading, setLoading] = useState(!!jobId);
  const [error, setError] = useState("");
  const [currentState, setCurrentState] = useState<Partial<CollegeFinderState> | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const pollStatus = async () => {
      if (!runId) return;

      try {
        const response = await fetch(`/api/college-agent/status/${runId}`);
        const data: AgentState = await response.json();

        if (response.ok) {
          setCurrentState(data.current_state as CollegeFinderState);
          if (data.status === AgentStatus.COMPLETED || data.status === AgentStatus.ERROR) {
            setResult(data.current_state as CollegeFinderState);
            setLoading(false);
            // Don't clear runId to keep the shareable link
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
      // Create shareable link when polling starts
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

    const processedFormData = {
      ...formData,
      max_tuition: formData.max_tuition ? parseInt(formData.max_tuition) : undefined,
      min_acceptance_rate: formData.min_acceptance_rate ? parseInt(formData.min_acceptance_rate) : undefined,
      sat_score: formData.sat_score ? parseInt(formData.sat_score) : undefined,
    };
    
    try {
      const response = await fetch("/api/college-agent/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedFormData),
      });
      
      const data: AgentState = await response.json();
      if (response.ok && data.run_id) {
        setRunId(data.run_id);
        // Create shareable link with the run_id
        const baseUrl = window.location.origin;
        setShareableLink(`${baseUrl}${pathname}?jobid=${data.run_id}`);
      } else {
        setError((data as any).error || "Failed to start college finder agent");
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
    
    fetch("/api/college-agent/start", {
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
        setError((data as any).error || "Failed to start college finder agent");
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
      <h1 className="text-2xl font-bold mb-4">College Finder AI Agent</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        Enter your preferences to find colleges that match your criteria. Our AI will help you discover the best options for your academic journey.
      </p>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Try these examples:</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_SEARCHES.map((sample, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-medium mb-2">{sample.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{sample.description}</p>
              <button
                onClick={() => handleSampleClick(sample.formData)}
                className="text-blue-500 text-sm hover:text-blue-600"
              >
                Use this example →
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm">
        <div>
          <label className="block mb-2 font-medium">Desired Major</label>
          <input
            type="text"
            value={formData.major}
            onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
            placeholder="e.g. Computer Science"
            className="w-full p-2 border rounded dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Location Preference</label>
          <input
            type="text"
            value={formData.location_preference}
            onChange={(e) => setFormData(prev => ({ ...prev, location_preference: e.target.value }))}
            placeholder="e.g. Northeast US, California"
            className="w-full p-2 border rounded dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Maximum Annual Tuition ($)</label>
          <input
            type="number"
            value={formData.max_tuition}
            onChange={(e) => setFormData(prev => ({ ...prev, max_tuition: e.target.value }))}
            placeholder="50000"
            className="w-full p-2 border rounded dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Minimum Acceptance Rate (%)</label>
          <input
            type="number"
            value={formData.min_acceptance_rate}
            onChange={(e) => setFormData(prev => ({ ...prev, min_acceptance_rate: e.target.value }))}
            min="0"
            max="100"
            placeholder="20"
            className="w-full p-2 border rounded dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">SAT Score</label>
          <input
            type="number"
            value={formData.sat_score}
            onChange={(e) => setFormData(prev => ({ ...prev, sat_score: e.target.value }))}
            min="400"
            max="1600"
            placeholder="1200"
            className="w-full p-2 border rounded dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Number of Colleges</label>
          <input
            type="number"
            value={formData.max_colleges}
            onChange={(e) => setFormData(prev => ({ ...prev, max_colleges: parseInt(e.target.value) }))}
            min="1"
            max="10"
            className="w-full p-2 border rounded dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">Number of college recommendations to generate (1-10)</p>
        </div>

        <div>
          <label className="block mb-2 font-medium">Custom Search Query</label>
          <textarea
            value={formData.search_query}
            onChange={(e) => setFormData(prev => ({ ...prev, search_query: e.target.value }))}
            placeholder="Describe any additional preferences or requirements for your college search"
            className="w-full p-2 border rounded dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <p className="text-sm text-gray-500 mt-1">Optional: Add specific details about what you&apos;re looking for</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-600 transition-colors"
        >
          {loading ? "Finding Colleges..." : "Find Matching Colleges"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
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
        <div className="mt-6 space-y-6">


          <CompletedSection title="Matching Colleges">
            <div className="space-y-4">
              {result.colleges?.map((college: College, i: number) => (
                <div key={i} className="border-b pb-4 last:border-b-0">
                  <h3 className="text-lg font-semibold">{college.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{college.location}</p>
                  <p className="mt-2">{college.description}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    {college.acceptance_rate && (
                      <div>
                        <span className="font-medium">Acceptance Rate:</span> {college.acceptance_rate}
                      </div>
                    )}
                    {college.tuition && (
                      <div>
                        <span className="font-medium">Tuition:</span> {college.tuition}
                      </div>
                    )}
                    {college.enrollment && (
                      <div>
                        <span className="font-medium">Enrollment:</span> {college.enrollment}
                      </div>
                    )}
                    {college.sat_scores && (
                      <div>
                        <span className="font-medium">SAT Scores:</span> {college.sat_scores}
                      </div>
                    )}
                  </div>
                  {college.programs && college.programs.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">Notable Programs:</span>{" "}
                      {college.programs.join(", ")}
                    </div>
                  )}
                  {college.url && (
                    <a
                      href={college.url?.startsWith('http') ? college.url : `https://${college.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-blue-500 hover:text-blue-600 inline-block"
                    >
                      Visit Website →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CompletedSection>

          {result.recommendations && result.recommendations.length > 0 && (
            <CompletedSection title="Recommendations">
              <ul className="list-disc pl-5 space-y-2">
                {result.recommendations.map((recommendation: string, i: number) => (
                  <li key={i}>{recommendation}</li>
                ))}
              </ul>
            </CompletedSection>
          )}
        </div>
      )}
    </div>
  );
} 