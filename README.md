# APSquared Site

The APSquared site provides AI-powered tools to help users with various tasks. The site is built using Next.js and uses a modular agent-based architecture.

[Visit APSquared.co](https://www.apsquared.co)

## Adding a New Agent

To add a new agent to the APSquared site, follow these steps:

### 1. Create Agent Types

Create a new file in `utils/your-agent-name/types.ts`:
```typescript
import { AgentState } from "../agentclient/schema/schema";

// Define the input type for your agent
export interface YourAgentInput {
    // Add your input fields here
    field1: string;
    field2: number;
    // etc...
}

// Define the state type for your agent
export interface YourAgentState extends AgentState {
    // Add your state fields here
    results?: any[];
    status?: string;
    // etc...
}
```

### 2. Create Agent Client

Create a new file in `utils/your-agent-name/your-agent-client.ts`:
```typescript
import { BaseAgentClient } from "../agentclient/base-agent-client";
import { YourAgentInput, YourAgentState } from "./types";

const YOUR_AGENT = 'your-agent-name';

export class YourAgentClient extends BaseAgentClient {
    constructor() {
        super(YOUR_AGENT);
    }

    async startYourAgent(input: YourAgentInput): Promise<YourAgentState> {
        const response = await this.startAgent(input);
        return response as YourAgentState;
    }

    async getYourAgentStatus(runId: string): Promise<YourAgentState> {
        const response = await this.getStatus(runId);
        return response as YourAgentState;
    }
}

// Create a singleton instance
export const yourAgentClient = new YourAgentClient();
```

### 3. Create API Routes

Create the following files in `app/api/your-agent-name/`:

#### start/route.ts:
```typescript
import { NextResponse } from "next/server";
import { yourAgentClient } from "@/utils/your-agent-name/your-agent-client";

export async function POST(request: Request) {
    const body = await request.json();
    try {
        const response = await yourAgentClient.startYourAgent(body);
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error starting agent:', error);
        return NextResponse.json({ error: 'Failed to start agent' }, { status: 500 });
    }
}
```

#### status/[runId]/route.ts:
```typescript
import { NextResponse } from "next/server";
import { yourAgentClient } from "@/utils/your-agent-name/your-agent-client";

export async function GET(
    request: Request,
    { params }: { params: { runId: string } }
) {
    try {
        const response = await yourAgentClient.getYourAgentStatus(params.runId);
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error getting status:', error);
        return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
    }
}
```

### 4. Create Frontend Components

Create a new directory in `app/tools/your-agent-name/` with the following files:

#### layout.tsx:
```typescript
export default function YourAgentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
```

#### page.tsx:
```typescript
"use client";

import AgentPage from '@/app/components/agent/AgentPage';
import { YourAgentState } from "@/utils/your-agent-name/types";

// Add sample searches for your agent
const SAMPLE_SEARCHES = [
    {
        title: "Sample Search 1",
        description: "Description of sample search 1",
        formData: {
            field1: "value1",
            field2: 123
        }
    },
    // Add more sample searches...
];

// Define how to render results
const renderResults = (state: YourAgentState) => {
    // Return JSX to display your agent's results
    return (
        <div>
            {/* Your results rendering logic here */}
        </div>
    );
};

// Define loading state tasks
const renderLoadingState = (currentState: Partial<YourAgentState>) => {
    return [
        // Return array of loading state descriptions
        "Task 1 description",
        "Task 2 description",
        // etc...
    ];
};

export default function YourAgent() {
    return (
        <AgentPage
            title="Your Agent Title"
            description="Description of what your agent does"
            apiEndpoint="/api/your-agent-name"
            sampleSearches={SAMPLE_SEARCHES}
            renderResults={renderResults}
            renderLoadingState={renderLoadingState}
        />
    );
}
```

### 5. Update Navigation (if needed)

Add your agent to the appropriate navigation menu or tool list in the site's navigation components.

### 6. Testing

1. Ensure your agent is properly registered with the agent service
2. Test the start and status endpoints
3. Test the frontend interface
4. Verify error handling and edge cases

### Best Practices

1. Follow the existing naming conventions
2. Implement proper type checking
3. Add error handling at all levels
4. Keep the UI components modular and reusable
5. Document any special requirements or dependencies
6. Add loading states and error states
7. Consider adding unit tests for critical functionality

