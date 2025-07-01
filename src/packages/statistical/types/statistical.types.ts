export interface StudentStatisticData {
  id: string;
  year: number;
  month: number;
  total_students: number;
  new_students: number;
  inactive_students: number;
  generated_at: Date;
}

export interface FinancialStatisticData {
  id: string;
  year: number;
  month: number;
  total_income: number;
  total_expenses: number;
  teacher_salaries: number;
  other_expenses: number;
  profit: number;
  total_discounts: number;
  unpaid_invoices: number;
  generated_at: Date;
}

export interface StatisticQuery {
  year?: number;
  month?: number;
  startYear?: number;
  endYear?: number;
  startMonth?: number;
  endMonth?: number;
}

export interface StatisticSummary {
  period: string;
  totalRecords: number;
  averageValues: Record<string, number>;
}
