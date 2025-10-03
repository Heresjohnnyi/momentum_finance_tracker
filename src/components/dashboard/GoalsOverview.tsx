import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import type { Goal } from "@shared/types";
interface GoalsOverviewProps {
  goals: Goal[];
  loading?: boolean;
}
export function GoalsOverview({ goals, loading }: GoalsOverviewProps) {
  const topGoals = goals.slice(0, 3);
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Goals Overview
        </CardTitle>
        <Button asChild variant="ghost" size="sm" className="text-sm">
          <Link to="/goals">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {topGoals.length > 0 ? (
          <div className="space-y-6">
            {topGoals.map((goal) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium">{goal.name}</p>
                    <p className="text-sm text-muted-foreground">{progress.toFixed(0)}%</p>
                  </div>
                  <Progress value={progress} />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-[150px] flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">No financial goals set yet.</p>
            <Button asChild variant="secondary" size="sm" className="mt-4">
              <Link to="/goals">Create a Goal</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}