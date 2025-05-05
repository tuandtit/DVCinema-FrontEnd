// src/app/core/services/genre.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/base-response/api.response';
import { GenreDto } from '../models/movie/genre.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GenreService {
  private apiUrl = `${environment.apiBaseUrl}/api/genres`;

  constructor(private http: HttpClient) {}

  getGenres(query: string): Observable<ApiResponse<GenreDto[]>> {
    return this.http.get<ApiResponse<GenreDto[]>>(`${this.apiUrl}?query=${query}`);
  }
}