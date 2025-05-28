import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovieResponseDto } from '../models/movie/movie-response.dto';
import { MovieSearchRequest } from '../models/movie/movie-search-request.dto';
import { PagingResponse } from '../models/base-response/paging-response.dto';
import { ApiResponse } from '../models/base-response/api.response';
import { MovieRequestDto } from '../models/movie/movie-request.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private apiUrl = `${environment.apiBaseUrl}/api/movies`;

  constructor(private http: HttpClient) {}

  getMovies(
    page: number,
    size: number,
    query: string,
    status: string[]
  ): Observable<ApiResponse<PagingResponse<MovieResponseDto>>> {
    const request: MovieSearchRequest = {
      paging: {
        page: page,
        size: size,
        orders: {
          id: 'DESC',
        },
      },
      query: query,
      status: status,
    };

    return this.http.post<ApiResponse<PagingResponse<MovieResponseDto>>>(
      `${this.apiUrl}/search`,
      request
    );
  }

  getMovieById(movieId: number): Observable<ApiResponse<MovieResponseDto>> {
    return this.http.get<ApiResponse<MovieResponseDto>>(`${this.apiUrl}/${movieId}`);
  }

  addMovie(movie: MovieRequestDto, poster: File): Observable<ApiResponse<MovieResponseDto>> {
    const formData = new FormData();

    // Append các trường từ MovieRequestDto
    formData.append('title', movie.title || '');
    formData.append('description', movie.description || '');
    formData.append('duration', movie.duration?.toString() || '');
    formData.append('releaseDate', movie.releaseDate?.toString() || '');
    formData.append('trailerUrl', movie.trailerUrl || '');
    formData.append('videoUrl', movie.videoUrl || '');
    formData.append('status', movie.status?.toString() || 'SHOWING');
    formData.append('directorId', movie.directorId?.toString() || '0');

    // Append mảng actorIds
    if (movie.actorIds && movie.actorIds.length > 0) {
      movie.actorIds.forEach((id: number) => formData.append('actorIds', id.toString()));
    }

    // Append mảng genreIds
    if (movie.genreIds && movie.genreIds.length > 0) {
      movie.genreIds.forEach((id: number) => formData.append('genreIds', id.toString()));
    }

    // Append poster
    if (poster) {
      formData.append('poster', poster);
    }
    debugger;
    // Gửi yêu cầu POST với FormData
    return this.http.post<ApiResponse<MovieResponseDto>>(`${this.apiUrl}`, formData);
  }

  updateMovie(movieId: number, movie: MovieRequestDto): Observable<ApiResponse<MovieResponseDto>> {
    return this.http.put<ApiResponse<MovieResponseDto>>(`${this.apiUrl}/${movieId}`, movie);
  }

  deleteMovie(movieId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${movieId}`);
  }
}
