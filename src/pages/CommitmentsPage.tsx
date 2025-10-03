import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CommitmentsList } from '@/components/commitments/CommitmentsList';
import { ManageCommitmentSheet } from '@/components/commitments/ManageCommitmentSheet';
import { useFinanceStore } from '@/stores/finance-store';
import { useShallow } from 'zustand/react/shallow';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Commitment } from '@shared/types';
export function CommitmentsPage() {
  const {
    commitments,
    categories,
    loading,
    error,
    fetchCommitments,
    fetchDashboardData, // To get categories
  } = useFinanceStore(
    useShallow((state) => ({
      commitments: state.commitments,
      categories: state.categories,
      loading: state.loading,
      error: state.error,
      fetchCommitments: state.fetchCommitments,
      fetchDashboardData: state.fetchDashboardData,
    }))
  );
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState<Commitment | null>(null);
  useEffect(() => {
    if (categories.length === 0) {
      fetchDashboardData();
    }
    fetchCommitments();
  }, [fetchCommitments, categories.length, fetchDashboardData]);
  const handleAdd = () => {
    setEditingCommitment(null);
    setSheetOpen(true);
  };
  const handleEdit = (commitment: Commitment) => {
    setEditingCommitment(commitment);
    setSheetOpen(true);
  };
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-display font-bold">Future Commitments</h1>
              <Button onClick={handleAdd}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Commitment
              </Button>
            </div>
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
                <p><strong>Error:</strong> {error}</p>
              </div>
            )}
            <CommitmentsList
              commitments={commitments}
              categories={categories}
              loading={loading}
              onEdit={handleEdit}
            />
          </div>
        </div>
      </main>
      <Footer />
      <ManageCommitmentSheet
        isOpen={isSheetOpen}
        setIsOpen={setSheetOpen}
        commitment={editingCommitment}
      />
      <Toaster richColors closeButton />
    </div>
  );
}