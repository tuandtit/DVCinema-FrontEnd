export interface Movie {
  id: number;
  title: string;
  poster: string;
  description: string;
  genre: string;
  duration: number;
  availableOnline: boolean;
  releaseDate?: string;
  status?: string; // Thêm status để hỗ trợ lọc
}
