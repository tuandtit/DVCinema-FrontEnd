import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/base-response/api.response';
import { Cinema } from '../models/cinema/cinema.model';
import { City } from '../models/cinema/city.model';
import { ShowtimeResponseDto } from '../models/showtime/showtime.response';

@Injectable({
  providedIn: 'root',
})
export class ShowtimeService {
  private apiUrl = 'http://localhost:8080/api/showtimes';
  private apiGetShowtimesByMovieId = 'http://localhost:8080/api/showtimes?movieId';
  private apiGetAllCities = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getShowtimes(): Observable<ApiResponse<ShowtimeResponseDto>> {
    return this.http.get<ApiResponse<ShowtimeResponseDto>>(this.apiUrl);
  }

  getShowtimesByMovieId(movieId: number): Observable<ApiResponse<ShowtimeResponseDto[]>> {
    return this.http.get<ApiResponse<ShowtimeResponseDto[]>>(
      `${this.apiGetShowtimesByMovieId}=${movieId}`
    );
  }

  getAllCities(): Observable<ApiResponse<City[]>> {
    return this.http.get<ApiResponse<City[]>>(`${this.apiGetAllCities}/cities`);
  }

  getAllCinemaInCity(cityId: number): Observable<ApiResponse<Cinema[]>> {
    return this.http.get<ApiResponse<Cinema[]>>(`${this.apiUrl}/cities/${cityId}/cinemas`);
  }
}
