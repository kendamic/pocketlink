import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  CalendarClock,
  PiggyBank,
  Sparkles,
  Sliders,
  RotateCcw,
  Compass,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'transactions'
  | 'commitments'
  | 'goals'
  | 'vibe-check'
  | 'insights'
  | 'ripple-effect';

interface NavbarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  onResetData: () => void;
  onOpenAddExpense: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onResetData,
  onOpenAddExpense,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'transactions', label: 'Transactions', icon: <Receipt className="w-5 h-5" /> },
    { id: 'commitments', label: 'Commitments', icon: <CalendarClock className="w-5 h-5" /> },
    { id: 'goals', label: 'Savings Goals', icon: <PiggyBank className="w-5 h-5" /> },
    { id: 'vibe-check', label: 'Vibe Check', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'insights', label: 'Pattern Radar', icon: <Compass className="w-5 h-5" /> },
    { id: 'ripple-effect', label: 'Ripple Effect', icon: <Sliders className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/90 border-r border-slate-800/80 backdrop-blur-xl p-5 sticky top-0 h-screen select-none shrink-0 z-20">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg
              className="w-5 h-5 text-slate-950 font-bold"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
              PocketPilot
            </h1>
            <p className="text-xs text-emerald-400 font-medium">Your money. Your call.</p>
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onOpenAddExpense}
          className="w-full mb-6 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
        >
          <span className="text-lg leading-none">+</span>
          <span>Add Expense</span>
        </button>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className={active ? 'text-emerald-400' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
                {item.id === 'vibe-check' && (
                  <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                    Hot
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom utility */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <button
            onClick={onResetData}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
            title="Reset demo data to initial ₹10,000 state"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Reset Demo Data</span>
          </button>
          <div className="px-3 py-1 text-[11px] text-slate-400">
            PocketPilot v1.0 • Student Edition
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-slate-950"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
          </div>
          <span className="font-extrabold text-base text-white">PocketPilot</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetData}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/60"
            title="Reset Demo Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAddExpense}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95"
          >
            + Add
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 border-t border-slate-800/90 backdrop-blur-lg px-2 py-1.5 flex justify-around">
        {navItems.map((item) => {
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                active ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`p-1 rounded-md ${active ? 'bg-emerald-500/10' : ''}`}>
                {item.icon}
              </span>
              <span className="truncate max-w-[54px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
