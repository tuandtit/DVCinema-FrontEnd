import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, map, Observable, of } from 'rxjs';
import { MovieResponseDto } from '../models/movie/movie-response.dto';
import { MovieSearchRequest } from '../models/movie/movie-search-request.dto';
import { PagingResponse } from '../models/movie/paging-response.dto';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private apiUrl = 'http://localhost:8080/api/movies/search';

  constructor(private http: HttpClient) {}

  getMovies(
    page: number,
    size: number,
    keyword: string,
    status: string[],
    isAvailableOnline: boolean | null
  ): Observable<PagingResponse<MovieResponseDto>> {
    const request: MovieSearchRequest = {
      paging: {
        page: page,
        size: size,
        orders: {
          id: 'DESC',
        },
      },
      keyword: keyword,
      status: status,
      isAvailableOnline: isAvailableOnline,
    };

    return this.http.post<PagingResponse<MovieResponseDto>>(this.apiUrl, request);
  }

  searchMovies(query: string) {
    if (!query.trim()) {
      return of([]);
    }

    // 🧪 Fake response (sau bạn đổi thành API thật)
    const dummyMovies = [
      { id: 1, title: 'Avengers: Endgame' },
      { id: 2, title: 'Avengers: Infinity War' },
      { id: 3, title: 'Avatar' },
      { id: 4, title: 'Aquaman' },
    ];

    return of(dummyMovies).pipe(
      delay(300),
      map((movies) =>
        movies.filter((movie) => movie.title.toLowerCase().includes(query.toLowerCase()))
      )
    );
  }
}
