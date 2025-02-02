"use client";

import AgentPage, { CompletedSection } from '@/app/components/agent/AgentPage';
import type { TeamRosterAgentState, Team, Player, TeamRosterPlanState } from "@/utils/team-roster-client/types";
import { Suspense } from 'react';
import ReactMarkdown from "react-markdown";

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

const FORM_FIELDS = [
  {
    name: "college_name",
    label: "College Name",
    placeholder: "Enter college name",
    required: true,
  }
];

const renderResults = (state: TeamRosterAgentState) => {
  const { team, summary } = state.current_state;

  return (
    <div className="space-y-8">
      {summary && (
        <CompletedSection title="Team Summary">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </CompletedSection>
      )}

      {team && (
        <CompletedSection title="Team Roster">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.players.map((player: Player, index: number) => (
              <div key={index} className="p-4 border rounded">
                <h3 className="font-semibold">{player.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {player.position} • {player.height}
                  {player.velocity && ` • ${player.velocity} mph`}
                </p>
                <p className="text-sm">{player.hometown}</p>
              </div>
            ))}
          </div>
        </CompletedSection>
      )}
    </div>
  );
};

interface TaskDefinition {
  key: keyof TeamRosterPlanState;
  label: string;
  checkEmpty?: boolean;
}

const renderLoadingState = (currentState: Partial<TeamRosterAgentState>) => {
  const completedTasks: string[] = [];
  const pendingTasks: string[] = [];
  
  const tasks: TaskDefinition[] = [
    { key: 'roster_url', label: 'Finding team roster' },
    { key: 'team', label: 'Processing player information', checkEmpty: true },
    { key: 'summary', label: 'Generating team summary' }
  ];

  tasks.forEach(task => {
    if (task.checkEmpty) {
      const value = currentState.current_state?.[task.key];
      if (value && (value as Team)?.players?.length > 0) {
        completedTasks.push(task.label);
      } else {
        pendingTasks.push(task.label);
      }
    } else {
      if (currentState.current_state?.[task.key]) {
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

export default function TeamRosterAgent() {
  const sourceCodeLink = "https://github.com/apsquared/lg-agents/tree/main/src/agents/college_finder_agent";
  const graphImageLink = "https://github.com/apsquared/lg-agents/blob/main/roster_graph.png?raw=true";

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgentPage<TeamRosterAgentState>
        agentDisplayName="College Baseball Roster Agent"
        agentName="team-roster-agent"
        sampleSearches={SAMPLE_SEARCHES}
        formFields={FORM_FIELDS}
        sourceCodeLink={sourceCodeLink}
        graphImageLink={graphImageLink}
      >
        {{
          renderResults,
          renderLoadingState
        }}
      </AgentPage>
    </Suspense>
  );
} 