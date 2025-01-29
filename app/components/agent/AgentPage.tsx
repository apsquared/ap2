"use client";

import { useState, useEffect } from "react";
import { AgentState, AgentStatus } from "@/utils/agentclient/schema/schema";
import ReactMarkdown from "react-markdown";

export interface SampleSearch {
    title: string;
    description: string;
    formData: Record<string, any>;
}

interface AgentPageProps {
    agentName: string;
    sampleSearches: SampleSearch[];
    formFields: Array<{
        name: string;
        label: string;
        type?: string;
        placeholder?: string;
    }>;
    renderResults: (state: any) => React.ReactNode;
    renderLoadingState?: (currentState: any) => React.ReactNode;
}

export const CompletedSection = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
    <div className={className}>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded">
            {children}
        </div>
    </div>
);

export default function AgentPage({
    agentName,
    sampleSearches,
    formFields,
    renderResults,
    renderLoadingState
}: AgentPageProps) {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [runId, setRunId] = useState<string | null>(null);
    const [agentState, setAgentState] = useState<AgentState | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            <h1 className="text-3xl font-bold mb-8">{agentName}</h1>

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
                            className="w-full p-2 border rounded"
                            required
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

            {agentState?.status === AgentStatus.RUNNING && renderLoadingState && agentState && (
                <div className="mb-8">
                    {renderLoadingState(agentState)}
                </div>
            )}

            {agentState?.status === AgentStatus.COMPLETED && agentState && (
                <div>
                    {renderResults(agentState)}
                </div>
            )}
        </div>
    );
} 