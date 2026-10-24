export async function* readSSEStream(
  response: Response,
): AsyncGenerator<string> {
  if (!response.body) throw new Error("Нет тела ответа");
  const decoder = new TextDecoder("utf-8");
  const reader = response.body.getReader();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const message of parts) {
      if (message.trim()) yield message.trim();
    }
  }
}
