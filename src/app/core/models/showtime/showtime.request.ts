export interface ShowtimeRequestDto {
  movieId: number;
  roomId: number;
  showDate: string; // ISO format: YYYY-MM-DD
  startTime: string; // Format: HH:mm
}
