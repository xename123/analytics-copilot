export const LLM_BASE_URL = import.meta.env.VITE_BASE_URL;
export const LLM_MODEL_NAME = import.meta.env.VITE_LLM_MODEL;
if (!LLM_BASE_URL) throw new Error("VITE_BASE_URL не задан - см. .env.example");
if (!LLM_MODEL_NAME) throw new Error("LLM_MODEL не задан - см. .env.example");
export const endpoints = {
  chatCompletions: `${LLM_BASE_URL}/v1/chat/completions`,
};
