import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';

export function Layout() {
  const handleAddExpense = () => {
    // TODO: Open AddExpenseModal
    console.log('Add expense clicked');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Desktop only */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header onAddExpense={handleAddExpense} />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
