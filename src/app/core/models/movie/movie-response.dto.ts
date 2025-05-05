export interface MovieResponseDto {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  trailerUrl: string;
  posterUrl: string;
  duration: number;
  releaseDate: string;
  isAvailableOnline: boolean;
  status: string | null;
  genreNames: string[];
  actorNames: string[];
  directorName: string;
}
