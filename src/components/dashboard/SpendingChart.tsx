import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import type { Transaction, Category } from "@shared/types";
import { useMemo, useState, useCallback } from "react";
import { Skeleton } from "../ui/skeleton";
import { formatCurrency } from "@/lib/utils";
interface SpendingChartProps {
  transactions: Transaction[];
  categories: Category[];
  loading?: boolean;
}
const COLORS = ['#46c28e', '#3a9a7e', '#2d726e', '#214c5e', '#15284e', '#0d083b'];
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy} dy={-10} textAnchor="middle" fill={fill} className="text-sm font-semibold">
        {payload.name}
      </text>
       <text x={cx} y={cy} dy={10} textAnchor="middle" fill="hsl(var(--foreground))" className="text-lg font-bold">
        {formatCurrency(value)}
      </text>
      <text x={cx} y={cy} dy={30} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-xs">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {payload[0].name}
            </span>
            <span className="font-bold text-muted-foreground">
              {formatCurrency(payload[0].value)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
export function SpendingChart({ transactions, categories, loading }: SpendingChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );
  const { chartData, totalExpenses } = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const total = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const spendingByCategory = expenseTransactions.reduce((acc, curr) => {
      const categoryName = categories.find(c => c.id === curr.categoryId)?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += curr.amount;
      return acc;
    }, {} as Record<string, number>);
    const data = Object.entries(spendingByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    return { chartData: data, totalExpenses: total };
  }, [transactions, categories]);
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="pl-2 flex items-center justify-center">
          <Skeleton className="h-[350px] w-[350px] rounded-full" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        {chartData.length > 0 ? (
          <div className="relative w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  onMouseEnter={onPieEnter}
                >
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {activeIndex === undefined || activeIndex === null && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-muted-foreground">No spending data available for this period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}