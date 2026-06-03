import { Check, Lock, Info, Receipt } from 'lucide-react';
import { motion } from 'motion/react';

export function Step4Confirmation({ onReturnToQueue }: { onReturnToQueue: () => void }) {
  const serialNumber = `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <main className="flex-1 flex flex-col items-center justify-center py-12 md:py-16 px-4 md:px-10 pb-24 md:pb-16 relative">
        <div className="max-w-[640px] w-full flex flex-col items-center z-10">
          
          {/* Success Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="mb-6"
            >
              <div className="w-20 h-20 bg-status-settled/10 text-status-settled rounded-full flex items-center justify-center ring-4 ring-status-settled/5 relative overflow-hidden">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Check strokeWidth={3} className="w-10 h-10" />
                </motion.div>
              </div>
            </motion.div>
            <motion.h1 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-[32px] font-bold text-on-surface mb-2 tracking-tight"
            >
              Invoice Submitted Successfully
            </motion.h1>
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-on-surface-variant text-base"
            >
              Your invoice is now being processed for institutional review.
            </motion.p>
          </div>

          {/* Submission Summary */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 30 }}
            className="w-full bg-surface-container-lowest border border-border-muted rounded-xl p-6 md:p-8 shadow-sm mb-6"
          >
            <div className="flex items-center justify-between mb-8 border-b border-surface-subtle pb-4">
              <span className="text-xs font-bold tracking-[0.05em] text-outline uppercase">Submission Summary</span>
              <div className="bg-primary/5 text-primary px-3 py-1 rounded-full flex items-center gap-1.5 border border-primary/10">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider">Submitted</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Invoice Serial Number</span>
                <span className="font-mono text-sm tracking-tight text-on-surface font-medium">#{serialNumber}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Submission Date</span>
                <span className="text-sm text-on-surface">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Recipient</span>
                <span className="text-sm text-on-surface font-semibold">Acme Global Manufacturing</span>
              </div>
              <div className="flex flex-col gap-1.5 items-start">
                <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Status</span>
                <span className="font-mono text-[11px] text-status-pending bg-status-pending/10 px-2 py-0.5 rounded border border-status-pending/20">
                  PENDING_SUPPLIER_REVIEW
                </span>
              </div>
              <div className="md:col-span-2 mt-4 pt-6 border-t border-surface-subtle flex items-end justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant text-outline">Total Amount</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-primary tracking-tight">$12,500.00</span>
                    <span className="text-sm font-medium text-primary/80">USDC</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-on-surface-variant opacity-80">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold tracking-[0.1em] uppercase">Secured by Verity</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 30 }}
            className="w-full bg-surface-container-low/50 border border-border-muted/50 rounded-xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-on-surface mb-5 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              What happens next?
            </h3>
            <div className="space-y-5">
              {[
                { title: "Buyer Review", description: "Acme Global Manufacturing will receive a notification to review the invoice details, line items, and terms." },
                { title: "Acceptance", description: <>Once accepted, the invoice status will move to <span className="font-mono text-[10px] bg-surface-container px-1 py-0.5 rounded text-on-surface-variant border border-border-muted/50">ACCEPTED_FOR_PAYMENT</span>.</> },
                { title: "Liquidity Option", description: "You will then be eligible to factor this invoice for immediate settlement or wait for the standard maturity date." }
              ].map((step, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    index === 0 ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-container-highest text-outline border border-border-muted'
                  }`}>
                    {index + 1}
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed pt-0.5">
                    <span className="text-on-surface font-semibold mr-1">{step.title}:</span> 
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 300, damping: 30 }}
            className="w-full flex flex-col md:flex-row gap-4 items-center justify-center"
          >
            <button 
              onClick={onReturnToQueue}
              className="w-full md:w-auto min-w-[220px] bg-primary text-on-primary hover:bg-primary-container transition-all py-3.5 px-8 rounded-lg font-semibold text-[15px] active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              Return to Invoice Queue
            </button>
            
            <button className="w-full md:w-auto min-w-[220px] bg-surface-container-lowest border border-border-muted text-on-surface hover:bg-surface-subtle transition-all py-3.5 px-8 rounded-lg font-semibold text-[15px] active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 cursor-pointer">
              <Receipt className="w-4 h-4 text-on-surface-variant" />
              Download Receipt
            </button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-10 text-center"
          >
            <p className="text-sm text-on-surface-variant">
              Need help? <a className="text-primary font-semibold hover:underline" href="#">Contact Verity Institutional Support</a>
            </p>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
