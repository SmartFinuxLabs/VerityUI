import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
}

export function StepperSimple({ currentStep }: StepperProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <div className={`flex-1 text-center text-xs font-bold uppercase tracking-wider ${currentStep >= 1 ? 'text-primary' : 'text-on-surface-variant'}`}>
          1. Select Customer
        </div>
        <div className={`flex-1 text-center text-xs font-bold uppercase tracking-wider ${currentStep >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>
          2. Add Items
        </div>
        <div className={`flex-1 text-center text-xs font-bold uppercase tracking-wider ${currentStep >= 3 ? 'text-primary' : 'text-on-surface-variant'}`}>
          3. Review & Submit
        </div>
      </div>
      <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden flex">
        <div className="bg-primary h-full transition-all duration-300" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
        <div className="bg-transparent flex-1 h-full border-l border-surface"></div>
      </div>
    </div>
  );
}

export function StepperCircles({ currentStep }: StepperProps) {
  return (
    <div className="w-full max-w-3xl mx-auto flex items-center justify-between mb-8">
      {/* Step 1 */}
      <div className="flex flex-col items-center flex-1">
        <div className="w-full flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${currentStep > 1 ? 'bg-status-settled text-on-primary' : 'bg-primary text-on-primary border-4 border-primary-fixed'}`}>
            {currentStep > 1 ? <Check className="w-4 h-4" strokeWidth={3} /> : <span className="font-mono font-medium text-sm">1</span>}
          </div>
          <div className={`h-1 flex-1 mx-2 ${currentStep > 1 ? 'bg-status-settled' : 'bg-surface-variant'}`}></div>
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider mt-2 w-full text-center pr-8 ${currentStep === 1 ? 'text-primary' : 'text-on-surface'}`}>
          1. Setup
        </span>
      </div>

      {/* Step 2 */}
      <div className="flex flex-col items-center flex-1">
        <div className="w-full flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${currentStep > 2 ? 'bg-status-settled text-on-primary' : currentStep === 2 ? 'bg-primary text-on-primary border-4 border-primary-fixed' : 'bg-surface-variant text-on-surface-variant'}`}>
             {currentStep > 2 ? <Check className="w-4 h-4" strokeWidth={3} /> : <span className="font-mono font-medium text-sm">2</span>}
          </div>
          <div className={`h-1 flex-1 mx-2 ${currentStep > 2 ? 'bg-status-settled' : 'bg-surface-variant'}`}></div>
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider mt-2 w-full text-center pr-8 ${currentStep === 2 ? 'text-primary' : currentStep > 2 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
          2. Line Items
        </span>
      </div>

      {/* Step 3 */}
      <div className="flex flex-col items-center flex-1">
        <div className="w-full flex items-center justify-end">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${currentStep === 3 ? 'bg-primary text-on-primary border-4 border-primary-fixed' : 'bg-surface-variant text-on-surface-variant'}`}>
            <span className="font-mono font-medium text-sm">3</span>
          </div>
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider mt-2 w-full text-right ${currentStep === 3 ? 'text-primary' : 'text-on-surface-variant'}`}>
          3. Review
        </span>
      </div>
    </div>
  );
}

export function StepperMini({ currentStep }: { currentStep: number }) {
  return (
    <div className="hidden md:flex items-center gap-2">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold ${currentStep > 1 ? 'border-primary text-primary' : 'border-outline-variant'}`}>
          {currentStep > 1 ? <Check className="w-3 h-3" strokeWidth={3} /> : '1'}
        </span>
        <span className="text-sm font-medium">Details</span>
      </div>
      <div className="w-8 h-px bg-outline-variant mx-2"></div>
      
      <div className="flex items-center gap-2 text-on-surface-variant">
         <span className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold ${currentStep > 2 ? 'border-primary text-primary' : currentStep === 2 ? 'bg-primary-fixed border-primary-fixed text-on-primary-fixed' : 'border-outline-variant'}`}>
          {currentStep > 2 ? <Check className="w-3 h-3" strokeWidth={3} /> : '2'}
        </span>
        <span className={`text-sm ${currentStep === 2 ? 'font-semibold text-primary' : 'font-medium'}`}>Line Items</span>
      </div>
      <div className="w-8 h-px bg-outline-variant mx-2"></div>
      
      <div className="flex items-center gap-2">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === 3 ? 'bg-primary-fixed text-on-primary-fixed' : 'border border-outline-variant text-on-surface-variant'}`}>
          3
        </span>
        <span className={`text-sm ${currentStep === 3 ? 'font-semibold text-primary' : 'font-medium text-on-surface-variant'}`}>Preview & Submit</span>
      </div>
    </div>
  );
}
