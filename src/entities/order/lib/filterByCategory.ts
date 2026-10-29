import { Order } from "../model";

export function filterByCategory(
  orders: Order[],
  category: "all" | Order["category"],
): Order[] {
  if (category === "all") return orders;
  return orders.filter((item: Order) => item.category === category);
}
