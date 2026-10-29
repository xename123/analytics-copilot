// Хелперы для тестов стриминга: собирают fake Response из SSE-чанков.

const encoder = new TextEncoder();

/** Одно SSE-событие в формате OpenAI-совместимого API (как отдаёт Ollama). */
export function sseToken(content: string): string {
  return `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;
}

export const SSE_DONE = "data: [DONE]\n\n";

/** Response, тело которого отдаёт chunks по одному (каждый элемент = один network-чанк). */
export function sseResponse(
  chunks: (string | Uint8Array)[],
  init?: ResponseInit,
): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(
          typeof chunk === "string" ? encoder.encode(chunk) : chunk,
        );
      }
      controller.close();
    },
  });
  return new Response(body, init);
}

/**
 * fetch, который никогда не отвечает — для проверки «сколько раз ушёл запрос».
 * Как и настоящий fetch, реджектится с AbortError, если отменить его signal.
 */
export function neverResolvingFetch(
  _input?: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () =>
      reject(new DOMException("The operation was aborted.", "AbortError")),
    );
  });
}
