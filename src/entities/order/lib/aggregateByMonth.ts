import { Order, MonthlyRevenue } from "@/entities/order/model";

export function aggregateByMonth(orders: Order[]): MonthlyRevenue[] {
  const aggregateMonth: Map<MonthlyRevenue["month"], MonthlyRevenue["total"]> =
    new Map();
  orders.forEach((order: Order) => {
    const currentMonth = order.date.slice(0, 7);
    const currentMonthTotal = aggregateMonth.get(currentMonth);
    if (currentMonthTotal) {
      aggregateMonth.set(currentMonth, currentMonthTotal + order.amount);
    } else {
      aggregateMonth.set(currentMonth, order.amount);
    }
  });
  return Array.from(aggregateMonth, ([month, total]) => ({
    month,
    total,
  })).sort((a, b) => a.month.localeCompare(b.month));
}
