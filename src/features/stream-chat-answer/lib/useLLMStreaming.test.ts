import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { LLMMessage } from "../model";
import { useLLMStreaming } from "./useLLMStreaming";
import {
  neverResolvingFetch,
  SSE_DONE,
  sseResponse,
  sseToken,
} from "@/shared/lib/test-utils";

const question = (content: string): LLMMessage[] => [{ role: "user", content }];

// Hook перезапускает запрос при каждой новой ссылке на messages, поэтому
// массив создаём один раз вне колбэка renderHook — как это делал бы useMemo.
const singleQuestion = question("q");

describe("useLLMStreaming", () => {
  test("пустой messages — запрос не отправляется", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { result } = renderHook(() => useLLMStreaming([]));
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.current.status).toBe("pending");
  });

  test("склеивает токены и завершается на [DONE]", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      sseResponse([sseToken("Выручка "), sseToken("растёт"), SSE_DONE]),
    );
    const { result } = renderHook(() => useLLMStreaming(singleQuestion));
    await waitFor(() => expect(result.current.status).toBe("done"));
    expect(result.current.content).toBe("Выручка растёт");
  });

  test("HTTP 404/500 → status 'error', а не вечный pending", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async () => new Response('{"error":"model not found"}', { status: 404 }),
    );
    const { result } = renderHook(() => useLLMStreaming(singleQuestion));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBeTruthy();
  });

  test("сеть упала → status 'error' с текстом ошибки", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    );
    const { result } = renderHook(() => useLLMStreaming(singleQuestion));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("Failed to fetch");
  });

  test("стрим закрылся без [DONE] → не зависает в 'streaming'", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      sseResponse([sseToken("Выручка "), sseToken("растёт")]),
    );
    const { result } = renderHook(() => useLLMStreaming(singleQuestion));
    await waitFor(() =>
      expect(["done", "error"]).toContain(result.current.status),
    );
    expect(result.current.content).toBe("Выручка растёт");
  });

  test("новый запрос сразу сбрасывает старый ответ", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(sseResponse([sseToken("ответ-1"), SSE_DONE]));
    const { result, rerender } = renderHook(
      ({ messages }) => useLLMStreaming(messages),
      { initialProps: { messages: question("q1") } },
    );
    await waitFor(() => expect(result.current.status).toBe("done"));

    fetchSpy.mockImplementation(neverResolvingFetch);
    rerender({ messages: question("q2") });

    expect(result.current.content).toBe("");
    expect(result.current.status).not.toBe("done");
  });

  test("смена messages отменяет предыдущий запрос (abort)", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(neverResolvingFetch);
    const { rerender } = renderHook(
      ({ messages }) => useLLMStreaming(messages),
      { initialProps: { messages: question("q1") } },
    );
    const firstSignal = (fetchSpy.mock.calls[0]?.[1] as RequestInit).signal;
    await act(async () => rerender({ messages: question("q2") }));

    expect(firstSignal?.aborted).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
