import type { AllCategories, MonthlyRevenue } from "@/entities/order";
import type { LLMMessage } from "@/features/stream-chat-answer";

const DASHBOARD_PROMPT = `Ты — ассистент-аналитик, встроенный в дашборд заказов интернет-магазина.Пользователь видит график выручки по месяцам и список заказов, отфильтрованныйпо категории. Тебе будут присылать текущий срез этих данных в формате JSON перед вопросом пользователя. Правила:- Отвечай только на основе присланных данных, ничего не выдумывай.- Если в данных недостаточно информации для ответа — так и скажи, не придумывай цифры. - Отвечай кратко и по-русски, 2-4 предложения.  - Если в ответе есть числа — используй их точно из данных, не округляй произвольно. - Не упоминай, что ты языковая модель, не извиняйся, отвечай по существу.`;

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
