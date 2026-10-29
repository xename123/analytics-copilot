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
import { aggregateByMonth, mockOrders } from "@/entities/order";
import type { DashboardContext } from "../model";
import { ChatPanel } from "./ChatPanel";

const chatContext: DashboardContext = {
  category: "electronics",
  revenueByMonth: aggregateByMonth(mockOrders),
};

function getInput() {
  return screen.getByPlaceholderText<HTMLTextAreaElement>("Введите ваш запрос");
}

function getSubmitButton() {
  return screen.getByRole<HTMLButtonElement>("button", { name: "Отправить" });
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

/** Даём отработать оставшимся рендерам и эффектам (стримы в моках уже закрыты). */
async function settle() {
  await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
}

/**
 * Ждём, пока в чате окажутся ровно эти сообщения и ответ зафиксируется в истории.
 * Не завязано на disabled у инпута: блокировать ли ввод во время ответа —
 * отдельное решение, тесты от него не зависят.
 */
async function waitForMessages(expected: string[]) {
  await waitFor(() => expect(messageTexts()).toEqual(expected));
  await settle();
}

function requestMessages(
  fetchSpy: ReturnType<typeof vi.spyOn>,
  call: number,
): LLMMessage[] {
  const init = fetchSpy.mock.calls[call]?.[1] as RequestInit;
  return (JSON.parse(init.body as string) as { messages: LLMMessage[] })
    .messages;
}

/** Всё, что после системных сообщений, — сам диалог. */
function dialogOf(messages: LLMMessage[]) {
  return messages.filter((m) => m.role !== "system");
}

describe("ChatPanel", () => {
  test("вопрос и ответ попадают в историю, поле ввода очищается", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      sseResponse([sseToken("Выручка "), sseToken("растёт"), SSE_DONE]),
    );
    render(<ChatPanel context={chatContext} />);

    ask("Как дела с выручкой?");
    await waitForMessages(["Как дела с выручкой?", "Выручка растёт"]);

    expect(getInput().value).toBe("");
  });

  test("в модель уходят промпт и данные дашборда из context", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(neverResolvingFetch);
    render(<ChatPanel context={chatContext} />);

    ask("q");
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));

    const [prompt, data] = requestMessages(fetchSpy, 0);
    expect(prompt?.role).toBe("system");
    expect(prompt?.content).not.toBe("");
    expect(data?.role).toBe("system");
    expect(JSON.parse(data?.content ?? "")).toEqual(chatContext);
  });

  test("пустой и пробельный ввод не отправляется", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<ChatPanel context={chatContext} />);

    ask("");
    ask("   ");
    await settle();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(messageTexts()).toEqual([]);
  });

  test("пробелы по краям вопроса обрезаются", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(neverResolvingFetch);
    render(<ChatPanel context={chatContext} />);

    ask("  вопрос  \n\n");
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));

    expect(messageTexts()).toEqual(["вопрос"]);
    expect(dialogOf(requestMessages(fetchSpy, 0))).toEqual([
      { role: "user", content: "вопрос" },
    ]);
  });

  test("Enter отправляет, Shift+Enter — нет", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(neverResolvingFetch);
    render(<ChatPanel context={chatContext} />);

    fireEvent.change(getInput(), { target: { value: "строка" } });
    fireEvent.keyDown(getInput(), { key: "Enter", shiftKey: true });
    await settle();
    expect(fetchSpy).not.toHaveBeenCalled();

    fireEvent.keyDown(getInput(), { key: "Enter" });
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
  });

  test("пока модель отвечает, второй вопрос не уходит ни кнопкой, ни Enter", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(neverResolvingFetch);
    render(<ChatPanel context={chatContext} />);

    ask("первый");
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(getSubmitButton().disabled).toBe(true);

    // submit напрямую — проверяем защиту в handleSubmit, а не только disabled у кнопки
    ask("второй");
    fireEvent.change(getInput(), { target: { value: "третий" } });
    fireEvent.keyDown(getInput(), { key: "Enter" });
    await settle();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(messageTexts()).toEqual(["первый"]);
    // во время ответа печатать можно — набранный текст не теряется
    expect(getInput().disabled).toBe(false);
    expect(getInput().value).toBe("третий");
  });

  test("после ответа кнопка снова активна", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      sseResponse([sseToken("Ответ"), SSE_DONE]),
    );
    render(<ChatPanel context={chatContext} />);

    expect(getSubmitButton().disabled).toBe(false);
    ask("q");
    await waitForMessages(["q", "Ответ"]);

    expect(getSubmitButton().disabled).toBe(false);
  });

  test("HTTP 404 от модели → ошибка видна, следующий вопрос уходит", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(
        async () =>
          new Response('{"error":"model not found"}', { status: 404 }),
      );
    render(<ChatPanel context={chatContext} />);

    ask("привет");
    await waitFor(() => expect(messageTexts()).toHaveLength(2));
    await settle();
    expect(messageTexts()[1]).toContain("404");

    ask("ещё раз");
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
  });

  test("стрим оборвался без [DONE] → ответ сохраняется, следующий вопрос уходит", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () =>
        sseResponse([sseToken("Выручка "), sseToken("растёт")]),
      );
    render(<ChatPanel context={chatContext} />);

    ask("привет");
    await waitForMessages(["привет", "Выручка растёт"]);

    ask("ещё");
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
  });

  test("пустой ответ модели → понятная заглушка, а не пустой пузырь", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      sseResponse([SSE_DONE]),
    );
    render(<ChatPanel context={chatContext} />);

    ask("q");
    await waitFor(() => expect(messageTexts()).toHaveLength(2));
    await settle();

    expect(messageTexts()[1]).not.toBe("");
  });

  test("две одинаковые ошибки подряд → обе показаны", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    );
    render(<ChatPanel context={chatContext} />);

    ask("первый");
    await waitForMessages(["первый", "Failed to fetch"]);
    ask("второй");
    await waitForMessages([
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
    render(<ChatPanel context={chatContext} />);

    ask("q1");
    await waitForMessages(["q1", "Нет данных."]);
    ask("q2");
    await waitForMessages(["q1", "Нет данных.", "q2", "Нет данных."]);
  });

  test("в модель уходит история диалога, а не только последний вопрос", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementationOnce(async () =>
        sseResponse([sseToken("Ответ 1"), SSE_DONE]),
      )
      .mockImplementation(neverResolvingFetch);
    render(<ChatPanel context={chatContext} />);

    ask("Вопрос 1");
    await waitForMessages(["Вопрос 1", "Ответ 1"]);
    ask("А почему?");
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));

    expect(dialogOf(requestMessages(fetchSpy, 1))).toEqual([
      { role: "user", content: "Вопрос 1" },
      { role: "assistant", content: "Ответ 1" },
      { role: "user", content: "А почему?" },
    ]);
  });

  test("текст ошибки не уходит в модель как реплика ассистента", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockImplementation(neverResolvingFetch);
    render(<ChatPanel context={chatContext} />);

    ask("q1");
    await waitForMessages(["q1", "Failed to fetch"]);
    ask("q2");
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));

    const dialog = dialogOf(requestMessages(fetchSpy, 1));
    expect(dialog.some((m) => m.content === "Failed to fetch")).toBe(false);
  });

  test("смена context (фильтр) посреди стрима отменяет запрос и шлёт новые данные", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(neverResolvingFetch);
    const { rerender } = render(<ChatPanel context={chatContext} />);

    ask("q");
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    const firstSignal = (fetchSpy.mock.calls[0]?.[1] as RequestInit).signal;

    const booksContext: DashboardContext = {
      category: "books",
      revenueByMonth: aggregateByMonth(
        mockOrders.filter((o) => o.category === "books"),
      ),
    };
    rerender(<ChatPanel context={booksContext} />);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));

    expect(firstSignal?.aborted).toBe(true);
    const data = requestMessages(fetchSpy, 1).find(
      (m) => m.role === "system" && m.content.startsWith("{"),
    );
    expect(JSON.parse(data?.content ?? "")).toEqual(booksContext);

    // Отмена из-за смены фильтра — не ошибка: в чате только вопрос.
    await settle();
    expect(messageTexts()).toEqual(["q"]);
  });

  test("перерендер с тем же context не перезапускает запрос", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(neverResolvingFetch);
    const { rerender } = render(<ChatPanel context={chatContext} />);

    ask("q");
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    rerender(<ChatPanel context={chatContext} />);
    await settle();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
