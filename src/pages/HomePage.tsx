import { useEffect } from 'react';
import { useFinanceStore } from '@/stores/finance-store';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AddTransactionSheet } from '@/components/dashboard/AddTransactionSheet';
import { Toaster } from '@/components/ui/sonner';
import { DollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { DashboardDateRangePicker } from '@/components/dashboard/DashboardDateRangePicker';
import { DataTrendsChart } from '@/components/dashboard/DataTrendsChart';
import { FinancialInsights } from '@/components/dashboard/FinancialInsights';
import { GoalsOverview } from '@/components/dashboard/GoalsOverview';
export function HomePage() {
  const {
    summary,
    transactions,
    categories,
    goals,
    loading,
    error,
    dashboardDateRange,
    setDashboardDateRange,
    fetchDashboardData,
  } = useFinanceStore(
    useShallow((state) => ({
      summary: state.summary,
      transactions: state.transactions,
      categories: state.categories,
      goals: state.goals,
      loading: state.loading,
      error: state.error,
      dashboardDateRange: state.dashboardDateRange,
      setDashboardDateRange: state.setDashboardDateRange,
      fetchDashboardData: state.fetchDashboardData,
    }))
  );
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md mb-8">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-3xl font-display font-bold">Dashboard</h1>
              <DashboardDateRangePicker date={dashboardDateRange} setDate={setDashboardDateRange} />
            </div>
            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <SummaryCard
                title="Current Balance"
                value={summary.balance}
                icon={<DollarSign />}
                loading={loading}
              />
              <SummaryCard
                title="Total Income"
                value={summary.income}
                icon={<ArrowUpCircle />}
                variant="positive"
                loading={loading}
              />
              <SummaryCard
                title="Total Expenses"
                value={summary.expenses}
                icon={<ArrowDownCircle />}
                variant="negative"
                loading={loading}
              />
            </div>
            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <DataTrendsChart transactions={transactions} date={dashboardDateRange} loading={loading} />
                <RecentTransactions transactions={transactions} categories={categories} loading={loading} />
              </div>
              <div className="lg:col-span-1 space-y-8">
                <SpendingChart transactions={transactions} categories={categories} loading={loading} />
                <GoalsOverview goals={goals} loading={loading} />
                <FinancialInsights
                  transactions={transactions}
                  categories={categories}
                  summary={summary}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <AddTransactionSheet />
      <Toaster richColors closeButton />
    </div>
  );
}