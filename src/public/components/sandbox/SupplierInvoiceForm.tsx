import React, { useState } from 'react';
import { PlusCircle, ListPlus } from 'lucide-react';
import { BUYERS, SUPPLIERS, calculateEarlyPayoff } from '../../data';
import { Invoice, TransactionRecord } from '../../types';

export interface SupplierInvoiceSubmission {
  invoice: Invoice;
  transaction: TransactionRecord;
}

interface SupplierInvoiceFormProps {
  supplierBalanceUsdc: number;
  onSubmit: (submission: SupplierInvoiceSubmission) => void;
}

export function SupplierInvoiceForm({ supplierBalanceUsdc, onSubmit }: SupplierInvoiceFormProps) {
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [selectedSupplierId, setSelectedSupplierId] = useState(SUPPLIERS[0].id);
  const [selectedBuyerId, setSelectedBuyerId] = useState(BUYERS[0].id);
  const [amount, setAmount] = useState<number>(300000);
  const [tenureDays, setTenureDays] = useState<number>(60);
  const [rail, setRail] = useState<'Fiat' | 'USDC' | 'EURC' | 'Hybrid'>('USDC');

  const generateTxHash = () => {
    const letters = '0123456789abcdef';
    let hash = '0x';

    for (let index = 0; index < 40; index += 1) {
      hash += letters[Math.floor(Math.random() * 16)];
    }

    return `${hash.substring(0, 14)}...${hash.substring(34)}`;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanAmount = Number(amount);
    if (!cleanAmount || cleanAmount <= 0) {
      return;
    }

    const supplier = SUPPLIERS.find((current) => current.id === selectedSupplierId)?.name || 'SME Partner';
    const buyer = BUYERS.find((current) => current.id === selectedBuyerId);
    const buyerName = buyer?.name || 'Enterprise Payer';
    const baseRate = buyer?.baseRate ?? 0.06;
    const riskGrade = (buyer?.rating as Invoice['riskGrade']) || 'AA';
    const earlyPaymentAmount = calculateEarlyPayoff(cleanAmount, baseRate, tenureDays);
    const txHash = generateTxHash();

    const invoice: Invoice = {
      id: `inv_${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceNumber,
      supplierName: supplier,
      buyerName,
      amount: cleanAmount,
      faceValue: cleanAmount,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + tenureDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending_Buyer_Approval',
      discountRate: baseRate,
      earlyPaymentAmount,
      settlementRail: rail,
      daysRemaining: tenureDays,
      riskGrade,
      onChainTxHash: txHash,
    };

    const transaction: TransactionRecord = {
      id: `tx_${Math.floor(2000 + Math.random() * 8000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      type: 'Invoice_Registered',
      actor: supplier,
      description: `Registered receivable ${invoiceNumber} worth $${cleanAmount.toLocaleString()} with ${buyerName}`,
      amount: cleanAmount,
      tokenSymbol: 'USD',
      txHash,
    };

    onSubmit({ invoice, transaction });

    setInvoiceNumber(`INV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setAmount(300000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-50 border border-zinc-200 rounded-none p-5">
      <h4 className="text-xs font-bold mb-4 flex items-center gap-1.5 text-zinc-900 uppercase tracking-widest font-mono">
        <ListPlus className="w-4 h-4 text-zinc-800" />
        Register New Commercial Invoice
      </h4>

      <div className="mb-4 text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-bold">
        Supplier wallet available: <span className="text-zinc-900">{supplierBalanceUsdc.toLocaleString()} USDC</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[10px] text-zinc-500 font-mono font-bold uppercase mb-1">Invoice Number (Reference ID)</label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(event) => setInvoiceNumber(event.target.value)}
            className="w-full bg-white border border-zinc-300 rounded-none px-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-900"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] text-zinc-500 font-mono font-bold uppercase mb-1">Anchor Buyer (Payer)</label>
          <select
            value={selectedBuyerId}
            onChange={(event) => setSelectedBuyerId(event.target.value)}
            className="w-full bg-white border border-zinc-300 rounded-none px-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-900"
          >
            {BUYERS.map((buyer) => (
              <option key={buyer.id} value={buyer.id}>
                {buyer.name} ({buyer.rating}-rated)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-[10px] text-zinc-500 font-mono font-bold uppercase mb-1">Face Value (Amount USD)</label>
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            className="w-full bg-white border border-zinc-300 rounded-none px-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-900"
            min="1000"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] text-zinc-500 font-mono font-bold uppercase mb-1">Payment Maturity Option</label>
          <select
            value={tenureDays}
            onChange={(event) => setTenureDays(Number(event.target.value))}
            className="w-full bg-white border border-zinc-300 rounded-none px-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-900"
          >
            <option value={30}>30 Days Net</option>
            <option value={45}>45 Days Net</option>
            <option value={60}>60 Days Net</option>
            <option value={90}>90 Days Net</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-zinc-500 font-mono font-bold uppercase mb-1">Clearing Settlement Rail</label>
          <select
            value={rail}
            onChange={(event) => setRail(event.target.value as 'Fiat' | 'USDC' | 'EURC' | 'Hybrid')}
            className="w-full bg-white border border-zinc-300 rounded-none px-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-900"
          >
            <option value="USDC">USDC (On-chain Layer-2 gasless)</option>
            <option value="EURC">EURC Stablecoin Rail</option>
            <option value="Fiat">Fiat Federal Reserve Fedwire</option>
            <option value="Hybrid">Hybrid Stablecoin/Fiat Split</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-none text-xs uppercase tracking-widest cursor-pointer transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Register Receivable Obligation
        </button>
      </div>
    </form>
  );
}
