import { LLMAnswer } from "../model";

export function parseLLMAnswer(answer: string): LLMAnswer | "done" | null {
  const payload = answer.slice("data:".length).trim();
  if (payload === "[DONE]") return "done";
  try {
    const value = JSON.parse(payload);
    return value;
  } catch {
    return null;
  }
}
