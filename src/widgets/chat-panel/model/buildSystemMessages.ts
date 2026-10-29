import type { AllCategories, MonthlyRevenue } from "@/entities/order";
import type { LLMMessage } from "@/features/stream-chat-answer";

const DASHBOARD_PROMPT = `Ты — ассистент-аналитик, встроенный в дашборд заказов интернет-магазина.
Пользователь видит график выручки по месяцам, отфильтрованный по выбранной категории.
Следующим системным сообщением приходит текущий срез этих данных в формате JSON:
- category — выбранная категория ("all" — все категории);
- revenueByMonth — массив { month: "YYYY-MM", total: выручка за месяц }.

Правила:
- Отвечай только на основе присланных данных, ничего не выдумывай.
- Если данных недостаточно для ответа — так и скажи, не придумывай цифры.
- Числа бери точно из данных, не округляй произвольно.
- Отвечай кратко и по-русски, 2–4 предложения.
- Не упоминай, что ты языковая модель, не извиняйся, отвечай по существу.`;

export interface DashboardContext {
  category: AllCategories;
  revenueByMonth: MonthlyRevenue[];
}

export function buildSystemMessages(context: DashboardContext): LLMMessage[] {
  return [
    { role: "system", content: DASHBOARD_PROMPT },
    { role: "system", content: JSON.stringify(context) },
  ];
}
