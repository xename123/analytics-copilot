import { describe, expect, test } from "vitest";
import type { Order } from "../model";
import { aggregateByMonth } from "./aggregateByMonth";

function order(id: number, date: string, amount: number): Order {
  return { id, date, category: "books", amount };
}

describe("aggregateByMonth", () => {
  test("пустой массив → пустой результат", () => {
    expect(aggregateByMonth([])).toEqual([]);
  });

  test("суммирует заказы одного месяца", () => {
    expect(
      aggregateByMonth([
        order(1, "2024-01-05", 100),
        order(2, "2024-01-20", 50),
      ]),
    ).toEqual([{ month: "2024-01", total: 150 }]);
  });

  test("неотсортированный вход → месяцы по возрастанию", () => {
    const result = aggregateByMonth([
      order(1, "2024-03-01", 1),
      order(2, "2023-12-31", 1),
      order(3, "2024-01-15", 1),
    ]);
    expect(result.map((r) => r.month)).toEqual([
      "2023-12",
      "2024-01",
      "2024-03",
    ]);
  });

  test("не мутирует входной массив", () => {
    const orders = [order(1, "2024-03-01", 1), order(2, "2024-01-01", 1)];
    const snapshot = structuredClone(orders);
    aggregateByMonth(orders);
    expect(orders).toEqual(snapshot);
  });

  test("200k заказов считаются быстрее 100 мс (сейчас O(n·m))", () => {
    const orders = Array.from({ length: 200_000 }, (_, i) =>
      order(
        i,
        `${2000 + (i % 500)}-${String((i % 12) + 1).padStart(2, "0")}-01`,
        1,
      ),
    );
    const start = performance.now();
    aggregateByMonth(orders);
    expect(performance.now() - start).toBeLessThan(100);
  });
});
