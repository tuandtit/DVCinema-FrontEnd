import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ApiResponse } from '../models/base-response/api.response';
import { SeatRow } from '../models/seat/seat.model';
import { WebSocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class SeatService {
  private apiRoom = 'http://localhost:8080/api/rooms';
  private apiSeat = 'http://localhost:8080/api/seats';
  private wsBaseUrl = 'ws://localhost:8080/ws/seat-updates';
  private userId = 1; // Thay bằng userId thực tế, có thể lấy từ auth service
  private webSocketSubject: Subject<any> = new Subject<any>();
  private currentRoomId: number | null = null;

  constructor(
    private http: HttpClient,
    private webSocketService: WebSocketService
  ) {}

  /**
   * Lấy danh sách ghế theo roomId
   * @param roomId ID của phòng
   * @returns Observable chứa danh sách hàng ghế
   */
  getSeatsByRoomId(roomId: number): Observable<ApiResponse<SeatRow[]>> {
    const params = new HttpParams().set('roomId', roomId.toString());
    return this.http.get<ApiResponse<SeatRow[]>>(`${this.apiRoom}/seats-of-room`, { params });
  }

  /**
   * Giữ một ghế
   * @param seatId ID của ghế cần giữ
   * @returns Observable cho yêu cầu HTTP
   */
  holdSeat(seatId: number): Observable<any> {
    const params = new HttpParams()
      .set('userId', this.userId.toString())
      .set('seatId', seatId.toString());
    return this.http.post(`${this.apiSeat}/hold-seat`, null, { params });
  }

  /**
   * Giải phóng một ghế
   * @param seatIds ID của các ghế cần giải phóng
   * @returns Observable cho yêu cầu HTTP
   */
  releaseSeats(seatIds: number[]): Observable<any> {
    const params = new HttpParams().set('seatIds', seatIds.toString());
    return this.http.post(`${this.apiSeat}/release-seats`, null, { params });
  }

  /**
   * Đăng ký nhận thông báo cập nhật ghế qua WebSocket
   * @param roomId ID của phòng
   * @returns Observable chứa các cập nhật ghế
   */
  subscribeToSeatUpdates(roomId: number): Observable<any> {
    if (this.currentRoomId !== roomId) {
      this.disconnectWebSocket();
      this.currentRoomId = roomId;
      const wsUrl = `${this.wsBaseUrl}?roomId=${roomId}`;
      this.webSocketSubject = this.webSocketService.connect(wsUrl);
    }
    return this.webSocketSubject.asObservable();
  }

  /**
   * Ngắt kết nối WebSocket
   */
  disconnectWebSocket(): void {
    this.webSocketService.disconnect();
    this.webSocketSubject = new Subject<any>();
    this.currentRoomId = null;
  }
}
