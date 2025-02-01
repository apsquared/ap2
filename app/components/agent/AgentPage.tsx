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
        optional?: boolean;
    }>;
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

export default function AgentPage<T extends AgentState>({
    agentName,
    agentDisplayName,
    sampleSearches,
    formFields,
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
            <h1 className="text-3xl font-bold mb-8">{agentDisplayName}</h1>

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
                        <label className="block text-sm font-medium mb-1">{field.label}</label>
                        <input
                            type={field.type || 'text'}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                            placeholder={field.placeholder}
                            required={!field.optional}
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