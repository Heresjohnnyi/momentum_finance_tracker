import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/lib/utils";
import React from "react";
interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: 'default' | 'positive' | 'negative';
  loading?: boolean;
}
export function SummaryCard({ title, value, icon, variant = 'default', loading = false }: SummaryCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-6" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn(
          "h-6 w-6",
          variant === 'positive' && "text-green-500",
          variant === 'negative' && "text-red-500",
          variant === 'default' && "text-muted-foreground"
        )}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold",
          variant === 'positive' && "text-green-500",
          variant === 'negative' && "text-red-500"
        )}>
          {formatCurrency(value)}
        </div>
        <p className="text-xs text-muted-foreground">For the current period</p>
      </CardContent>
    </Card>
  );
}