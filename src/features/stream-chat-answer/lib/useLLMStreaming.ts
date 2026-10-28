import { useEffect, useState } from "react";
import { Answer, LLMMessage } from "../model";
import { sendStreamMessage } from "../api/sendStreamMessage";
import { parseLLMAnswer } from "../api/parseLLMAnswer";
import { readSSEStream } from "@/shared/lib";

export function useLLMStreaming(messages: LLMMessage[]): Answer {
  const [answerState, setAnswerState] = useState<Answer>({
    status: "idle",
    content: "",
    error: null,
  });
  useEffect(() => {
    if (messages.length === 0) return;
    const controller = new AbortController();
    const signal = controller.signal;
    (async () => {
      let text = "";
      let status: Answer["status"] = "pending";

      try {
        const response = await sendStreamMessage(messages, signal);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        for await (const message of readSSEStream(response)) {
          const parsedAnswer = parseLLMAnswer(message);
          if (parsedAnswer === "done") {
            status = "done";
            setAnswerState({ status, content: text, error: null });
            break;
          }
          const deltaContent = parsedAnswer?.choices[0]?.delta?.content;
          if (deltaContent) text += deltaContent;
          status = "streaming";
          console.log(text);

          setAnswerState({ status, content: text.trim(), error: null });
        }
        if (status === "streaming") {
          status = "done";
          setAnswerState({ status, content: text.trim(), error: null });
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setAnswerState({
          status: "error",
          content: text,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    })();

    return () => {
      controller.abort();
      setAnswerState({
        status: "pending",
        content: "",
        error: null,
      });
    };
  }, [messages]);
  return answerState;
}
