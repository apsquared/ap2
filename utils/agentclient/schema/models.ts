export enum Provider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  GROQ = 'groq',
  AWS = 'aws',
  FAKE = 'fake'
}

/**
 * https://platform.openai.com/docs/models/gpt-4o
 */
export enum OpenAIModelName {
  GPT_4O_MINI = 'gpt-4o-mini',
  GPT_4O = 'gpt-4o'
}

/**
 * https://docs.anthropic.com/en/docs/about-claude/models#model-names
 */
export enum AnthropicModelName {
  HAIKU_3 = 'claude-3-haiku',
  HAIKU_35 = 'claude-3.5-haiku',
  SONNET_35 = 'claude-3.5-sonnet'
}

/**
 * https://ai.google.dev/gemini-api/docs/models/gemini
 */
export enum GoogleModelName {
  GEMINI_15_FLASH = 'gemini-1.5-flash'
}

/**
 * https://console.groq.com/docs/models
 */
export enum GroqModelName {
  LLAMA_31_8B = 'groq-llama-3.1-8b',
  LLAMA_33_70B = 'groq-llama-3.3-70b',
  LLAMA_GUARD_3_8B = 'groq-llama-guard-3-8b'
}

/**
 * https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html
 */
export enum AWSModelName {
  BEDROCK_HAIKU = 'bedrock-3.5-haiku'
}

/**
 * Fake model for testing.
 */
export enum FakeModelName {
  FAKE = 'fake'
}

export type AllModelEnum =
  | OpenAIModelName
  | AnthropicModelName
  | GoogleModelName
  | GroqModelName
  | AWSModelName
  | FakeModelName; 