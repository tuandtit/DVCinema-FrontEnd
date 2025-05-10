import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/base-response/api.response';
import { Cinema } from '../models/cinema/cinema.model';
import { City } from '../models/cinema/city.model';
import { ShowtimeResponseDto } from '../models/showtime/showtime.response';
import { environment } from '../../environments/environment';

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
}
