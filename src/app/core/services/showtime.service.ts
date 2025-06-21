import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiResponse } from '../models/base-response/api.response';
import { Cinema } from '../models/cinema/cinema.model';
import { City } from '../models/cinema/city.model';
import { ShowtimeResponseDto } from '../models/showtime/showtime.response';
import { environment } from '../../environments/environment';
import { ShowtimeRequestDto } from '../models/showtime/showtime.request';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ShowtimeService {
  private apiUrl = `${environment.apiBaseUrl}/api/showtimes`;
  private apiGetAllCities = `${environment.apiBaseUrl}/api`;

  constructor(private http: HttpClient) {}

  getShowtimes(): Observable<ApiResponse<ShowtimeResponseDto>> {
    return this.http.get<ApiResponse<ShowtimeResponseDto>>(this.apiUrl);
  }

  getShowtimesByMovieId(
    movieId: number,
    cinemaId: number
  ): Observable<ApiResponse<ShowtimeResponseDto[]>> {
    return this.http.get<ApiResponse<ShowtimeResponseDto[]>>(
      `${this.apiUrl}?movieId=${movieId}&cinemaId=${cinemaId}`
    );
  }

  getAllCities(): Observable<ApiResponse<City[]>> {
    return this.http.get<ApiResponse<City[]>>(`${this.apiGetAllCities}/cities`);
  }

  getAllCinemaInCity(cityId: number): Observable<ApiResponse<Cinema[]>> {
    return this.http.get<ApiResponse<Cinema[]>>(`${this.apiUrl}/cities/${cityId}/cinemas`);
  }

  getByCinemaIdAndShowDate(
    cinemaId: number,
    showDate: string
  ): Observable<ApiResponse<ShowtimeResponseDto[]>> {
    const params = new HttpParams().set('cinemaId', cinemaId).set('showDate', showDate);
    return this.http.get<ApiResponse<ShowtimeResponseDto[]>>(`${this.apiUrl}/filter-showtime`, {
      params,
    });
  }

  createShowtime(dto: ShowtimeRequestDto): Observable<ApiResponse<ShowtimeResponseDto>> {
    return this.http.post<ApiResponse<ShowtimeResponseDto>>(this.apiUrl, dto).pipe(
      map((response) => {
        if (response.status.code !== 200) {
          throw new Error(response.message || 'Failed to create showtime');
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  deleteShowtime(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (response.status.code !== 204) {
          throw new Error(response.message || 'Failed to delete showtime');
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage =
        error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
