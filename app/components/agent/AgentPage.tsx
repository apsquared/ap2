"use client";

import { useState, useEffect } from "react";
import { AgentState, AgentStatus } from "@/utils/agentclient/schema/schema";
import ReactMarkdown from "react-markdown";
import { usePathname, useSearchParams } from "next/navigation";

export interface SampleSearch {
    title: string;
    description: string;
    formData: Record<string, any>;
}

interface AgentPageProps<T extends AgentState> {
    agentName: string;
    agentDisplayName: string;
    sampleSearches: SampleSearch[];
    formFields: Array<{
        name: string;
        label: string;
        type?: string;
        placeholder?: string;
        required?: boolean;
    }>;
    sourceCodeLink?: string;
    graphImageLink?: string;
    children: {
        renderResults: (state: T) => JSX.Element;
        renderLoadingState?: (currentState: T) => JSX.Element;
    };
}

export const CompletedSection = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
    <div className={className}>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded">
            {children}
        </div>
    </div>
);

const LoadingIndicator = () => (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span>Agent is working...</span>
    </div>
);

const StatusUpdates = ({ updates, isRunning }: { updates: string[], isRunning: boolean }) => (
    <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Status Updates</h2>
        {isRunning && <LoadingIndicator />}
        <div className="space-y-2">
            {updates.map((update, index) => (
                <div 
                    key={index} 
                    className="p-3 bg-gray-50 dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-700"
                >
                    <ReactMarkdown>{update}</ReactMarkdown>
                </div>
            ))}
        </div>
    </div>
);

const saveAgentState = async (state: AgentState, agentName: string) => {
    try {
        const response = await fetch('/api/agent-db/create-update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...state,
                agent_name: agentName
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save agent state');
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving agent state:', error);
        throw error;
    }
};


export default function AgentPage<T extends AgentState>({
    agentName,
    agentDisplayName,
    sampleSearches,
    formFields,
    sourceCodeLink,     
    graphImageLink,
    children: {
        renderResults,
        renderLoadingState
    }
}: AgentPageProps<T>) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [runId, setRunId] = useState<string | null>(null);
    const [agentState, setAgentState] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initialize runId from URL parameters
    useEffect(() => {
        const urlRunId = searchParams.get('runId');
        if (urlRunId && !runId) {
            setRunId(urlRunId);
        }
    }, [searchParams]);

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        const pollStatus = async () => {
            if (!runId) return;

            try {
                const response = await fetch(`/api/${agentName}/status/${runId}`);
                const data = await response.json();

                setAgentState(data);
                await saveAgentState(data, agentName);

                if (data.status !== AgentStatus.RUNNING) {
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error('Error polling status:', error);
                clearInterval(pollInterval);
            }
        };

        if (runId) {
            pollInterval = setInterval(pollStatus, 10000);
            pollStatus();
        }

        return () => {
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, [runId, agentName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setRunId(null);
        setAgentState(null);

        try {
            const response = await fetch(`/api/${agentName}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to start agent');
            }

            const data = await response.json();
            setRunId(data.run_id);
            await saveAgentState(data, agentName);
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to start agent');
        }
    };

    const handleSampleClick = (sampleData: Record<string, any>) => {
        setFormData(sampleData);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{agentDisplayName}</h1>
                <div className="flex gap-4">
                    {sourceCodeLink && (
                        <a href={sourceCodeLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 border rounded-lg hover:border-blue-600 transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            Source
                        </a>
                    )}
                    {graphImageLink && (
                        <a href={graphImageLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 border rounded-lg hover:border-blue-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                            Graph
                        </a>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {sampleSearches.map((sample, index) => (
                    <button
                        key={index}
                        onClick={() => handleSampleClick(sample.formData)}
                        className="p-4 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                    >
                        <h3 className="font-semibold">{sample.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{sample.description}</p>
                    </button>
                ))}

            </div>

            <form onSubmit={handleSubmit} className="mb-8">
                {formFields.map((field) => (
                    <div key={field.name} className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                            type={field.type || 'text'}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                            placeholder={field.placeholder}
                            required={field.required}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                ))}
                <button
                    type="submit"
                    disabled={!!runId && agentState?.status === AgentStatus.RUNNING}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    Start Search
                </button>
            </form>

            {error && (
                <div className="text-red-500 mb-4">
                    {error}
                </div>
            )}

            {runId && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded">
                    <p className="mb-2">Bookmark this link to return to your results later:</p>
                    <a 
                        href={`${pathname}?runId=${runId}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                        {`${pathname}?runId=${runId}`}
                    </a>
                </div>
            )}

            {agentState?.status_updates  && (
                <StatusUpdates 
                    updates={agentState.status_updates} 
                    isRunning={agentState.status === AgentStatus.RUNNING} 
                />
            )}

            {agentState?.status === AgentStatus.RUNNING && renderLoadingState && agentState && (
                <div className="mb-8">
                    {renderLoadingState(agentState)}
                </div>
            )}

            {agentState?.status === AgentStatus.COMPLETED && agentState && (
                <div>
                    Results:
                    {renderResults(agentState)}
                </div>
            )}
        </div>
    );
} 