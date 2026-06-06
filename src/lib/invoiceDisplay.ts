export interface InvoiceIdentifier {
  id: string;
  invoiceNumber?: string | null;
}

export function getInvoiceDisplayNumber(invoice: InvoiceIdentifier) {
  return invoice.invoiceNumber?.trim() || invoice.id;
}

export function formatInvoiceDate(value?: string | null) {
  if (!value) return 'Not provided';

  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(Number(year), Number(month) - 1, Number(day)));
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return value;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(timestamp));
}
