import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TransactionsToolbar } from '@/components/transactions/TransactionsToolbar';
import { TransactionsTable } from '@/components/transactions/TransactionsTable';
import { useFinanceStore } from '@/stores/finance-store';
import { useShallow } from 'zustand/react/shallow';
import { Toaster } from '@/components/ui/sonner';
import { Card, CardContent } from '@/components/ui/card';
export function TransactionsPage() {
  const {
    transactions,
    categories,
    loading,
    error,
    filters,
    setFilters,
    fetchTransactions,
    fetchDashboardData, // To get categories
  } = useFinanceStore(
    useShallow((state) => ({
      transactions: state.transactions,
      categories: state.categories,
      loading: state.loading,
      error: state.error,
      filters: state.filters,
      setFilters: state.setFilters,
      fetchTransactions: state.fetchTransactions,
      fetchDashboardData: state.fetchDashboardData,
    }))
  );
  useEffect(() => {
    // Fetch categories if they are not already loaded
    if (categories.length === 0) {
      fetchDashboardData();
    }
    fetchTransactions(filters);
  }, [fetchTransactions, filters, categories.length, fetchDashboardData]);
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-display font-bold">Transactions</h1>
            </div>
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
                <p><strong>Error:</strong> {error}</p>
              </div>
            )}
            <Card className="shadow-md">
              <CardContent className="p-0">
                <TransactionsToolbar
                  filters={filters}
                  setFilters={setFilters}
                  categories={categories}
                />
                <TransactionsTable
                  transactions={transactions}
                  categories={categories}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
      <Toaster richColors closeButton />
    </div>
  );
}