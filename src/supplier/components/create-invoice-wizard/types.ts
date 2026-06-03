export interface Customer {
  id: string;
  name: string;
  taxId: string;
  status: 'VERIFIED' | 'PENDING';
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  taxPercent: number;
}
