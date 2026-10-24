import { LLMMessage } from "../model";
import { endpoints } from "./config";

export async function sendStreamMessage(
  messages: LLMMessage[],
  signal: AbortSignal,
): Promise<Response> {
  const response = await fetch(endpoints.chatCompletions, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2:3b",
      messages,
      stream: true,
    }),
    signal,
  });
  return response;
}
