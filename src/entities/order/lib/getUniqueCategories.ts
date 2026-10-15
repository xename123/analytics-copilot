import type { Order } from "../model";

export function getUniqueCategories(orders: Order[]): Order["category"][] {
  return [...new Set(orders.map((order) => order.category))];
}
