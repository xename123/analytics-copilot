export const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
export const endpoints = {
  chatCompletions: `${VITE_BASE_URL}/v1/chat/completions`,
};
