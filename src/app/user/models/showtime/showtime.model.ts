export interface Showtime {
  id: number;
  movieId: number;
  roomId: number;
  cinemaId: number;
  startTime: string | Date; // Thời gian bắt đầu (VD: '2025-04-24T14:00')
  endTime: string | Date; // Thời gian kết thúc (VD: '2025-04-24T16:23')
  ticketPrice: number; // Giá vé (VD: 80000)
}
