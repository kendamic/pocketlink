import React from 'react';
import { Compass, AlertTriangle, Lightbulb, TrendingUp, CheckCircle, X, RotateCcw } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { SpendingInsight } from '../types';
import { formatINR } from '../utils/calculations';

export const InsightsView: React.FC = () => {
  const {
    budget,
    transactions,
    totalExpenses,
    categoryTotals,
    safeToSpend,
    remainingDays,
    dismissedInsightIds,
    dismissInsight,
    resetDismissedInsights,
  } = useFinance();

  // Generate real insights purely derived from transaction data
  const rawInsights: SpendingInsight[] = [];

  // 1. Highest spending category
  const sortedCategories = Object.entries(categoryTotals)
    .filter(([, val]) => val > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sortedCategories.length > 0) {
    const [topCat, topVal] = sortedCategories[0];
    const topPct = totalExpenses > 0 ? Math.round((topVal / totalExpenses) * 100) : 0;
    if (topPct >= 30) {
      rawInsights.push({
        id: 'top-category-heavy',
        type: 'warning',
        title: `Heavy outflow in ${topCat}`,
        description: `${topCat} accounts for ${topPct}% (${formatINR(topVal)}) of all your spent money. Consider setting a sub-cap on this category.`,
        metric: `${topPct}% of total spending`,
      });
    }
  }

  // 2. Spending pace vs budget
  const budgetRatio = budget.totalBudget > 0 ? totalExpenses / budget.totalBudget : 0;
  if (budgetRatio > 0.7 && remainingDays > 10) {
    rawInsights.push({
      id: 'high-burn-rate',
      type: 'alert',
      title: 'Fast budget burn rate detected',
      description: `You have consumed ${(budgetRatio * 100).toFixed(0)}% of your monthly allowance with ${remainingDays} days still left in the period. Safe daily limit is down to ${formatINR(safeToSpend)}/day.`,
      metric: `${remainingDays} days remaining`,
    });
  } else if (budgetRatio < 0.4 && remainingDays <= 15) {
    rawInsights.push({
      id: 'disciplined-pace',
      type: 'success',
      title: 'Disciplined spending pace',
      description: `You've used only ${(budgetRatio * 100).toFixed(0)}% of your funds halfway through the month. You have ample breathing room.`,
      metric: 'Well under budget',
    });
  }

  // 3. Frequent micro-transactions (< ₹150)
  const smallTxs = transactions.filter((t) => t.amount <= 150);
  if (smallTxs.length >= 3) {
    const smallTotal = smallTxs.reduce((acc, t) => acc + t.amount, 0);
    rawInsights.push({
      id: 'micro-spend-leak',
      type: 'info',
      title: 'Frequent small purchases accumulate',
      description: `You have made ${smallTxs.length} small purchases (chai, snacks, quick deliveries) totaling ${formatINR(smallTotal)}. Micro-transactions add up quickly over 30 days.`,
      metric: `${smallTxs.length} transactions (${formatINR(smallTotal)})`,
    });
  }

  // 4. Large single expenses (> 20% of monthly budget)
  const largeTxs = transactions.filter((t) => t.amount >= budget.totalBudget * 0.2);
  if (largeTxs.length > 0) {
    rawInsights.push({
      id: 'large-single-expense',
      type: 'warning',
      title: 'Major individual purchases detected',
      description: `Found ${largeTxs.length} expense(s) exceeding ₹${(budget.totalBudget * 0.2).toLocaleString()} each (e.g. "${largeTxs[0].name}"). Consider amortizing large one-off costs.`,
      metric: `${formatINR(largeTxs[0].amount)} single purchase`,
    });
  }

  // Filter out user-dismissed insights
  const visibleInsights = rawInsights.filter((ins) => !dismissedInsightIds.includes(ins.id));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Pattern Radar Insights</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Spending Behavior Radar</h2>
          <p className="text-sm text-slate-400">
            Automated pattern detection from your actual expense history. Dismissed alerts can be restored at any time.
          </p>
        </div>

        {dismissedInsightIds.length > 0 && (
          <button
            onClick={resetDismissedInsights}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Restore Dismissed ({dismissedInsightIds.length})</span>
          </button>
        )}
      </div>

      {visibleInsights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleInsights.map((insight) => {
            const icon =
              insight.type === 'alert' ? (
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              ) : insight.type === 'warning' ? (
                <TrendingUp className="w-5 h-5 text-amber-400" />
              ) : insight.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <Lightbulb className="w-5 h-5 text-blue-400" />
              );

            const borderClass =
              insight.type === 'alert'
                ? 'border-rose-500/30 bg-rose-500/5'
                : insight.type === 'warning'
                ? 'border-amber-500/30 bg-amber-500/5'
                : insight.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-blue-500/30 bg-blue-500/5';

            return (
              <div
                key={insight.id}
                className={`p-5 rounded-2xl border ${borderClass} relative flex flex-col justify-between backdrop-blur-sm transition-all`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      {icon}
                      <h4 className="font-bold text-white text-base">{insight.title}</h4>
                    </div>
                    <button
                      onClick={() => dismissInsight(insight.id)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
                      title="Dismiss insight"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {insight.description}
                  </p>
                </div>

                {insight.metric && (
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Key Metric:</span>
                    <span className="text-white bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
                      {insight.metric}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <p className="text-base font-bold text-white">Radar is Clear</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No active anomalies or warning patterns found in your current transactions, or all insights have been dismissed.
          </p>
        </div>
      )}
    </div>
  );
};
