export interface MovieResponseDto {
  id: number;
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  isAvailableOnline: boolean;
  status: string | null;
  genreNames: string[];
}
