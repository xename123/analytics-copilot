import { aggregateByMonth, mockOrders } from "@/entities/order";
import { RevenueChart } from "@/widgets/revenue-chart";
import { ErrorBoundary, Paragraph, Title, Loader } from "@/shared/ui";
import {
  FilterOrdersSelect,
  useOrdersCategoryFilter,
} from "@/features/filter-orders-by-category/";
import "./Dashboard.css";

import { CurrentDate } from "@/features/current-date";
import React, { Suspense, useMemo } from "react";
import type { DashboardContext } from "@/widgets/chat-panel";

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
        <ErrorBoundary fallback={<Paragraph>Чат сейчас недоступен</Paragraph>}>
          <Suspense fallback={<Loader />}>
            <ChatPanelLazy context={chatContext} />
          </Suspense>
        </ErrorBoundary>
      </div>
      <div className="dashboard">
        <div className="dashboard__top">
          <Title as="h1" variant="large">
            Дашборд с суммой всех заказов в определенном месяце
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
