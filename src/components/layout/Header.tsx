import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Wallet, Menu, X, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
export function Header() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "text-lg md:text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
      isActive ? "text-primary" : "text-muted-foreground"
    );
  const navLinks = (
    <>
      <NavLink to="/" className={navLinkClasses} onClick={() => setSheetOpen(false)}>Dashboard</NavLink>
      <NavLink to="/transactions" className={navLinkClasses} onClick={() => setSheetOpen(false)}>Transactions</NavLink>
      <NavLink to="/commitments" className={navLinkClasses} onClick={() => setSheetOpen(false)}>Commitments</NavLink>
      <NavLink to="/goals" className={navLinkClasses} onClick={() => setSheetOpen(false)}>Goals</NavLink>
      <NavLink to="/emi-calculator" className={navLinkClasses} onClick={() => setSheetOpen(false)}>EMI Calculator</NavLink>
      <NavLink to="/settings" className={navLinkClasses} onClick={() => setSheetOpen(false)}>
        <span className="md:hidden">Settings</span>
        <Settings className="h-5 w-5 hidden md:inline-block" />
      </NavLink>
    </>
  );
  return (
    <header className="py-6 border-b sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <NavLink to="/" className="flex items-center space-x-3">
            <Wallet className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-display font-bold text-foreground">
              Momentum
            </h1>
          </NavLink>
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink to="/" className={navLinkClasses}>Dashboard</NavLink>
            <NavLink to="/transactions" className={navLinkClasses}>Transactions</NavLink>
            <NavLink to="/commitments" className={navLinkClasses}>Commitments</NavLink>
            <NavLink to="/goals" className={navLinkClasses}>Goals</NavLink>
            <NavLink to="/emi-calculator" className={navLinkClasses}>EMI Calculator</NavLink>
          </nav>
        </div>
        <div className="flex items-center space-x-2">
          <nav className="hidden md:flex items-center space-x-4">
             <NavLink to="/settings" className={navLinkClasses}>
                <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                </Button>
            </NavLink>
          </nav>
          <ThemeToggle className="relative" />
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-3/4">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-6 border-b">
                    <NavLink to="/" className="flex items-center space-x-3" onClick={() => setSheetOpen(false)}>
                      <Wallet className="h-8 w-8 text-primary" />
                      <h1 className="text-2xl font-display font-bold text-foreground">
                        Momentum
                      </h1>
                    </NavLink>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Close menu</span>
                      </Button>
                    </SheetClose>
                  </div>
                  <nav className="flex flex-col space-y-6 mt-8">
                    {navLinks}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}