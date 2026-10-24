import { getUniqueCategories } from "@/entities/order/";
import { AllCategories, Order } from "@/entities/order/";
import { Select } from "@/shared/ui";

interface Props {
  setSelectedCategory: (item: AllCategories) => void;
  orders: Order[];
  value?: string;
}

export function FilterOrdersSelect({
  value = "all",
  setSelectedCategory,
  orders,
}: Props) {
  return (
    <Select
      value={value}
      options={["all", ...getUniqueCategories(orders)]}
      onChange={(value) => setSelectedCategory(value)}
    />
  );
}
