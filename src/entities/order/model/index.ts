export interface Order {
  id: number;
  date: string; // "YYYY-MM-DD"
  category: "electronics" | "books" | "clothing";
  amount: number;
}

export interface MonthlyRevenue {
  month: string; // "YYYY-MM"
  total: number;
}
