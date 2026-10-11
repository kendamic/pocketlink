import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  Commitment,
  SavingsGoal,
  BudgetConfig,
  SpendingInsight,
} from '../types';
import {
  INITIAL_BUDGET,
  INITIAL_TRANSACTIONS,
  INITIAL_COMMITMENTS,
  INITIAL_GOALS,
} from '../data/initialData';
import {
  calculateAvailableBalance,
  calculateSafeToSpend,
  calculateTotalExpenses,
  calculateUnpaidCommitments,
  calculateReservedSavings,
  calculateRemainingDays,
  calculateCategoryTotals,
} from '../utils/calculations';

interface FinanceContextType {
  budget: BudgetConfig;
  setBudget: (config: BudgetConfig) => void;
  updateTotalBudget: (amount: number) => void;
  
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  commitments: Commitment[];
  addCommitment: (comm: Omit<Commitment, 'id'>) => void;
  updateCommitment: (id: string, comm: Partial<Commitment>) => void;
  deleteCommitment: (id: string) => void;
  toggleCommitmentPaid: (id: string) => void;
  
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  
  dismissedInsightIds: string[];
  dismissInsight: (id: string) => void;
  resetDismissedInsights: () => void;
  
  // Derived state (always consistent)
  totalExpenses: number;
  unpaidCommitments: number;
  reservedSavings: number;
  availableBalance: number;
  safeToSpend: number;
  remainingDays: number;
  categoryTotals: Record<string, number>;
  
  resetToDefaultData: () => void;
  clearAllData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BUDGET: 'pocketpilot_budget_v1',
  TRANSACTIONS: 'pocketpilot_transactions_v1',
  COMMITMENTS: 'pocketpilot_commitments_v1',
  GOALS: 'pocketpilot_goals_v1',
  DISMISSED_INSIGHTS: 'pocketpilot_dismissed_insights_v1',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from LocalStorage or fallbacks
  const [budget, setBudgetState] = useState<BudgetConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
      return saved ? JSON.parse(saved) : INITIAL_BUDGET;
    } catch {
      return INITIAL_BUDGET;
    }
  });

  const [transactions, setTransactionsState] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [commitments, setCommitmentsState] = useState<Commitment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMMITMENTS);
      return saved ? JSON.parse(saved) : INITIAL_COMMITMENTS;
    } catch {
      return INITIAL_COMMITMENTS;
    }
  });

  const [goals, setGoalsState] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      return saved ? JSON.parse(saved) : INITIAL_GOALS;
    } catch {
      return INITIAL_GOALS;
    }
  });

  const [dismissedInsightIds, setDismissedInsightIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISMISSED_INSIGHTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
    } catch (e) {
      console.error('Failed to save budget', e);
    }
  }, [budget]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMITMENTS, JSON.stringify(commitments));
    } catch (e) {
      console.error('Failed to save commitments', e);
    }
  }, [commitments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save goals', e);
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DISMISSED_INSIGHTS, JSON.stringify(dismissedInsightIds));
    } catch (e) {
      console.error('Failed to save dismissed insights', e);
    }
  }, [dismissedInsightIds]);

  // Derived financial values
  const totalExpenses = calculateTotalExpenses(transactions);
  const unpaidCommitments = calculateUnpaidCommitments(commitments);
  const reservedSavings = calculateReservedSavings(goals);
  const availableBalance = calculateAvailableBalance(budget, transactions, commitments, goals);
  const remainingDays = calculateRemainingDays(budget);
  const safeToSpend = calculateSafeToSpend(budget, transactions, commitments, goals, remainingDays);
  const categoryTotals = calculateCategoryTotals(transactions);

  // Actions
  const setBudget = (config: BudgetConfig) => setBudgetState(config);
  
  const updateTotalBudget = (amount: number) => {
    setBudgetState((prev) => ({
      ...prev,
      totalBudget: Math.max(0, amount),
    }));
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      amount: Math.max(0, Number(tx.amount) || 0),
    };
    setTransactionsState((prev) => [newTx, ...prev]);
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactionsState((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated, amount: Math.max(0, Number(updated.amount ?? t.amount) || 0) } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactionsState((prev) => prev.filter((t) => t.id !== id));
  };

  const addCommitment = (comm: Omit<Commitment, 'id'>) => {
    const newComm: Commitment = {
      ...comm,
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      amount: Math.max(0, Number(comm.amount) || 0),
    };
    setCommitmentsState((prev) => [newComm, ...prev]);
  };

  const updateCommitment = (id: string, updated: Partial<Commitment>) => {
    setCommitmentsState((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated, amount: Math.max(0, Number(updated.amount ?? c.amount) || 0) } : c))
    );
  };

  const deleteCommitment = (id: string) => {
    setCommitmentsState((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleCommitmentPaid = (id: string) => {
    setCommitmentsState((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPaid: !c.isPaid } : c))
    );
  };

  const addGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      targetAmount: Math.max(0, Number(goal.targetAmount) || 0),
      savedAmount: Math.max(0, Number(goal.savedAmount) || 0),
    };
    setGoalsState((prev) => [...prev, newGoal]);
  };

  const updateGoal = (id: string, updated: Partial<SavingsGoal>) => {
    setGoalsState((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updated } : g))
    );
  };

  const deleteGoal = (id: string) => {
    setGoalsState((prev) => prev.filter((g) => g.id !== id));
  };

  const dismissInsight = (id: string) => {
    setDismissedInsightIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const resetDismissedInsights = () => {
    setDismissedInsightIds([]);
  };

  const resetToDefaultData = () => {
    setBudgetState(INITIAL_BUDGET);
    setTransactionsState(INITIAL_TRANSACTIONS);
    setCommitmentsState(INITIAL_COMMITMENTS);
    setGoalsState(INITIAL_GOALS);
    setDismissedInsightIds([]);
  };

  const clearAllData = () => {
    setBudgetState({
      totalBudget: 10000,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
      periodName: 'Fresh Budget',
    });
    setTransactionsState([]);
    setCommitmentsState([]);
    setGoalsState([]);
    setDismissedInsightIds([]);
  };

  return (
    <FinanceContext.Provider
      value={{
        budget,
        setBudget,
        updateTotalBudget,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        commitments,
        addCommitment,
        updateCommitment,
        deleteCommitment,
        toggleCommitmentPaid,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        dismissedInsightIds,
        dismissInsight,
        resetDismissedInsights,
        totalExpenses,
        unpaidCommitments,
        reservedSavings,
        availableBalance,
        safeToSpend,
        remainingDays,
        categoryTotals,
        resetToDefaultData,
        clearAllData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
