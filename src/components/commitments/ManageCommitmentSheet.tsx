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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useFinanceStore } from '@/stores/finance-store';
import { toast } from 'sonner';
import type { Commitment, RecurrenceFrequency } from '@shared/types';
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  amount: z.coerce
    .number({
      invalid_type_error: 'Amount must be a number.',
      required_error: 'Amount is required.',
    })
    .min(0.01, { message: 'Amount must be at least 0.01.' }),
  categoryId: z.string({
    required_error: 'Please select a category.',
  }).min(1, 'Please select a category.'),
  dueDate: z.date({
    required_error: 'Please select a due date.',
  }),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']),
});
type FormValues = z.infer<typeof formSchema>;
interface ManageCommitmentSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  commitment: Commitment | null;
}
export function ManageCommitmentSheet({ isOpen, setIsOpen, commitment }: ManageCommitmentSheetProps) {
  const { categories, addCommitment, updateCommitment } = useFinanceStore();
  const isEditing = !!commitment;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  useEffect(() => {
    if (isOpen) {
      if (isEditing && commitment) {
        form.reset({
          name: commitment.name,
          amount: commitment.amount / 100,
          categoryId: commitment.categoryId,
          dueDate: new Date(commitment.dueDate),
          recurrence: commitment.recurrence,
        });
      } else {
        form.reset({
          name: '',
          amount: undefined,
          categoryId: undefined,
          dueDate: new Date(),
          recurrence: 'none',
        });
      }
    }
  }, [isOpen, commitment, isEditing, form]);
  async function onSubmit(values: FormValues) {
    try {
      const data = {
        ...values,
        amount: Math.round(values.amount * 100), // to cents
        recurrence: values.recurrence as RecurrenceFrequency,
      };
      if (isEditing && commitment) {
        await updateCommitment(commitment.id, data);
        toast.success('Commitment updated successfully!');
      } else {
        await addCommitment(data);
        toast.success('Commitment added successfully!');
      }
      setIsOpen(false);
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} commitment.`);
    }
  }
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit' : 'Add'} Commitment</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update the details of your commitment.' : 'Enter the details for a new future commitment.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input placeholder="e.g., Netflix Subscription" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl><Input type="number" placeholder="0.00" {...field} step="0.01" onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="categoryId" render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="dueDate" render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
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
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="recurrence" render={({ field }) => (
              <FormItem>
                <FormLabel>Recurrence</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select recurrence frequency" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <SheetFooter className="pt-4">
              <SheetClose asChild><Button type="button" variant="outline">Cancel</Button></SheetClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Commitment'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}