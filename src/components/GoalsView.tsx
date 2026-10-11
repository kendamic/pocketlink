import React, { useState } from 'react';
import { PiggyBank, Plus, Trash2, Lock, Unlock, Target, Calendar } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR, calculatePercentage } from '../utils/calculations';
import confetti from 'canvas-confetti';

export const GoalsView: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('');
  const [reservedFromBudget, setReservedFromBudget] = useState(false);
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const saved = parseFloat(savedAmount || '0');

    if (!name.trim()) {
      setError('Please provide a goal name.');
      return;
    }
    if (isNaN(target) || target <= 0) {
      setError('Please provide a valid target amount.');
      return;
    }

    addGoal({
      name: name.trim(),
      targetAmount: target,
      savedAmount: isNaN(saved) ? 0 : saved,
      reservedFromBudget,
      targetDate: targetDate || undefined,
    });

    setName('');
    setTargetAmount('');
    setSavedAmount('');
    setReservedFromBudget(false);
    setTargetDate('');
    setError('');
    setIsAdding(false);
  };

  const handleAddFunds = (goalId: string, currentSaved: number, target: number) => {
    const input = window.prompt(`How much would you like to add to this goal?`);
    if (!input) return;
    const addVal = parseFloat(input);
    if (!isNaN(addVal) && addVal > 0) {
      const newSaved = currentSaved + addVal;
      updateGoal(goalId, { savedAmount: newSaved });
      if (newSaved >= target) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Savings Goals</h2>
          <p className="text-sm text-slate-400">
            Target savings for tech, emergency funds, or trips. Only explicitly reserved savings impact your daily Safe to Spend.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Add Goal Modal / Dropdown */}
      {isAdding && (
        <form
          onSubmit={handleAddGoal}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-700 space-y-4 animate-fade-in"
        >
          <h3 className="font-bold text-white text-base">Create New Savings Target</h3>
          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Name *</label>
              <input
                type="text"
                placeholder="e.g. Mechanical Keyboard, Goa Trip"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Amount (₹) *</label>
              <input
                type="number"
                placeholder="₹5000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Already Saved (₹)</label>
              <input
                type="number"
                placeholder="₹0"
                value={savedAmount}
                onChange={(e) => setSavedAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Date (Optional)</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              id="reserveCheck"
              checked={reservedFromBudget}
              onChange={(e) => setReservedFromBudget(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer"
            />
            <label htmlFor="reserveCheck" className="text-xs text-slate-300 cursor-pointer">
              <strong>Reserve from current budget:</strong> Deduct saved amount directly from available monthly budget and Safe to Spend.
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              Create Goal
            </button>
          </div>
        </form>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {goals.map((goal) => {
          const progress = calculatePercentage(goal.savedAmount, goal.targetAmount);
          const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);

          return (
            <div
              key={goal.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-4 hover:border-slate-700/80 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    {goal.name}
                    {goal.reservedFromBudget ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        <Lock className="w-2.5 h-2.5" /> Reserved in budget
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        <Unlock className="w-2.5 h-2.5" /> External / Unreserved
                      </span>
                    )}
                  </h3>
                  {goal.targetDate && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Calendar className="w-3.5 h-3.5" /> Target: {goal.targetDate}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete goal "${goal.name}"?`)) {
                      deleteGoal(goal.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-emerald-400 font-bold">{formatINR(goal.savedAmount)} saved</span>
                  <span className="text-slate-400">Target: {formatINR(goal.targetAmount)} ({progress}%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Need <strong className="text-slate-200">{formatINR(remaining)}</strong> more to reach goal
                </div>
              </div>

              {/* Quick actions */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                <button
                  onClick={() =>
                    updateGoal(goal.id, { reservedFromBudget: !goal.reservedFromBudget })
                  }
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {goal.reservedFromBudget ? 'Unreserve from monthly budget' : 'Reserve from budget'}
                </button>
                <button
                  onClick={() => handleAddFunds(goal.id, goal.savedAmount, goal.targetAmount)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs transition-colors"
                >
                  + Add Savings
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
