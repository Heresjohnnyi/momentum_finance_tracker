import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { calculateSimpleInterestEmi, calculateCompoundInterestEmi, formatCurrency } from '@/lib/utils';
import { useFinanceStore } from '@/stores/finance-store';
import { toast } from 'sonner';
import type { InterestType, EmiBorrowing } from '@shared/types';
const formSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  principal: z.coerce.number({ errorMap: () => ({ message: 'Principal is required.' }) }).min(1, 'Principal must be greater than 0.'),
  interestRate: z.coerce.number({ errorMap: () => ({ message: 'Interest rate is required.' }) }).min(0.1, 'Interest rate must be greater than 0.'),
  tenure: z.coerce.number({ errorMap: () => ({ message: 'Tenure is required.' }) }).int().min(1, 'Tenure must be at least 1 month.'),
  interestType: z.enum(['simple', 'compound']),
});
type FormValues = z.infer<typeof formSchema>;
export function EmiCalculator() {
  const [result, setResult] = useState<Omit<EmiBorrowing, 'id' | 'name'> | null>(null);
  const addEmi = useFinanceStore((state) => state.addEmi);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      principal: undefined,
      interestRate: undefined,
      tenure: undefined,
      interestType: 'compound',
    },
  });
  const onSubmit = (values: FormValues) => {
    const principalInCents = Math.round(values.principal * 100);
    const calculation = values.interestType === 'simple'
      ? calculateSimpleInterestEmi(principalInCents, values.interestRate, values.tenure)
      : calculateCompoundInterestEmi(principalInCents, values.interestRate, values.tenure);
    setResult({
      principal: principalInCents,
      interestRate: values.interestRate,
      tenure: values.tenure,
      interestType: values.interestType as InterestType,
      ...calculation,
    });
  };
  const handleSave = async () => {
    if (!result) {
      toast.error('First calculate an EMI to save it.');
      return;
    }
    const name = form.getValues('name');
    if (!name) {
      form.setError('name', { type: 'manual', message: 'Name is required to save.' });
      return;
    }
    try {
      await addEmi({ name, ...result });
      toast.success('Borrowing saved successfully!');
      form.reset();
      setResult(null);
    } catch (error) {
      toast.error('Failed to save borrowing.');
    }
  };
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>New Calculation</CardTitle>
        <CardDescription>Enter borrowing details to calculate your EMI.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
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
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4">
                  <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="compound" /></FormControl><FormLabel className="font-normal">Compound</FormLabel></FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="simple" /></FormControl><FormLabel className="font-normal">Simple</FormLabel></FormItem>
                </RadioGroup>
              </FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" className="w-full">Calculate</Button>
            {result && (
              <div className="pt-4 space-y-4">
                <Separator />
                <h3 className="text-lg font-semibold text-center">Calculation Result</h3>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Monthly EMI</span>
                  <span className="font-bold text-2xl text-primary">{formatCurrency(result.emi)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Interest</span>
                  <span className="font-medium">{formatCurrency(result.totalInterest)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Amount Payable</span>
                  <span className="font-medium">{formatCurrency(result.totalAmount)}</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="button" variant="secondary" className="w-full" onClick={handleSave} disabled={!result}>
              Save this Borrowing
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}