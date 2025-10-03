import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFinanceStore } from "@/stores/finance-store";
import { toast } from "sonner";
interface DeleteTransactionDialogProps {
  transactionId: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
export function DeleteTransactionDialog({ transactionId, isOpen, setIsOpen }: DeleteTransactionDialogProps) {
  const { deleteTransaction } = useFinanceStore();
  const handleDelete = async () => {
    try {
      await deleteTransaction(transactionId);
      toast.success("Transaction deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete transaction.");
    }
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this transaction
            from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}