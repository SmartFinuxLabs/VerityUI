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

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

function generateInvoiceNumber() {
  return `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function CreateInvoiceFullView({ onSelectRoute, onSubmitFullInvoice, buyerOptions }: CreateInvoiceFullViewProps) {
  const today = new Date();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber);
  const [issueDate, setIssueDate] = useState(formatDateInput(today));
  const [dueDate, setDueDate] = useState(formatDateInput(addMonths(today, 2)));
  const [items, setItems] = useState<LineItem[]>(INITIAL_ITEMS);

  const handleFinish = () => {
    const selectedBuyer = buyerOptions.find(b => b.buyerId === selectedBuyerId);
    onSubmitFullInvoice({
      invoiceNumber: invoiceNumber.trim(),
      issueDate,
      dueDate,
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
          invoiceNumber={invoiceNumber}
          issueDate={issueDate}
          dueDate={dueDate}
          onChangeInvoiceNumber={setInvoiceNumber}
          onChangeIssueDate={setIssueDate}
          onChangeDueDate={setDueDate}
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
          invoiceDetails={{
            invoiceNumber,
            issueDate,
            dueDate,
            buyerName: buyerOptions.find(b => b.buyerId === selectedBuyerId)?.buyerName,
            items,
          }}
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
