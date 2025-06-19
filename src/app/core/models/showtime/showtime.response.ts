export interface ShowtimeResponseDto {
  id: number;
  movieId: number;
  movieTitle: string;
  roomId: number;
  roomName: string;
  cinemaId: number;
  cinemaName: string;
  showDate: string;
  startTime: string;
  endTime: string;
  ticketPrice: number;
}
