export interface Seat {
  seatShowtimeId: number;
  seatId: number;
  seatName: string;
  status: string;
  selectedByUserId?: number;
}

export interface SeatRow {
  rowId: number;
  seats: Seat[];
}
