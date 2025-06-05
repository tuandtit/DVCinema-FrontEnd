import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../../core/services/booking.service';
import { BookingHistory } from '../../../core/models/booking/booking-history.model';
import { AccountService } from '../../../core/services/account.service';
import { ApiResponse } from '../../../core/models/base-response/api.response';

@Component({
  selector: 'app-history-booking',
  templateUrl: './history-booking.component.html',
  styleUrls: ['./history-booking.component.scss'],
  standalone: false,
})
export class HistoryBookingComponent implements OnInit {
  bookings: BookingHistory[] = [];

  constructor(
    private bookingHistoryService: BookingService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.loadBookingHistory();
  }

  loadBookingHistory(): void {
    const userId = this.accountService.getUserId();
    if (userId == null) {
      alert('Bạn chưa đăng nhập');
      return;
    }
    this.bookingHistoryService.getBookingHistory(userId).subscribe({
      next: (response: ApiResponse<BookingHistory[]>) => {
        this.bookings = response.data;
      },
      error: (err) => {
        console.error('Error loading booking history:', err);
      },
    });
  }
}
