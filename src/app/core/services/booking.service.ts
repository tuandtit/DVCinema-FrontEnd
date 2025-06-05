import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/base-response/api.response';
import { BookingResponseDto } from '../models/booking/booking-response.dto';
import { TicketDto } from '../models/booking/ticket.model';
import { BookingHistory } from '../models/booking/booking-history.model';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = `${environment.apiBaseUrl}/api/bookings`; // Replace with your actual backend URL

  constructor(private http: HttpClient) {}

  getBookingByCode(bookingCode: string): Observable<BookingResponseDto> {
    const params = new HttpParams().set('bookingCode', bookingCode);
    return this.http
      .get<{ data: BookingResponseDto }>(this.apiUrl, { params })
      .pipe(map((response) => response.data));
  }

  deleteBookingByCode(bookingCode: string): Observable<void> {
    const params = new HttpParams().set('bookingCode', bookingCode);
    return this.http.delete<void>(this.apiUrl, { params });
  }

  checkin(bookingCode: number): Observable<ApiResponse<TicketDto[]>> {
    return this.http.get<ApiResponse<TicketDto[]>>(`${this.apiUrl}/checkin`, {
      params: { bookingCode },
    });
  }

  getBookingHistory(userId: number): Observable<ApiResponse<BookingHistory[]>> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<ApiResponse<BookingHistory[]>>(`${this.apiUrl}/history-booking`, {
      params,
    });
  }

  generatePdf(bookingCode: string): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/generate-pdf`,
      { bookingCode },
      {
        observe: 'response',
        responseType: 'blob',
      }
    );
  }
}
