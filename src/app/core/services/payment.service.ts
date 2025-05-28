import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaymentResponse } from '../models/payment/payment.response';
import { ApiResponse } from '../models/base-response/api.response';
import { OrderData } from '../models/payment/order-data.response';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = `${environment.apiBaseUrl}/api/payment`;

  constructor(
    private http: HttpClient,
    private accountService: AccountService
  ) {}

  createPayment(
    price: number,
    description: string,
    productName: string,
    quantity: number,
    seatShowtimeIds: number[],
    showtimeId: number
  ): Observable<PaymentResponse> {
    const userId = this.accountService.getUserId();
    if (!userId) {
      return throwError(() => new Error('Vui lòng đăng nhập để thanh toán!'));
    }
    const body = {
      productName: productName,
      description: description,
      price: price,
      quantity: quantity,
      seatShowtimeIds: seatShowtimeIds,
      showtimeId: showtimeId,
      accountId: userId,
    };

    return this.http.post<PaymentResponse>(`${this.apiUrl}/create`, body);
  }

  checkPaymentStatus(orderCode: string): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/status?orderCode=${orderCode}`);
  }

  getBookingByBookingCode(orderCode: string): Observable<ApiResponse<OrderData>> {
    return this.http.get<ApiResponse<OrderData>>(`${this.apiUrl}/${orderCode}`);
  }
}
