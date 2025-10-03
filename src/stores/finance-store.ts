import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Transaction, Category, DashboardSummary, TransactionType, Commitment, RecurrenceFrequency, EmiBorrowing, Goal } from '@shared/types';
import { api } from '@/lib/api-client';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
export type TransactionFilters = {
  query: string;
  type: 'all' | 'income' | 'expense';
  categoryId: string; // 'all' or an actual category id
  dateRange?: DateRange;
};
type NewTransactionData = {
  amount: number; // in cents
  type: TransactionType;
  categoryId: string;
  date: Date;
  description?: string;
};
type UpdateTransactionData = Partial<Omit<NewTransactionData, 'amount'>> & { amount?: number };
type NewCommitmentData = {
    name: string;
    amount: number; // in cents
    categoryId: string;
    dueDate: Date;
    recurrence: RecurrenceFrequency;
};
type UpdateCommitmentData = Partial<NewCommitmentData>;
type NewEmiData = Omit<EmiBorrowing, 'id'>;
type UpdateEmiData = Partial<NewEmiData>;
type NewGoalData = {
    name: string;
    targetAmount: number; // in cents
    deadline: Date;
};
type UpdateGoalData = Partial<NewGoalData>;
export type FinanceState = {
  transactions: Transaction[];
  categories: Category[];
  commitments: Commitment[];
  emis: EmiBorrowing[];
  goals: Goal[];
  summary: DashboardSummary;
  loading: boolean;
  error: string | null;
  filters: TransactionFilters;
  dashboardDateRange: DateRange;
};
export type FinanceActions = {
  fetchDashboardData: () => Promise<void>;
  fetchTransactions: (filters: TransactionFilters) => Promise<void>;
  addTransaction: (data: NewTransactionData) => Promise<void>;
  updateTransaction: (id: string, data: UpdateTransactionData) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setFilters: (filters: TransactionFilters) => void;
  setDashboardDateRange: (dateRange: DateRange) => void;
  fetchCommitments: () => Promise<void>;
  addCommitment: (data: NewCommitmentData) => Promise<void>;
  updateCommitment: (id: string, data: UpdateCommitmentData) => Promise<void>;
  deleteCommitment: (id: string) => Promise<void>;
  payCommitment: (id: string) => Promise<void>;
  fetchEmis: () => Promise<void>;
  addEmi: (data: NewEmiData) => Promise<void>;
  updateEmi: (id: string, data: UpdateEmiData) => Promise<void>;
  deleteEmi: (id: string) => Promise<void>;
  fetchGoals: () => Promise<void>;
  addGoal: (data: NewGoalData) => Promise<void>;
  updateGoal: (id: string, data: UpdateGoalData) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;
};
const initialState: FinanceState = {
  transactions: [],
  categories: [],
  commitments: [],
  emis: [],
  goals: [],
  summary: { balance: 0, income: 0, expenses: 0 },
  loading: true,
  error: null,
  filters: {
    query: '',
    type: 'all',
    categoryId: 'all',
    dateRange: undefined,
  },
  dashboardDateRange: { from: subDays(new Date(), 29), to: new Date() },
};
export const useFinanceStore = create<FinanceState & FinanceActions>()(
  immer((set, get) => ({
    ...initialState,
    fetchDashboardData: async () => {
      set({ loading: true, error: null });
      try {
        const { from, to } = get().dashboardDateRange;
        const params = new URLSearchParams();
        if (from) params.append('from', from.toISOString());
        if (to) params.append('to', to.toISOString());
        const [transactions, categories, summary, goals] = await Promise.all([
          api<Transaction[]>(`/api/transactions?${params.toString()}`),
          api<Category[]>('/api/categories'),
          api<DashboardSummary>(`/api/summary?${params.toString()}`),
          api<Goal[]>('/api/goals'),
        ]);
        set({ transactions, categories, summary, goals, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
        set({ loading: false, error: errorMessage });
      }
    },
    fetchTransactions: async (filters) => {
      set({ loading: true, error: null });
      try {
        const params = new URLSearchParams();
        if (filters.query) params.append('query', filters.query);
        if (filters.type !== 'all') params.append('type', filters.type);
        if (filters.categoryId !== 'all') params.append('categoryId', filters.categoryId);
        if (filters.dateRange?.from) params.append('from', filters.dateRange.from.toISOString());
        if (filters.dateRange?.to) params.append('to', filters.dateRange.to.toISOString());
        const transactions = await api<Transaction[]>(`/api/transactions?${params.toString()}`);
        set({ transactions, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions';
        set({ loading: false, error: errorMessage });
      }
    },
    addTransaction: async (data) => {
      const newTransaction: Transaction = {
        id: `temp-${Date.now()}`,
        ...data,
        date: data.date.toISOString(),
        type: data.type,
      };
      const originalState = get();
      set((state) => {
        state.transactions.unshift(newTransaction);
      });
      try {
        const savedTransaction = await api<Transaction>('/api/transactions', {
          method: 'POST',
          body: JSON.stringify({ ...data, date: data.date.toISOString() }),
        });
        set((state) => {
          const index = state.transactions.findIndex((t) => t.id === newTransaction.id);
          if (index !== -1) state.transactions[index] = savedTransaction;
        });
        await get().fetchDashboardData(); // Re-fetch summary
      } catch (error) {
        set(originalState);
        console.error(error);
        throw error;
      }
    },
    updateTransaction: async (id, data) => {
      const originalState = get();
      const transactionIndex = originalState.transactions.findIndex((t) => t.id === id);
      if (transactionIndex === -1) return;
      const updatedTransaction = { ...originalState.transactions[transactionIndex], ...data, date: data.date?.toISOString() ?? originalState.transactions[transactionIndex].date };
      set((state) => {
        state.transactions[transactionIndex] = updatedTransaction as Transaction;
      });
      try {
        await api<Transaction>(`/api/transactions/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...data, date: data.date?.toISOString() }),
        });
        await get().fetchDashboardData(); // Re-fetch summary
      } catch (error) {
        set(originalState);
        console.error(error);
        throw error;
      }
    },
    deleteTransaction: async (id) => {
      const originalState = get();
      set((state) => {
        state.transactions = state.transactions.filter((t) => t.id !== id);
      });
      try {
        await api<{ id: string }>(`/api/transactions/${id}`, { method: 'DELETE' });
        await get().fetchDashboardData(); // Re-fetch summary
      } catch (error) {
        set(originalState);
        console.error(error);
        throw error;
      }
    },
    addCategory: async (name) => {
      const newCategory: Category = { id: `temp-${Date.now()}`, name };
      const originalState = get();
      set((state) => {
        state.categories.push(newCategory);
      });
      try {
        const savedCategory = await api<Category>('/api/categories', {
          method: 'POST',
          body: JSON.stringify({ name }),
        });
        set((state) => {
          const index = state.categories.findIndex((c) => c.id === newCategory.id);
          if (index !== -1) state.categories[index] = savedCategory;
        });
      } catch (error) {
        set(originalState);
        console.error(error);
        throw error;
      }
    },
    updateCategory: async (id, name) => {
      const originalState = get();
      const categoryIndex = originalState.categories.findIndex((c) => c.id === id);
      if (categoryIndex === -1) return;
      set((state) => {
        state.categories[categoryIndex].name = name;
      });
      try {
        await api<Category>(`/api/categories/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ name }),
        });
      } catch (error) {
        set(originalState);
        console.error(error);
        throw error;
      }
    },
    deleteCategory: async (id) => {
      const originalState = get();
      set((state) => {
        state.categories = state.categories.filter((c) => c.id !== id);
      });
      try {
        await api<{ id: string }>(`/api/categories/${id}`, { method: 'DELETE' });
      } catch (error) {
        set(originalState);
        console.error(error);
        throw error;
      }
    },
    setFilters: (filters) => {
      set({ filters });
    },
    setDashboardDateRange: (dateRange) => {
      set({ dashboardDateRange: dateRange });
      get().fetchDashboardData();
    },
    fetchCommitments: async () => {
        set({ loading: true, error: null });
        try {
            const commitments = await api<Commitment[]>('/api/commitments');
            set({ commitments, loading: false });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch commitments';
            set({ loading: false, error: errorMessage });
        }
    },
    addCommitment: async (data) => {
        const tempId = `temp-${Date.now()}`;
        const newCommitment: Commitment = {
            id: tempId,
            ...data,
            dueDate: data.dueDate.toISOString(),
            status: 'upcoming',
        };
        const originalState = get();
        set(state => {
            state.commitments.push(newCommitment);
        });
        try {
            const savedCommitment = await api<Commitment>('/api/commitments', {
                method: 'POST',
                body: JSON.stringify({ ...data, dueDate: data.dueDate.toISOString() }),
            });
            set(state => {
                const index = state.commitments.findIndex(c => c.id === tempId);
                if (index !== -1) state.commitments[index] = savedCommitment;
            });
        } catch (error) {
            set(originalState);
            console.error(error);
            throw error;
        }
    },
    updateCommitment: async (id, data) => {
        const originalState = get();
        const commitmentIndex = originalState.commitments.findIndex(c => c.id === id);
        if (commitmentIndex === -1) return;
        const updatedCommitment = { ...originalState.commitments[commitmentIndex], ...data, dueDate: data.dueDate?.toISOString() ?? originalState.commitments[commitmentIndex].dueDate };
        set(state => {
            state.commitments[commitmentIndex] = updatedCommitment as Commitment;
        });
        try {
            await api<Commitment>(`/api/commitments/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ ...data, dueDate: data.dueDate?.toISOString() }),
            });
        } catch (error) {
            set(originalState);
            console.error(error);
            throw error;
        }
    },
    deleteCommitment: async (id) => {
        const originalState = get();
        set(state => {
            state.commitments = state.commitments.filter(c => c.id !== id);
        });
        try {
            await api<{ id: string }>(`/api/commitments/${id}`, { method: 'DELETE' });
        } catch (error) {
            set(originalState);
            console.error(error);
            throw error;
        }
    },
    payCommitment: async (id) => {
        const originalState = get();
        try {
            const { transaction, commitment } = await api<{ transaction: Transaction, commitment: Commitment }>(`/api/commitments/${id}/pay`, { method: 'POST' });
            set(state => {
                state.transactions.unshift(transaction);
                const index = state.commitments.findIndex(c => c.id === id);
                if (index !== -1) {
                    state.commitments[index] = commitment;
                }
            });
            await get().fetchDashboardData(); // Refresh summary
        } catch (error) {
            set(originalState);
            console.error(error);
            throw error;
        }
    },
    fetchEmis: async () => {
        set({ loading: true, error: null });
        try {
            const emis = await api<EmiBorrowing[]>('/api/emis');
            set({ emis, loading: false });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch EMI records';
            set({ loading: false, error: errorMessage });
        }
    },
    addEmi: async (data) => {
        const tempId = `temp-${Date.now()}`;
        const newEmi: EmiBorrowing = { id: tempId, ...data };
        const originalState = get();
        set(state => { state.emis.push(newEmi); });
        try {
            const savedEmi = await api<EmiBorrowing>('/api/emis', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            set(state => {
                const index = state.emis.findIndex(e => e.id === tempId);
                if (index !== -1) state.emis[index] = savedEmi;
            });
        } catch (error) {
            set(originalState);
            console.error(error);
            throw error;
        }
    },
    updateEmi: async (id, data) => {
        const originalState = get();
        const emiIndex = originalState.emis.findIndex(e => e.id === id);
        if (emiIndex === -1) return;
        const updatedEmi = { ...originalState.emis[emiIndex], ...data };
        set(state => { state.emis[emiIndex] = updatedEmi; });
        try {
            await api<EmiBorrowing>(`/api/emis/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        } catch (error) {
            set(originalState);
            console.error(error);
            throw error;
        }
    },
    deleteEmi: async (id) => {
        const originalState = get();
        set(state => { state.emis = state.emis.filter(e => e.id !== id); });
        try {
            await api<{ id: string }>(`/api/emis/${id}`, { method: 'DELETE' });
        } catch (error) {
            set(originalState);
            console.error(error);
            throw error;
        }
    },
    fetchGoals: async () => {
        set({ loading: true, error: null });
        try {
            const goals = await api<Goal[]>('/api/goals');
            set({ goals, loading: false });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch goals';
            set({ loading: false, error: errorMessage });
        }
    },
    addGoal: async (data) => {
        const tempId = `temp-${Date.now()}`;
        const newGoal: Goal = { id: tempId, ...data, deadline: data.deadline.toISOString(), currentAmount: 0 };
        const originalState = get();
        set(state => { state.goals.push(newGoal); });
        try {
            const savedGoal = await api<Goal>('/api/goals', {
                method: 'POST',
                body: JSON.stringify({ ...data, deadline: data.deadline.toISOString() }),
            });
            set(state => {
                const index = state.goals.findIndex(g => g.id === tempId);
                if (index !== -1) state.goals[index] = savedGoal;
            });
        } catch (error) {
            set(originalState);
            console.error(error);
            throw error;
        }
    },
    updateGoal: async (id, data) => {
        const originalState = get();
        const goalIndex = originalState.goals.findIndex(g => g.id === id);
        if (goalIndex === -1) return;
        const updatedGoal = { ...originalState.goals[goalIndex], ...data, deadline: data.deadline?.toISOString() ?? originalState.goals[goalIndex].deadline };
        set(state => { state.goals[goalIndex] = updatedGoal as Goal; });
        try {
            await api<Goal>(`/api/goals/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ ...data, deadline: data.deadline?.toISOString() }),
            });
        } catch (error) {
            set(originalState);
            console.error(error);
            throw error;
        }
    },
    deleteGoal: async (id) => {
        const originalState = get();
        set(state => { state.goals = state.goals.filter(g => g.id !== id); });
        try {
            await api<{ id: string }>(`/api/goals/${id}`, { method: 'DELETE' });
        } catch (error) {
            set(originalState);
            console.error(error);
            throw error;
        }
    },
    contributeToGoal: async (id, amount) => {
        const originalState = get();
        try {
            const { transaction, goal } = await api<{ transaction: Transaction, goal: Goal }>(`/api/goals/${id}/contribute`, {
                method: 'POST',
                body: JSON.stringify({ amount }),
            });
            set(state => {
                state.transactions.unshift(transaction);
                const index = state.goals.findIndex(g => g.id === id);
                if (index !== -1) state.goals[index] = goal;
            });
            await get().fetchDashboardData(); // Refresh summary
        } catch (error) {
            set(originalState);
            console.error(error);
            throw error;
        }
    },
  }))
);