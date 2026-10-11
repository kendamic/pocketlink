import { Transaction, Commitment, SavingsGoal, BudgetConfig, TransactionCategory } from '../types';

/**
 * Format currency in Indian Rupees format (e.g. ₹10,000, ₹1,25,000)
 */
export function formatINR(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(absAmount);
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Calculate total recorded expenses from transactions
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
}

/**
 * Calculate expenses aggregated by category
 */
export function calculateCategoryTotals(transactions: Transaction[]): Record<TransactionCategory, number> {
  const totals: Record<TransactionCategory, number> = {
    Food: 0,
    Transport: 0,
    Shopping: 0,
    Entertainment: 0,
    Education: 0,
    Bills: 0,
    Health: 0,
    Other: 0,
  };

  transactions.forEach((t) => {
    if (totals[t.category] !== undefined) {
      totals[t.category] += Number(t.amount) || 0;
    } else {
      totals.Other += Number(t.amount) || 0;
    }
  });

  return totals;
}

/**
 * Calculate unpaid commitments amount.
 * Only count unpaid commitments.
 */
export function calculateUnpaidCommitments(commitments: Commitment[]): number {
  return commitments
    .filter((c) => !c.isPaid)
    .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
}

/**
 * Calculate explicitly reserved savings from the active monthly budget
 */
export function calculateReservedSavings(goals: SavingsGoal[]): number {
  return goals
    .filter((g) => g.reservedFromBudget)
    .reduce((acc, g) => acc + (Number(g.savedAmount) || 0), 0);
}

/**
 * Calculate remaining days in the budget period.
 * Handles zero days or end dates gracefully.
 */
export function calculateRemainingDays(budget: BudgetConfig, referenceDateStr?: string): number {
  const now = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const end = new Date(budget.endDate);
  
  // Set both to midnight for pure day comparison
  const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d2 = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of today
  
  return Math.max(1, diffDays); // never 0 to prevent division by zero, at least 1 day
}

/**
 * Calculate Available Balance
 * Available Balance = Budget - Recorded Expenses - Unpaid Commitments - Reserved Savings
 */
export function calculateAvailableBalance(
  budget: BudgetConfig,
  transactions: Transaction[],
  commitments: Commitment[],
  goals: SavingsGoal[]
): number {
  const totalSpent = calculateTotalExpenses(transactions);
  const unpaidCommitments = calculateUnpaidCommitments(commitments);
  const reservedSavings = calculateReservedSavings(goals);
  return budget.totalBudget - totalSpent - unpaidCommitments - reservedSavings;
}

/**
 * Calculate Safe to Spend per day
 * Formula: max(0, (Budget - Recorded Expenses - Unpaid Commitments - Reserved Savings) / Remaining Days)
 */
export function calculateSafeToSpend(
  budget: BudgetConfig,
  transactions: Transaction[],
  commitments: Commitment[],
  goals: SavingsGoal[],
  customRemainingDays?: number
): number {
  const availableBalance = calculateAvailableBalance(budget, transactions, commitments, goals);
  const days = customRemainingDays ?? calculateRemainingDays(budget);
  if (days <= 0 || availableBalance <= 0) {
    return 0;
  }
  return Math.floor(availableBalance / days);
}

/**
 * Safe percentage calculation
 */
export function calculatePercentage(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  const pct = (part / total) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

/**
 * Determine financial budget status
 */
export function getBudgetStatus(
  budget: BudgetConfig,
  transactions: Transaction[],
  commitments: Commitment[],
  goals: SavingsGoal[]
): {
  status: 'on_track' | 'approaching' | 'exceeded';
  label: string;
  badgeColor: string;
  textColor: string;
  bgLight: string;
} {
  const totalSpent = calculateTotalExpenses(transactions);
  const unpaid = calculateUnpaidCommitments(commitments);
  const reserved = calculateReservedSavings(goals);
  const effectiveOutflow = totalSpent + unpaid + reserved;
  const ratio = budget.totalBudget > 0 ? effectiveOutflow / budget.totalBudget : 1;

  if (ratio >= 1.0) {
    return {
      status: 'exceeded',
      label: 'Budget Limit Exceeded',
      badgeColor: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      textColor: 'text-rose-400',
      bgLight: 'from-rose-500/5 to-transparent',
    };
  } else if (ratio >= 0.8) {
    return {
      status: 'approaching',
      label: 'Approaching Budget Limit',
      badgeColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      textColor: 'text-amber-400',
      bgLight: 'from-amber-500/5 to-transparent',
    };
  } else {
    return {
      status: 'on_track',
      label: 'Comfortably on Track',
      badgeColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      textColor: 'text-emerald-400',
      bgLight: 'from-emerald-500/5 to-transparent',
    };
  }
}
