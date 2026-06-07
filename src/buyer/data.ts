/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Invoice, FundingRequest, LiquidityProfile } from './types';

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-089',
    supplierName: 'TechGear Solutions',
    supplierId: 'tg_0492',
    walletAddress: '0x8a1b...4f2b',
    amount: 50000,
    currency: 'USDC',
    issueDate: 'May 15, 2026',
    maturityDate: 'June 22, 2026',
    status: 'PENDING_VERIFICATION',
    poNumber: 'PO-2026-772',
    goodsReceiptNumber: 'GR-8829',
    lineItems: [
      {
        description: 'Industrial Sensors (Type-X)',
        qty: 500,
        unitPrice: 100.00,
        total: 50000.00,
      }
    ],
    validations: [
      {
        key: 'supplier_identity',
        name: 'Supplier Identity Verified',
        status: 'passed',
        detail: 'KYB Check passed via Chainalysis',
      },
      {
        key: 'po_match',
        name: 'PO Match Passed',
        status: 'passed',
        detail: 'Amount matches PO-2026-772',
      },
      {
        key: 'quantity_match',
        name: 'Quantity Match Passed',
        status: 'passed',
        detail: '500 units verified against GR-8829',
      },
      {
        key: 'duplicate_check',
        name: 'Duplicate Check Passed',
        status: 'passed',
        detail: 'No prior submissions for this invoice',
      }
    ],
    internalNotes: '',
  },
  {
    id: 'INV-2026-092',
    supplierName: 'Global Logistics Ltd',
    supplierId: 'gl_1104',
    walletAddress: '0x3c2d...9a11',
    amount: 12500,
    currency: 'USDC',
    issueDate: 'May 10, 2026',
    maturityDate: 'June 15, 2026',
    status: 'CONTESTED',
    poNumber: 'PO-2026-781',
    goodsReceiptNumber: 'GR-8833',
    lineItems: [
      {
        description: 'Freight Shipping & Cargo Logistics',
        qty: 1,
        unitPrice: 12500.00,
        total: 12500.00,
      }
    ],
    validations: [
      {
        key: 'supplier_identity',
        name: 'Supplier Identity Verified',
        status: 'passed',
        detail: 'KYB Verified via Elliptic',
      },
      {
        key: 'po_match',
        name: 'PO Match Passed',
        status: 'passed',
        detail: 'Matches PO-2026-781',
      },
      {
        key: 'quantity_match',
        name: 'Quantity Match Passed',
        status: 'failed',
        detail: 'Received 480 units instead of 500 (Disputed)',
      },
      {
        key: 'duplicate_check',
        name: 'Duplicate Check Passed',
        status: 'passed',
        detail: 'Unique submission',
      }
    ],
    dispute: {
      reason: 'Quantity Mismatch',
      description: 'Received 480 units instead of 500. The delivery pallet is short by 20 units.',
      evidenceFileName: 'dock_photo_480_pallet.jpg',
      evidenceFileSize: '1.4 MB',
      date: 'Oct 12, 2024',
    },
    rebuttal: {
      stance: 'Full Quantity Delivered',
      explanation: 'Our warehouse logs and digital Bill of Lading confirm 500 units were loaded and signed for at the Detroit facility dock. The discrepancy likely occurred during your internal routing from the receiving dock to your primary storage. Attached is the countersigned delivery note showing a count of 500.',
      evidenceFileName: 'signed_delivery_note_500.pdf',
      evidenceFileSize: '1.2 MB',
      date: 'Oct 14, 2024',
    },
    internalNotes: 'e.g., Checked with receiving dock manager, they found the missing 20 units...',
  },
  {
    id: 'INV-2026-095',
    supplierName: 'Apex Manufacturing',
    supplierId: 'am_0021',
    walletAddress: '0x9e8f...77bb',
    amount: 120000,
    currency: 'USDC',
    issueDate: 'May 08, 2026',
    maturityDate: 'July 01, 2026',
    status: 'FACTORED',
    poNumber: 'PO-2026-764',
    goodsReceiptNumber: 'GR-8815',
    lineItems: [
      {
        description: 'Microprocessors & Semi-conductors',
        qty: 1200,
        unitPrice: 100.00,
        total: 120000.00,
      }
    ],
    validations: [
      {
        key: 'supplier_identity',
        name: 'Supplier Identity Verified',
        status: 'passed',
        detail: 'KYB Check cleared',
      },
      {
        key: 'po_match',
        name: 'PO Match Passed',
        status: 'passed',
        detail: 'Matches PO-2026-764',
      },
      {
        key: 'quantity_match',
        name: 'Quantity Match Passed',
        status: 'passed',
        detail: '1200 units verified against GR-8815',
      },
      {
        key: 'duplicate_check',
        name: 'Duplicate Check Passed',
        status: 'passed',
        detail: 'Unique submission',
      }
    ],
    internalNotes: 'Pre-approved due to automatic smart-contract matching rules.',
    factoredAmount: 118200,
    discountAmount: 1800,
    paymentStatus: 'FINANCED',
  },
  {
    id: 'INV-2023-8901',
    supplierName: 'Apex Tech Supplies',
    supplierId: 'at_0531',
    walletAddress: '0x9e8f...77bb',
    amount: 145000,
    currency: 'USDC',
    issueDate: 'Sep 15, 2024',
    maturityDate: 'Oct 15, 2024',
    status: 'PENDING_VERIFICATION',
    poNumber: 'PO-2023-012',
    goodsReceiptNumber: 'GR-5523',
    lineItems: [
      {
        description: 'High-Performance Motherboards',
        qty: 290,
        unitPrice: 500.00,
        total: 145000.00,
      }
    ],
    validations: [
      {
        key: 'supplier_identity',
        name: 'Supplier Identity Verified',
        status: 'passed',
        detail: 'KYB Checked',
      },
      {
        key: 'po_match',
        name: 'PO Match Passed',
        status: 'passed',
        detail: 'Matches PO-2023-012',
      },
      {
        key: 'quantity_match',
        name: 'Quantity Match Passed',
        status: 'passed',
        detail: 'Quantity verified',
      },
      {
        key: 'duplicate_check',
        name: 'Duplicate Check Passed',
        status: 'passed',
        detail: 'Clear submission',
      }
    ],
    internalNotes: '',
  },
  {
    id: 'INV-GM-442',
    supplierName: 'Global Manufacturing Ltd',
    supplierId: 'gm_8821',
    walletAddress: '0x2a3b...4c5d',
    amount: 89500.50,
    currency: 'USDC',
    issueDate: 'Sep 18, 2024',
    maturityDate: 'Oct 18, 2024',
    status: 'SETTLED',
    poNumber: 'PO-2023-015',
    goodsReceiptNumber: 'GR-5531',
    lineItems: [
      {
        description: 'Steel Bracket Assembly Sets',
        qty: 15,
        unitPrice: 5966.70,
        total: 89500.50,
      }
    ],
    validations: [
      {
        key: 'supplier_identity',
        name: 'Supplier Identity Verified',
        status: 'passed',
        detail: 'Verified',
      }
    ],
    paidAt: '2026-05-29T18:00:00.000Z',
    settledAt: '2026-05-29T18:00:00.000Z',
    paymentStatus: 'PAID',
  },
  {
    id: 'SL-2023-09',
    supplierName: 'Silica Logistics',
    supplierId: 'sl_9021',
    walletAddress: '0x5e6f...7g8h',
    amount: 12000,
    currency: 'USDC',
    issueDate: 'Sep 20, 2024',
    maturityDate: 'Oct 20, 2024',
    status: 'PENDING_VERIFICATION',
    poNumber: 'PO-2023-019',
    goodsReceiptNumber: 'GR-5539',
    lineItems: [
      {
        description: 'Cold-chain shipping containers',
        qty: 6,
        unitPrice: 2000.00,
        total: 12000.00,
      }
    ],
    validations: [
      {
        key: 'supplier_identity',
        name: 'Supplier Identity Verified',
        status: 'passed',
        detail: 'Verified',
      }
    ],
  },
];

export const INITIAL_FUNDING_REQUESTS: FundingRequest[] = [
  {
    id: 'REQ-8890-B',
    type: 'Batch payment for 5 suppliers',
    amount: 450000,
    status: 'DRAFT',
    description: 'Pending internal approval',
  },
  {
    id: 'REQ-8889-A',
    type: 'Single invoice to TechPro',
    amount: 75000,
    status: 'SUPPLIER_REVIEW',
    description: 'Awaiting supplier sign-off',
  },
  {
    id: 'REQ-8885-C',
    type: 'Batch payment for 2 suppliers',
    amount: 120500,
    status: 'READY_FOR_FUNDING',
    description: 'Execute Funding',
  }
];

export const INITIAL_LIQUIDITY: LiquidityProfile = {
  availableLiquidity: 4250000.00,
  walletAddress: '0x7f2E...3B92',
  walletName: 'Fireblocks Vault',
  isConnected: true,
};
