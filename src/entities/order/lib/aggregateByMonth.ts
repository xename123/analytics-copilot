import { Order, MonthlyRevenue } from "@/entities/order/model";

export function aggregateByMonth(orders: Order[]): MonthlyRevenue[] {
  const aggregateMonth: MonthlyRevenue[] = [];
  orders.forEach((order: Order) => {
    const currentMonth = order.date.slice(0, 7);
    const findedIndex: number = aggregateMonth.findIndex(
      (item) => item.month === currentMonth,
    );
    if (aggregateMonth[findedIndex]) {
      aggregateMonth[findedIndex].total += order.amount;
    } else {
      aggregateMonth.push({ month: currentMonth, total: order.amount });
    }
  });
  return aggregateMonth.sort((a, b) => a.month.localeCompare(b.month));
}
