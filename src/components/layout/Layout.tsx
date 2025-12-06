import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';

export function Layout() {
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  const handleAddExpense = () => {
    setExpenseModalOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop only (fixed, doesn't scroll) */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onAddExpense={handleAddExpense} />

        {/* Page Content (scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Add Expense Modal */}
      <AddExpenseModal
        open={expenseModalOpen}
        onOpenChange={setExpenseModalOpen}
      />
    </div>
  );
}
