# APSquared Site

The APSquared site provides AI-powered tools to help users with various tasks. The site is built using Next.js and uses a modular agent-based architecture.

[Visit APSquared.co](https://www.apsquared.co)

## Adding a New Agent

To add a new agent to the system, follow these steps:

1. **Define Agent Types**
   - Create a new directory in `utils/` for your agent (e.g., `utils/my-agent/`)
   - Create `types.ts` to define your agent's input and state interfaces:
     ```typescript
     export interface MyAgentInput {
         // Define input parameters
     }

     export interface MyAgentState {
         // Define agent state
     }
     ```

2. **Create Agent Client**
   - Create `my-agent-client.ts` extending the base agent client:
     ```typescript
     import { BaseAgentClient } from "../agentclient/base-agent-client";
     
     export class MyAgentClient extends BaseAgentClient {
         constructor() {
             super('my-agent');
         }
         
         async startMyAgent(input: MyAgentInput): Promise<AgentState> {
             return this.startAgent(input);
         }
         
         async getMyAgentStatus(runId: string): Promise<AgentState> {
             return this.getStatus(runId);
         }
     }
     
     export const myAgentClient = new MyAgentClient();
     ```

3. **Create API Routes**
   - Create directories in `app/api/` for your agent's routes:
     ```
     app/api/my-agent/
     ├── start/
     │   └── route.ts
     └── status/
         └── [runId]/
             └── route.ts
     ```
   - Use the base route creators in your routes:
     ```typescript
     // start/route.ts
     import { createStartRoute } from '@/utils/api/base-agent-routes';
     import { myAgentClient } from '@/utils/my-agent/my-agent-client';
     
     export const POST = createStartRoute(myAgentClient);
     
     // status/[runId]/route.ts
     import { createStatusRoute } from '@/utils/api/base-agent-routes';
     import { myAgentClient } from '@/utils/my-agent/my-agent-client';
     
     export const GET = createStatusRoute(myAgentClient);
     ```

4. **Create Agent Page**
   - Create a new page in `app/tools/`:
     ```
     app/tools/my-agent/
     ├── page.tsx
     └── layout.tsx
     ```
   - Use the base `AgentPage` component:
     ```typescript
     import AgentPage from '@/app/components/agent/AgentPage';
     import type { MyAgentState } from '@/utils/my-agent/types';
     
     const SAMPLE_SEARCHES = [/* define sample searches */];
     const FORM_FIELDS = [/* define form fields */];
     
     const renderResults = (state: MyAgentState) => {
         // Render results UI
     };
     
     const renderLoadingState = (currentState: Partial<MyAgentState>) => {
         // Render loading state UI
     };
     
     export default function MyAgent() {
         return (
             <AgentPage
                 agentName="My Agent"
                 sampleSearches={SAMPLE_SEARCHES}
                 formFields={FORM_FIELDS}
                 renderResults={renderResults}
                 renderLoadingState={renderLoadingState}
             />
         );
     }
     ```

See the existing agents (Team Roster Agent, College Finder Agent) for complete examples of implementation.

