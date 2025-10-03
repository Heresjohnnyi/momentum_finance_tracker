import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Repeat } from 'lucide-react';
import type { Commitment, Category } from "@shared/types";
import { format, isPast } from 'date-fns';
import { cn, formatCurrency } from "@/lib/utils";
import { CommitmentActions } from "./CommitmentActions";
import { useFinanceStore } from "@/stores/finance-store";
import { toast } from "sonner";
interface CommitmentsListProps {
  commitments: Commitment[];
  categories: Category[];
  loading?: boolean;
  onEdit: (commitment: Commitment) => void;
}
export function CommitmentsList({ commitments, categories, loading, onEdit }: CommitmentsListProps) {
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const { payCommitment } = useFinanceStore();
  const handlePay = async (id: string) => {
    try {
      await payCommitment(id);
      toast.success("Commitment paid successfully!");
    } catch (error) {
      toast.error("Failed to pay commitment.");
    }
  };
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-2">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming & Recurring</CardTitle>
        <CardDescription>A list of your future financial commitments like bills and subscriptions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commitments.length > 0 ? (
                  commitments.map((item) => {
                    const isOverdue = item.status !== 'paid' && isPast(new Date(item.dueDate));
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          {item.name}
                          {item.recurrence !== 'none' && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Repeat className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Recurs {item.recurrence}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell>{categoryMap.get(item.categoryId) || 'Uncategorized'}</TableCell>
                        <TableCell>{format(new Date(item.dueDate), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={
                            item.status === 'paid' ? 'default' : isOverdue ? 'destructive' : 'secondary'
                          }>
                            {item.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Upcoming'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(item.amount)}</TableCell>
                        <TableCell className="text-center flex items-center justify-center gap-2">
                          {item.status !== 'paid' && (
                            <Button size="sm" onClick={() => handlePay(item.id)}>Pay</Button>
                          )}
                          <CommitmentActions commitment={item} onEdit={onEdit} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No commitments found. Add one to get started!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}