import { BudgetConfig, Transaction, Commitment, SavingsGoal } from '../types';

export const INITIAL_BUDGET: BudgetConfig = {
  totalBudget: 10000,
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  periodName: 'Monthly Budget (October)',
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    name: 'Campus Cafeteria Lunch',
    amount: 140,
    category: 'Food',
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    note: 'Veg thali with lime soda',
    paymentMethod: 'UPI',
    isSample: true,
  },
  {
    id: 'tx-2',
    name: 'Metro Smart Card Recharge',
    amount: 500,
    category: 'Transport',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    note: 'Monthly commute pass balance',
    paymentMethod: 'UPI',
    isSample: true,
  },
  {
    id: 'tx-3',
    name: 'Course Reference Book & Notebooks',
    amount: 650,
    category: 'Education',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    note: 'Algorithm textbooks from bookstore',
    paymentMethod: 'Card',
    isSample: true,
  },
  {
    id: 'tx-4',
    name: 'Weekend Movie & Popcorn',
    amount: 420,
    category: 'Entertainment',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    note: 'Cinema ticket with friends',
    paymentMethod: 'UPI',
    isSample: true,
  },
  {
    id: 'tx-5',
    name: 'Chai & Evening Snacks',
    amount: 90,
    category: 'Food',
    date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
    note: 'Tapri chai and samosa',
    paymentMethod: 'Cash',
    isSample: true,
  },
];

export const INITIAL_COMMITMENTS: Commitment[] = [
  {
    id: 'comm-1',
    name: 'Mobile Postpaid & 5G Plan',
    amount: 399,
    dueDate: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
    isPaid: false,
    category: 'Bills',
  },
  {
    id: 'comm-2',
    name: 'Spotify & Cloud Subscription',
    amount: 179,
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    isPaid: false,
    category: 'Entertainment',
  },
  {
    id: 'comm-3',
    name: 'Hostel Maintenance Fee',
    amount: 500,
    dueDate: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    isPaid: true, // Marked as paid to verify rules
    category: 'Bills',
  },
];

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    name: 'Semester Tech Gadget (Headphones)',
    targetAmount: 3500,
    savedAmount: 1200,
    reservedFromBudget: true, // ₹1200 locked from budget
    targetDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 'goal-2',
    name: 'Emergency Buffer Fund',
    targetAmount: 5000,
    savedAmount: 500,
    reservedFromBudget: false, // tracking only, not deducted
    targetDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  },
];
