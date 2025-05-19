export interface Seat {
  seatId: number;
  seatName: string;
  isBooked: boolean;
  selected?: boolean; // Thêm trường selected để quản lý trạng thái chọn ghế
}

export interface SeatRow {
  rowId: number;
  seats: Seat[];
}
