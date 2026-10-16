import { IconButton, Input } from "@/shared/ui";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import "./ChatPanel.css";
import { Message } from "@/features/stream-chat-answer/";

export function ChatPanel() {
  const [message, setMessage] = useState<string>("");
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }
  return (
    <>
      <div className="llm__chat">
        <Message content="Привет любимая нейронка!!" role="user" />
        <Message content="Привет! чем могу помочь" role="assistant" />
      </div>
      <form className="llm__input" onSubmit={handleSubmit}>
        <Input
          value={message}
          variant="with-iconbtn"
          placeholder="Введите ваш запрос"
          onChange={setMessage}
        />
        <IconButton type="submit">
          <ArrowRight />
        </IconButton>
      </form>
    </>
  );
}
