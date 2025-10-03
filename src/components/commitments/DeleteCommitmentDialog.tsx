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
interface DeleteCommitmentDialogProps {
  commitmentId: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
export function DeleteCommitmentDialog({ commitmentId, isOpen, setIsOpen }: DeleteCommitmentDialogProps) {
  const { deleteCommitment } = useFinanceStore();
  const handleDelete = async () => {
    try {
      await deleteCommitment(commitmentId);
      toast.success("Commitment deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete commitment.");
    }
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this commitment.
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