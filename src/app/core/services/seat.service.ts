import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/base-response/api.response';
import { SeatRow } from '../models/seat/seat.model';

@Injectable({
  providedIn: 'root',
})
export class SeatService {
  private apiUrl = 'http://localhost:8080/api/rooms';

  constructor(private http: HttpClient) {}

  getSeatsByRoomId(roomId: number): Observable<ApiResponse<SeatRow[]>> {
    const params = new HttpParams().set('roomId', roomId.toString());
    return this.http.get<ApiResponse<SeatRow[]>>(`${this.apiUrl}/seats-of-room`, { params });
  }
}
