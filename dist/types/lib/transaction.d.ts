export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    date: string;
    description: string;
    category: 'pan';
    status: 'failed' | 'paid';
    pan: string;
    type: 'debit' | 'credit';
}
