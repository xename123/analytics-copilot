// widgets/revenue-chart — публичное API. Компонент (ui/) собирает
// entities/order (aggregateByMonth) + Recharts. Может использовать
// entities/* и shared/*, но НЕ другой widgets и НЕ features напрямую —
// если график должен реагировать на фильтр, это приходит через пропсы

export { RevenueChart } from "./ui";
