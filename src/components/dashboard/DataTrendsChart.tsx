import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Transaction } from "@shared/types";
import { useMemo } from "react";
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Skeleton } from "../ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { DateRange } from "react-day-picker";
interface DataTrendsChartProps {
  transactions: Transaction[];
  date: DateRange;
  loading?: boolean;
}
export function DataTrendsChart({ transactions, date, loading }: DataTrendsChartProps) {
  const chartData = useMemo(() => {
    const from = date?.from || subDays(new Date(), 29);
    const to = date?.to || new Date();
    const intervalDays = eachDayOfInterval({ start: from, end: to });
    const dailyData = intervalDays.map(day => ({
      date: format(day, 'MMM d'),
      income: 0,
      expense: 0,
    }));
    transactions.forEach(txn => {
      const txnDate = new Date(txn.date);
      if (txnDate >= from && txnDate <= to) {
        const formattedDate = format(txnDate, 'MMM d');
        const dayData = dailyData.find(d => d.date === formattedDate);
        if (dayData) {
          if (txn.type === 'income') {
            dayData.income += txn.amount;
          } else {
            dayData.expense += txn.amount;
          }
        }
      }
    });
    return dailyData;
  }, [transactions, date]);
  if (loading) {
    return (
      <Card className="col-span-1 lg:col-span-7">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="pl-2">
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="col-span-1 lg:col-span-7">
      <CardHeader>
        <CardTitle>Data Trends</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        {transactions.length > 0 ? (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrency(value as number).replace('₹', '')} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="income" fill="hsl(var(--chart-2))" name="Income" />
                <Bar dataKey="expense" fill="hsl(var(--destructive))" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-muted-foreground">No transaction data available for this period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}