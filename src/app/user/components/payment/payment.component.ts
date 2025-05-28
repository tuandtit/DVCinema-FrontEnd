import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { DataSharingService } from '../../../core/services/data-sharing.service';
import { PaymentService } from '../../../core/services/payment.service';
import { SeatService } from '../../../core/services/seat.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  standalone: false,
})
export class PaymentComponent implements OnInit, OnDestroy {
  paymentData: any;
  qrCodeUrl: string = '';
  checkoutUrl: string = '';
  isPaymentSuccess: boolean = false;
  timeLeft: number = 600; // 10 phút
  timer: any;
  heldSeatIds: number[] = [];
  orderCode: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private paymentService: PaymentService,
    private seatService: SeatService,
    private dataSharingService: DataSharingService
  ) {}

  ngOnInit(): void {
    this.loadPaymentData();
  }

  async loadPaymentData(): Promise<void> {
    this.isLoading = true;
    try {
      this.paymentData =
        this.dataSharingService.getData('paymentData') || history.state.paymentData;
      if (!this.paymentData) {
        this.router.navigate(['/']);
        return;
      }
      this.heldSeatIds = this.paymentData.heldSeatIds || [];
      this.startTimer();
    } finally {
      this.isLoading = false;
    }
  }

  initiatePayment() {
    this.isLoading = true;
    const description = this.accountService.getUsername() || '';
    const productName = 'Vé xem phim - ' + this.paymentData.movieTitle;
    const quantity = this.paymentData.heldSeatIds.length;
    const showtimeId = this.paymentData.showtimeId;
    this.paymentService
      .createPayment(
        this.paymentData.totalAmount,
        description,
        productName,
        quantity,
        this.paymentData.heldSeatIds,
        showtimeId
      )
      .subscribe(
        (paymentResponse) => {
          this.dataSharingService.setData('paymentResponse', paymentResponse);
          window.location.href = paymentResponse.data.checkoutUrl;
        },
        (error) => {
          console.error('Thanh toán thất bại', error);
          this.isLoading = false;
        }
      );
  }

  openCheckoutUrl(): void {
    if (this.checkoutUrl) {
      window.location.href = this.checkoutUrl;
    }
  }

  releaseSelectedSeats(): void {
    if (this.paymentData.showtimeId == null || this.heldSeatIds.length === 0) return;
    if (this.heldSeatIds.length > 0) {
      this.seatService.releaseSeats(this.heldSeatIds, this.paymentData.showtimeId).subscribe({
        next: () => {
          this.heldSeatIds = [];
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

  showErrorPopup(message: string): void {
    if (confirm(`${message} Nhấn "OK" để quay lại trang chọn ghế.`)) {
      this.router.navigate(['/seat-selection']);
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
      this.releaseSelectedSeats();
    }
  }
}
