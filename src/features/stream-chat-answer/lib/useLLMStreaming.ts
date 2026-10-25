import { useEffect, useState } from "react";
import { Answer, LLMMessage } from "../model";
import { sendStreamMessage } from "../";
import { parseLLMAnswer } from "../api/parseLLMAnswer";
import { readSSEStream } from "@/shared/lib";

export function useLLMStreaming(messages: LLMMessage[]): Answer {
  const [answerState, setAnswerState] = useState<Answer>({
    status: "pending",
    content: "",
    error: null,
  });
  useEffect(() => {
    if (messages.length === 0) return;
    const controller = new AbortController();
    const signal = controller.signal;
    (async () => {
      let text = "";
      try {
        const response = await sendStreamMessage([...messages], signal);
        for await (const message of readSSEStream(response)) {
          const parsedAnswer = parseLLMAnswer(message);
          if (parsedAnswer === "done") {
            setAnswerState({ status: "done", content: text, error: null });
            break;
          }
          const deltaContent = parsedAnswer?.choices[0]?.delta.content;
          if (deltaContent) text += deltaContent;
          setAnswerState({ status: "streaming", content: text, error: null });
        }
      } catch (e) {
        setAnswerState({
          status: "error",
          content: e instanceof Error ? e.message : String(e),
          error: "Stop getting previous answer",
        });
      }
    })();
    return () => {
      controller.abort();
    };
  }, [messages]);
  return answerState;
}
