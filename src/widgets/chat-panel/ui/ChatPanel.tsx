import { IconButton, Textarea } from "@/shared/ui";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "./ChatPanel.css";
import {
  LLMMessage,
  Message,
  ChatMessage,
  useLLMStreaming,
} from "@/features/stream-chat-answer/";
import { buildSystemMessages, DashboardContext } from "../model";

interface Props {
  context: DashboardContext;
}

export function ChatPanel({ context }: Props) {
  const systemMessages = useMemo(() => buildSystemMessages(context), [context]);

  const [inputValue, setInputValue] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const messages = useMemo<LLMMessage[]>(() => {
    const lastMessage = chatHistory[chatHistory.length - 1];
    return lastMessage?.role === "user"
      ? [
          ...systemMessages,
          ...chatHistory
            .filter((item) => item.status !== "error")
            .map(({ role, content }) => ({ role, content })),
        ]
      : [];
  }, [systemMessages, chatHistory]);

  const { status, content, error } = useLLMStreaming(messages);

  const isBusy = status === "streaming" || status === "pending";

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inputValue.trim() && !isBusy) {
      setChatHistory([
        ...chatHistory,
        {
          status: "done",
          messageId: uuidv4(),
          role: "user",
          content: inputValue.trim(),
        },
      ]);
      setInputValue("");
    }
  }
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }
  useEffect(() => {
    if (status === "done") {
      // Разовая фиксация готового ответа в историю, а не вывод состояния
      // из состояния на каждый рендер — react-hooks/set-state-in-effect
      // тут ложное срабатывание.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChatHistory((prev) => {
        return [
          ...prev,
          {
            messageId: uuidv4(),
            status: "done",
            role: "assistant",
            content: content || "Модель ничего не ответила",
          },
        ];
      });
    }
    if (status === "error") {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error ?? "",
          messageId: uuidv4(),
          status: "error",
        },
      ]);
    }
  }, [status, content, error]);

  return (
    <>
      <div className="llm__chat" aria-live="polite" aria-busy={isBusy}>
        {chatHistory.map((item) => (
          <Message
            key={item.messageId}
            role={item.role}
            content={item.content}
          />
        ))}
        {status === "streaming" && (
          <Message role={"assistant"} content={content} />
        )}
      </div>
      <form
        className="llm__input"
        data-busy={isBusy}

        onSubmit={handleSubmit}
      >
        <Textarea
          aria-label="Вопрос ассистенту"
          value={inputValue}
          variant={["with-iconbtn", "lined"]}
          placeholder="Введите ваш запрос"
          onChange={setInputValue}
          onKeyDown={handleKeyDown}
        />
        <IconButton disabled={isBusy} type="submit" aria-label="Отправить">
          <ArrowRight />
        </IconButton>
      </form>
    </>
  );
}
