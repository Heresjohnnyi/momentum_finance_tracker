import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { EmiCalculator } from '@/components/emi/EmiCalculator';
import { BorrowingsList } from '@/components/emi/BorrowingsList';
import { EditBorrowingSheet } from '@/components/emi/EditBorrowingSheet';
import { useFinanceStore } from '@/stores/finance-store';
import { useShallow } from 'zustand/react/shallow';
import { Toaster } from '@/components/ui/sonner';
import type { EmiBorrowing } from '@shared/types';
export function EmiCalculatorPage() {
  const { emis, loading, error, fetchEmis } = useFinanceStore(
    useShallow((state) => ({
      emis: state.emis,
      loading: state.loading,
      error: state.error,
      fetchEmis: state.fetchEmis,
    }))
  );
  const [isEditSheetOpen, setEditSheetOpen] = useState(false);
  const [editingBorrowing, setEditingBorrowing] = useState<EmiBorrowing | null>(null);
  useEffect(() => {
    fetchEmis();
  }, [fetchEmis]);
  const handleEdit = (borrowing: EmiBorrowing) => {
    setEditingBorrowing(borrowing);
    setEditSheetOpen(true);
  };
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-display font-bold">EMI Calculator</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Calculate and manage your Equated Monthly Installments for borrowings.
              </p>
            </div>
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
                <p><strong>Error:</strong> {error}</p>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-1">
                <EmiCalculator />
              </div>
              <div className="lg:col-span-2">
                <BorrowingsList borrowings={emis} loading={loading} onEdit={handleEdit} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <EditBorrowingSheet
        isOpen={isEditSheetOpen}
        setIsOpen={setEditSheetOpen}
        borrowing={editingBorrowing}
      />
      <Toaster richColors closeButton />
    </div>
  );
}