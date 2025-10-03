import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useFinanceStore } from '@/stores/finance-store';
import { toast } from 'sonner';
import type { Goal } from '@shared/types';
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  targetAmount: z.coerce
    .number({
      invalid_type_error: 'Target amount must be a number.',
      required_error: 'Target amount is required.',
    })
    .positive({ message: 'Target amount must be positive.' }),
  deadline: z.date({
    required_error: 'Please select a deadline.',
  }),
});
type FormValues = z.infer<typeof formSchema>;
interface ManageGoalSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  goal: Goal | null;
}
export function ManageGoalSheet({ isOpen, setIsOpen, goal }: ManageGoalSheetProps) {
  const { addGoal, updateGoal } = useFinanceStore();
  const isEditing = !!goal;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  useEffect(() => {
    if (isOpen) {
      if (isEditing && goal) {
        form.reset({
          name: goal.name,
          targetAmount: goal.targetAmount / 100,
          deadline: new Date(goal.deadline),
        });
      } else {
        form.reset({
          name: '',
          targetAmount: undefined,
          deadline: new Date(),
        });
      }
    }
  }, [isOpen, goal, isEditing, form]);
  async function onSubmit(values: FormValues) {
    try {
      const data = {
        ...values,
        targetAmount: Math.round(values.targetAmount * 100), // to cents
      };
      if (isEditing && goal) {
        await updateGoal(goal.id, data);
        toast.success('Goal updated successfully!');
      } else {
        await addGoal(data);
        toast.success('Goal added successfully!');
      }
      setIsOpen(false);
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} goal.`);
    }
  }
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit' : 'Add'} Financial Goal</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update the details of your goal.' : 'Set a new financial goal to track your progress.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Goal Name</FormLabel>
                <FormControl><Input placeholder="e.g., New Car Fund" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="targetAmount" render={({ field }) => (
              <FormItem>
                <FormLabel>Target Amount</FormLabel>
                <FormControl><Input type="number" placeholder="5000.00" {...field} step="0.01" onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="deadline" render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Deadline</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />
            <SheetFooter className="pt-4">
              <SheetClose asChild><Button type="button" variant="outline">Cancel</Button></SheetClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Goal'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}