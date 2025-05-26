export interface Transaction {
  reference: string;
  amount: number;
  accountNumber: string;
  description: string;
  transactionDateTime: string;
  virtualAccountName: string | null;
  virtualAccountNumber: string | null;
  counterAccountBankId: string;
  counterAccountBankName: string | null;
  counterAccountName: string | null;
  counterAccountNumber: string;
}

export interface OrderData {
  id: string;
  orderCode: number;
  amount: number;
  amountPaid: number;
  amountRemaining: number;
  status: string;
  createdAt: string;
  transactions: Transaction[];
  cancellationReason: string | null;
  canceledAt: string | null;
}
