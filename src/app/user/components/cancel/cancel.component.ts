import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataSharingService } from '../../../core/services/data-sharing.service';

@Component({
  selector: 'app-cancel',
  template: `
    <div class="container">
      <h2 class="title">Thanh toán bị hủy</h2>
      <div class="payment-info">
        <p>Thanh toán của bạn đã bị hủy. Vui lòng thử lại.</p>
      </div>
      <div class="actions">
        <button class="btn btn-primary" (click)="goToSeatSelection()">Quay lại chọn ghế</button>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
        background: #ffffff;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        font-family: Arial, sans-serif;
      }
      .title {
        text-align: center;
        color: #1e3a8a;
        margin-bottom: 20px;
        font-size: 24px;
      }
      .payment-info {
        background: #f3f4f6;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        text-align: center;
      }
      .payment-info p {
        margin: 5px 0;
        color: #374151;
      }
      .actions {
        display: flex;
        justify-content: center;
        gap: 10px;
      }
      .btn-primary {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        background: #3b82f6;
        color: #ffffff;
        transition: all 0.3s ease;
      }
      .btn-primary:hover {
        background: #2563eb;
      }
    `,
  ],
})
export class CancelComponent implements OnInit {
  constructor(
    private router: Router,
    private dataSharingService: DataSharingService
  ) {}

  ngOnInit(): void {
    this.dataSharingService.clearData('paymentData'); // Xóa dữ liệu tạm
  }

  goToSeatSelection(): void {
    this.router.navigate(['/seat-selection']);
  }
}
