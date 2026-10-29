import { Order, MonthlyRevenue } from "@/entities/order/model";

export function aggregateByMonth(orders: Order[]): MonthlyRevenue[] {
  const aggregateMonth: Map<MonthlyRevenue["month"], MonthlyRevenue["total"]> =
    new Map();
  orders.forEach((order: Order) => {
    const currentMonth = order.date.slice(0, 7);
    aggregateMonth.set(
      currentMonth,
      (aggregateMonth.get(currentMonth) ?? 0) + order.amount,
    );
  });
  return Array.from(aggregateMonth, ([month, total]) => ({
    month,
    total,
  })).sort((a, b) => a.month.localeCompare(b.month));
}
