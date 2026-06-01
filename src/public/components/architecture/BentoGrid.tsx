import React, { useState } from 'react';
import { Percent, Shield, Zap, RefreshCw, CheckCircle, ChevronRight, Landmark } from 'lucide-react';
import { calculateEarlyPayoff } from '../../data';

export const BentoGrid: React.FC = () => {
  const [invoiceAmount, setInvoiceAmount] = useState<number>(250000);
  const [tenureDays, setTenureDays] = useState<number>(45);
  const [creditPremium, setCreditPremium] = useState<number>(0.045);
  const [ratingGrade, setRatingGrade] = useState<string>('AAA');

  const annualRate = creditPremium;
  const earlyPayout = calculateEarlyPayoff(invoiceAmount, annualRate, tenureDays);
  const financingFee = invoiceAmount - earlyPayout;
  const displayRatePercent = (annualRate * 100).toFixed(2);

  const handleRatingChange = (grade: string, rate: number) => {
    setRatingGrade(grade);
    setCreditPremium(rate);
  };

  return (
    <section id="bento-grid" className="py-24 bg-white relative overflow-hidden text-zinc-900 border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-[11px] uppercase tracking-[0.25em] font-extrabold text-zinc-400 block mb-3">PROTOCOL ARCHITECTURE</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light italic tracking-tight text-zinc-950 mb-4">
            Designed for Risk Control. Optimized for Yield.
          </h2>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-zinc-500 leading-relaxed">
            Technical structure of the protocol, from risk controls and settlement rails to funding workflows.
          </p>
          <div className="w-12 h-[1px] bg-zinc-350 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative group overflow-hidden rounded-none border border-zinc-200 bg-white p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-zinc-350 hover:shadow-sm">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-zinc-900" />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="p-1.5 rounded-none bg-zinc-100 text-zinc-950 border border-zinc-200">
                  <Percent className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-extrabold">Rate Simulator</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight mb-2">Interactive Liquidity Calculator</h3>
              <p className="text-xs sm:text-sm text-zinc-500 mb-6">
                Slide parameters to see live factoring payouts. Adjust credit scores to map risk yield pools instantly.
              </p>

              <div className="space-y-6">
                <div className="bg-zinc-50 p-4 rounded-none border border-zinc-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Receivable Face Value</label>
                    <span className="text-sm font-mono font-bold text-zinc-950">
                      ${invoiceAmount.toLocaleString()} USD
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="2000000"
                    step="25000"
                    value={invoiceAmount}
                    onChange={(event) => setInvoiceAmount(Number(event.target.value))}
                    className="w-full h-1 bg-zinc-200 rounded-none appearance-none cursor-pointer accent-zinc-900 focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-400 font-mono mt-1 font-bold">
                    <span>$50k</span>
                    <span>$1M</span>
                    <span>$2M</span>
                  </div>
                </div>

                <div className="bg-zinc-50 p-4 rounded-none border border-zinc-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Days to Payment Maturity</label>
                    <span className="text-sm font-mono font-bold text-zinc-950">
                      {tenureDays} Days
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="1"
                    value={tenureDays}
                    onChange={(event) => setTenureDays(Number(event.target.value))}
                    className="w-full h-1 bg-zinc-200 rounded-none appearance-none cursor-pointer accent-zinc-900 focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-400 font-mono mt-1 font-bold">
                    <span>15 Days</span>
                    <span>60 Days</span>
                    <span>120 Days</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Buyer Credit Rating Grade</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { g: 'AAA', r: 0.042 },
                      { g: 'AA', r: 0.051 },
                      { g: 'A', r: 0.060 },
                      { g: 'BBB', r: 0.075 },
                    ].map((item) => (
                      <button
                        key={item.g}
                        onClick={() => handleRatingChange(item.g, item.r)}
                        className={`py-2 px-3 text-xs font-mono font-bold h-12 rounded-none border transition-all cursor-pointer ${
                          ratingGrade === item.g
                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        {item.g} <span className={`block text-[9px] font-mono leading-none mt-1 ${ratingGrade === item.g ? 'text-zinc-300' : 'text-zinc-400'}`}>{(item.r * 100).toFixed(1)}%</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-3 gap-6 bg-zinc-50 p-5 rounded-none border border-zinc-200 text-zinc-900">
              <div>
                <span className="block text-[9px] uppercase font-mono font-extrabold tracking-widest text-zinc-400 mb-1">Instant Payoff Value</span>
                <span className="text-xl font-mono font-bold text-emerald-650">
                  ${earlyPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="block text-[10px] text-zinc-500 mt-1">Disbursed on-chain instantly</span>
              </div>
              <div className="border-t sm:border-t-0 sm:border-l border-zinc-200 sm:pl-5">
                <span className="block text-[9px] uppercase font-mono font-extrabold tracking-widest text-zinc-400 mb-1">Factoring Fee Deducted</span>
                <span className="text-xl font-mono font-bold text-[#E11D48]">
                  -${financingFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="block text-[10px] text-zinc-500 mt-1">Discount Rate: {displayRatePercent}%</span>
              </div>
              <div className="border-t sm:border-t-0 sm:border-l border-zinc-200 sm:pl-5">
                <span className="block text-[9px] uppercase font-mono font-extrabold tracking-widest text-zinc-400 mb-1">Alternative Recovery</span>
                <span className="text-xl font-mono font-bold text-zinc-800">
                  90+ Bank Days
                </span>
                <span className="block text-[10px] text-zinc-500 mt-1">In legacy clearing networks</span>
              </div>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-none border border-zinc-200 bg-white p-6 flex flex-col justify-between transition-all duration-300 hover:border-zinc-350 hover:shadow-sm">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-zinc-900" />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="p-1.5 rounded-none bg-zinc-100 text-zinc-900 border border-zinc-200">
                  <Zap className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-extrabold">Settlement Rails</span>
              </div>

              <h3 className="text-lg font-bold text-zinc-950 tracking-tight mb-2">Split-Settlement Engine</h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                Avoid single-venue bottlenecks. Settle maturity capital across fiat clearance (Federal Reserve Fedwire / SWIFT) and on-chain stablecoins seamlessly.
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-none border border-zinc-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="font-mono font-bold text-zinc-850">USDC Asset Rail</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">Arbitrum L2 • Instant</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-none border border-zinc-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    <span className="font-mono font-bold text-zinc-850">EURC Asset Rail</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">Base L2 • Instant</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-none border border-zinc-200 text-xs shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                    <span className="font-mono font-bold text-zinc-850">Fedwire / SWIFT</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">RTGS • Same-day</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-100">
              <span className="text-[11px] text-zinc-550 flex items-center gap-1.5 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Auto-routed at maturation
              </span>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-none border border-zinc-200 bg-white p-6 flex flex-col justify-between transition-all duration-300 hover:border-zinc-350 hover:shadow-sm">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-zinc-900" />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="p-1.5 rounded-none bg-zinc-100 text-zinc-950 border border-zinc-200">
                  <Shield className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-extrabold">Fraud Guard</span>
              </div>

              <h3 className="text-lg font-bold text-zinc-950 tracking-tight mb-2">Cryptographic Hash Stamping</h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                Double-factoring represents the #1 risk factor in trade invoice finance. Verity generates high-entropy cryptographic digest tags for all invoices to block replication.
              </p>

              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-none text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-mono font-extrabold text-zinc-400">INCOMING DOCUMENT DIGEST</span>
                  <span className="text-emerald-700 font-mono text-[9px] uppercase font-bold">Unique ✓</span>
                </div>
                <div className="font-mono text-[10px] text-zinc-700 break-all p-2 bg-white rounded-none border border-zinc-200">
                  sha256:1a84f391bde4c5ea23...592c
                </div>
                <div className="flex justify-between items-center text-[9px] text-zinc-500 pt-1 font-bold">
                  <span>Replication checked</span>
                  <span className="text-zinc-900">Verity Ledger Safe</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-100">
              <span className="text-[11px] text-zinc-550 flex items-center gap-1.5 font-medium">
                <Landmark className="w-4 h-4 text-zinc-950" /> Fully compatible with e-Invoice standard
              </span>
            </div>
          </div>

          <div className="lg:col-span-2 relative group overflow-hidden rounded-none border border-zinc-200 bg-white p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-zinc-350 hover:shadow-sm">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-zinc-900" />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="p-1.5 rounded-none bg-zinc-100 text-zinc-950 border border-zinc-200">
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                </span>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-extrabold">P2P Underwriting</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight mb-2">Automated Underwriting & Investor Pools</h3>
              <p className="text-xs sm:text-sm text-zinc-500 mb-6">
                Access risk-segregated factoring yield pools backed by AAA rated buyers. Diversify across dynamic asset pools yielding up to 7.8% IRR.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-55 border border-zinc-200 bg-zinc-50 rounded-none">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-900 uppercase">AAA Tier Capital Desk</span>
                    <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-none">4.2% APY</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-normal mb-3">
                    Financing AAA blue-chip buyer obligations. Zero historic defaults to date.
                  </p>
                  <div className="w-full bg-zinc-200 h-1.5 rounded-none overflow-hidden">
                    <div className="bg-zinc-900 h-full w-[82%]" />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 mt-2 font-bold">
                    <span>Pool: $10M USDC</span>
                    <span>82% Committed</span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-55 border border-zinc-200 bg-zinc-50 rounded-none">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-900 uppercase">Dynamic SME Liquidity Desk</span>
                    <span className="text-xs font-mono font-bold bg-zinc-900 text-white px-1.5 py-0.5 rounded-none">7.5% APY</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-normal mb-3">
                    Broad yield diversification across mid-tier verified global suppliers.
                  </p>
                  <div className="w-full bg-zinc-200 h-1.5 rounded-none overflow-hidden">
                    <div className="bg-zinc-900 h-full w-[54%]" />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 mt-2 font-bold">
                    <span>Pool: $5M USDC</span>
                    <span>54% Committed</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <a href="#sandbox-portal" className="text-xs font-bold text-zinc-900 hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors uppercase tracking-wider">
                Browse Sandbox Portfolios <ChevronRight className="w-4 h-4 ml-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
