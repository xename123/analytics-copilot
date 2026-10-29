import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar } from "recharts";
import {
  aggregateByMonth,
  type MonthlyRevenue,
  type Order,
} from "@/entities/order";
import { useMemo } from "react";

export function RevenueChart({ orders }: { orders: Order[] }) {
  const aggregatedOrders: MonthlyRevenue[] = useMemo(
    () => aggregateByMonth(orders),
    [orders],
  );
  return (
    <ResponsiveContainer
      width={"100%"}
      height={"100%"}
      aspect={1.618}
      maxHeight={700}
      minHeight={400}
      className="revenue-bar__page"
    >
      <BarChart data={aggregatedOrders}>
        <XAxis dataKey="month" />
        <YAxis />
        <Bar dataKey="total" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
