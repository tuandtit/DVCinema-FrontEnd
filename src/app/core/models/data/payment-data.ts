export interface PaymentData {
  showtimeId: number;
  cinemaId: number;
  selectedSeats: string;
  totalAmount: number;
  movieTitle: string;
  showDate: string;
  startTime: string;
  cinemaName: string;
  heldSeatIds: number[];
}
