import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar, TabType } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TransactionsView } from './components/TransactionsView';
import { CommitmentsView } from './components/CommitmentsView';
import { GoalsView } from './components/GoalsView';
import { VibeCheck } from './components/VibeCheck';
import { InsightsView } from './components/InsightsView';
import { RippleEffect } from './components/RippleEffect';
import { TransactionModal } from './components/TransactionModal';
import { Transaction } from './types';

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { addTransaction, updateTransaction, resetToDefaultData } = useFinance();

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsAddExpenseOpen(true);
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddExpenseOpen(true);
  };

  const handleModalSubmit = (data: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
    } else {
      addTransaction(data);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to initial ₹10,000 budget and sample transactions?')) {
      resetToDefaultData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Navigation (Sidebar desktop, Bottom bar mobile) */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onResetData={handleResetData}
        onOpenAddExpense={handleOpenAdd}
      />

      {/* Main View Area */}
      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 overflow-y-auto max-h-screen">
        {currentTab === 'dashboard' && (
          <Dashboard onNavigate={setCurrentTab} onOpenAddExpense={handleOpenAdd} />
        )}
        {currentTab === 'transactions' && (
          <TransactionsView onOpenAddModal={handleOpenAdd} onEditTransaction={handleEdit} />
        )}
        {currentTab === 'commitments' && <CommitmentsView />}
        {currentTab === 'goals' && <GoalsView />}
        {currentTab === 'vibe-check' && <VibeCheck />}
        {currentTab === 'insights' && <InsightsView />}
        {currentTab === 'ripple-effect' && <RippleEffect />}
      </main>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSubmit={handleModalSubmit}
        editingTransaction={editingTransaction}
      />
    </div>
  );
};

export function App() {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
}

export default App;
