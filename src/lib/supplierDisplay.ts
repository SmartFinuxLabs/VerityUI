export function getSupplierDisplayName(invoice: { supplierName?: string | null; supplierId?: string | null }) {
  const supplierName = invoice.supplierName?.trim();
  if (supplierName && supplierName !== invoice.supplierId) {
    return supplierName;
  }

  return 'Supplier name unavailable';
}
