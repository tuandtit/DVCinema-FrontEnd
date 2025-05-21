import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { ApiResponse } from '../models/base-response/api.response';
import { Seat, SeatRow } from '../models/seat/seat.model';
import { WebSocketService } from './websocket.service';
import { AccountService } from './account.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SeatService {
  private apiRoom = `${environment.apiBaseUrl}/api/rooms`;
  private apiSeat = `${environment.apiBaseUrl}/api/seats`;
  private wsBaseUrl = `${environment.apiBaseUrl}/ws/seat-updates`;
  private webSocketSubject: Subject<Seat> = new Subject<Seat>();
  private currentRoomId: number | null = null;

  constructor(
    private http: HttpClient,
    private webSocketService: WebSocketService,
    private accountService: AccountService
  ) {}

  getSeatsByRoomId(roomId: number): Observable<ApiResponse<SeatRow[]>> {
    const params = new HttpParams().set('roomId', roomId.toString());
    return this.http.get<ApiResponse<SeatRow[]>>(`${this.apiRoom}/seats-of-room`, { params });
  }

  holdSeat(seatId: number, showtimeId: number): Observable<any> {
    const userId = this.accountService.getUserId();
    if (!userId) {
      return throwError(() => new Error('Vui lòng đăng nhập để giữ ghế!'));
    }
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('showtimeId', showtimeId.toString())
      .set('seatId', seatId.toString());
    return this.http.post(`${this.apiSeat}/hold-seat`, null, { params });
  }

  releaseSeat(seatId: number): Observable<any> {
    const params = new HttpParams().set('seatId', seatId.toString());
    return this.http.post(`${this.apiSeat}/release-seat`, null, { params });
  }

  releaseSeats(seatIds: number[]): Observable<any> {
    const params = new HttpParams().set('seatIds', seatIds.join(','));
    return this.http.post(`${this.apiSeat}/release-seats`, null, { params });
  }

  subscribeToSeatUpdates(showtimeId: number): Observable<Seat> {
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
    this.webSocketSubject = new Subject<Seat>();
    this.currentRoomId = null;
  }
}
