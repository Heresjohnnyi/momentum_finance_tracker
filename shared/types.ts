export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type TransactionType = 'income' | 'expense';
export interface Transaction {
  id: string;
  amount: number; // in cents
  type: TransactionType;
  categoryId: string;
  date: string; // ISO 8601 string
  description?: string;
}
export interface Category {
  id: string;
  name: string;
}
export interface DashboardSummary {
  balance: number; // in cents
  income: number; // in cents
  expenses: number; // in cents
}
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
export type CommitmentStatus = 'upcoming' | 'paid' | 'overdue';
export interface Commitment {
  id: string;
  name: string;
  amount: number; // in cents
  categoryId: string;
  dueDate: string; // ISO 8601 string
  recurrence: RecurrenceFrequency;
  status: CommitmentStatus;
}
export type InterestType = 'simple' | 'compound';
export interface EmiBorrowing {
  id: string;
  name: string;
  principal: number; // in cents
  interestRate: number; // annual percentage rate (e.g., 8.5 for 8.5%)
  tenure: number; // in months
  interestType: InterestType;
  emi: number; // calculated monthly installment in cents
  totalInterest: number; // in cents
  totalAmount: number; // in cents
}
export interface Goal {
  id: string;
  name: string;
  targetAmount: number; // in cents
  currentAmount: number; // in cents
  deadline: string; // ISO 8601 string
}