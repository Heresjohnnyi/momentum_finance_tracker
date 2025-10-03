import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MoreVertical, Pencil, Trash2, PiggyBank } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { useFinanceStore } from '@/stores/finance-store';
import { toast } from 'sonner';
import type { Goal } from '@shared/types';
interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
}
const contributionSchema = z.object({
  amount: z.coerce
    .number({
      invalid_type_error: 'Amount must be a number.',
      required_error: 'Amount is required.',
    })
    .positive("Amount must be positive."),
});
type ContributionFormValues = z.infer<typeof contributionSchema>;
export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const { deleteGoal, contributeToGoal } = useFinanceStore();
  const [isContributeOpen, setContributeOpen] = useState(false);
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
  });
  const handleDelete = async () => {
    try {
      await deleteGoal(goal.id);
      toast.success('Goal deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete goal.');
    }
  };
  const handleContribute = async (values: ContributionFormValues) => {
    try {
      await contributeToGoal(goal.id, Math.round(values.amount * 100));
      toast.success('Contribution added successfully!');
      form.reset();
      setContributeOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add contribution.';
      toast.error(errorMessage);
    }
  };
  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between">
          <CardTitle>{goal.name}</CardTitle>
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(goal)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete your goal. This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-medium text-primary">{formatCurrency(goal.currentAmount)}</span>
              <span className="text-sm text-muted-foreground">Target: {formatCurrency(goal.targetAmount)}</span>
            </div>
            <Progress value={progress} />
            <div className="text-right text-xs text-muted-foreground mt-1">{progress.toFixed(1)}% complete</div>
          </div>
          <div className="text-sm text-muted-foreground">
            Deadline: {format(new Date(goal.deadline), 'MMM d, yyyy')} ({formatDistanceToNow(new Date(goal.deadline), { addSuffix: true })})
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => setContributeOpen(true)} disabled={goal.currentAmount >= goal.targetAmount}>
            <PiggyBank className="mr-2 h-4 w-4" />
            {goal.currentAmount >= goal.targetAmount ? 'Goal Reached!' : 'Contribute'}
          </Button>
        </CardFooter>
      </Card>
      <Dialog open={isContributeOpen} onOpenChange={setContributeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contribute to {goal.name}</DialogTitle>
            <DialogDescription>Enter the amount you want to add to this goal. This will create an expense transaction under "Savings".</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleContribute)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contribution Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} step="0.01" onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Contributing...' : 'Contribute'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}