import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Без `globals: true` RTL не размонтирует компоненты сам — делаем это явно.
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
