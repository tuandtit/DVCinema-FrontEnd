import { ContributorDto } from '../contributor/contributor-search-result.model';
import { GenreDto } from './genre.dto';

export interface MovieResponseDto {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  trailerUrl: string;
  posterUrl: string;
  duration: number;
  releaseDate: string;
  endDate: string;
  status: string | null;
  genres: GenreDto[];
  actors: ContributorDto[];
  director: ContributorDto;
}
