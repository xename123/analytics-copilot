import { mockOrders } from "@/entities/order";
import { RevenueChart } from "@/widgets/revenue-chart";
import "./App.css";
import { Paragraph, Title } from "@/shared/ui";
import { useCurrentDate } from "@/shared/lib";
function App() {
  const date = useCurrentDate().toLocaleString();
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
      <RevenueChart orders={mockOrders} />
    </div>
  );
}

export default App;
