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
interface Props {
  systemMessages: LLMMessage[];
}
export function ChatPanel({ systemMessages }: Props) {
  const [inputValue, setInputValue] = useState<string>("");
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [isCallingLLM, setIsCallingLLM] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const messages = useMemo<LLMMessage[]>(
    () =>
      isCallingLLM
        ? [
            ...systemMessages,
            ...chatHistory.map(({ role, content }) => ({ role, content })),
          ]
        : [],
    [systemMessages, chatHistory, isCallingLLM],
  );

  const { status, content, error } = useLLMStreaming(messages);
  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inputValue.trim()) {
      setIsDisabled(true);
      setIsCallingLLM(true);
      setChatHistory([
        ...chatHistory,
        {
          status: "done",
          messageId: uuidv4(),
          role: "user",
          content: inputValue,
        },
      ]);
      setInputValue("");
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
            status: "streaming",
            role: "assistant",
            content,
          },
        ];
      });
      setIsDisabled(false);
      setIsCallingLLM(false);
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
      setIsDisabled(false);
      setIsCallingLLM(false);
    }
  }, [status, content, error]);

  return (
    <>
      <div className="llm__chat">
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
      <form className="llm__input" onSubmit={handleSubmit}>
        <Textarea
          value={inputValue}
          variant="with-iconbtn"
          placeholder="Введите ваш запрос"
          onChange={setInputValue}
          disabled={isDisabled}
        />
        <IconButton type="submit">
          <ArrowRight />
        </IconButton>
      </form>
    </>
  );
}
