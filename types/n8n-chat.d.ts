declare module '@n8n/chat' {
  export interface ChatOptions {
    webhookUrl: string;
    target?: string;
    mode?: 'window' | 'fullscreen';
    showWelcomeScreen?: boolean;
    enableStreaming?: boolean;
    defaultLanguage?: string;
    metadata?: Record<string, any>;
    initialMessages?: string[];
    i18n?: {
      [key: string]: {
        title?: string;
        subtitle?: string;
        inputPlaceholder?: string;
        sendButton?: string;
        typingIndicator?: string;
        errorMessage?: string;
        noMessages?: string;
        loading?: string;
      };
    };
  }

  export function createChat(options: ChatOptions): void;
}

declare module '@n8n/chat/style.css';
