import { HttpClient, HttpParams } from '@angular/common/http';
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
export class CinemaService {
  private apiUrl = `${environment.apiBaseUrl}/api/cinemas`;

  constructor(private http: HttpClient) {}

  getAllCinemas(): Observable<ApiResponse<Cinema[]>> {
    return this.http.get<ApiResponse<Cinema[]>>(`${this.apiUrl}`);
  }
}
