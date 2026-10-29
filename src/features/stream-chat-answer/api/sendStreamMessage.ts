import { LLMMessage } from "../model";
import { endpoints, LLM_MODEL_NAME } from "./config";

export async function sendStreamMessage(
  messages: LLMMessage[],
  signal: AbortSignal,
): Promise<Response> {
  const response = await fetch(endpoints.chatCompletions, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LLM_MODEL_NAME,
      messages,
      stream: true,
    }),
    signal,
  });
  return response;
}
