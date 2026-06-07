import { describe, expect, it } from 'vitest';
import { getSupplierDisplayName } from '../../../src/lib/supplierDisplay';

describe('supplier display helpers', () => {
  it('uses supplier names for buyer invoice display', () => {
    expect(getSupplierDisplayName({ supplierName: 'Northstar Supplier LLC', supplierId: 'supplier-org-1' })).toBe(
      'Northstar Supplier LLC'
    );
  });

  it('does not display supplier ids as supplier names', () => {
    expect(getSupplierDisplayName({ supplierName: 'supplier-org-1', supplierId: 'supplier-org-1' })).toBe(
      'Supplier name unavailable'
    );
    expect(getSupplierDisplayName({ supplierName: '   ', supplierId: 'supplier-org-1' })).toBe('Supplier name unavailable');
  });
});
