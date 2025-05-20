export interface Seat {
  seatId: number;
  seatName: string;
  isBooked: boolean;
  isHeld: boolean;
  selected?: boolean;
  selectedByUserId?: number;
}

export interface SeatRow {
  rowId: number;
  roomName: string;
  seats: Seat[];
}
