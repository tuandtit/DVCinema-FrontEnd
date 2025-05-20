export interface ShowtimeResponseDto {
  id: number;
  movieId: number;
  roomId: number;
  roomName: string;
  cinemaId: number;
  showDate: string; // Thời gian bắt đầu
  startTime: string; // Thời gian kết thúc
  ticketPrice: number;
}
