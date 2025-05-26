export interface BookingResponseDto {
  id: number;
  bookingCode: number;
  bookingUrl: string;
  cinemaName: string;
  roomName: string;
  seatName: string;
  movieTitle: string;
  showtime: string; // e.g. "26-05-2025 19:30"
  totalPrice: string; // Use string for BigDecimal to preserve precision
  transactionId: string;
}
