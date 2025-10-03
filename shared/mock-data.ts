import type { Transaction, Category, Commitment } from './types';
export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Groceries' },
  { id: 'cat_2', name: 'Salary' },
  { id: 'cat_3', name: 'Rent' },
  { id: 'cat_4', name: 'Utilities' },
  { id: 'cat_5', name: 'Dining Out' },
  { id: 'cat_6', name: 'Freelance' },
  { id: 'cat_7', name: 'Transport' },
  { id: 'cat_8', name: 'Entertainment' },
  { id: 'cat_9', name: 'Subscription' },
];
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn_1',
    amount: 500000, // $5000.00
    type: 'income',
    categoryId: 'cat_2',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Monthly Salary',
  },
  {
    id: 'txn_2',
    amount: 150000, // $1500.00
    type: 'expense',
    categoryId: 'cat_3',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Apartment Rent',
  },
  {
    id: 'txn_3',
    amount: 12550, // $125.50
    type: 'expense',
    categoryId: 'cat_1',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Weekly Groceries',
  },
  {
    id: 'txn_4',
    amount: 7500, // $75.00
    type: 'expense',
    categoryId: 'cat_4',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Electricity Bill',
  },
  {
    id: 'txn_5',
    amount: 5000, // $50.00
    type: 'expense',
    categoryId: 'cat_5',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Dinner with friends',
  },
  {
    id: 'txn_6',
    amount: 75000, // $750.00
    type: 'income',
    categoryId: 'cat_6',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Freelance Project',
  },
  {
    id: 'txn_7',
    amount: 4200, // $42.00
    type: 'expense',
    categoryId: 'cat_7',
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Gasoline',
  },
  {
    id: 'txn_8',
    amount: 2500, // $25.00
    type: 'expense',
    categoryId: 'cat_8',
    date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Movie Tickets',
  },
];
export const MOCK_COMMITMENTS: Commitment[] = [
  {
    id: 'com_1',
    name: 'Netflix Subscription',
    amount: 1599,
    categoryId: 'cat_9',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    recurrence: 'monthly',
    status: 'upcoming',
  },
  {
    id: 'com_2',
    name: 'Gym Membership',
    amount: 4999,
    categoryId: 'cat_8',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    recurrence: 'monthly',
    status: 'upcoming',
  },
  {
    id: 'com_3',
    name: 'Phone Bill',
    amount: 7999,
    categoryId: 'cat_4',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    recurrence: 'monthly',
    status: 'overdue',
  },
];