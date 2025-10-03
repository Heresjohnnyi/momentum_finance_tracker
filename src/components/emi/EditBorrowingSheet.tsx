import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { calculateSimpleInterestEmi, calculateCompoundInterestEmi } from '@/lib/utils';
import { useFinanceStore } from '@/stores/finance-store';
import { toast } from 'sonner';
import type { EmiBorrowing, InterestType } from '@shared/types';
const formSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  principal: z.coerce.number({ errorMap: () => ({ message: 'Principal is required.' }) }).min(1, 'Principal must be greater than 0.'),
  interestRate: z.coerce.number({ errorMap: () => ({ message: 'Interest rate is required.' }) }).min(0.1, 'Interest rate must be greater than 0.'),
  tenure: z.coerce.number({ errorMap: () => ({ message: 'Tenure is required.' }) }).int().min(1, 'Tenure must be at least 1 month.'),
  interestType: z.enum(['simple', 'compound']),
});
type FormValues = z.infer<typeof formSchema>;
interface EditBorrowingSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  borrowing: EmiBorrowing | null;
}
export function EditBorrowingSheet({ isOpen, setIsOpen, borrowing }: EditBorrowingSheetProps) {
  const updateEmi = useFinanceStore((state) => state.updateEmi);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  useEffect(() => {
    if (borrowing && isOpen) {
      form.reset({
        name: borrowing.name,
        principal: borrowing.principal / 100,
        interestRate: borrowing.interestRate,
        tenure: borrowing.tenure,
        interestType: borrowing.interestType,
      });
    }
  }, [borrowing, isOpen, form]);
  async function onSubmit(values: FormValues) {
    if (!borrowing) return;
    const principalInCents = Math.round(values.principal * 100);
    const calculation = values.interestType === 'simple'
      ? calculateSimpleInterestEmi(principalInCents, values.interestRate, values.tenure)
      : calculateCompoundInterestEmi(principalInCents, values.interestRate, values.tenure);
    const updatedData = {
      name: values.name,
      principal: principalInCents,
      interestRate: values.interestRate,
      tenure: values.tenure,
      interestType: values.interestType as InterestType,
      ...calculation,
    };
    try {
      await updateEmi(borrowing.id, updatedData);
      toast.success('Borrowing updated successfully!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to update borrowing.');
    }
  }
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Borrowing</SheetTitle>
          <SheetDescription>
            Update the details of your saved borrowing and recalculate.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Borrowing Name</FormLabel><FormControl><Input placeholder="e.g., Home Loan" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="principal" render={({ field }) => (
              <FormItem><FormLabel>Principal Amount (₹)</FormLabel><FormControl><Input type="number" placeholder="100000" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="interestRate" render={({ field }) => (
              <FormItem><FormLabel>Annual Interest Rate (%)</FormLabel><FormControl><Input type="number" placeholder="8.5" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="tenure" render={({ field }) => (
              <FormItem><FormLabel>Tenure (in months)</FormLabel><FormControl><Input type="number" placeholder="120" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="interestType" render={({ field }) => (
              <FormItem className="space-y-3"><FormLabel>Interest Type</FormLabel><FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4">
                  <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="compound" /></FormControl><FormLabel className="font-normal">Compound</FormLabel></FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="simple" /></FormControl><FormLabel className="font-normal">Simple</FormLabel></FormItem>
                </RadioGroup>
              </FormControl><FormMessage /></FormItem>
            )} />
            <SheetFooter className="pt-4">
              <SheetClose asChild><Button type="button" variant="outline">Cancel</Button></SheetClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}