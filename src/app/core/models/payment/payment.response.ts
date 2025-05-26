export interface PaymentResponse {
  data: PaymentData;
  error: number;
  message: string;
}

export interface PaymentData {
  bin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  orderCode: string;
  currency: string;
  paymentLinkId: string;
  status: string;
  expiredAt: number;
  checkoutUrl: string;
  qrCode: string;
}
