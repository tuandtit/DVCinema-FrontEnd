import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { BookingResponseDto } from '../../../core/models/booking/booking-response.dto';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  standalone: false,
})
export class SuccessComponent implements OnInit {
  bookingData: BookingResponseDto | null = null;
  orderCode: string = '';
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}

  async ngOnInit(): Promise<void> {
    console.log('ngOnInit started, isLoading:', this.isLoading);
    this.isLoading = true;
    this.orderCode = this.route.snapshot.queryParamMap.get('orderCode') || 'N/A';

    if (this.orderCode && this.orderCode !== 'N/A') {
      try {
        const data = await this.bookingService.getBookingByCode(this.orderCode).toPromise();
        this.bookingData = data;
      } catch (error) {
        console.error('Error fetching booking details:', error);
        alert('Lỗi khi lấy thông tin vé. Vui lòng liên hệ hỗ trợ.');
        this.router.navigate(['/']);
      } finally {
        this.isLoading = false;
        console.log('ngOnInit finished, isLoading:', this.isLoading);
      }
    } else {
      this.isLoading = false;
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
