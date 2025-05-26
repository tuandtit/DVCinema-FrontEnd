import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { BookingResponseDto } from '../../../core/models/booking/booking-response.dto';
import { DataSharingService } from '../../../core/services/data-sharing.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  standalone: false,
})
export class SuccessComponent implements OnInit {
  bookingData: BookingResponseDto | null = null;
  orderCode: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.orderCode = this.route.snapshot.queryParamMap.get('orderCode') || 'N/A';
    if (this.orderCode && this.orderCode !== 'N/A') {
      this.bookingService.getBookingByCode(this.orderCode).subscribe({
        next: (data: BookingResponseDto) => {
          this.bookingData = data;
        },
        error: (error) => {
          console.error('Error fetching booking details:', error);
          alert('Lỗi khi lấy thông tin vé. Vui lòng liên hệ hỗ trợ.');
          this.router.navigate(['/']);
        },
      });
    } else {
      alert('Mã đơn hàng không hợp lệ. Vui lòng thử lại.');
      this.router.navigate(['/']);
    }
  }

  handleImageError(): void {
    console.error('Failed to load QR code image');
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
