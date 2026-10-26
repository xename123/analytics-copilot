import { LLMAnswer } from "../model";

function isLLMAnswer(value: unknown): value is LLMAnswer {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { choices?: unknown }).choices)
  );
}
export function parseLLMAnswer(answer: string): LLMAnswer | "done" | null {
  const payload = answer.slice("data:".length).trim();
  if (payload === "[DONE]") return "done";
  try {
    const value = JSON.parse(payload);
    return isLLMAnswer(value) ? value : null;
  } catch {
    return null;
  }
}
