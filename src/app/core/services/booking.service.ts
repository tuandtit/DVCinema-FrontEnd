import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BookingResponseDto } from '../models/booking/booking-response.dto';
import { environment } from '../../environments/environment';

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
}

