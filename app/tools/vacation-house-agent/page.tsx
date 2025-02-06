"use client";

import AgentPage, { CompletedSection } from '@/app/components/agent/AgentPage';
import { VacationHouseAgentState, VacationHomes } from '@/utils/vacation-house-agent/types';
import { Suspense } from 'react';
import Markdown from 'react-markdown';



const SAMPLE_SEARCHES = [
  {
    title: "Beach House in Florida",
    description: "Looking for a beachfront vacation house in Florida",
    formData: {
      search_query: "I want a beachfront vacation house in Florida under 1 million dollars"
    }
  },
  {
    title: "Key West Vibe",
    description: "A place in a city with a Key West vibe",
    formData: {
      search_query: "I want a place in a town with a Key West vibe in North or South Carolina under $750,000"
    }
  },
  {
    title: "Lake House in Michigan",
    description: "Waterfront property on a Michigan lake",
    formData: {
      search_query: "Need a lakefront vacation house in Michigan under $500,000"
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

const HomeCard = ({ home }: { home: VacationHomes }) => (
  <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
    <h4 className="font-medium">{home.address}</h4>
    <p className="text-sm text-gray-600 dark:text-gray-300">Price: {home.price}</p>
    <p className="text-sm mt-2">{home.why_it_matches}</p>
    <p className="text-sm">Walk Score: {home.walk_score}</p>
    
    {home.bars_and_restaurants.length > 0 && (
      <div className="mt-3">
        <h5 className="text-sm font-medium">Nearby Bars & Restaurants:</h5>
        <ul className="text-sm ml-4">
          {home.bars_and_restaurants.map((business, j) => (
            <li key={j}>
              {business.name} - {business.type} ({business.distanceFromHome})
            </li>
          ))}
        </ul>
      </div>
    )}

    {home.coffee_shops.length > 0 && (
      <div className="mt-3">
        <h5 className="text-sm font-medium">Nearby Coffee Shops:</h5>
        <ul className="text-sm ml-4">
          {home.coffee_shops.map((shop, j) => (
            <li key={j}>
              {shop.name} - {shop.type} ({shop.distanceFromHome})
            </li>
          ))}
        </ul>
      </div>
    )}

    <a 
      href={home.link}
      target="_blank"
      rel="noopener noreferrer" 
      className="text-blue-500 hover:text-blue-600 text-sm mt-3 inline-block"
    >
      View Listing
    </a>
  </div>
);

const renderResults = (state: VacationHouseAgentState) => {
  const { json_dict } = state.current_state;

  return (
    <div className="space-y-8">
      {json_dict && (
        <CompletedSection title="Recommendations">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-gray-700 dark:text-gray-300">{json_dict.summary}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Recommended Cities</h3>
              <div className="space-y-6">
                {json_dict.candidate_cities.map((city, i) => (
                  <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h4 className="font-medium text-lg">{city.city}, {city.state}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Price Range: {city.price_range}</p>
                    <p className="text-sm mt-2">{city.why_it_matches}</p>
                    <p className="text-sm mt-2">Short Term Rental Info: {city.short_term_rental_info}</p>
                    
                    {city.homes && city.homes.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Available Homes</h5>
                        <div className="space-y-4 pl-4">
                          {city.homes.map((home, j) => (
                            <HomeCard key={j} home={home} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
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
        agentType="crewai"
        sourceCodeLink="https://github.com/apsquared/lg-agents/tree/main/src/crew_agents/vacation_house_agent"
      >
        {{
          renderResults,
          renderLoadingState
        }}
      </AgentPage>
    </Suspense>
  );
} 