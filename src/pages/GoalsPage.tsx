import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GoalCard } from '@/components/goals/GoalCard';
import { ManageGoalSheet } from '@/components/goals/ManageGoalSheet';
import { useFinanceStore } from '@/stores/finance-store';
import { useShallow } from 'zustand/react/shallow';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Goal } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
export function GoalsPage() {
  const { goals, loading, error, fetchGoals } = useFinanceStore(
    useShallow((state) => ({
      goals: state.goals,
      loading: state.loading,
      error: state.error,
      fetchGoals: state.fetchGoals,
    }))
  );
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);
  const handleAdd = () => {
    setEditingGoal(null);
    setSheetOpen(true);
  };
  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setSheetOpen(true);
  };
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-display font-bold">Financial Goals</h1>
              <Button onClick={handleAdd}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Goal
              </Button>
            </div>
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
                <p><strong>Error:</strong> {error}</p>
              </div>
            )}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-semibold">No Goals Yet</h2>
                <p className="text-muted-foreground mt-2">
                  Start tracking your financial goals by adding a new one.
                </p>
                <Button onClick={handleAdd} className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Goal
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <ManageGoalSheet
        isOpen={isSheetOpen}
        setIsOpen={setSheetOpen}
        goal={editingGoal}
      />
      <Toaster richColors closeButton />
    </div>
  );
}
function CardSkeleton() {
  return (
    <div className="p-6 border rounded-lg space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
      <Skeleton className="h-4 w-full" />
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}