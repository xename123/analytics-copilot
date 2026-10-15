import { getUniqueCategories } from "@/entities/order/";
import { AllCategories, Order } from "@/entities/order/";
import { Select } from "@/shared/ui";

interface Props {
  setSelectedCategory: (item: AllCategories) => void;
  orders: Order[];
}

export function FilterOrdersSelect({ setSelectedCategory, orders }: Props) {
  return (
    <Select
      value="all"
      options={["all", ...getUniqueCategories(orders)]}
      onChange={(value) => setSelectedCategory(value)}
    />
  );
}
