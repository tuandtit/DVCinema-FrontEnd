import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  standalone: false,
})
export class PaymentComponent implements OnInit {
  paymentData: any = null;
  qrCodeUrl: string = '';
  isPaymentSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.paymentData = params['data'] ? JSON.parse(params['data']) : null;
      if (!this.paymentData) {
        this.router.navigate(['/']);
        return;
      }
      this.generateQrCode(); // Gọi API backend để tạo mã QR
    });
  }

  generateQrCode(): void {
    // Gửi yêu cầu đến backend để tạo mã QR (giả lập)
    const paymentRequest = {
      amount: this.paymentData.totalAmount,
      orderId: `ORDER_${Date.now()}`, // Tạo mã đơn hàng duy nhất
      returnUrl: 'http://your-frontend-url/payment-callback', // URL callback (cần backend xử lý)
    };
    this.http.post('http://your-api-base-url/api/create-payment', paymentRequest).subscribe(
      (response: any) => {
        if (response.status.code === 200) {
          this.qrCodeUrl = response.data.qrCodeUrl; // Giả sử backend trả về URL mã QR
        }
      },
      (error) => {
        console.error('Lỗi khi tạo mã QR:', error);
      }
    );
  }

  checkPaymentStatus(): void {
    // Kiểm tra trạng thái thanh toán (giả lập)
    this.http
      .get(`http://your-api-base-url/api/check-payment-status?orderId=ORDER_${Date.now()}`)
      .subscribe(
        (response: any) => {
          if (response.status.code === 200 && response.data.status === 'SUCCESS') {
            this.isPaymentSuccess = true;
            this.showSuccessPopup();
          }
        },
        (error) => {
          console.error('Lỗi khi kiểm tra trạng thái:', error);
        }
      );
  }

  showSuccessPopup(): void {
    if (confirm('Thanh toán thành công! Nhấn "OK" để quay lại trang chủ.')) {
      this.router.navigate(['/']);
    }
  }

  goBack(): void {
    this.router.navigate(['/seat-selection']);
  }
}
