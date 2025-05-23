export interface Seat {
  seatId: number;
  seatName: string;
  status: string;
  selectedByUserId?: number;
}

export interface SeatRow {
  rowId: number;
  seats: Seat[];
}
