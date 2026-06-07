import { describe, expect, it } from 'vitest';
import { getInvoiceStatusDisplay } from '../../../src/lib/invoiceStatusDisplay';

describe('invoice status display helper', () => {
  it.each([
    ['PENDING', 'PENDING', 'bg-amber-100'],
    ['PENDING_VERIFICATION', 'PENDING', 'bg-amber-100'],
    ['ACCEPTED', 'ACCEPTED', 'bg-emerald-100'],
    ['VERIFIED', 'ACCEPTED', 'bg-emerald-100'],
    ['FACTORING_REQUESTED', 'Factoring Requested', 'bg-sky-100'],
    ['FACTORED', 'FACTORED', 'bg-sky-100'],
    ['SETTLED', 'SETTLED', 'bg-slate-100'],
    ['DISPUTED', 'DISPUTED', 'bg-rose-100'],
    ['CONTESTED', 'DISPUTED', 'bg-rose-100'],
  ])('maps %s to %s with the expected color token', (status, label, colorClass) => {
    expect(getInvoiceStatusDisplay(status)).toEqual(
      expect.objectContaining({
        label,
        className: expect.stringContaining(colorClass),
      })
    );
  });

  it('falls back to a readable neutral badge for unknown statuses', () => {
    expect(getInvoiceStatusDisplay('MANUAL_REVIEW')).toEqual(
      expect.objectContaining({
        label: 'MANUAL REVIEW',
        className: expect.stringContaining('bg-slate-100'),
      })
    );
  });
});
