import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Clock, Calendar, Check, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Commitment, TransactionCategory } from '../types';
import { formatINR } from '../utils/calculations';

const CATEGORIES: TransactionCategory[] = [
  'Bills',
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Education',
  'Health',
  'Other',
];

export const CommitmentsView: React.FC = () => {
  const {
    budget,
    updateTotalBudget,
    setBudget,
    commitments,
    addCommitment,
    deleteCommitment,
    toggleCommitmentPaid,
  } = useFinance();

  // Budget setup form
  const [budgetInput, setBudgetInput] = useState(budget.totalBudget.toString());
  const [startDate, setStartDate] = useState(budget.startDate);
  const [endDate, setEndDate] = useState(budget.endDate);
  const [periodName, setPeriodName] = useState(budget.periodName);
  const [budgetSavedSuccess, setBudgetSavedSuccess] = useState(false);

  // New commitment form
  const [isAddingComm, setIsAddingComm] = useState(false);
  const [commName, setCommName] = useState('');
  const [commAmount, setCommAmount] = useState('');
  const [commDueDate, setCommDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [commCategory, setCommCategory] = useState<TransactionCategory>('Bills');
  const [commError, setCommError] = useState('');

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(budgetInput);
    if (isNaN(amount) || amount < 0) return;

    setBudget({
      totalBudget: amount,
      startDate,
      endDate,
      periodName: periodName.trim() || 'Custom Period',
    });
    setBudgetSavedSuccess(true);
    setTimeout(() => setBudgetSavedSuccess(false), 2500);
  };

  const handleAddCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(commAmount);
    if (!commName.trim()) {
      setCommError('Please enter commitment name.');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setCommError('Please enter a valid amount.');
      return;
    }

    addCommitment({
      name: commName.trim(),
      amount,
      dueDate: commDueDate,
      category: commCategory,
      isPaid: false,
    });

    setCommName('');
    setCommAmount('');
    setCommError('');
    setIsAddingComm(false);
  };

  const unpaidTotal = commitments
    .filter((c) => !c.isPaid)
    .reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Budget & Commitments</h2>
        <p className="text-sm text-slate-400">
          Configure your total allowance and lock down recurring upcoming bills (rent, recharges, subscriptions).
        </p>
      </div>

      {/* Part 1: Budget Period Setup */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
        <h3 className="text-base font-bold text-white mb-1">Budget Configuration</h3>
        <p className="text-xs text-slate-400 mb-4">
          Adjusting your budget immediately updates your available balance and Safe to Spend metric.
        </p>

        <form onSubmit={handleSaveBudget} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Total Budget (₹) *
            </label>
            <input
              type="number"
              min="0"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold text-base outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Period Label
            </label>
            <input
              type="text"
              value={periodName}
              onChange={(e) => setPeriodName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-4 flex items-center justify-between pt-2">
            <span className="text-xs text-emerald-400 font-medium">
              {budgetSavedSuccess && '✓ Budget settings updated successfully!'}
            </span>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
            >
              Update Budget Plan
            </button>
          </div>
        </form>
      </div>

      {/* Part 2: Commitments Section */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">Upcoming & Recurring Commitments</h3>
            <p className="text-xs text-slate-400">
              Unpaid commitments ({formatINR(unpaidTotal)}) are automatically deducted from your Safe to Spend.
              Once marked as paid, they no longer count as pending obligations.
            </p>
          </div>
          <button
            onClick={() => setIsAddingComm(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Commitment</span>
          </button>
        </div>

        {/* Add Commitment Inline Form */}
        {isAddingComm && (
          <form
            onSubmit={handleAddCommitment}
            className="p-4 rounded-xl bg-slate-950/80 border border-slate-700/80 space-y-3 animate-fade-in"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-emerald-400">New Commitment</span>
              <button
                type="button"
                onClick={() => setIsAddingComm(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {commError && <p className="text-xs text-rose-400">{commError}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Commitment name (e.g. WiFi Bill)"
                value={commName}
                onChange={(e) => setCommName(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                placeholder="Amount (₹)"
                value={commAmount}
                onChange={(e) => setCommAmount(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
              <input
                type="date"
                value={commDueDate}
                onChange={(e) => setCommDueDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
              <select
                value={commCategory}
                onChange={(e) => setCommCategory(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingComm(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Add Commitment
              </button>
            </div>
          </form>
        )}

        {/* Commitment List */}
        <div className="divide-y divide-slate-800/80">
          {commitments.map((comm) => (
            <div
              key={comm.id}
              className="py-3.5 flex items-center justify-between group hover:bg-slate-850/40 px-3 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleCommitmentPaid(comm.id)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                    comm.isPaid
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                      : 'border-slate-600 hover:border-emerald-400 text-transparent'
                  }`}
                  title={comm.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                >
                  <Check className="w-4 h-4 font-bold" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        comm.isPaid ? 'text-slate-400 line-through' : 'text-white'
                      }`}
                    >
                      {comm.name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        comm.isPaid
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {comm.isPaid ? 'Paid' : 'Unpaid (Pending)'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due: {comm.dueDate}</span>
                    {comm.category && <span>• {comm.category}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div
                    className={`text-sm font-bold ${
                      comm.isPaid ? 'text-slate-500 line-through' : 'text-slate-200'
                    }`}
                  >
                    {formatINR(comm.amount)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {comm.isPaid ? 'Settled' : 'Deducted from Safe Spend'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete commitment "${comm.name}"?`)) {
                      deleteCommitment(comm.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete commitment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
