export interface Seat {
  seatShowtimeId: number;
  seatId: number;
  seatName: string;
  status: string;
  selectedByUserId?: number;
  seatType: string;
  price: number;
}

export interface SeatRow {
  rowId: number;
  seats: Seat[];
}
