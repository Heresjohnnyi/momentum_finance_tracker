import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CategoryManager } from '@/components/settings/CategoryManager';
import { Toaster } from '@/components/ui/sonner';
export function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-display font-bold">Settings</h1>
            </div>
            <CategoryManager />
          </div>
        </div>
      </main>
      <Footer />
      <Toaster richColors closeButton />
    </div>
  );
}