import { MessageInterface } from "@/features/stream-chat-answer/model";
import "./Message.css";

export function Message({ content, role }: Omit<MessageInterface, "status">) {
  return (
    <div className={`message message-${role}`}>
      <p className="message__sender">{role === "user" ? "Я" : "Нейронка"}</p>
      <p className="message__content">{content}</p>
    </div>
  );
}
