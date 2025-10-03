import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction, Category } from "@shared/types";
import { format } from 'date-fns';
import { cn, formatCurrency } from "@/lib/utils";
import { TransactionActions } from "./TransactionActions";
interface TransactionsTableProps {
  transactions: Transaction[];
  categories: Category[];
  loading?: boolean;
}
export function TransactionsTable({ transactions, categories, loading }: TransactionsTableProps) {
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length > 0 ? (
            transactions.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="whitespace-nowrap">{format(new Date(txn.date), 'MMM d, yyyy')}</TableCell>
                <TableCell className="font-medium">{txn.description || 'N/A'}</TableCell>
                <TableCell>{categoryMap.get(txn.categoryId) || 'Uncategorized'}</TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-semibold",
                    txn.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  )}>
                    {txn.type}
                  </span>
                </TableCell>
                <TableCell className={cn(
                  "text-right font-semibold",
                  txn.type === 'income' ? 'text-green-500' : 'text-red-500'
                )}>
                  {txn.type === 'income' ? '+' : '-'}
                  {formatCurrency(txn.amount)}
                </TableCell>
                <TableCell>
                  <TransactionActions transaction={txn} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No transactions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}