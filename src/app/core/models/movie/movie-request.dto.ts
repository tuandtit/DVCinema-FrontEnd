export interface MovieRequestDto {
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  isAvailableOnline: boolean;
  trailerUrl?: string;
  videoUrl?: string;
  status: 'SHOWING' | 'UPCOMING';
  directorId: number;
  actorIds: number[];
  genreIds: number[];
}
