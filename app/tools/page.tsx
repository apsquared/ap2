import { tools } from "./data/tools"
import { ToolCard } from "./components/ToolCard"

export default function ToolsDisplay() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Our AI Agents</h1>
      <p className="text-lg mb-8 text-left">
        The following are some sample AI Agents that we have built using our <a className="text-blue-500 hover:underline" href="https://www.apsquared.co/full-stack-ai-agents">full stack agent &quot;framework&quot;</a>.
        Each agent can be run in the browser and contains links to the source code and a graph of the agent.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <ToolCard key={index} {...tool} />
        ))}
      </div>
    </div>
  )
}

