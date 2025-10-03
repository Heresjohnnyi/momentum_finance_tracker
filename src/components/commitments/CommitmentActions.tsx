import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeleteCommitmentDialog } from './DeleteCommitmentDialog';
import type { Commitment } from '@shared/types';
interface CommitmentActionsProps {
  commitment: Commitment;
  onEdit: (commitment: Commitment) => void;
}
export function CommitmentActions({ commitment, onEdit }: CommitmentActionsProps) {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  return (
    <>
      <DeleteCommitmentDialog
        commitmentId={commitment.id}
        isOpen={isDeleteDialogOpen}
        setIsOpen={setDeleteDialogOpen}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onEdit(commitment)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDeleteDialogOpen(true)} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}