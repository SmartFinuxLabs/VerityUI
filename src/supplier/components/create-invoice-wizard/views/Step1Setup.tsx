import { Search, UserPlus, ArrowRight } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import { StepperSimple } from '../components/Steppers';
import { RegisteredBuyerOption } from '../../../types';
import { useState } from 'react';

export function Step1Setup({ onNext, buyerOptions, selectedBuyerId, onChangeBuyerId }: { onNext: () => void, buyerOptions: RegisteredBuyerOption[], selectedBuyerId: string | null, onChangeBuyerId: (id: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuyers = buyerOptions.filter(b => 
    b.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.buyerId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-surface">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-4 hidden md:block">Create Invoice</h1>
          <h1 className="text-2xl font-bold tracking-tight mb-4 md:hidden">Create Invoice</h1>
          
          <StepperSimple currentStep={1} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Search Directory */}
            <div className="lg:col-span-7 bg-surface-container-lowest border border-border-muted rounded-lg p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-1">Search Directory</h2>
                <p className="text-sm text-on-surface-variant">Find an existing buyer network participant.</p>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-2.5 text-outline w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search by Name or Tax ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-md bg-surface-bright focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow text-sm"
                />
              </div>

              <div className="space-y-2">
                {filteredBuyers.length === 0 ? (
                  <div className="text-center py-6 text-on-surface-variant text-sm">No buyers found matching your search.</div>
                ) : (
                  filteredBuyers.map(c => (
                    <label 
                      key={c.buyerId} 
                      className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors group ${selectedBuyerId === c.buyerId ? 'border-primary bg-primary/5' : 'border-border-muted hover:bg-surface-subtle'}`}
                    >
                      <input 
                        type="radio" 
                        name="customer" 
                        className="w-4 h-4 text-primary focus:ring-primary border-outline-variant"
                        onChange={() => onChangeBuyerId(c.buyerId)}
                        checked={selectedBuyerId === c.buyerId}
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold">{c.buyerName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            c.buyerStatus === 'VERIFIED' ? 'bg-primary/10 text-primary' : 'bg-status-pending/10 text-status-pending'
                          }`}>
                            {c.buyerStatus || 'VERIFIED'}
                          </span>
                        </div>
                        <div className="font-mono text-xs text-on-surface-variant mt-1">
                          ID: {c.buyerId}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Mobile Divider */}
            <div className="lg:hidden flex items-center justify-center py-2">
              <div className="h-px bg-outline-variant flex-1"></div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-4">OR</span>
              <div className="h-px bg-outline-variant flex-1"></div>
            </div>

            {/* Add New Customer */}
            <div className="lg:col-span-5 bg-surface-container-lowest border border-border-muted rounded-lg p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.03)] relative overflow-hidden">
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                style={{ backgroundImage: 'radial-gradient(#003d9b 1px, transparent 1px)', backgroundSize: '16px 16px' }}
              ></div>
              <div className="relative z-10">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Add New Customer</h2>
                  <UserPlus className="text-outline w-6 h-6" />
                </div>
                <form className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Company Name</label>
                    <input type="text" className="w-full px-3 py-2 border border-outline-variant rounded-md bg-surface-bright focus:ring-2 focus:ring-primary outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Tax ID / Registration</label>
                    <input type="text" className="w-full px-3 py-2 border border-outline-variant rounded-md bg-surface-bright focus:ring-2 focus:ring-primary outline-none font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Billing Address</label>
                    <textarea rows={3} className="w-full px-3 py-2 border border-outline-variant rounded-md bg-surface-bright focus:ring-2 focus:ring-primary outline-none resize-none text-sm"></textarea>
                  </div>
                  <button type="button" className="w-full bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-md transition-colors border border-outline-variant">
                    Save to Network
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-border-muted pt-6">
            <button className="px-6 py-2.5 border border-outline-variant rounded-md text-on-surface hover:bg-surface-container-high transition-colors text-xs font-bold uppercase tracking-wider shadow-sm">
              Cancel
            </button>
              <button 
                onClick={onNext}
                disabled={!selectedBuyerId}
                className={`flex items-center gap-2 font-bold py-3 px-8 rounded-md transition-colors ${selectedBuyerId ? 'bg-primary hover:bg-on-primary-fixed-variant text-on-primary shadow-sm' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'}`}
              >
                Next: Line Itemsp
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
