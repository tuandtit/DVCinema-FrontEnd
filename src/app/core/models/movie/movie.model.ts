export interface Movie {
  id: number;
  title: string;
  poster: string;
  trailer: string;
  description: string;
  genres: string;
  director: string;
  actors: string;
  duration: number;
  releaseDate?: string | Date;
  status?: string; // Thêm status để hỗ trợ lọc
}
