export type TransactionCategory =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Education'
  | 'Bills'
  | 'Health'
  | 'Other';

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: TransactionCategory;
  date: string; // YYYY-MM-DD
  note?: string;
  paymentMethod?: 'UPI' | 'Card' | 'Cash' | 'NetBanking';
  isSample?: boolean;
}

export interface Commitment {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  isPaid: boolean;
  category?: TransactionCategory;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  reservedFromBudget: boolean; // explicitly reserved from current monthly budget
  targetDate?: string;
}

export interface BudgetConfig {
  totalBudget: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  periodName: string; // e.g. "Current Month"
}

export interface SpendingInsight {
  id: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  title: string;
  description: string;
  metric?: string;
  dismissed?: boolean;
}

export interface ProjectionScenario {
  id: string;
  name: string;
  description: string;
  dailyDelta: number; // e.g. +100 or -50
  oneTimeDelta: number; // e.g. -800
  categoryPercentChange?: { category: TransactionCategory; percent: number }; // e.g. { category: 'Food', percent: -10 }
}
