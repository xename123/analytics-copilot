import { filterByCategory, Order } from "@/entities/order";
import { AllCategories } from "@/entities/order/";
import { useMemo, useState } from "react";

export function useOrdersCategoryFilter(orders: Order[]) {
  const [category, setCategory] = useState<AllCategories>("all");
  const filteredOrders = useMemo(
    () => filterByCategory(orders, category),
    [category, orders],
  );
  return { category, setCategory, filteredOrders };
}
