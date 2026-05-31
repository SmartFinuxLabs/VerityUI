/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, X, ExternalLink, ShieldCheck, Copy, Check } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  amount: number | string;
  txHash: string;
  subtitle?: string;
  details?: Record<string, string>;
}

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  title, 
  amount, 
  txHash, 
  subtitle = "Transaction Sent Successfully", 
  details = {} 
}: SuccessModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" id="success-modal-overlay">
      <div 
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden" 
        id="success-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6 pr-10 border-b border-slate-50 flex flex-col items-center justify-center text-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-3 text-emerald-500">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <h3 className="font-semibold text-xl text-slate-900">{title}</h3>
          <p className="text-sm text-emerald-600 mt-1 flex items-center justify-center font-medium">
            <ShieldCheck className="w-4 h-4 mr-1 text-emerald-500" />
            {subtitle}
          </p>
        </div>

        <div className="p-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center mb-6 text-center">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Amount</span>
            <span className="text-2xl font-bold text-slate-800 font-mono mt-1">
              {typeof amount === 'number' ? `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC` : amount}
            </span>
          </div>

          {Object.keys(details).length > 0 && (
            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transaction Context</h4>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                {Object.entries(details).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">{key}</span>
                    <span className="text-slate-800 font-mono font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cryptographic Proof</span>
              <button 
                onClick={handleCopy}
                className="text-[11px] text-brand-primary hover:underline flex items-center space-x-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied Address</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Tx Hash</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-slate-900 text-slate-300 font-mono text-[11px] p-3 rounded-lg flex items-center justify-between border border-slate-800">
              <span className="truncate pr-4">{txHash}</span>
              <a 
                href="https://securerender.com/etherscan/tx" 
                target="_blank" 
                rel="noreferrer" 
                className="text-brand-on-primary-container hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-brand-primary hover:bg-brand-primary-container text-white text-sm font-semibold py-3 rounded-lg cursor-pointer transition-colors"
            >
              Okay, Return to App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
