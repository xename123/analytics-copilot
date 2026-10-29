export interface LLMAnswer {
  choices: {
    delta?: { content: string };
    finish_reason: string | null;
    index: number;
  }[];
  created: number;
  id: string;
  model: string;
  object: string;
  system_fingerprint: string;
}
export interface LLMMessage {
  role: ChatMessage["role"] | "system";
  content: string;
}
export interface Answer {
  status: "pending" | "streaming" | "done" | "error" | "idle";
  content: string;
  error: string | null;
}
export interface ChatMessage {
  status: Answer["status"];
  messageId: string;
  role: "user" | "assistant";
  content: string;
  error?: string;
}
