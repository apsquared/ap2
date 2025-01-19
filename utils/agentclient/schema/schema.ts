import { AllModelEnum, OpenAIModelName } from './models';


export enum AgentStatus {
  RUNNING = "running",
  COMPLETED = "completed",
  ERROR = "error"
}

export interface AgentState {
  run_id: string;
  thread_id: string;
  status: AgentStatus;
  start_time: Date;
  last_update: Date;
  current_state: Record<string, any>;
}


/**
 * Info about an available agent.
 */
export interface AgentInfo {
  /** Agent key. */
  key: string;
  /** Description of the agent. */
  description: string;
}

/**
 * Metadata about the service including available agents and models.
 */
export interface ServiceMetadata {
  /** List of available agents. */
  agents: AgentInfo[];
  /** List of available LLMs. */
  models: AllModelEnum[];
  /** Default agent used when none is specified. */
  default_agent: string;
  /** Default model used when none is specified. */
  default_model: AllModelEnum;
}

/**
 * Basic user input for the agent.
 */
export interface UserInput {
  /** User input to the agent. Required for chat-based agents. */
  message?: string | null;
  /** Initial state for state-based agents like marketing_agent. */
  state?: Record<string, any> | null;
  /** LLM Model to use for the agent. */
  model?: AllModelEnum;
  /** Thread ID to persist and continue a multi-turn conversation. */
  thread_id?: string | null;
}

/**
 * User input for streaming the agent's response.
 */
export interface StreamInput extends UserInput {
  /** Whether to stream LLM tokens to the client. */
  stream_tokens?: boolean;
}

/**
 * Represents a request to call a tool.
 */
export interface ToolCall {
  /** The name of the tool to be called. */
  name: string;
  /** The arguments to the tool call. */
  args: Record<string, any>;
  /** An identifier associated with the tool call. */
  id?: string | null;
  /** The type of the tool call. */
  type?: 'tool_call';
}

/**
 * Message in a chat.
 */
export interface ChatMessage {
  /** Role of the message. */
  type: 'human' | 'ai' | 'tool' | 'custom';
  /** Content of the message. */
  content: string;
  /** Tool calls in the message. */
  tool_calls: ToolCall[];
  /** Tool call that this message is responding to. */
  tool_call_id?: string | null;
  /** Run ID of the message. */
  run_id?: string | null;
  /** Response metadata. For example: response headers, logprobs, token counts. */
  response_metadata: Record<string, any>;
  /** Custom message data. */
  custom_data: Record<string, any>;
}

/**
 * Feedback for a run, to record to LangSmith.
 */
export interface Feedback {
  /** Run ID to record feedback for. */
  run_id: string;
  /** Feedback key. */
  key: string;
  /** Feedback score. */
  score: number;
  /** Additional feedback kwargs, passed to LangSmith. */
  kwargs?: Record<string, any>;
}

/**
 * Response for feedback submission.
 */
export interface FeedbackResponse {
  status: 'success';
}

/**
 * Input for retrieving chat history.
 */
export interface ChatHistoryInput {
  /** Thread ID to persist and continue a multi-turn conversation. */
  thread_id: string;
}

/**
 * Chat history containing messages.
 */
export interface ChatHistory {
  messages: ChatMessage[];
}

// Helper functions
export function prettyRepr(message: ChatMessage): string {
  const baseTitle = message.type.charAt(0).toUpperCase() + message.type.slice(1) + ' Message';
  const padded = ` ${baseTitle} `;
  const sepLen = Math.floor((80 - padded.length) / 2);
  const sep = '='.repeat(sepLen);
  const secondSep = padded.length % 2 ? sep + '=' : sep;
  const title = `${sep}${padded}${secondSep}`;
  return `${title}\n\n${message.content}`;
}

export function prettyPrint(message: ChatMessage): void {
  console.log(prettyRepr(message));
} 