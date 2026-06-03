import React from 'react';
import { Building2, Timer, AlertOctagon, ChevronRight, Download, Plus } from 'lucide-react';
import { Invoice, MainRoute } from '../types';

interface OverallDisputesViewProps {
  invoices: Invoice[];
  onSelectRoute: (route: MainRoute) => void;
  onFocusInvoiceForDispute: (id: string) => void;
}

export default function OverallDisputesView({ invoices, onFocusInvoiceForDispute }: OverallDisputesViewProps) {
  const disputedInvoices = invoices.filter(inv => inv.status === 'DISPUTED');
  const totalDisputedVolume = disputedInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto w-full animate-fadeIn font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Invoices</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0052CC]">Dispute Management</span>
          </nav>
          <h2 className="text-[28px] font-extrabold tracking-tight text-slate-900">Dispute Workspace</h2>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all rounded-[6px] text-xs font-bold uppercase tracking-wider cursor-pointer">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0052CC] text-white hover:bg-[#003D9B] transition-all rounded-[6px] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs">
            <Plus className="w-4 h-4" /> Log Dispute
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-[12px] shadow-3xs">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-blue-50 text-[#0052CC]">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="flex items-center font-mono text-sm text-red-500 font-bold">
              +12% vs LY
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Disputed Volume</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold text-slate-900 font-mono">
              {totalDisputedVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <span className="font-mono text-slate-400 font-bold text-xs">USDC</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[12px] shadow-3xs">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Timer className="w-6 h-6" />
            </div>
            <span className="flex items-center font-mono text-sm text-emerald-600 font-bold">
              -1.5 Days
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg. Resolution Time</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold text-slate-900 font-mono">4.2</h3>
            <span className="font-sans text-slate-500 font-semibold text-sm">Business Days</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-red-50 border border-slate-200 p-6 rounded-[12px] shadow-3xs">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <span className="px-2 py-0.5 bg-red-500 text-white rounded-[4px] text-[10px] font-bold tracking-wider">
              IMMEDIATE
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Critical Actions</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold text-red-600 font-mono">{disputedInvoices.length}</h3>
            <span className="font-mono text-slate-400 font-bold text-xs">Near Maturity</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <section className="bg-white border border-slate-200 rounded-[12px] shadow-3xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between gap-4 bg-slate-50/50">
          <h4 className="text-lg font-extrabold text-slate-900">Active Disputes</h4>
          <div className="flex gap-2">
            <select className="bg-white border border-slate-200 text-sm font-semibold text-slate-700 rounded-lg py-1.5 px-3 outline-none focus:ring-1 focus:ring-[#0052CC] cursor-pointer shadow-xs">
              <option>All Dispute Reasons</option>
              <option>Quantity Mismatch</option>
              <option>Pricing Error</option>
              <option>Missing Documents</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold tracking-wider uppercase">
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Buyer</th>
                <th className="px-6 py-4">Dispute Reason</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {disputedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No active disputes found.
                  </td>
                </tr>
              ) : (
                disputedInvoices.map((dispute) => (
                  <tr key={dispute.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-[#0052CC]">{dispute.id}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-800">{dispute.buyer}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{dispute.disputeReason || 'Unspecified Dispute'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-mono text-[13px] font-bold text-slate-900">${dispute.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-bold">USDC</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => onFocusInvoiceForDispute(dispute.id)}
                          className="px-3 py-1.5 bg-[#0052CC] text-white text-[11px] font-bold uppercase tracking-wider rounded-[6px] hover:bg-[#003D9B] transition-colors cursor-pointer shadow-xs"
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
