import { describe, expect, test } from "vitest";
import { readSSEStream } from "./readSSEStream";
import { sseResponse } from "./test-utils";

async function collect(response: Response): Promise<string[]> {
  const events: string[] = [];
  for await (const event of readSSEStream(response)) events.push(event);
  return events;
}

describe("readSSEStream", () => {
  test("собирает событие, разрезанное между network-чанками", async () => {
    const response = sseResponse(['data: {"a"', ":1}\n", "\ndata: [DONE]\n\n"]);
    expect(await collect(response)).toEqual(['data: {"a":1}', "data: [DONE]"]);
  });

  test("не ломает кириллицу, разрезанную посреди байтов", async () => {
    const bytes = new TextEncoder().encode('data: {"c":"привет"}\n\n');
    const response = sseResponse([bytes.slice(0, 13), bytes.slice(13)]);
    expect(await collect(response)).toEqual(['data: {"c":"привет"}']);
  });

  test("отдаёт последнее событие, даже если после него нет \\n\\n", async () => {
    const response = sseResponse(['data: {"a":1}\n\ndata: [DONE]']);
    expect(await collect(response)).toEqual(['data: {"a":1}', "data: [DONE]"]);
  });

  test("понимает разделитель \\r\\n\\r\\n (допустим по спеке SSE)", async () => {
    const response = sseResponse(['data: {"a":1}\r\n\r\ndata: [DONE]\r\n\r\n']);
    expect(await collect(response)).toEqual(['data: {"a":1}', "data: [DONE]"]);
  });

  test("пустой поток — пустой результат, без ошибки", async () => {
    expect(await collect(sseResponse([]))).toEqual([]);
  });

  test("ответ без тела — понятная ошибка", async () => {
    await expect(collect(new Response(null))).rejects.toThrow();
  });
});
