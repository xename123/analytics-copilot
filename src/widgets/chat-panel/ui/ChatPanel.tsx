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
      setChatHistory((prev) => [
        ...prev,
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
    if (status === "done") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChatHistory((prev) => [
        ...prev,
        { messageId: uuidv4(), status: "done", role: "assistant", content },
      ]);
      setIsDisabled(false);
      setPrompt("");
    }
    if (status === "error") {
      setChatHistory((prev) => [
        ...prev,
        {
          messageId: uuidv4(),
          status: "error",
          role: "assistant",
          content: error ?? "",
        },
      ]);
      setIsDisabled(false);
      setPrompt("");
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
          <Message role="assistant" content={content} />
        )}
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
