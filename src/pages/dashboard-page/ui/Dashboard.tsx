import { aggregateByMonth, mockOrders } from "@/entities/order";
import { RevenueChart } from "@/widgets/revenue-chart";
import { Paragraph, Title } from "@/shared/ui";
import { FilterOrdersSelect } from "@/features/filter-orders-by-category/";
import { useOrdersCategoryFilter } from "@/features/filter-orders-by-category/";
import "./Dashboard.css";
import { ChatPanel } from "@/widgets/chat-panel";
import { CurrentDate } from "@/features/current-date";
import { SYSTEM_PROMPTS } from "@/features/stream-chat-answer/";

export function Dashboard() {
  const { category, setCategory, filteredOrders } =
    useOrdersCategoryFilter(mockOrders);
  return (
    <div className="wrap">
      <div className="chat">
        <ChatPanel
          systemMessages={[
            { role: "system", content: SYSTEM_PROMPTS.dashboard },
            {
              role: "system",
              content: JSON.stringify(aggregateByMonth(filteredOrders)),
            },
          ]}
        />
      </div>
      <div className="dashboard">
        <div className="dashboard__top">
          <Title as="h1" variant="large">
            График кол-ва заказов в определенном месяце
          </Title>
          <CurrentDate />
        </div>
        <div className="filter-row">
          <Paragraph variant="large">{category}</Paragraph>
          <FilterOrdersSelect
            value={category}
            setSelectedCategory={setCategory}
            orders={mockOrders}
          />
        </div>
        <RevenueChart orders={filteredOrders} />
      </div>
    </div>
  );
}
