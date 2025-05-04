import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovieResponseDto } from '../models/movie/movie-response.dto';
import { MovieSearchRequest } from '../models/movie/movie-search-request.dto';
import { PagingResponse } from '../../shared/base-response/paging-response.dto';
import { ApiResponse } from '../../shared/base-response/api.response';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private apiUrl = 'http://localhost:8080/api/movies/search';
  private apiGetMovieById = 'http://localhost:8080/api/movies';

  constructor(private http: HttpClient) {}

  getMovies(
    page: number,
    size: number,
    query: string,
    status: string[],
    isAvailableOnline: boolean | null
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
      isAvailableOnline: isAvailableOnline,
    };

    return this.http.post<ApiResponse<PagingResponse<MovieResponseDto>>>(this.apiUrl, request);
  }

  getMovieById(movieId: number): Observable<ApiResponse<MovieResponseDto>> {
    return this.http.get<ApiResponse<MovieResponseDto>>(`${this.apiGetMovieById}/${movieId}`);
  }
}
