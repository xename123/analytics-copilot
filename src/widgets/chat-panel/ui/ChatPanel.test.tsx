import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { LLMMessage } from "@/features/stream-chat-answer";
import {
  neverResolvingFetch,
  SSE_DONE,
  sseResponse,
  sseToken,
} from "@/shared/lib/test-utils";
import { ChatPanel } from "./ChatPanel";

const systemMessages: LLMMessage[] = [{ role: "system", content: "SYSTEM" }];

function getInput() {
  return screen.getByPlaceholderText<HTMLInputElement>("Введите ваш запрос");
}

function ask(text: string) {
  const input = getInput();
  fireEvent.change(input, { target: { value: text } });
  fireEvent.submit(input.closest("form")!);
}

function messageTexts() {
  return [...document.querySelectorAll(".message__content")].map(
    (el) => el.textContent,
  );
}

/** Ждём, пока чат снова примет ввод — то есть ответ полностью обработан. */
async function waitUntilReady() {
  await waitFor(() => expect(getInput().disabled).toBe(false));
}

function requestBody(fetchSpy: ReturnType<typeof vi.spyOn>, call: number) {
  const init = fetchSpy.mock.calls[call]?.[1] as RequestInit;
  return JSON.parse(init.body as string) as { messages: LLMMessage[] };
}

describe("ChatPanel", () => {
  test("вопрос и ответ попадают в историю, инпут снова доступен", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      sseResponse([sseToken("Выручка "), sseToken("растёт"), SSE_DONE]),
    );
    render(<ChatPanel systemMessages={systemMessages} />);

    ask("Как дела с выручкой?");
    await waitUntilReady();

    expect(messageTexts()).toEqual(["Как дела с выручкой?", "Выручка растёт"]);
    expect(getInput().value).toBe("");
  });

  test("пустой и пробельный ввод не отправляется", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<ChatPanel systemMessages={systemMessages} />);

    ask("");
    ask("   ");
    await act(() => new Promise((r) => setTimeout(r, 20)));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(messageTexts()).toEqual([]);
  });

  test("HTTP 404 от модели → ошибка видна, чат не блокируется", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async () => new Response('{"error":"model not found"}', { status: 404 }),
    );
    render(<ChatPanel systemMessages={systemMessages} />);

    ask("привет");
    await waitUntilReady();

    expect(messageTexts()).toHaveLength(2);
  });

  test("стрим оборвался без [DONE] → ответ сохраняется, чат не блокируется", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      sseResponse([sseToken("Выручка "), sseToken("растёт")]),
    );
    render(<ChatPanel systemMessages={systemMessages} />);

    ask("привет");
    await waitUntilReady();

    expect(messageTexts()).toContain("Выручка растёт");
  });

  test("две одинаковые ошибки подряд → обе показаны, чат не блокируется", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    );
    render(<ChatPanel systemMessages={systemMessages} />);

    ask("первый");
    await waitUntilReady();
    ask("второй");
    await waitUntilReady();

    expect(messageTexts()).toEqual([
      "первый",
      "Failed to fetch",
      "второй",
      "Failed to fetch",
    ]);
  });

  test("два одинаковых ответа подряд (одним чанком) → оба в истории", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      sseResponse([sseToken("Нет данных.") + SSE_DONE]),
    );
    render(<ChatPanel systemMessages={systemMessages} />);

    ask("q1");
    await waitUntilReady();
    ask("q2");
    await waitUntilReady();

    expect(messageTexts()).toEqual(["q1", "Нет данных.", "q2", "Нет данных."]);
  });

  test("в модель уходит история диалога, а не только последний вопрос", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(sseResponse([sseToken("Ответ 1"), SSE_DONE]))
      .mockImplementationOnce(neverResolvingFetch);
    render(<ChatPanel systemMessages={systemMessages} />);

    ask("Вопрос 1");
    await waitUntilReady();
    ask("А почему?");
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));

    expect(requestBody(fetchSpy, 1).messages).toEqual([
      { role: "system", content: "SYSTEM" },
      { role: "user", content: "Вопрос 1" },
      { role: "assistant", content: "Ответ 1" },
      { role: "user", content: "А почему?" },
    ]);
  });

  test("смена systemMessages (фильтр) посреди стрима перезапускает запрос с новыми данными", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(neverResolvingFetch);
    const { rerender } = render(<ChatPanel systemMessages={systemMessages} />);

    ask("q");
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    rerender(
      <ChatPanel systemMessages={[{ role: "system", content: "NEW DATA" }]} />,
    );
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));

    expect(requestBody(fetchSpy, 1).messages[0]?.content).toBe("NEW DATA");
  });
});
