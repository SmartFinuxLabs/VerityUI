import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  Cpu, 
  FileCheck, 
  AlertCircle,
  Play,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Invoice, MainRoute } from '../types';

interface SettlementViewProps {
  invoice: Invoice;
  onSelectRoute: (route: MainRoute) => void;
  onExecuteSettlement: (invoiceId: string, releasedRetention: number) => void;
}

export default function SettlementView({
  invoice,
  onSelectRoute,
  onExecuteSettlement
}: SettlementViewProps) {
  
  // Interactive checkboxes
  const [authEscrow, setAuthEscrow] = useState(false);
  const [authGoods, setAuthGoods] = useState(false);

  // Execution engine terminal states
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[SYSTEM] Booting Verity Core Ledger on Finux Node...',
    '[INFO] Connecting to contract security escrow: 0x71C...4f9E',
    '[INFO] Total Pool Balance: 50,000.00 USDC',
    '[INFO] Ready for signature: AUTHORIZATION_PENDING (Check authorization toggles to proceed)'
  ]);

  const [executionState, setExecutionState] = useState<'IDLE' | 'RUNNING' | 'SUCCESS'>('IDLE');

  // Multi-step transaction logs simulator
  const runSettlementScript = () => {
    if (!authEscrow || !authGoods) return;
    
    setExecutionState('RUNNING');
    setTerminalLogs(prev => [
      ...prev,
      '[LEDGER] Authorization toggles verified.',
      '[SYSTEM] Initiating smart contract disbursement...',
    ]);

    const step1 = setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        '[LEDGER] SECURE KEYPAIR VERIFIED... OK',
        '[SYSTEM] Invoking transfer_pool_allocation_v3(0x71C...4f9E)'
      ]);
    }, 1000);

    const step2 = setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        '[LEDGER] Disbursing Investor Principal + Yield: $46,250.00 USDC... SUCCESS',
        '[LEDGER] Releasing Supplier Retention: $3,750.00 USDC... SUCCESS',
      ]);
    }, 2000);

    const step3 = setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        '[LEDGER] Disbursing Platform Protocol Fee: $25.00 USDC... SUCCESS',
        '[SYSTEM] Tx Hash: 0x8a92ef65ca78ddae124f9cda3415ef4a781d4aef82',
        '[SYSTEM] State updated successfully: STATUS = SETTLED'
      ]);
    }, 3000);

    const step4 = setTimeout(() => {
      setExecutionState('SUCCESS');
      // Trigger parent callback to update invoice status and add retention balance to liquidity!
      onExecuteSettlement(invoice.id, 3750);
    }, 3800);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);
    };
  };

  // Adjust terminal warning message based on toggles
  useEffect(() => {
    if (authEscrow && authGoods && executionState === 'IDLE') {
      setTerminalLogs(prev => [
        ...prev,
        '[INFO] Toggles verified. Core signature ready. click "Execute Programmatic Settlement" to sign transaction block.'
      ]);
    }
  }, [authEscrow, authGoods, executionState]);

  return (
    <div id="invoice-settlement" className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full animate-fadeIn font-sans">
      
      {/* Navigation Breadcrumb header with Back */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <button 
            onClick={() => onSelectRoute('dashboard')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-primary lowercase tracking-wider uppercase mb-3 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Back to Dashboard</span>
          </button>
          
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900 font-sans">Invoice Settlement</h1>
          <p className="text-[14px] text-slate-500 mt-1">
            View allocated payouts and sign the contract escrow to execute settlement distribution.
          </p>
        </div>

        {/* Informative Walkthrough badge */}
        <div className="bg-[#EBF2FF] border border-blue-205 p-3.5 rounded-[8px] flex items-start gap-2.5 max-w-sm text-xs text-blue-950 shadow-3xs">
          <Cpu className="w-5 h-5 text-[#0052CC] shrink-0 mt-0.5" />
          <p>
            This settlement engine provides atomic release of locks. Checking authorizations activates the transaction terminal for invoice <span className="font-mono font-bold">{invoice.id}</span>.
          </p>
        </div>
      </div>

      {/* Invoice Overview Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-[12px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-[#0052CC] uppercase font-bold block">PROGRAMMATIC ESCROW MODULE</span>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold font-mono text-slate-150">{invoice.id}</h2>
            <span className="text-slate-500">•</span>
            <span className="text-sm text-slate-300 font-semibold">{invoice.buyer}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">MATURITY STATUS</span>
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>MATURED</span>
          </span>
        </div>
      </div>

      {/* Two Column details split */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Settlement Allocations Breakdown */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[12px] p-6 shadow-3xs space-y-6">
          
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Settlement Distribution Breakdown</h2>
            <p className="text-xs text-slate-400 mt-0.5">Programmatically calculated based on locked factoring parameters.</p>
          </div>

          <div className="border border-slate-150 rounded-[8px] overflow-hidden">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-250 text-slate-500 text-[10.5px] font-bold uppercase">
                  <th className="px-5 py-3 w-1/2">Allocation Recipient</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3 text-right">Payout Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 font-sans text-slate-700">
                
                {/* Investor yield */}
                <tr className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-bold text-slate-900">
                    Investor Principal + Yield
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    90% advance rate plus yield fees
                  </td>
                  <td className="px-5 py-4 text-right font-mono font-bold text-slate-900">
                    $46,250.00
                  </td>
                </tr>

                {/* Supplier release */}
                <tr className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-bold text-slate-900">
                    Supplier Retention Balance
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    10% locked reserve release
                  </td>
                  <td className="px-5 py-4 text-right font-mono font-bold text-emerald-700">
                    $3,750.00
                  </td>
                </tr>

                {/* Platform cost */}
                <tr className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    Platform Fee
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    0.05% protocol network cost
                  </td>
                  <td className="px-5 py-4 text-right font-mono font-semibold text-slate-600">
                    $25.00
                  </td>
                </tr>

                {/* Total bolding row */}
                <tr className="bg-slate-50/80 font-bold border-t border-slate-300">
                  <td colSpan={2} className="px-5 py-4 text-slate-900 font-extrabold uppercase text-[11px] tracking-wider">
                    Total Gross Invoice Secured
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-[#0052CC] font-extrabold text-[14px]">
                    $50,000.00 <span className="text-[9px] text-slate-400">USDC</span>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Secure Escrow Gauge Status indicator matching Screen 7 */}
          <div className="bg-[#E7F6ED] border border-emerald-250 p-4 rounded-[8px] flex items-center justify-between">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-emerald-950 font-bold text-xs uppercase tracking-wide">SMART CONTRACT ESCROW STATUS</span>
                <p className="text-[11.5px] text-slate-600 mt-0.5">Funded 100% by payer Global Manufacturing Corp.</p>
              </div>
            </div>
            <span className="text-xs bg-emerald-600 text-white font-extrabold font-mono px-2.5 py-1 rounded-[4px] uppercase tracking-wider">
              100% Funded
            </span>
          </div>

          {/* Authorizations Checkbox Group */}
          <div className="space-y-3.5 pt-4 border-t border-slate-150">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest label-caps">
              CONFIRM SETTLEMENT AUTHORIZATIONS
            </span>
            
            <div className="space-y-3">
              
              {/* Toggle 1 */}
              <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/50 rounded-[8px] border-2 border-slate-200/60 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={authEscrow}
                  onChange={(e) => setAuthEscrow(e.target.checked)}
                  disabled={executionState !== 'IDLE'}
                  className="mt-1 text-[#0052CC] w-4.5 h-4.5 rounded border-slate-300 cursor-pointer"
                />
                <span className="text-xs text-slate-600 leading-normal">
                  I authorize the immediate release of locked escrow funds to the respective recipient addresses according to the allocation schedule.
                </span>
              </label>

              {/* Toggle 2 */}
              <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/50 rounded-[8px] border-2 border-slate-200/60 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={authGoods}
                  onChange={(e) => setAuthGoods(e.target.checked)}
                  disabled={executionState !== 'IDLE'}
                  className="mt-1 text-[#0052CC] w-4.5 h-4.5 rounded border-slate-300 cursor-pointer"
                />
                <span className="text-xs text-slate-600 leading-normal">
                  I confirm that all dispute parameters are resolved, physical delivery of goods is verified, and the ledger can close.
                </span>
              </label>

            </div>
          </div>

        </div>

        {/* Right Column: Monospaced execution shell and submit button */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-[12px] p-6 shadow-3xs space-y-6">
          
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">EXECUTION TERMINAL</span>
            <h2 className="text-base font-extrabold text-slate-900 mt-1">Transaction Receipt Engine</h2>
          </div>

          {/* Terminal Terminal shell layout */}
          <div className="bg-slate-950 rounded-[10px] p-4 font-mono text-[11.5px] text-emerald-400 space-y-2 h-[260px] overflow-y-auto shadow-inner leading-relaxed select-all">
            <div className="flex gap-2 items-center mb-1 text-slate-500 font-bold border-b border-white/10 pb-1.5 uppercase text-[10px]">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block" />
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full inline-block" />
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block" />
              <span className="ml-[10px] text-xs">verity-console v3.0.5</span>
            </div>
            
            {terminalLogs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {log}
              </div>
            ))}
          </div>

          {/* Core submit button */}
          <div>
            <button
              onClick={runSettlementScript}
              disabled={!authEscrow || !authGoods || executionState !== 'IDLE'}
              type="button"
              className={`w-full py-4 px-4 rounded-[6.5px] text-[13.5px] font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 tracking-wider uppercase cursor-pointer ${
                (!authEscrow || !authGoods) && executionState === 'IDLE'
                  ? 'bg-slate-100 text-slate-450 border border-slate-250 cursor-not-allowed select-none'
                  : executionState === 'RUNNING'
                    ? 'bg-amber-600 text-white cursor-wait animate-pulse'
                    : executionState === 'SUCCESS'
                      ? 'bg-emerald-650 text-white select-none'
                      : 'bg-[#0052CC] hover:bg-[#003D9B] text-white active:scale-101'
              }`}
            >
              {executionState === 'RUNNING' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Chain Block...</span>
                </>
              ) : executionState === 'SUCCESS' ? (
                <>
                  <CheckCircle className="w-4.5 h-4.5 text-white" />
                  <span>Settlement Complete</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Execute Programmatic Settlement</span>
                </>
              )}
            </button>
            
            {(!authEscrow || !authGoods) && executionState === 'IDLE' && (
              <span className="block mt-2 text-center text-[11px] text-slate-400 font-bold uppercase tracking-wide">
                ⚠️ Authorize requirements above to proceed
              </span>
            )}
          </div>

        </div>

      </div>

      {/* Floating success banner */}
      {executionState === 'SUCCESS' && (
        <div className="fixed bottom-10 inset-x-6 mx-auto max-w-sm bg-emerald-600 text-white p-4 rounded-[12px] shadow-lg border border-emerald-500 flex items-center gap-3 animate-slideIn z-50">
          <CheckCircle className="w-6 h-6 text-emerald-100 shrink-0" />
          <div>
            <p className="font-extrabold text-sm">Escrow Disbursed!</p>
            <p className="text-[11.5px] text-emerald-50/80 mt-0.5">
              USDC $3,750 retention reserve released to your available balance. Node update completed.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
