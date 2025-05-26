export interface CreatePaymentLinkRequestBody {
  productName: string;
  description: string;
  price: number;
  quantity: number;
  seatShowtimeIds: Set<number> | number[];
}
