import React, { useState } from 'react';
import { INITIAL_INVOICES } from './data';
import { Invoice, MainRoute, InvoiceStatus } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import CreateInvoiceModal from './components/CreateInvoiceModal';
import FactoringView from './components/FactoringView';
import DisputeView from './components/DisputeView';
import SettlementView from './components/SettlementView';

interface SupplierWorkspaceProps {
  initialRoute?: MainRoute;
  accessLabel?: string;
  accessRole?: string;
  workspacePerspective?: 'Supplier' | 'Investor';
  onResetAccess?: () => void;
}

export default function SupplierWorkspace({
  initialRoute = 'dashboard',
  accessLabel,
  accessRole,
  workspacePerspective = 'Supplier',
  onResetAccess,
}: SupplierWorkspaceProps) {
  const [currentRoute, setCurrentRoute] = useState<MainRoute>(initialRoute);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [availableLiquidity, setAvailableLiquidity] = useState<number>(215500);
  const [escrowValue, setEscrowValue] = useState<number>(145000);
  const [onChainCredit, setOnChainCredit] = useState<number>(820);
  const [walletConnected, setWalletConnected] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string | null>('0x71C8384f9E58A49dfF0bd083B20B2F5b48B64F9E');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [preselectedInvoiceId, setPreselectedInvoiceId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  const handleToggleWallet = () => {
    if (walletConnected) {
      setWalletConnected(false);
      setWalletAddress(null);
    } else {
      setWalletConnected(true);
      setWalletAddress('0x71C8384f9E58A49dfF0bd083B20B2F5b48B64F9E');
    }
  };

  const handleAddInvoice = (newInvoice: Omit<Invoice, 'status'>) => {
    const fullInvoice: Invoice = {
      ...newInvoice,
      status: 'ACCEPTED',
      lifecycleTimeline: {
        registered:
          new Date().toLocaleDateString() +
          ' • ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        approved:
          new Date().toLocaleDateString() +
          ' • ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    };

    setInvoices([fullInvoice, ...invoices]);
  };

  const handleSubmitFactoringBatch = (invoiceIds: string[], totalAdvance: number) => {
    const focusInvoiceId = invoiceIds[0] ?? null;

    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) => {
        if (invoiceIds.includes(inv.id)) {
          return {
            ...inv,
            status: 'FACTORED' as InvoiceStatus,
          };
        }

        return inv;
      })
    );

    setEscrowValue((prev) => prev + totalAdvance);
    setAvailableLiquidity((prev) => prev + totalAdvance);
    setOnChainCredit((prev) => Math.min(850, prev + 15));
    setPreselectedInvoiceId(focusInvoiceId);
  };

  const handleResolveDispute = (
    invoiceId: string,
    params: {
      status: 'ACCEPTED' | 'PENDING';
      amount?: number;
      qty?: number;
      rebuttalCounterReason?: string;
      rebuttalDetail?: string;
    }
  ) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: params.status,
            amount: params.amount !== undefined ? params.amount : inv.amount,
            revisedQty: params.qty,
            rebuttalCounterReason: params.rebuttalCounterReason,
            rebuttalDetail: params.rebuttalDetail,
          };
        }

        return inv;
      })
    );

    if (params.status === 'ACCEPTED') {
      setOnChainCredit((prev) => Math.min(850, prev + 10));
    }
  };

  const handleExecuteSettlement = (invoiceId: string, releasedRetention: number) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: 'SETTLED' as InvoiceStatus,
            lifecycleTimeline: {
              ...inv.lifecycleTimeline,
              matured: new Date().toLocaleDateString(),
              settled:
                new Date().toLocaleDateString() +
                ' • ' +
                new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          };
        }

        return inv;
      })
    );

    setAvailableLiquidity((prev) => prev + releasedRetention);
    setEscrowValue((prev) => Math.max(0, prev - 50000));
    setOnChainCredit((prev) => Math.min(850, prev + 25));
  };

  const handleFocusInvoiceForFactoring = (invoiceId: string) => {
    setPreselectedInvoiceId(invoiceId);
    setCurrentRoute('factoring');
  };

  const handleFocusInvoiceForDispute = (invoiceId: string) => {
    setPreselectedInvoiceId(invoiceId);
    setCurrentRoute('disputes');
  };

  const handleFocusInvoiceForSettlement = (invoiceId: string) => {
    setPreselectedInvoiceId(invoiceId);
    setCurrentRoute('settlement');
  };

  const getDisputeInvoice = () => {
    const matched = invoices.find((inv) => inv.id === preselectedInvoiceId || inv.status === 'DISPUTED');
    return matched || invoices.find((inv) => inv.id === 'INV-2026-089') || invoices[4];
  };

  const getSettlementInvoice = () => {
    const matched = invoices.find((inv) => inv.id === preselectedInvoiceId || inv.status === 'FACTORED');
    return matched || invoices.find((inv) => inv.id === 'INV-2026-089') || invoices[4];
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        currentRoute={currentRoute}
        setCurrentRoute={(route) => {
          setPreselectedInvoiceId(null);
          setCurrentRoute(route);
        }}
        onOpenUploadModal={() => setShowUploadModal(true)}
        walletConnected={walletConnected}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#F8F9FA]">
        <Header
          currentRoute={currentRoute}
          setCurrentRoute={setCurrentRoute}
          workspacePerspective={workspacePerspective}
          walletConnected={walletConnected}
          onToggleWallet={handleToggleWallet}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          accessLabel={accessLabel}
          accessRole={accessRole}
          onResetAccess={onResetAccess}
        />

        {currentRoute === 'dashboard' && (
          <DashboardView
            workspacePerspective={workspacePerspective}
            invoices={invoices}
            availableLiquidity={availableLiquidity}
            onModifyLiquidity={(amount) => setAvailableLiquidity((prev) => Math.max(0, prev + amount))}
            escrowValue={escrowValue}
            onChainCredit={onChainCredit}
            onSelectRoute={setCurrentRoute}
            onOpenUploadModal={() => setShowUploadModal(true)}
            searchQuery={searchQuery}
            onFocusInvoiceForFactoring={handleFocusInvoiceForFactoring}
            onFocusInvoiceForDispute={handleFocusInvoiceForDispute}
            onFocusInvoiceForSettlement={handleFocusInvoiceForSettlement}
          />
        )}

        {currentRoute === 'factoring' && (
          <FactoringView
            invoices={invoices}
            onSelectRoute={setCurrentRoute}
            onSubmitFactoringBatch={handleSubmitFactoringBatch}
            preselectedInvoiceId={preselectedInvoiceId}
          />
        )}

        {currentRoute === 'disputes' && (
          <DisputeView
            invoice={getDisputeInvoice()}
            onSelectRoute={setCurrentRoute}
            onResolveDispute={handleResolveDispute}
          />
        )}

        {currentRoute === 'settlement' && (
          <SettlementView
            invoice={getSettlementInvoice()}
            onSelectRoute={setCurrentRoute}
            onExecuteSettlement={handleExecuteSettlement}
          />
        )}
      </div>

      {showUploadModal && (
        <CreateInvoiceModal onClose={() => setShowUploadModal(false)} onSubmitInvoice={handleAddInvoice} />
      )}
    </div>
  );
}
