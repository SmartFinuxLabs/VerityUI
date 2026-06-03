import { Trash2, PlusCircle, UploadCloud, FileText, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { FocusedHeader } from '../components/FocusedHeader';
import { StepperCircles } from '../components/Steppers';
import { useState } from 'react';
import { LineItem } from '../types';
import { formatCurrency } from '../utils/formatters';

export const INITIAL_ITEMS: LineItem[] = [
  { id: '1', description: 'Industrial Server Racks - Type C', quantity: 12, price: 1250, taxPercent: 8.5 },
  { id: '2', description: 'Installation & Setup Labor', quantity: 1, price: 3500, taxPercent: 0 },
];

export function Step2LineItems({ onNext, onBack, items, setItems }: { onNext: () => void; onBack: () => void; items: LineItem[]; setItems: (items: LineItem[]) => void }) {

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, price: 0, taxPercent: 0 }]);
  };

  const deleteItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const tax = items.reduce((acc, item) => acc + (item.quantity * item.price * (item.taxPercent / 100)), 0);
  const fee = subtotal * 0.001; // 0.1% platform fee
  const total = subtotal + tax + fee;

  return (
    <div className="flex flex-col min-h-screen">
      <FocusedHeader title="Create Invoice" onCancel={onBack} />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 py-8 flex flex-col gap-8">
        <StepperCircles currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Line Items Card */}
            <section className="bg-surface-container-lowest border border-border-muted rounded-lg shadow-[0px_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="p-4 border-b border-border-muted bg-surface-bright flex justify-between items-center">
                <h2 className="text-xl font-semibold">Invoice Details</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-surface-container-highest">
                      <th className="text-xs font-bold uppercase tracking-wider text-on-surface-variant py-4 px-4">Description</th>
                      <th className="text-xs font-bold uppercase tracking-wider text-on-surface-variant py-4 px-4 text-right">Qty</th>
                      <th className="text-xs font-bold uppercase tracking-wider text-on-surface-variant py-4 px-4 text-right">Unit Price</th>
                      <th className="text-xs font-bold uppercase tracking-wider text-on-surface-variant py-4 px-4 text-right">Tax (%)</th>
                      <th className="text-xs font-bold uppercase tracking-wider text-on-surface-variant py-4 px-4 text-right">Amount</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id} className={`group ${index % 2 === 0 ? 'bg-surface-subtle/50' : 'bg-surface-container-lowest'}`}>
                        <td className="py-2 px-4">
                          <input type="text" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} className="w-full bg-transparent border-0 border-b border-transparent focus:border-primary outline-none transition-colors py-2 text-sm" placeholder="Item description" />
                        </td>
                        <td className="py-2 px-4">
                          <input type="number" value={item.quantity} min={1} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)} className="w-20 bg-transparent border-0 border-b border-transparent focus:border-primary outline-none transition-colors py-2 text-right float-right font-mono text-[13px]" />
                        </td>
                        <td className="py-2 px-4">
                           <div className="flex items-center justify-end">
                            <span className="text-on-surface-variant mr-1 text-sm">$</span>
                            <input type="number" value={item.price} min={0} step={0.01} onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)} className="w-24 bg-transparent border-0 border-b border-transparent focus:border-primary outline-none transition-colors py-2 text-right font-mono text-[13px]" />
                          </div>
                        </td>
                        <td className="py-2 px-4">
                           <input type="number" value={item.taxPercent} min={0} step={0.1} onChange={(e) => updateItem(index, 'taxPercent', parseFloat(e.target.value) || 0)} className="w-16 bg-transparent border-0 border-b border-transparent focus:border-primary outline-none transition-colors py-2 text-right float-right font-mono text-[13px]" />
                        </td>
                        <td className="py-2 px-4 text-right">
                          <span className="font-mono text-[13px] block py-2">${formatCurrency(item.quantity * item.price)}</span>
                        </td>
                        <td className="py-2 px-4 text-center">
                          <button onClick={() => deleteItem(index)} className="text-on-surface-variant hover:text-status-failed opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={6} className="py-3 px-4 bg-surface-bright border-t border-surface-container-highest">
                        <button onClick={addItem} className="flex items-center gap-2 text-primary text-sm font-medium hover:text-primary-fixed-dim transition-colors cursor-pointer">
                          <PlusCircle className="w-[18px] h-[18px]" />
                          Add Line Item
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Supporting Documents */}
            <section className="bg-surface-container-lowest border border-border-muted rounded-lg shadow-[0px_4px_12px_rgba(0,0,0,0.03)] p-4 flex flex-col gap-2">
              <h2 className="text-xl font-semibold">Supporting Documents</h2>
              <p className="text-sm text-on-surface-variant">Attach purchase orders, delivery receipts, or custom contracts (PDF, JPG, PNG).</p>
              
              <div className="mt-2 border-2 border-dashed border-outline-variant rounded-lg bg-surface-bright hover:bg-surface-subtle transition-colors cursor-pointer flex flex-col items-center justify-center py-10 px-4 text-center group">
                <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">Click to upload or drag and drop</span>
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mt-2">Maximum file size 50 MB</span>
              </div>

              <div className="mt-4 flex items-center justify-between p-3 border border-border-muted rounded-md bg-surface-subtle">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">PO_88492_signed.pdf</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mt-0.5">1.2 MB • Cryptographic Hash verified</span>
                  </div>
                </div>
                <button className="text-on-surface-variant hover:text-status-failed transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <section className="bg-surface-container-lowest border border-border-muted rounded-lg shadow-[0px_4px_12px_rgba(0,0,0,0.03)] p-6 sticky top-24">
              <h3 className="text-xl font-semibold mb-6">Settlement Summary</h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant">Subtotal</span>
                  <span className="font-mono text-[13px]">${formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant">Tax Amount</span>
                  <span className="font-mono text-[13px]">${formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant">Platform Fee (0.1%)</span>
                  <span className="font-mono text-[13px]">${formatCurrency(fee)}</span>
                </div>
                
                <hr className="border-border-muted my-2" />
                
                <div className="flex justify-between items-end">
                  <span className="text-base font-semibold">Grand Total</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-on-surface-variant">USD</span>
                    <span className="text-2xl font-bold text-primary font-mono tracking-tight">${formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button onClick={onNext} className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-bold py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2 shadow-sm text-sm">
                  Next: Review & Sign
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="w-full bg-transparent border border-outline-variant hover:bg-surface-subtle text-on-surface font-semibold py-3 px-4 rounded-md transition-colors text-sm">
                  Save as Draft
                </button>
                <button onClick={onBack} className="w-full text-on-surface-variant hover:text-on-surface text-sm font-semibold py-2 mt-2 transition-colors flex justify-center items-center gap-2">
                  <ArrowLeft className="w-[18px] h-[18px]" />
                  Back to Setup
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
