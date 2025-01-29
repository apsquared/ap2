import type { ToolItem } from "../data/tools"

export function ToolCard({ name, description, icon: Icon, link }: ToolItem) {
  return (
   <a href={link} ><div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-3">
          <Icon className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{name}</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div></a>
  )
}

