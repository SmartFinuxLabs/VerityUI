import React, { useEffect, useRef, useState } from 'react';
import { Invoice, MainRoute, InvoiceStatus, RegisteredBuyerOption } from './types';
import { getParticipantAccessSnapshot } from '../lib/participantAuth';
import {
  getSupplierAnalyticsInitialState,
  getSupplierWorkspaceInitialState,
  isDemoWorkspaceDataMode,
  loadSupplierAnalytics,
  loadSupplierWorkspaceState,
  type SupplierAnalyticsState,
} from '../lib/workspaceData';
import { verityApi } from '../lib/apiClient';
import { INITIAL_INVOICES } from './data';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import CreateInvoiceModal from './components/CreateInvoiceModal';
import FactoringView from './components/FactoringView';
import InvoiceQueueView from './components/InvoiceQueueView';
import DisputeView from './components/DisputeView';
import SettlementView from './components/SettlementView';
import OverallDisputesView from './components/OverallDisputesView';
import CreateInvoiceFullView from './components/create-invoice-wizard/CreateInvoiceFullView';
import ReadOnlyInvoiceDetails from './components/ReadOnlyInvoiceDetails';

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
  const initialWorkspaceState = getSupplierWorkspaceInitialState();
  const initialAnalyticsState = getSupplierAnalyticsInitialState();
  const [currentRoute, setCurrentRoute] = useState<MainRoute>(initialRoute);
  const [supplierOrganizationId, setSupplierOrganizationId] = useState<string | null>(
    initialWorkspaceState.supplierOrganizationId
  );
  const supplierOrganizationIdRef = useRef<string | null>(initialWorkspaceState.supplierOrganizationId);
  const [invoices, setInvoices] = useState<Invoice[]>(initialWorkspaceState.invoices);
  const [registeredBuyers, setRegisteredBuyers] = useState<RegisteredBuyerOption[]>(initialWorkspaceState.registeredBuyers);
  const [availableLiquidity, setAvailableLiquidity] = useState<number>(initialWorkspaceState.availableLiquidity);
  const [escrowValue, setEscrowValue] = useState<number>(initialWorkspaceState.escrowValue);
  const [onChainCredit, setOnChainCredit] = useState<number>(initialWorkspaceState.onChainCredit);
  const [walletConnected, setWalletConnected] = useState<boolean>(initialWorkspaceState.walletConnected);
  const [walletAddress, setWalletAddress] = useState<string | null>(initialWorkspaceState.walletAddress);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [preselectedInvoiceId, setPreselectedInvoiceId] = useState<string | null>(null);
  const [readOnlyInvoiceId, setReadOnlyInvoiceId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [workspaceDataStatus, setWorkspaceDataStatus] = useState<'loading' | 'ready' | 'error'>(
    isDemoWorkspaceDataMode() ? 'ready' : 'loading'
  );
  const [workspaceDataError, setWorkspaceDataError] = useState('');
  const [analytics, setAnalytics] = useState<SupplierAnalyticsState>(initialAnalyticsState);
  const [analyticsStatus, setAnalyticsStatus] = useState<'loading' | 'ready' | 'error'>(
    isDemoWorkspaceDataMode() ? 'ready' : 'loading'
  );

  const handleRouteChange = async (route: MainRoute) => {
    if (route === 'invoice-queue' || route === 'dashboard') {
      await refreshSupplierWorkspace();
    }
    setCurrentRoute(route);
    setPreselectedInvoiceId(null); // Clear focus when navigating from sidebar/header
    setReadOnlyInvoiceId(null);
  };

  useEffect(() => {
    let isMounted = true;

    Promise.all([loadSupplierWorkspaceState(), loadSupplierAnalytics()])
      .then(([state, analyticsState]) => {
        if (!isMounted) return;
        supplierOrganizationIdRef.current = state.supplierOrganizationId;
        setSupplierOrganizationId(state.supplierOrganizationId);
        setInvoices(state.invoices);
        setRegisteredBuyers(state.registeredBuyers);
        setAvailableLiquidity(state.availableLiquidity);
        setEscrowValue(state.escrowValue);
        setOnChainCredit(state.onChainCredit);
        setWalletConnected(state.walletConnected);
        setWalletAddress(state.walletAddress);
        setAnalytics(analyticsState);
        setWorkspaceDataStatus('ready');
        setAnalyticsStatus('ready');
        setWorkspaceDataError('');
      })
      .catch((error) => {
        if (!isMounted) return;
        setWorkspaceDataStatus('error');
        setAnalyticsStatus('error');
        setWorkspaceDataError(error instanceof Error ? error.message : 'Unable to load supplier workspace data from VerityAPI.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleWallet = () => {
    if (walletConnected) {
      setWalletConnected(false);
      setWalletAddress(null);
    } else {
      setWalletConnected(true);
      setWalletAddress('0x71C8384f9E58A49dfF0bd083B20B2F5b48B64F9E');
    }
  };

  const refreshSupplierWorkspace = async () => {
    const [refreshedState, refreshedAnalytics] = await Promise.all([
      loadSupplierWorkspaceState(),
      loadSupplierAnalytics(),
    ]);
    supplierOrganizationIdRef.current = refreshedState.supplierOrganizationId;
    setSupplierOrganizationId(refreshedState.supplierOrganizationId);
    setInvoices(refreshedState.invoices);
    setRegisteredBuyers(refreshedState.registeredBuyers);
    setAvailableLiquidity(refreshedState.availableLiquidity);
    setEscrowValue(refreshedState.escrowValue);
    setOnChainCredit(refreshedState.onChainCredit);
    setWalletConnected(refreshedState.walletConnected);
    setWalletAddress(refreshedState.walletAddress);
    setAnalytics(refreshedAnalytics);
    setAnalyticsStatus('ready');
  };

  const toApiDate = (value: string, fallback: Date) => {
    const timestamp = Date.parse(value);
    const date = Number.isNaN(timestamp) ? fallback : new Date(timestamp);
    return date.toISOString().slice(0, 10);
  };

  const handleAddInvoice = async (newInvoice: Omit<Invoice, 'status'>) => {
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

    if (!isDemoWorkspaceDataMode()) {
      const snapshot = getParticipantAccessSnapshot();

      if (snapshot?.provider !== 'api' || !snapshot.accessToken) {
        throw new Error('API supplier invoice creation requires a signed-in VerityAPI session.');
      }

      const activeSupplierOrganizationId = supplierOrganizationIdRef.current ?? supplierOrganizationId;

      if (!activeSupplierOrganizationId) {
        throw new Error('Register a supplier organization before submitting an MVP invoice.');
      }

      if (!newInvoice.buyerId) {
        throw new Error('Select a registered buyer before submitting an MVP invoice.');
      }

      const now = new Date();
      const invoiceNumber = newInvoice.invoiceNumber ?? newInvoice.id;
      const issueDate = toApiDate(newInvoice.issueDate ?? '', now);
      const dueDate = toApiDate(newInvoice.dueDate ?? newInvoice.maturityDate, new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
      const supplierDisplayName = snapshot.entityName?.trim();

      await verityApi.createInvoice(snapshot.accessToken, {
        supplierId: activeSupplierOrganizationId,
        buyerId: newInvoice.buyerId,
        invoiceNumber,
        issueDate,
        dueDate,
        currency: 'USDC',
        grossAmount: newInvoice.amount,
        acceptedAmount: newInvoice.amount,
        sourceSystemReference: `VERITYUI-${invoiceNumber}`,
        metadata: {
          buyerName: newInvoice.buyer,
          supplierId: activeSupplierOrganizationId,
          ...(supplierDisplayName ? { supplierName: supplierDisplayName } : {}),
          itemDescription: newInvoice.itemDescription,
          originalQty: newInvoice.originalQty,
          unitPrice: newInvoice.unitPrice,
          poNumber: newInvoice.poNumber ?? `PO-${invoiceNumber}`,
          goodsReceiptNumber: newInvoice.goodsReceiptNumber ?? `GR-${invoiceNumber}`,
          walletAddress,
          lineItems: newInvoice.lineItems ? newInvoice.lineItems.map(item => ({
            description: item.description,
            qty: item.quantity || item.qty,
            unitPrice: item.price || item.unitPrice,
            total: (item.quantity || item.qty) * (item.price || item.unitPrice),
            taxPercent: item.taxPercent
          })) : [
            {
              description: newInvoice.itemDescription ?? `Invoice ${newInvoice.id}`,
              qty: newInvoice.originalQty ?? 1,
              unitPrice: newInvoice.unitPrice ?? newInvoice.amount,
              total: newInvoice.amount,
            },
          ],
        },
      });
      await refreshSupplierWorkspace();
      return;
    }

    setInvoices((prevInvoices) => [fullInvoice, ...prevInvoices]);
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

  const handleResolveDispute = async (
    invoiceId: string,
    params: {
      status: 'ACCEPTED' | 'PENDING';
      amount?: number;
      qty?: number;
      rebuttalCounterReason?: string;
      rebuttalDetail?: string;
    }
  ) => {
    if (!isDemoWorkspaceDataMode()) {
      try {
        const snapshot = getParticipantAccessSnapshot();
        if (snapshot?.provider === 'api' && snapshot.accessToken) {
          const decisionState = params.status === 'ACCEPTED' ? 'ACCEPTED' : 'HELD';
          await verityApi.createInvoiceResolution(snapshot.accessToken, invoiceId, {
            decisionState: decisionState,
            decisionReason: params.rebuttalDetail ?? params.rebuttalCounterReason ?? 'Rebuttal filed',
            reasonCode: params.rebuttalCounterReason ?? 'REBUTTAL',
            acceptedAmount: params.amount ?? 0
          });
        }
      } catch (err) {
        console.error('Failed to persist rebuttal to database:', err);
      }
    }

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

  const getReadOnlyInvoice = () => invoices.find((invoice) => invoice.id === readOnlyInvoiceId) ?? null;

  const getDisputeInvoice = () => {
    const matched = invoices.find((inv) => inv.id === preselectedInvoiceId || inv.status === 'DISPUTED');
    return matched || invoices.find((inv) => inv.invoiceNumber === 'INV-2026-089') || invoices[4] || INITIAL_INVOICES.find(inv => inv.status === 'DISPUTED');
  };

  const getSettlementInvoice = () => {
    const matched = invoices.find((inv) => inv.id === preselectedInvoiceId || inv.status === 'FACTORED');
    return matched || invoices.find((inv) => inv.invoiceNumber === 'INV-2026-089') || invoices[4] || INITIAL_INVOICES.find(inv => inv.status === 'FACTORED');
  };

  const EmptyActionState = ({
    title,
    body,
    actionLabel,
  }: {
    title: string;
    body: string;
    actionLabel: string;
  }) => (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
      <div className="bg-white border border-slate-200 rounded-[12px] p-8 shadow-3xs">
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Supplier Workspace</p>
        <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">{body}</p>
        <button
          type="button"
          onClick={() => setCurrentRoute('dashboard')}
          className="mt-5 px-4 py-2 bg-[#0052CC] text-white text-xs font-bold uppercase tracking-widest rounded-[6px]"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );

  if (workspaceDataStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-slate-700">
        <div className="bg-white border border-slate-200 rounded-[8px] px-6 py-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">VerityAPI</p>
          <p className="text-sm font-bold">Loading supplier workspace data...</p>
        </div>
      </div>
    );
  }

  if (workspaceDataStatus === 'error') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-slate-700">
        <div className="bg-white border border-rose-200 rounded-[8px] px-6 py-5 shadow-sm max-w-md">
          <p className="text-xs uppercase tracking-widest font-bold text-rose-500 mb-2">VerityAPI data unavailable</p>
          <p className="text-sm leading-relaxed">{workspaceDataError}</p>
          {onResetAccess && (
            <button
              type="button"
              onClick={onResetAccess}
              className="mt-4 px-3 py-2 text-[10px] uppercase tracking-widest font-bold bg-slate-900 text-white"
            >
              Reset Access
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        currentRoute={currentRoute}
        setCurrentRoute={handleRouteChange}
        onOpenUploadModal={() => setShowUploadModal(true)}
        walletConnected={walletConnected}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#F8F9FA]">
        <Header
          currentRoute={currentRoute}
          setCurrentRoute={handleRouteChange}
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
            onSelectRoute={handleRouteChange}
            onOpenUploadModal={() => setShowUploadModal(true)}
            searchQuery={searchQuery}
            onFocusInvoiceForFactoring={handleFocusInvoiceForFactoring}
            onFocusInvoiceForDispute={handleFocusInvoiceForDispute}
            onFocusInvoiceForSettlement={handleFocusInvoiceForSettlement}
            analytics={analytics}
            analyticsStatus={analyticsStatus}
          />
        )}

        {currentRoute === 'invoice-queue' && (
          <InvoiceQueueView
            invoices={invoices}
            searchQuery={searchQuery}
            onOpenUploadModal={() => setShowUploadModal(true)}
            onSelectRoute={handleRouteChange}
            onFocusInvoiceForFactoring={handleFocusInvoiceForFactoring}
            onFocusInvoiceForDispute={handleFocusInvoiceForDispute}
            onFocusInvoiceForSettlement={handleFocusInvoiceForSettlement}
            onOpenReadOnlyInvoiceDetails={setReadOnlyInvoiceId}
          />
        )}

        {currentRoute === 'factoring' && (
          <FactoringView
            invoices={invoices}
            onSelectRoute={handleRouteChange}
            onSubmitFactoringBatch={handleSubmitFactoringBatch}
            preselectedInvoiceId={preselectedInvoiceId}
          />
        )}

        {currentRoute === 'disputes' && (
          preselectedInvoiceId ? (
            getDisputeInvoice() ? (
              <DisputeView
                invoice={getDisputeInvoice() as any}
                onSelectRoute={handleRouteChange}
                onResolveDispute={handleResolveDispute}
              />
            ) : (
              <EmptyActionState
                title="No buyer disputes require action"
                body="There are no disputed invoices available for this supplier workspace. New buyer disputes will appear here when invoice verification is contested."
                actionLabel="Back to dashboard"
              />
            )
          ) : (
            <OverallDisputesView
              invoices={invoices}
              onSelectRoute={handleRouteChange}
              onFocusInvoiceForDispute={handleFocusInvoiceForDispute}
            />
          )
        )}

        {currentRoute === 'settlement' && (
          getSettlementInvoice() ? (
            <SettlementView
              invoice={getSettlementInvoice() as any}
              onSelectRoute={handleRouteChange}
              onExecuteSettlement={handleExecuteSettlement}
            />
          ) : (
            <EmptyActionState
              title="No invoices ready for settlement"
              body="There are no factored or settlement-ready invoices in this supplier workspace. Accepted invoices can be submitted for factoring before settlement is available."
              actionLabel="Back to dashboard"
            />
          )
        )}

        {currentRoute === 'create-invoice' && (
          <CreateInvoiceFullView
            onSelectRoute={handleRouteChange}
            buyerOptions={registeredBuyers}
            onSubmitFullInvoice={(data) => {
              const totalAmount = data?.items?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 50000;
              const firstItemDesc = data?.items?.[0]?.description || 'Multiple Items';
              const now = new Date();
              const fallbackInvoiceNumber = `INV-${now.getFullYear()}-${Math.floor(Math.random() * 1000)}`;
              const invoiceNumber = data?.invoiceNumber || fallbackInvoiceNumber;
              const dueDate = data?.dueDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
              handleAddInvoice({
                id: `supplier-invoice-${now.getTime()}`,
                invoiceNumber,
                buyerId: data?.customer?.id || 'GLOBAL_CORP',
                buyer: data?.customer?.name || 'Global Corp',
                amount: totalAmount,
                itemDescription: firstItemDesc,
                issueDate: data?.issueDate || now.toISOString().slice(0, 10),
                dueDate,
                maturityDate: dueDate,
                lineItems: data?.items,
              });
            }}
          />
        )}
      </div>

      {showUploadModal && (
        <CreateInvoiceModal
          onClose={() => setShowUploadModal(false)}
          onSubmitInvoice={handleAddInvoice}
          buyerOptions={registeredBuyers}
        />
      )}

      {getReadOnlyInvoice() && (
        <ReadOnlyInvoiceDetails invoice={getReadOnlyInvoice() as Invoice} onClose={() => setReadOnlyInvoiceId(null)} />
      )}
    </div>
  );
}
