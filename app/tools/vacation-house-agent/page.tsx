"use client";

import AgentPage, { CompletedSection } from '@/app/components/agent/AgentPage';
import { VacationHouseAgentState } from '@/utils/vacation-house-agent/types';
import { Suspense } from 'react';
import Markdown from 'react-markdown';



const SAMPLE_SEARCHES = [
  {
    title: "Beach House in Florida",
    description: "Looking for a beachfront vacation house in Florida",
    formData: {
      search_query: "I want a beachfront vacation house in Florida with at least 3 bedrooms and a pool"
    }
  },
  {
    title: "Mountain Cabin in Colorado",
    description: "Searching for a cozy mountain retreat",
    formData: {
      search_query: "Looking for a mountain cabin in Colorado with ski access and a hot tub"
    }
  },
  {
    title: "Lake House in Michigan",
    description: "Waterfront property on a Michigan lake",
    formData: {
      search_query: "Need a lakefront vacation house in Michigan with boat dock and large deck"
    }
  }
];

const FORM_FIELDS = [
  {
    name: 'search_query',
    label: 'What kind of vacation house are you looking for?',
    placeholder: 'Describe your ideal vacation house, including location, features, and preferences',
    required: true,
  }
];

const renderResults = (state: VacationHouseAgentState) => {
  const { raw } = state.current_state;

  return (
    <div className="space-y-8">
      {raw && (
        <CompletedSection title="Recommendations">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                <Markdown>{raw}</Markdown>
            
            </p>
          </div>
        </CompletedSection>
      )}
    </div>
  );
};

const renderLoadingState = (currentState: Partial<VacationHouseAgentState>) => {
  const completedTasks: string[] = [];
  const pendingTasks: string[] = [];
  
  const tasks = [
    { key: 'search_query', label: 'Processing your request' },
    { key: 'response', label: 'Generating recommendations' }
  ];

  tasks.forEach(task => {
    if (currentState.current_state?.[task.key as keyof VacationHouseAgentState['current_state']]) {
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

export default function VacationHouseAgent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgentPage<VacationHouseAgentState>
        agentName="vacation-house-agent"
        agentDisplayName="Vacation House Finder"
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