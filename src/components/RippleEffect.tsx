import React, { useState } from 'react';
import { Sliders, TrendingUp, TrendingDown, HelpCircle, ArrowRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/calculations';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const RippleEffect: React.FC = () => {
  const {
    budget,
    availableBalance,
    safeToSpend,
    remainingDays,
    categoryTotals,
  } = useFinance();

  // Scenario 1: Daily spending delta slider (-₹200 to +₹300)
  const [dailyDelta, setDailyDelta] = useState<number>(100);

  // Scenario 2: Food spending reduction slider (0% to 50%)
  const [foodCutPercent, setFoodCutPercent] = useState<number>(15);

  // Scenario 3: One-time large purchase projection (₹0 to ₹5000)
  const [oneTimePurchase, setOneTimePurchase] = useState<number>(0);

  // Scenario 4: Weekly recurring savings (₹0 to ₹1000/week)
  const [weeklySavings, setWeeklySavings] = useState<number>(200);

  // Calculations under scenario
  const foodTotal = categoryTotals.Food || 0;
  const projectedFoodSaved = Math.round(foodTotal * (foodCutPercent / 100));

  const totalDailyDeltaCost = dailyDelta * remainingDays;
  const totalWeeklySavingsAmount = Math.floor(weeklySavings * (remainingDays / 7));

  // Projected available balance at end of period
  const projectedAvailable =
    availableBalance - totalDailyDeltaCost + projectedFoodSaved - oneTimePurchase - totalWeeklySavingsAmount;

  const projectedSafeToSpend = Math.max(
    0,
    Math.floor((availableBalance + projectedFoodSaved - oneTimePurchase - totalWeeklySavingsAmount) / remainingDays) -
      (dailyDelta > 0 ? dailyDelta : 0)
  );

  // Chart data comparing Baseline vs Simulated
  const comparisonData = [
    {
      name: 'Safe Daily Limit',
      Baseline: safeToSpend,
      Simulated: Math.max(0, safeToSpend - dailyDelta + Math.floor(projectedFoodSaved / remainingDays)),
    },
    {
      name: 'End Period Buffer',
      Baseline: Math.max(0, availableBalance),
      Simulated: Math.max(0, projectedAvailable),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
          <Sliders className="w-3.5 h-3.5" />
          <span>Ripple Effect Projections</span>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Hypothetical Spending Projections
        </h2>
        <p className="text-sm text-slate-400">
          Simulate how lifestyle adjustments or habit changes ripple through your monthly budget.
          <strong className="text-slate-300"> Note: Exploring projections never alters your real transaction records.</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Scenario Controls */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 backdrop-blur-sm">
          <h3 className="font-bold text-white text-base">Adjust Simulation Levers</h3>

          {/* Lever 1: Daily delta */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Spend more / less per day</span>
              <span className={dailyDelta > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                {dailyDelta > 0 ? `+₹${dailyDelta}/day extra` : `₹${Math.abs(dailyDelta)}/day saved`}
              </span>
            </div>
            <input
              type="range"
              min="-200"
              max="400"
              step="25"
              value={dailyDelta}
              onChange={(e) => setDailyDelta(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Save ₹200/day</span>
              <span>Baseline (₹0)</span>
              <span>Spend ₹400/day extra</span>
            </div>
          </div>

          {/* Lever 2: Food cut percent */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Cut dining out / Food expenses by</span>
              <span className="text-emerald-400">{foodCutPercent}% ({formatINR(projectedFoodSaved)} saved)</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={foodCutPercent}
              onChange={(e) => setFoodCutPercent(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0% (No change)</span>
              <span>25% cut</span>
              <span>50% aggressive cut</span>
            </div>
          </div>

          {/* Lever 3: One-time expense simulation */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Hypothetical one-time splurge</span>
              <span className="text-slate-200">{formatINR(oneTimePurchase)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="3000"
              step="100"
              value={oneTimePurchase}
              onChange={(e) => setOneTimePurchase(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>₹0</span>
              <span>₹1,500</span>
              <span>₹3,000</span>
            </div>
          </div>

          {/* Lever 4: Weekly recurring savings */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Save a fixed amount every week</span>
              <span className="text-emerald-400">₹{weeklySavings}/week (₹{totalWeeklySavingsAmount} total)</span>
            </div>
            <input
              type="range"
              min="0"
              max="800"
              step="50"
              value={weeklySavings}
              onChange={(e) => setWeeklySavings(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>₹0/week</span>
              <span>₹400/week</span>
              <span>₹800/week</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Outcome & Projection Chart */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 flex flex-col justify-between backdrop-blur-sm">
          <div>
            <h3 className="font-bold text-white text-base mb-1">Projected Trajectory</h3>
            <p className="text-xs text-slate-400 mb-4">
              Comparing your current actual trajectory with this simulated scenario over the remaining {remainingDays} days.
            </p>

            <div className="h-52 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Amount']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey="Baseline" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Simulated" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Narrative summary */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white">Summary of Scenario:</div>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li>
                  Daily spending shift totals <strong className="text-white">{formatINR(totalDailyDeltaCost)}</strong> impact across the month.
                </li>
                {projectedFoodSaved > 0 && (
                  <li>
                    Cutting food by {foodCutPercent}% saves <strong className="text-emerald-400">{formatINR(projectedFoodSaved)}</strong>.
                  </li>
                )}
                {oneTimePurchase > 0 && (
                  <li>
                    Splurge cost of {formatINR(oneTimePurchase)} absorbed.
                  </li>
                )}
                <li>
                  Estimated end-of-month cushion:{' '}
                  <strong className={projectedAvailable < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    {formatINR(projectedAvailable)}
                  </strong>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Projections are purely educational and do not mutate your ledger.
          </div>
        </div>
      </div>
    </div>
  );
};
