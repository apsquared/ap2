import type { ToolItem } from "../data/tools"

export function ToolCard({ name, description, icon: Icon, link, agentType }: ToolItem) {
  return (
   <a href={link} ><div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-3">
          <Icon className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{name}</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
        <div className="mt-2">
          <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 rounded">
            {agentType === 'langgraph' ? 'LangGraph' : 'CrewAI'}
          </span>
        </div>
      </div>
    </div></a>
  )
}

