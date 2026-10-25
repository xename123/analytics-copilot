import { IconButton, Input } from "@/shared/ui";
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
  const [prompt, setPrompt] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const messages = useMemo<LLMMessage[]>(
    () =>
      prompt ? [...systemMessages, { role: "user", content: prompt }] : [],
    [systemMessages, prompt],
  );

  const { status, content, error } = useLLMStreaming(messages);
  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inputValue) {
      setIsDisabled(true);
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
      setPrompt(inputValue);
    }
  }
  useEffect(() => {
    if (status === "streaming") {
      setChatHistory((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (
          lastMessage?.status === "streaming" &&
          lastMessage.role === "assistant"
        ) {
          return [...prev.slice(0, -1), { ...lastMessage, content }];
        }
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
    }
    if (status === "done") {
      setIsDisabled(false);
      setPrompt("");
    }
    if (status === "error") {
      setChatHistory((prev) => [
        ...prev.slice(0, -1),
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
      <div className="llm__chat">
        {chatHistory.map((item) => (
          <Message
            key={item.messageId}
            role={item.role}
            content={item.content}
          />
        ))}
      </div>
      <form className="llm__input" onSubmit={handleSubmit}>
        <Input
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
