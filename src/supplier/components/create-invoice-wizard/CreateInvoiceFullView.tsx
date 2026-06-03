import React, { useState } from 'react';
import { Step1Setup } from './views/Step1Setup';
import { Step2LineItems, INITIAL_ITEMS } from './views/Step2LineItems';
import { Step3Preview } from './views/Step3Preview';
import { Step4Confirmation } from './views/Step4Confirmation';
import { MainRoute, RegisteredBuyerOption } from '../../types';
import { LineItem } from './types';

interface CreateInvoiceFullViewProps {
  onSelectRoute: (route: MainRoute) => void;
  onSubmitFullInvoice: (invoiceData: any) => void;
  buyerOptions: RegisteredBuyerOption[];
}

export default function CreateInvoiceFullView({ onSelectRoute, onSubmitFullInvoice, buyerOptions }: CreateInvoiceFullViewProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [items, setItems] = useState<LineItem[]>(INITIAL_ITEMS);

  const handleFinish = () => {
    const selectedBuyer = buyerOptions.find(b => b.buyerId === selectedBuyerId);
    onSubmitFullInvoice({
      customer: {
        id: selectedBuyerId,
        name: selectedBuyer?.buyerName || 'Unknown Buyer'
      },
      items: items
    });
    setCurrentStep(4);
  };

  return (
    <div className="w-full min-h-screen bg-surface">
      {currentStep === 1 && (
        <Step1Setup 
          onNext={() => setCurrentStep(2)} 
          buyerOptions={buyerOptions} 
          selectedBuyerId={selectedBuyerId}
          onChangeBuyerId={setSelectedBuyerId}
        />
      )}
      {currentStep === 2 && (
        <Step2LineItems 
          onNext={() => setCurrentStep(3)} 
          onBack={() => setCurrentStep(1)} 
          items={items}
          setItems={setItems}
        />
      )}
      {currentStep === 3 && (
        <Step3Preview 
          onBack={() => setCurrentStep(2)} 
          onSubmit={handleFinish}
        />
      )}
      {currentStep === 4 && (
        <Step4Confirmation 
          onReturnToQueue={() => onSelectRoute('invoice-queue')}
        />
      )}
    </div>
  );
}
