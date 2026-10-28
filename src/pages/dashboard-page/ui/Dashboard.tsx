import { aggregateByMonth, mockOrders } from "@/entities/order";
import { RevenueChart } from "@/widgets/revenue-chart";
import { Paragraph, Title } from "@/shared/ui";
import { FilterOrdersSelect } from "@/features/filter-orders-by-category/";
import { useOrdersCategoryFilter } from "@/features/filter-orders-by-category/";
import "./Dashboard.css";

import { CurrentDate } from "@/features/current-date";
import React, { Suspense, useMemo } from "react";
import { Loader } from "@/shared/ui/";
import { DashboardContext } from "@/widgets/chat-panel/model";

const ChatPanelLazy = React.lazy(() =>
  import("@/widgets/chat-panel").then((module) => ({
    default: module.ChatPanel,
  })),
);

export function Dashboard() {
  const { category, setCategory, filteredOrders } =
    useOrdersCategoryFilter(mockOrders);
  const chatContext = useMemo<DashboardContext>(
    () => ({ category, revenueByMonth: aggregateByMonth(filteredOrders) }),
    [category, filteredOrders],
  );
  return (
    <div className="wrap">
      <div className="chat">
        <Suspense fallback={<Loader />}>
          <ChatPanelLazy context={chatContext} />
        </Suspense>
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
