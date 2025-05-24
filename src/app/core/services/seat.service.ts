import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { ApiResponse } from '../models/base-response/api.response';
import { Seat, SeatRow } from '../models/seat/seat.model';
import { WebSocketService } from './websocket.service';
import { AccountService } from './account.service';
import { environment } from '../../environments/environment';
import { BaseDto } from '../models/base-response/base.dto';

@Injectable({
  providedIn: 'root',
})
export class SeatService {
  private apiSeatByShowtime = `${environment.apiBaseUrl}/api/seat-by-showtime`;
  private apiSeat = `${environment.apiBaseUrl}/api/seats`;
  private wsBaseUrl = `${environment.apiBaseUrl}/ws/seat-updates`;
  private webSocketSubject: Subject<Seat[]> = new Subject<Seat[]>();
  private currentRoomId: number | null = null;

  constructor(
    private http: HttpClient,
    private webSocketService: WebSocketService,
    private accountService: AccountService
  ) {}

  getSeatsByShowtimeId(showtimeId: number): Observable<ApiResponse<SeatRow[]>> {
    const params = new HttpParams().set('showtimeId', showtimeId.toString());
    return this.http.get<ApiResponse<SeatRow[]>>(`${this.apiSeatByShowtime}/seats-of-showtime`, {
      params,
    });
  }

  holdSeat(seatId: number, showtimeId: number): Observable<ApiResponse<BaseDto>> {
    const userId = this.accountService.getUserId();
    if (!userId) {
      return throwError(() => new Error('Vui lòng đăng nhập để giữ ghế!'));
    }
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('showtimeId', showtimeId.toString())
      .set('seatId', seatId.toString());
    return this.http.post<ApiResponse<BaseDto>>(`${this.apiSeatByShowtime}/hold-seat`, null, {
      params,
    });
  }

  releaseSeats(seatIds: number[], showtimeId: number): Observable<any> {
    const params = new HttpParams()
      .set('seatShowtimeIds', seatIds.join(','))
      .set('showtimeId', showtimeId.toString());
    return this.http.post(`${this.apiSeatByShowtime}/release-seats`, null, { params });
  }

  subscribeToSeatUpdates(showtimeId: number): Observable<Seat[]> {
    if (this.currentRoomId !== showtimeId) {
      this.disconnectWebSocket();
      this.currentRoomId = showtimeId;
      const wsUrl = `${this.wsBaseUrl}?showtimeId=${showtimeId}`;
      this.webSocketSubject = this.webSocketService.connect(wsUrl);
    }
    return this.webSocketSubject.asObservable();
  }

  disconnectWebSocket(): void {
    this.webSocketService.disconnect();
    this.webSocketSubject = new Subject<Seat[]>();
    this.currentRoomId = null;
  }
}
