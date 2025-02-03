import { getAllAgentStates } from '@/utils/db/dbsave';
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: 'noindex, nofollow'
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export default async function AllRunsPage() {
  const runs = await getAllAgentStates();
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Runs</h1>
      <div className="space-y-4">
        {runs.map((run, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <div className="font-semibold">Run ID: {run.run_id}</div>
            <div>Agent: {run.agent_name ? (
              <a href={`/tools/${run.agent_name.toLowerCase()}?run_id=${run.run_id}`} className="text-blue-500 hover:underline">
                {run.agent_name}
              </a>
            ) : 'Unknown'}</div>
            <div>Status: {run.status}</div>
            <div>Created: {run.start_time ? new Date(run.start_time).toLocaleString() : 'N/A'}</div>
          </div>
        ))}
        {runs.length === 0 && (
          <div className="text-gray-500">No runs found</div>
        )}
      </div>
    </div>
  );
}
