import { AgentState } from '../agentclient/schema/schema';
import clientPromise from './mymongo';

const AGENT_DB = 'agent_db';
const AGENT_STATE_COLLECTION = 'agent_states';

/**
 * Creates a new AgentState document in MongoDB
 * @param agentState The AgentState object to save
 * @returns The created AgentState document
 */
export async function createOrUpdateAgentState(agentState: AgentState): Promise<AgentState> {
    const client = await clientPromise;
    const collection = client.db(AGENT_DB).collection(AGENT_STATE_COLLECTION);
    
    // Ensure dates are properly set
    if (!agentState.start_time) {
        agentState.start_time = new Date();
    }
    agentState.last_update = new Date(); // Always update last_update time

    // Check if document with this run_id already exists
    const existingDoc = await collection.findOne({ run_id: agentState.run_id });

    if (existingDoc) {
        // Update existing document
        const result = await collection.findOneAndUpdate(
            { run_id: agentState.run_id },
            { $set: agentState },
            { returnDocument: 'after' }
        );

        if (!result){
            throw new Error('Failed to update agent state');
        }

        //console.log('Updated agent state', result);

        return {
            run_id: result.run_id,
            thread_id: result.thread_id,
            status: result.status,
            start_time: result.start_time,
            last_update: result.last_update,
            current_state: result.current_state,
            status_updates: result.status_updates,
            _id: result._id
        } as AgentState;
    } else {
        // Insert new document
        const result = await collection.insertOne(agentState);
        
        if (!result.acknowledged) {
            console.error('Failed to create agent state', result);
            throw new Error('Failed to create agent state');
        }

        return {
            ...agentState,
            _id: result.insertedId
        } as AgentState;
    }
}



/**
 * Gets counts of agent states grouped by status
 * @returns Object with counts for each status
 */
export async function getAgentStateCounts(): Promise<Record<string, number>> {
    const client = await clientPromise;
    const collection = client.db(AGENT_DB).collection(AGENT_STATE_COLLECTION);

    const result = await collection.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]).toArray();

    // Convert array of {_id: status, count: number} to object
    return result.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
    }, {} as Record<string, number>);
}

/**
 * Gets agent states filtered by agent name and sorted by start time descending
 * @param agentName Name of the agent to filter by
 * @returns Array of AgentState documents
 */
export async function getAgentStatesByName(agentName: string): Promise<AgentState[]> {
    const client = await clientPromise;
    const collection = client.db(AGENT_DB).collection(AGENT_STATE_COLLECTION);

    const result = await collection
        .find({ agent_name: agentName })
        .sort({ start_time: -1 })
        .toArray();

    return result.map(doc => ({
        run_id: doc.run_id,
        thread_id: doc.thread_id,
        status: doc.status,
        start_time: new Date(doc.start_time),
        last_update: new Date(doc.last_update),
        current_state: doc.current_state,
        agent_name: doc.agent_name,
        status_updates: doc.status_updates || [],
        _id: doc._id
    } as AgentState));
}

/**
 * Gets agent states  sorted by start time descending
 * @returns Array of AgentState documents
 */
export async function getAllAgentStates(): Promise<AgentState[]> {
    const client = await clientPromise;
    const collection = client.db(AGENT_DB).collection(AGENT_STATE_COLLECTION);

    const result = await collection
        .find({ })
        .sort({ start_time: -1 })
        .toArray();

    return result.map(doc => ({
        run_id: doc.run_id,
        thread_id: doc.thread_id,
        status: doc.status,
        start_time: new Date(doc.start_time),
        last_update: new Date(doc.last_update),
        current_state: doc.current_state,
        agent_name: doc.agent_name,
        status_updates: doc.status_updates || [],
        _id: doc._id
    } as AgentState));
}
