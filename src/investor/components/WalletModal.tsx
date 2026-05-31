/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Sparkles, X, Wallet, Check } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string, network: 'ethereum' | 'arc') => void;
}

export default function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const handleWalletSelect = (walletName: string) => {
    setSelectedWallet(walletName);
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      // Generate random-looking address
      const randomAddr = '0x' + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('').substring(0, 4) + '...' + Array.from({ length: 4 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      onConnect(randomAddr, walletName === 'Arc Vault' ? 'arc' : 'ethereum');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" id="wallet-modal-overlay">
      <div 
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        id="wallet-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-brand-primary" />
            <h3 className="font-semibold text-lg text-slate-900">Connect Web3 Wallet</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-500 mb-5">
            Connect your institutional wallet to sign and settle high-yield invoices on the verifiably secure Smart Finux prime networks.
          </p>

          {isConnecting ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-700">Connecting to {selectedWallet}...</p>
              <p className="text-xs text-slate-400">Please sign the authorization request in your wallet extension</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { name: 'MetaMask', desc: 'Secure connection via browser extension', badge: 'Popular' },
                { name: 'Arc Vault', desc: 'Native ultra low latency prime node wallet', badge: 'Recommended' },
                { name: 'Coinbase Wallet', desc: 'Frictionless enterprise wallet', badge: '' },
                { name: 'Ledger Prime', desc: 'Cold storage hardware security node', badge: 'High Sec' }
              ].map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleWalletSelect(wallet.name)}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-brand-primary/40 hover:bg-brand-primary/5 cursor-pointer transition-all duration-150 flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-white border border-slate-100 group-hover:border-brand-primary/20 transition-all text-brand-primary font-semibold">
                      {wallet.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 flex items-center space-x-1.5">
                        <span>{wallet.name}</span>
                        {wallet.badge && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium tracking-tight ${
                            wallet.badge === 'Recommended' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {wallet.badge}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{wallet.desc}</p>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>AES-256 MPC Encrypted Node</span>
            </span>
            <span className="font-mono text-slate-300">v2.4.9-Stable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
