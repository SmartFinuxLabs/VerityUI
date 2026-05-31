import { Invoice } from './types';

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-001',
    buyer: 'Acme Corp',
    amount: 50000,
    maturityDate: 'Jun 22, 2026',
    status: 'PENDING',
    originalQty: 500,
    unitPrice: 100,
    itemDescription: 'High-Performance Copper Cladding',
    lifecycleTimeline: {
      registered: 'May 12, 2026 • 09:45 AM'
    }
  },
  {
    id: 'INV-002',
    buyer: 'Global Ltd',
    amount: 30000,
    maturityDate: 'Jul 01, 2026',
    status: 'ACCEPTED',
    originalQty: 300,
    unitPrice: 100,
    itemDescription: 'Smart Power Transmitters',
    lifecycleTimeline: {
      registered: 'May 14, 2026 • 11:15 AM',
      approved: 'May 16, 2026 • 02:30 PM'
    }
  },
  {
    id: 'INV-003',
    buyer: 'TechNova Inc',
    amount: 120000,
    maturityDate: 'May 30, 2026',
    status: 'FACTORED',
    originalQty: 1200,
    unitPrice: 100,
    itemDescription: 'Premium Semiconductor Boards',
    lifecycleTimeline: {
      registered: 'Apr 20, 2026 • 08:00 AM',
      approved: 'Apr 22, 2026 • 10:45 AM'
    }
  },
  {
    id: 'INV-004',
    buyer: 'Retail Giant',
    amount: 15000,
    maturityDate: 'May 15, 2026',
    status: 'SETTLED',
    originalQty: 150,
    unitPrice: 100,
    itemDescription: 'Standard Storage Units',
    lifecycleTimeline: {
      registered: 'Apr 02, 2026 • 09:00 AM',
      approved: 'Apr 04, 2026 • 01:20 PM',
      matured: 'May 15, 2026 • 12:00 AM',
      settled: 'May 15, 2026 • 04:30 PM'
    }
  },
  {
    id: 'INV-2026-089',
    buyer: 'Global Manufacturing Corp',
    amount: 50000,
    maturityDate: 'Aug 14, 2026',
    status: 'DISPUTED',
    originalQty: 500,
    unitPrice: 100,
    itemDescription: 'Industrial Sensors Type-X',
    disputeReason: 'Quantity Mismatch',
    disputeEvidenceFile: 'receiving_report_v2.pdf',
    disputeDetailedDescription: 'Received 480 units instead of the 500 invoiced. Please adjust the invoice to reflect the actual quantity received at our Detroit facility on Oct 12th.',
    smartContractAddress: '0x71C...4f9E',
    lifecycleTimeline: {
      registered: 'May 12, 2026 • 09:45 AM',
      approved: 'May 15, 2026 • 02:20 PM'
    }
  },
  {
    id: 'INV-2023-0891',
    buyer: 'Acme Corp Logistics',
    amount: 125000,
    maturityDate: 'Oct 15, 2023',
    status: 'ACCEPTED',
    originalQty: 1250,
    unitPrice: 100,
    itemDescription: 'Heavy Machinery Assembly Kits',
    lifecycleTimeline: {
      registered: 'Sep 01, 2023 • 10:00 AM'
    }
  },
  {
    id: 'INV-2023-0904',
    buyer: 'Stark Industries',
    amount: 85500,
    maturityDate: 'Nov 02, 2023',
    status: 'ACCEPTED',
    originalQty: 855,
    unitPrice: 100,
    itemDescription: 'Arc-Resistive Alloy Sheets',
    lifecycleTimeline: {
      registered: 'Sep 10, 2023 • 08:30 AM'
    }
  },
  {
    id: 'INV-2023-0912',
    buyer: 'Wayne Enterprises',
    amount: 35000,
    maturityDate: 'Oct 30, 2023',
    status: 'ACCEPTED',
    originalQty: 350,
    unitPrice: 100,
    itemDescription: 'Graphite Plate Armor Plates',
    lifecycleTimeline: {
      registered: 'Sep 14, 2023 • 11:00 AM'
    }
  },
  {
    id: 'INV-2023-0915',
    buyer: 'LexCorp',
    amount: 12400,
    maturityDate: 'Dec 15, 2023',
    status: 'ACCEPTED',
    originalQty: 124,
    unitPrice: 100,
    itemDescription: 'Synthesized Lead Sheeting',
    lifecycleTimeline: {
      registered: 'Sep 20, 2023 • 04:15 PM'
    }
  }
];
