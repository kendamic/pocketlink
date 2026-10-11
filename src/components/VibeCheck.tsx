import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, RotateCcw, Info, Plus } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR, calculatePercentage } from '../utils/calculations';
import { TransactionCategory } from '../types';
import confetti from 'canvas-confetti';

const CATEGORIES: TransactionCategory[] = [
  'Food',
  'Shopping',
  'Entertainment',
  'Transport',
  'Education',
  'Bills',
  'Health',
  'Other',
];

export const VibeCheck: React.FC = () => {
  const {
    budget,
    availableBalance,
    safeToSpend,
    remainingDays,
    totalExpenses,
    addTransaction,
  } = useFinance();

  const [hypoName, setHypoName] = useState('New Gaming Headset / Party Night');
  const [hypoAmount, setHypoAmount] = useState<string>('800');
  const [hypoCategory, setHypoCategory] = useState<TransactionCategory>('Shopping');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const amountNumber = Math.max(0, parseFloat(hypoAmount) || 0);

  // Hypothetical Calculations
  const hypoBalance = availableBalance - amountNumber;
  const hypoSafeToSpend = Math.max(0, Math.floor(hypoBalance / remainingDays));
  const safeToSpendDelta = hypoSafeToSpend - safeToSpend;

  const currentPercentUsed = calculatePercentage(totalExpenses, budget.totalBudget);
  const hypoPercentUsed = calculatePercentage(totalExpenses + amountNumber, budget.totalBudget);

  const handleApplyPurchase = () => {
    if (amountNumber <= 0 || !hypoName.trim()) return;

    // Create real transaction
    addTransaction({
      name: `[Vibe Checked] ${hypoName.trim()}`,
      amount: amountNumber,
      category: hypoCategory,
      date: new Date().toISOString().split('T')[0],
      note: 'Applied directly from Vibe Check simulator',
      paymentMethod: 'UPI',
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3000);
  };

  const handleReset = () => {
    setHypoAmount('');
    setHypoName('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vibe Check Interactive Simulator</span>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Test Purchases Before You Tap
        </h2>
        <p className="text-sm text-slate-400">
          Curious how buying that hoodie, concert ticket, or sneakers hits your daily safety cushion? Test it risk-free.
        </p>
      </div>

      {/* Simulator Inputs & Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Input parameters */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 backdrop-blur-sm">
          <h3 className="font-bold text-white text-base">Hypothetical Purchase</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              What do you want to buy?
            </label>
            <input
              type="text"
              placeholder="e.g. Zara Jacket, Weekend Dineout"
              value={hypoName}
              onChange={(e) => setHypoName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Price Tag (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={hypoAmount}
                onChange={(e) => setHypoAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-white font-black text-2xl outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={hypoCategory}
              onChange={(e) => setHypoCategory(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-emerald-500 cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Quick presets */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quick Test Amounts
            </label>
            <div className="flex flex-wrap gap-2">
              {[250, 500, 800, 1500, 3000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setHypoAmount(amt.toString())}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-xs font-semibold text-slate-300 border border-slate-700 hover:text-white"
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset test
            </button>
          </div>
        </div>

        {/* Right: Simulated Budget Impact Card */}
        <div className="md:col-span-7 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-6 flex flex-col justify-between backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Simulated Result
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Non-Destructive Preview
              </span>
            </div>

            {/* Side-by-side metric comparison */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Metric 1: Safe Daily Spend */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Safe Daily Spend</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{formatINR(safeToSpend)}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <span
                    className={`text-2xl font-black ${
                      safeToSpendDelta < 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {formatINR(hypoSafeToSpend)}
                  </span>
                </div>
                <div className="text-[11px] text-rose-400 mt-1 font-semibold">
                  {safeToSpendDelta < 0 ? `${formatINR(safeToSpendDelta)} / day drop` : 'No change'}
                </div>
              </div>

              {/* Metric 2: Available Balance */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Available Balance</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">
                    {formatINR(availableBalance)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <span
                    className={`text-2xl font-black ${
                      hypoBalance < 0 ? 'text-rose-400' : 'text-slate-200'
                    }`}
                  >
                    {formatINR(hypoBalance)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Budget use: {currentPercentUsed}% → {hypoPercentUsed}%
                </div>
              </div>
            </div>

            {/* Impact assessment callout */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Info className="w-4 h-4 text-emerald-400" />
                <span>Impact Assessment</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                If you proceed with this {formatINR(amountNumber)} purchase, your safe daily allowance
                decreases by{' '}
                <strong className="text-rose-400">{formatINR(Math.abs(safeToSpendDelta))}</strong> for
                the next {remainingDays} days.
                {hypoBalance < 0
                  ? ' ⚠️ This purchase puts you beyond your total budget for this month!'
                  : hypoSafeToSpend < 150
                  ? ' ⚠️ Your safe daily spend drops below ₹150/day. Keep caution for food & transit.'
                  : ' You will comfortably stay within safe limits.'}
              </p>
            </div>
          </div>

          {/* Action Confirmation Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            {appliedSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Expense created and ledger updated successfully!</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-750 text-xs font-semibold transition-colors"
              >
                Cancel / Not Now
              </button>
              <button
                type="button"
                onClick={handleApplyPurchase}
                disabled={amountNumber <= 0}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Apply Purchase (Record Real Expense)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
