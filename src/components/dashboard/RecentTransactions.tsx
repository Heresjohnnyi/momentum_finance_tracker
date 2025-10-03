import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaction, Category } from "@shared/types";
import { format, compareDesc } from 'date-fns';
import { cn, formatCurrency } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  loading?: boolean;
}
export function RecentTransactions({ transactions, categories, loading }: RecentTransactionsProps) {
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const recentTransactions = [...transactions]
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
    .slice(0, 5);
  if (loading) {
    return (
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {recentTransactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>
                    <div className="font-medium">{txn.description || categoryMap.get(txn.categoryId) || 'Uncategorized'}</div>
                    <div className="text-sm text-muted-foreground">{format(new Date(txn.date), 'MMM d, yyyy')}</div>
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-semibold",
                    txn.type === 'income' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {txn.type === 'income' ? '+' : '-'}
                    {formatCurrency(txn.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">No recent transactions to display.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}