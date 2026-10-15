import { mockOrders } from "@/entities/order";
import { RevenueChart } from "@/widgets/revenue-chart";
import "./App.css";
import { Paragraph, Title } from "@/shared/ui";
import { useCurrentDate } from "@/shared/lib";
import { FilterOrdersSelect } from "@/features/filter-orders-by-category/";
import { useOrdersCategoryFilter } from "@/features/filter-orders-by-category/";
function App() {
  const date = useCurrentDate().toLocaleString();
  const { category, setCategory, filteredOrders } =
    useOrdersCategoryFilter(mockOrders);
  return (
    <div className="dashboard">
      <div className="dashboard__top">
        <Title as="h1" variant="large">
          График кол-ва заказов в определенном месяце
        </Title>
        <Paragraph variant="large">
          <span className="text-accent">Текущее время:&nbsp;</span>
          {date}
        </Paragraph>
      </div>
      <div className="filter-row">
        <Paragraph variant="large">{category}</Paragraph>
        <FilterOrdersSelect
          setSelectedCategory={setCategory}
          orders={mockOrders}
        />
      </div>
      <RevenueChart orders={filteredOrders} />
    </div>
  );
}

export default App;
