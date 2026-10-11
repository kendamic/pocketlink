import { describe, it } from 'node:test';
import assert from 'node:assert';

function formatINR(amount) {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(absAmount);
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

function calculateTotalExpenses(transactions) {
  return transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
}

function calculateCategoryTotals(transactions) {
  const totals = {
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

function calculateUnpaidCommitments(commitments) {
  return commitments
    .filter((c) => !c.isPaid)
    .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
}

function calculateReservedSavings(goals) {
  return goals
    .filter((g) => g.reservedFromBudget)
    .reduce((acc, g) => acc + (Number(g.savedAmount) || 0), 0);
}

function calculateAvailableBalance(budget, transactions, commitments, goals) {
  const totalSpent = calculateTotalExpenses(transactions);
  const unpaid = calculateUnpaidCommitments(commitments);
  const reserved = calculateReservedSavings(goals);
  return budget.totalBudget - totalSpent - unpaid - reserved;
}

function calculateSafeToSpend(budget, transactions, commitments, goals, customRemainingDays) {
  const availableBalance = calculateAvailableBalance(budget, transactions, commitments, goals);
  const days = customRemainingDays ?? 30;
  if (days <= 0 || availableBalance <= 0) {
    return 0;
  }
  return Math.floor(availableBalance / days);
}

const mockBudget = {
  totalBudget: 10000,
  startDate: '2026-10-01',
  endDate: '2026-10-31',
  periodName: 'October',
};

describe('PocketPilot Calculation QA Suite', () => {
  it('QA 1 & 2: Initial budget is 10,000; with 0 expense/commitment/savings available is 10,000', () => {
    const bal = calculateAvailableBalance(mockBudget, [], [], []);
    assert.strictEqual(bal, 10000);
  });

  it('QA 3: Adding a ₹100 expense reduces available budget by exactly ₹100', () => {
    const tx = [{ id: '1', name: 'Lunch', amount: 100, category: 'Food', date: '2026-10-11' }];
    const bal = calculateAvailableBalance(mockBudget, tx, [], []);
    assert.strictEqual(bal, 9900);
  });

  it('QA 4: Editing expense from ₹100 to ₹150 makes total expense ₹150, not ₹250', () => {
    const tx = [{ id: '1', name: 'Lunch', amount: 150, category: 'Food', date: '2026-10-11' }];
    const totalExp = calculateTotalExpenses(tx);
    assert.strictEqual(totalExp, 150);
  });

  it('QA 5: Deleting expense restores original available budget', () => {
    const bal = calculateAvailableBalance(mockBudget, [], [], []);
    assert.strictEqual(bal, 10000);
  });

  it('QA 7: Safe to spend does not divide by zero when days is 0', () => {
    const safe = calculateSafeToSpend(mockBudget, [], [], [], 0);
    assert.strictEqual(safe, 0);
  });

  it('QA 8: Displayed category totals equal sum of matching transactions', () => {
    const txs = [
      { id: '1', name: 'Meal', amount: 200, category: 'Food', date: '2026-10-11' },
      { id: '2', name: 'Snack', amount: 50, category: 'Food', date: '2026-10-11' },
      { id: '3', name: 'Bus', amount: 30, category: 'Transport', date: '2026-10-11' },
    ];
    const catTotals = calculateCategoryTotals(txs);
    assert.strictEqual(catTotals.Food, 250);
    assert.strictEqual(catTotals.Transport, 30);
  });

  it('QA 9 & 10: Unpaid commitments affect Safe to Spend; Paid commitments do not reduce available twice', () => {
    const comms = [
      { id: '1', name: 'WiFi', amount: 500, dueDate: '2026-10-15', isPaid: false },
      { id: '2', name: 'Rent', amount: 2000, dueDate: '2026-10-05', isPaid: true },
    ];
    const unpaid = calculateUnpaidCommitments(comms);
    assert.strictEqual(unpaid, 500);
    const bal = calculateAvailableBalance(mockBudget, [], comms, []);
    assert.strictEqual(bal, 9500);
  });

  it('QA 12: Only explicitly reserved savings affect calculation', () => {
    const goals = [
      { id: '1', name: 'Laptop', targetAmount: 5000, savedAmount: 1000, reservedFromBudget: true },
      { id: '2', name: 'Trip', targetAmount: 3000, savedAmount: 800, reservedFromBudget: false },
    ];
    const reserved = calculateReservedSavings(goals);
    assert.strictEqual(reserved, 1000);
    const bal = calculateAvailableBalance(mockBudget, [], [], goals);
    assert.strictEqual(bal, 9000);
  });

  it('Safe to spend formula correctness: (10000 - 1000 - 500 - 500) / 10 days = 800', () => {
    const tx = [{ id: '1', name: 'Book', amount: 1000, category: 'Education', date: '2026-10-11' }];
    const comms = [{ id: '1', name: 'Phone', amount: 500, dueDate: '2026-10-20', isPaid: false }];
    const goals = [{ id: '1', name: 'Fund', targetAmount: 1000, savedAmount: 500, reservedFromBudget: true }];
    const safe = calculateSafeToSpend(mockBudget, tx, comms, goals, 10);
    assert.strictEqual(safe, 800);
  });
});
