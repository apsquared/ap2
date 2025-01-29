import axios, { AxiosInstance } from 'axios';
import { config } from 'dotenv';

import {
  AgentState,
  ChatHistory,
  ChatHistoryInput,
  ChatMessage,
  ServiceMetadata,
  StreamInput,
  UserInput,
} from '../schema/schema';
import { AllModelEnum } from '../schema/models';

config();

export class AgentClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentClientError';
  }
}

export class AgentClient {
  private baseUrl: string;
  private authSecret: string | undefined;
  private timeout: number | undefined;
  private info: ServiceMetadata | null;
  private agent: string | null;
  private axiosInstance: AxiosInstance;

  /**
   * Initialize the client.
   * @param baseUrl The base URL of the agent service.
   * @param agent The name of the default agent to use.
   * @param timeout The timeout for requests.
   * @param getInfo Whether to fetch agent information on init.
   */
  constructor(
    baseUrl: string = 'http://localhost:8123',
    agent: string | null = null,
    timeout?: number,
    getInfo: boolean = true
  ) {
    this.baseUrl = baseUrl;
    this.authSecret = process.env.AUTH_SECRET;
    this.timeout = timeout;
    this.info = null;
    this.agent = null;

    console.log('Initializing: Base URL', this.baseUrl);

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: this.getHeaders(),
    });


    console.log("AgentClient initialized with baseUrl complete:", this.baseUrl);
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.authSecret) {
      headers['Authorization'] = `Bearer ${this.authSecret}`;
    }
    return headers;
  }

  public async retrieveInfo(): Promise<void> {
    try {
      const response = await this.axiosInstance.get<ServiceMetadata>('/info');
      this.info = response.data;
      if (!this.agent || !this.info?.agents.some(a => a.key === this.agent)) {
        console.log('Setting: Default Agent', this.info?.default_agent);
        this.agent = this.info?.default_agent ?? null;
      }
      console.log("Agent: ", this.agent);
    } catch (error) {
      throw new AgentClientError(`Error getting service info: ${error}`);
    }
  }

  public async updateAgent(agent: string, verify: boolean = true): Promise<void> {
    if (verify) {
      if (!this.info) {
        await this.retrieveInfo();
      }
      const agentKeys = this.info?.agents.map(a => a.key) ?? [];
      if (!agentKeys.includes(agent)) {
        throw new AgentClientError(
          `Agent ${agent} not found in available agents: ${agentKeys.join(', ')}`
        );
      }
    }
    this.agent = agent;
  }

  public async invoke(
    message?: string | null,
    state?: Record<string, any> | null,
    model?: AllModelEnum | null,
    threadId?: string | null
  ): Promise<any> {
    if (!this.agent) {
      throw new AgentClientError('No agent selected. Use updateAgent() to select an agent.');
    }

    const request: UserInput = { message, state };
    if (threadId) {
      request.thread_id = threadId;
    }
    if (model) {
      request.model = model;
    }

    try {
      const response = await this.axiosInstance.post(
        `/${this.agent}/invoke`,
        request
      );
      return response.data;
    } catch (error) {
      throw new AgentClientError(`Error: ${error}`);
    }
  }

  private parseStreamLine(line: string): any | string | null {
    line = line.trim();
    if (line.startsWith('data: ')) {
      const data = line.substring(6);
      if (data === '[DONE]') {
        return null;
      }
      try {
        return JSON.parse(data);
      } catch (error) {
        throw new Error(`Error JSON parsing message from server: ${error}`);
      }
    }
    return null;
  }

  public async *stream(
    message?: string | null,
    state?: Record<string, any> | null,
    model?: AllModelEnum | null,
    threadId?: string | null,
    streamTokens: boolean = true
  ): AsyncGenerator<ChatMessage | string | Record<string, any>, void, unknown> {
    if (!this.agent) {
      throw new AgentClientError('No agent selected. Use updateAgent() to select an agent.');
    }

    const request: StreamInput = {
      message,
      state,
      stream_tokens: streamTokens,
    };
    if (threadId) {
      request.thread_id = threadId;
    }
    if (model) {
      request.model = model;
    }

    try {
      const response = await this.axiosInstance.post(
        `/${this.agent}/stream`,
        request,
        {
          responseType: 'stream',
        }
      );

      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.trim()) {
            const parsed = this.parseStreamLine(line);
            if (parsed === null) {
              return;
            }
            yield parsed;
          }
        }
      }
    } catch (error) {
      throw new AgentClientError(`Error: ${error}`);
    }
  }


  public async getHistory(threadId: string): Promise<ChatHistory> {
    const request: ChatHistoryInput = {
      thread_id: threadId,
    };

    try {
      const response = await this.axiosInstance.post<ChatHistory>(
        '/history',
        request
      );
      return response.data;
    } catch (error) {
      throw new AgentClientError(`Error: ${error}`);
    }
  }

  /**
   * Start an agent run asynchronously and return immediately.
   * @param message The message to send to the agent
   * @param state Initial state for state-based agents
   * @param model LLM model to use for the agent
   * @param threadId Thread ID for continuing a conversation
   * @returns Response containing the run_id and other metadata
   */
  public async startAgentRun(
    message?: string | null,
    state?: Record<string, any> | null,
    model?: AllModelEnum | null,
    threadId?: string | null
  ): Promise<AgentState> {
    if (!this.agent) {
      throw new AgentClientError('No agent selected. Use updateAgent() to select an agent.');
    }

    const request: UserInput = { message, state };
    if (threadId) {
      request.thread_id = threadId;
    }
    if (model) {
      request.model = model;
    }

    try {
      const response = await this.axiosInstance.post(
        `/${this.agent}/start`,
        request
      );
      return response.data;
    } catch (error) {
      throw new AgentClientError(`Error: ${error}`);
    }
  }

  /**
   * Get the status of an agent run.
   * @param runId The ID of the run to check
   * @returns Status information about the run
   */
  public async getRunStatus(runId: string): Promise<AgentState> {
    try {
      console.log("Getting run status for: ", runId);
      console.log(`Full URL: ${this.axiosInstance.defaults.baseURL}/agent/${runId}/status`);
      const response = await this.axiosInstance.get(
        `/agent/${runId}/status`
      );
      return response.data;
    } catch (error) {
      throw new AgentClientError(`Error: ${error}`);
    }
  }
} 