import type { Transaction, Category, DashboardSummary } from '@shared/types';
import { formatCurrency } from './utils';
export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'info';
}
export function generateFinancialInsights(
  transactions: Transaction[],
  categories: Category[],
  summary: DashboardSummary
): Insight[] {
  const insights: Insight[] = [];
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  // Insight 1: Savings Potential
  if (summary.income > summary.expenses) {
    const savings = summary.income - summary.expenses;
    insights.push({
      id: 'savings-potential',
      title: 'Great Savings Potential!',
      description: `You've earned ${formatCurrency(savings)} more than you spent. This is a great opportunity to save or invest.`,
      type: 'positive',
    });
  }
  // Insight 2: High Expense Warning
  if (summary.income > 0 && summary.expenses > summary.income * 0.8) {
    const expensePercentage = ((summary.expenses / summary.income) * 100).toFixed(0);
    insights.push({
      id: 'high-expense-ratio',
      title: 'High Spending Alert',
      description: `Your expenses are ${expensePercentage}% of your income. Keep an eye on your spending to maintain a healthy budget.`,
      type: 'warning',
    });
  }
  // Insight 3: Top Spending Category
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  if (expenseTransactions.length > 0) {
    const spendingByCategory = expenseTransactions.reduce((acc, curr) => {
      const categoryName = categoryMap.get(curr.categoryId) || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += curr.amount;
      return acc;
    }, {} as Record<string, number>);
    const topCategory = Object.entries(spendingByCategory).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      const [categoryName, amount] = topCategory;
      insights.push({
        id: 'top-spending-category',
        title: 'Top Spending Category',
        description: `Your highest spending was in '${categoryName}', totaling ${formatCurrency(amount)}. Review these expenses for potential savings.`,
        type: 'info',
      });
    }
  }
  // Insight 4: No Transactions
  if (transactions.length === 0) {
    insights.push({
      id: 'no-transactions',
      title: 'Ready to Start?',
      description: "You haven't added any transactions for this period yet. Click the '+' button to add your first income or expense!",
      type: 'info',
    });
  }
  return insights.slice(0, 3); // Return a maximum of 3 insights
}