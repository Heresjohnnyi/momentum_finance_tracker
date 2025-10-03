import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { generateFinancialInsights, Insight } from '@/lib/insights';
import { cn } from '@/lib/utils';
import type { Transaction, Category, DashboardSummary } from '@shared/types';
interface FinancialInsightsProps {
  transactions: Transaction[];
  categories: Category[];
  summary: DashboardSummary;
  loading?: boolean;
}
const iconMap: Record<Insight['type'], React.ReactNode> = {
  positive: <TrendingUp className="h-5 w-5 text-green-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};
const colorMap: Record<Insight['type'], string> = {
  positive: 'border-l-4 border-green-500',
  warning: 'border-l-4 border-yellow-500',
  info: 'border-l-4 border-blue-500',
};
export function FinancialInsights({ transactions, categories, summary, loading }: FinancialInsightsProps) {
  const insights = useMemo(() => {
    if (loading || !transactions || !categories || !summary) {
      return [];
    }
    return generateFinancialInsights(transactions, categories, summary);
  }, [transactions, categories, summary, loading]);
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-start space-x-4">
              <Skeleton className="h-6 w-6 rounded-full mt-1" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-3 space-y-0">
        <Lightbulb className="h-6 w-6 text-primary" />
        <CardTitle>Financial Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className={cn("p-4 rounded-md bg-muted/50", colorMap[insight.type])}>
                <div className="flex items-start space-x-4">
                  <div className="mt-1">{iconMap[insight.type]}</div>
                  <div>
                    <p className="font-semibold">{insight.title}</p>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[150px] flex items-center justify-center">
            <p className="text-muted-foreground text-center">
              Add more transactions to unlock personalized financial insights.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}