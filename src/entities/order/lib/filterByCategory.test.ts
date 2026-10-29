import { describe, expect, test } from "vitest";
import { mockOrders } from "../model";
import { filterByCategory } from "./filterByCategory";

describe("filterByCategory", () => {
  test("'all' возвращает ту же ссылку (важно для useMemo ниже по дереву)", () => {
    expect(filterByCategory(mockOrders, "all")).toBe(mockOrders);
  });

  test("оставляет только нужную категорию", () => {
    const result = filterByCategory(mockOrders, "books");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((o) => o.category === "books")).toBe(true);
  });

  test("пустой вход → пустой выход", () => {
    expect(filterByCategory([], "books")).toEqual([]);
  });
});
