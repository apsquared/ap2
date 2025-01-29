"use client";

import AgentPage, { CompletedSection } from '@/app/components/agent/AgentPage';
import type { CollegeFinderState, College } from "@/utils/college-agent/type";
import { Suspense } from 'react';
import ReactMarkdown from "react-markdown";

const SAMPLE_SEARCHES = [
  {
    title: "Computer Science in California",
    description: "Top CS programs in California",
    formData: {
      major: "Computer Science",
      location_preference: "California",
      max_colleges: 5
    }
  },
  {
    title: "Affordable Business Schools",
    description: "Business programs under $30k/year",
    formData: {
      major: "Business",
      max_tuition: 30000,
      max_colleges: 5
    }
  },
  {
    title: "Engineering with High Acceptance",
    description: "Engineering schools with >70% acceptance",
    formData: {
      major: "Engineering",
      min_acceptance_rate: 70,
      max_colleges: 5
    }
  }
];

const FORM_FIELDS = [
  {
    name: "major",
    label: "Major/Field of Study",
    placeholder: "Enter desired major",
  },
  {
    name: "location_preference",
    label: "Location Preference",
    placeholder: "Enter preferred location",
  },
  {
    name: "max_tuition",
    label: "Maximum Tuition (USD/year)",
    type: "number",
    placeholder: "Enter maximum tuition",
  },
  {
    name: "min_acceptance_rate",
    label: "Minimum Acceptance Rate (%)",
    type: "number",
    placeholder: "Enter minimum acceptance rate",
  },
  {
    name: "sat_score",
    label: "SAT Score",
    type: "number",
    placeholder: "Enter your SAT score",
  }
];

const renderResults = (state: CollegeFinderState) => {
  const { colleges, recommendations } = state;

  return (
    <div className="space-y-8">
      {recommendations && recommendations.length > 0 && (
        <CompletedSection title="Recommendations">
          <ul className="list-disc list-inside space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">
                {rec}
              </li>
            ))}
          </ul>
        </CompletedSection>
      )}

      {colleges && colleges.length > 0 && (
        <CompletedSection title="Matching Colleges">
          <div className="grid grid-cols-1 gap-6">
            {colleges.map((college: College, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <h3 className="text-xl font-semibold">{college.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{college.location}</p>
                <p className="text-sm">{college.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {college.acceptance_rate && (
                    <div>
                      <span className="text-sm font-medium">Acceptance Rate:</span>
                      <p className="text-sm">{college.acceptance_rate}</p>
                    </div>
                  )}
                  {college.tuition && (
                    <div>
                      <span className="text-sm font-medium">Tuition:</span>
                      <p className="text-sm">{college.tuition}</p>
                    </div>
                  )}
                  {college.enrollment && (
                    <div>
                      <span className="text-sm font-medium">Enrollment:</span>
                      <p className="text-sm">{college.enrollment}</p>
                    </div>
                  )}
                  {college.sat_scores && (
                    <div>
                      <span className="text-sm font-medium">SAT Scores:</span>
                      <p className="text-sm">{college.sat_scores}</p>
                    </div>
                  )}
                </div>
                {college.programs && college.programs.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Notable Programs:</span>
                    <p className="text-sm">{college.programs.join(", ")}</p>
                  </div>
                )}
                {college.url && (
                  <a
                    href={college.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 text-sm inline-block mt-2"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            ))}
          </div>
        </CompletedSection>
      )}
    </div>
  );
};

interface TaskDefinition {
  key: keyof CollegeFinderState;
  label: string;
  checkEmpty?: boolean;
}

const renderLoadingState = (currentState: Partial<CollegeFinderState>) => {
  const completedTasks: string[] = [];
  const pendingTasks: string[] = [];
  
  const tasks: TaskDefinition[] = [
    { key: 'search_query', label: 'Building search query' },
    { key: 'colleges', label: 'Finding matching colleges', checkEmpty: true },
    { key: 'recommendations', label: 'Generating recommendations', checkEmpty: true }
  ];

  tasks.forEach(task => {
    if (task.checkEmpty) {
      const value = currentState[task.key];
      if (Array.isArray(value) && value.length > 0) {
        completedTasks.push(task.label);
      } else {
        pendingTasks.push(task.label);
      }
    } else {
      if (currentState[task.key]) {
        completedTasks.push(task.label);
      } else {
        pendingTasks.push(task.label);
      }
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

export default function CollegeFinderAgent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <AgentPage<CollegeFinderState>
      agentName="college-finder-agent"
      sampleSearches={SAMPLE_SEARCHES}
      formFields={FORM_FIELDS}
      children={{
        renderResults,
        renderLoadingState
      }}
    />
    </Suspense>
  );
} 