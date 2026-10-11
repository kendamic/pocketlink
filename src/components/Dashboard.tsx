import React from 'react';
import {
  Wallet,
  TrendingDown,
  Calendar,
  ShieldCheck,
  Info,
  ArrowUpRight,
  Sparkles,
  PieChart as PieChartIcon,
  Flame,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR, calculatePercentage, getBudgetStatus } from '../utils/calculations';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { TabType } from './Navbar';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#10b981', // Emerald
  Transport: '#06b6d4', // Cyan
  Shopping: '#8b5cf6', // Violet
  Entertainment: '#f59e0b', // Amber
  Education: '#3b82f6', // Blue
  Bills: '#ef4444', // Red
  Health: '#ec4899', // Pink
  Other: '#64748b', // Slate
};

interface DashboardProps {
  onNavigate: (tab: TabType) => void;
  onOpenAddExpense: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenAddExpense }) => {
  const {
    budget,
    transactions,
    commitments,
    goals,
    totalExpenses,
    unpaidCommitments,
    reservedSavings,
    availableBalance,
    safeToSpend,
    remainingDays,
    categoryTotals,
    deleteTransaction,
  } = useFinance();

  const budgetStatus = getBudgetStatus(budget, transactions, commitments, goals);
  const percentSpent = calculatePercentage(totalExpenses, budget.totalBudget);

  // Prepare chart data for categories with spending > 0
  const chartData = Object.entries(categoryTotals)
    .filter(([_, val]) => val > 0)
    .map(([name, value]) => ({ name, value }));

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Budget Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-4 sm:p-5 rounded-2xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {budget.periodName}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${budgetStatus.badgeColor}`}
            >
              {budgetStatus.label}
            </span>
          </div>
          <p className="text-sm text-slate-300">
            {remainingDays} days remaining until{' '}
            <span className="text-slate-100 font-semibold">{budget.endDate}</span>
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('vibe-check')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 hover:text-white hover:border-emerald-500/50 text-xs font-bold transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vibe Check Simulator</span>
          </button>
          <button
            onClick={() => onNavigate('commitments')}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 text-xs font-medium transition-colors"
          >
            Adjust Budget
          </button>
        </div>
      </div>

      {/* Hero Metric: SAFE TO SPEND TODAY */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border-2 border-emerald-500/30 p-6 sm:p-8 shadow-2xl shadow-emerald-950/40">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-48 h-48 text-emerald-400" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-4">
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
            <span>Safe Daily Outflow Formula</span>
          </div>

          <div className="text-xs uppercase tracking-wider font-semibold text-emerald-400/90 mb-1">
            Safe to Spend Today
          </div>
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
              {formatINR(safeToSpend)}
            </span>
            <span className="text-slate-400 text-sm sm:text-base font-medium">/ day</span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            You have <strong className="text-white">{formatINR(availableBalance)}</strong> available
            after accounting for bills ({formatINR(unpaidCommitments)}) and reserved savings (
            {formatINR(reservedSavings)}) spread across{' '}
            <strong className="text-white">{remainingDays} days</strong>.
          </p>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 w-fit">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Formula: (₹{budget.totalBudget.toLocaleString()} - ₹{totalExpenses.toLocaleString()} spent - ₹{unpaidCommitments} bills - ₹{reservedSavings} savings) ÷ {remainingDays} days
            </span>
          </div>
        </div>
      </div>

      {/* Main Budget Grid: Total Budget, Total Spent, Available Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Budget Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Total Monthly Budget</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            {formatINR(budget.totalBudget)}
          </div>
          <div className="text-xs text-slate-400">
            Set for {budget.periodName}
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Total Spent</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            {formatINR(totalExpenses)}
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mb-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentSpent > 90
                  ? 'bg-rose-500'
                  : percentSpent > 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${percentSpent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>{percentSpent}% of budget used</span>
            <span>{transactions.length} transactions</span>
          </div>
        </div>

        {/* Available Balance Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Available Balance</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold mb-2 ${
              availableBalance < 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {formatINR(availableBalance)}
          </div>
          <div className="text-xs text-slate-400">
            {availableBalance >= 0 ? 'Surplus ready for allocation' : 'Budget exceeded! Adjust expenses'}
          </div>
        </div>
      </div>

      {/* Spending Breakdown & Recent Transactions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Spending Breakdown (2 Cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Category Breakdown</h3>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              Details <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {chartData.length > 0 ? (
            <div className="flex-1 flex flex-col justify-between">
              {/* Donut Chart */}
              <div className="h-44 w-full my-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={CATEGORY_COLORS[entry.name] || '#64748b'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Spent']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Progress Bars */}
              <div className="space-y-2.5 mt-2">
                {Object.entries(categoryTotals)
                  .filter(([_, val]) => val > 0)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([cat, val]) => {
                    const pct = totalExpenses > 0 ? Math.round((val / totalExpenses) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: CATEGORY_COLORS[cat] || '#64748b' }}
                            />
                            {cat}
                          </span>
                          <span className="text-white font-semibold">
                            {formatINR(val)}{' '}
                            <span className="text-slate-400 font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: CATEGORY_COLORS[cat] || '#64748b',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs">
              <PieChartIcon className="w-8 h-8 text-slate-600 mb-2" />
              <span>No expenses recorded yet. Click "Add Expense" to get started.</span>
            </div>
          )}
        </div>

        {/* Recent Transactions (3 Cols) */}
        <div className="lg:col-span-3 p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Recent Transactions</h3>
              <p className="text-xs text-slate-400">Live updates from your wallet</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddExpense}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
              >
                + Add Expense
              </button>
              <button
                onClick={() => onNavigate('transactions')}
                className="text-xs text-slate-300 hover:text-white font-medium px-2 py-1"
              >
                View All
              </button>
            </div>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-slate-800/80 flex-1">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between group hover:bg-slate-850/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[tx.category] || '#64748b'}25`,
                        color: CATEGORY_COLORS[tx.category] || '#64748b',
                        border: `1px solid ${CATEGORY_COLORS[tx.category] || '#64748b'}40`,
                      }}
                    >
                      {tx.category.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate flex items-center gap-2">
                        {tx.name}
                        {tx.isSample && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                            sample
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                        {tx.paymentMethod && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500 font-mono text-[11px]">
                              {tx.paymentMethod}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <div className="text-sm font-bold text-rose-400">-{formatINR(tx.amount)}</div>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete expense "${tx.name}" for ${formatINR(tx.amount)}?`)) {
                          deleteTransaction(tx.id);
                        }
                      }}
                      className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs">
              <p>No transactions found. Record your first spend!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
