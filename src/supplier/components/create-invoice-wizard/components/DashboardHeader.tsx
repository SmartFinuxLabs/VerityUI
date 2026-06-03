import { Bell, Settings } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant w-full px-6 h-16 sticky top-0 z-50 flex justify-between items-center transition-colors">
      <div className="flex items-center gap-8">
        <span className="text-2xl font-bold text-primary tracking-tight">Verity</span>
        <nav className="hidden md:flex gap-6">
          <a className="text-on-surface-variant hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider" href="#">Dashboard</a>
          <a className="text-primary border-b-2 border-primary pb-1 text-xs font-bold uppercase tracking-wider opacity-80" href="#">Invoices</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider" href="#">Buyers</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider" href="#">Reports</a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="bg-primary text-on-primary text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md hover:bg-primary-container transition-colors hidden md:block">
          Create Invoice
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant">
          <img alt="User" className="w-full h-full object-cover" src="https://ui-avatars.com/api/?name=User&background=003d9b&color=fff" />
        </div>
      </div>
    </header>
  );
}
