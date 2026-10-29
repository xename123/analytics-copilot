export async function* readSSEStream(
  response: Response,
): AsyncGenerator<string> {
  if (!response.body) throw new Error("Нет тела ответа");
  const decoder = new TextDecoder("utf-8");
  const reader = response.body.getReader();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      if (buffer) yield buffer;
      return;
    }
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split(/\n\n|\r\n\r\n/);
    buffer = parts.pop() ?? "";
    for (const message of parts) {
      if (message.trim()) yield message.trim();
    }
  }
}
