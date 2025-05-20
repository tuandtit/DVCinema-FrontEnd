import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SeatService } from '../../../core/services/seat.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  standalone: false,
})
export class PaymentComponent implements OnInit, OnDestroy {
  paymentData: any = null;
  qrCodeUrl: string = '';
  isPaymentSuccess: boolean = false;
  timeLeft: number = 600; // 10 phút = 600 giây
  timer: any;
  heldSeatIds: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private seatService: SeatService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.paymentData = params['data'] ? JSON.parse(params['data']) : null;
      if (!this.paymentData) {
        this.router.navigate(['/']);
        return;
      }
      this.heldSeatIds = this.paymentData.heldSeatIds || [];
      this.generateQrCode();
      this.startTimer();
    });
  }

  generateQrCode(): void {
    const paymentRequest = {
      amount: this.paymentData.totalAmount,
      orderId: `ORDER_${Date.now()}`,
      returnUrl: 'http://your-frontend-url/payment-callback',
    };
    this.http.post('http://your-api-base-url/api/create-payment', paymentRequest).subscribe(
      (response: any) => {
        if (response.status.code === 200) {
          this.qrCodeUrl = response.data.qrCodeUrl;
        }
      },
      (error) => {
        console.error('Lỗi khi tạo mã QR:', error);
      }
    );
  }

  checkPaymentStatus(): void {
    this.http
      .get(`http://your-api-base-url/api/check-payment-status?orderId=ORDER_${Date.now()}`)
      .subscribe(
        (response: any) => {
          if (response.status.code === 200 && response.data.status === 'SUCCESS') {
            this.isPaymentSuccess = true;
            this.releaseSelectedSeats(); // Giải phóng ghế sau khi thanh toán thành công
            this.showSuccessPopup();
          }
        },
        (error) => {
          console.error('Lỗi khi kiểm tra trạng thái:', error);
        }
      );
  }

  releaseSelectedSeats(): void {
    if (this.heldSeatIds.length > 0) {
      this.seatService.releaseSeats(this.heldSeatIds).subscribe({
        next: () => {
          this.heldSeatIds = []; // Reset danh sách ghế
        },
        error: (err) => {
          console.error('Lỗi khi giải phóng ghế:', err);
        },
      });
    }
  }

  showSuccessPopup(): void {
    if (confirm('Thanh toán thành công! Nhấn "OK" để quay lại trang chủ.')) {
      this.router.navigate(['/']);
    }
  }

  goBack(): void {
    this.releaseSelectedSeats();
    this.router.navigate(['/seat-selection']);
  }

  startTimer(): void {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        const timerElement = document.getElementById('timer');
        if (timerElement) {
          timerElement.textContent = this.formatTime(this.timeLeft);
        }
      } else {
        clearInterval(this.timer);
        this.releaseSelectedSeats();
        this.showTimeoutPopup();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
  }

  showTimeoutPopup(): void {
    if (confirm('Hết thời gian thanh toán! Nhấn "OK" để quay lại trang chủ.')) {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (!this.isPaymentSuccess) {
      this.releaseSelectedSeats(); // Giải phóng ghế nếu rời trang mà chưa thanh toán thành công
    }
  }
}
