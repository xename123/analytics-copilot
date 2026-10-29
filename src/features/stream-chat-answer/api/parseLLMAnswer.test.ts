import { describe, expect, test } from "vitest";
import { parseLLMAnswer } from "./parseLLMAnswer";

const validPayload = {
  choices: [{ delta: { content: "Привет" }, finish_reason: null, index: 0 }],
};

describe("parseLLMAnswer", () => {
  test("[DONE] → 'done'", () => {
    expect(parseLLMAnswer("data: [DONE]")).toBe("done");
  });

  test("валидный JSON-чанк разбирается", () => {
    expect(parseLLMAnswer(`data: ${JSON.stringify(validPayload)}`)).toEqual(
      validPayload,
    );
  });

  test("'data:' без пробела тоже валиден по спеке SSE", () => {
    expect(parseLLMAnswer(`data:${JSON.stringify(validPayload)}`)).toEqual(
      validPayload,
    );
  });

  test("битый JSON → null", () => {
    expect(parseLLMAnswer('data: {"choices": [')).toBeNull();
  });

  test.each(["data: 42", "data: null", 'data: "строка"', "data: []"])(
    "JSON, который не похож на LLMAnswer (%s) → null, а не мусор под видом LLMAnswer",
    (event) => {
      expect(parseLLMAnswer(event)).toBeNull();
    },
  );
});
