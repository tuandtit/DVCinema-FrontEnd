// src/app/ticket-display/ticket-display.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { TicketDto } from '../../../core/models/booking/ticket.model';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-ticket-display',
  templateUrl: './ticket-display.component.html',
  styleUrls: ['./ticket-display.component.scss'],
  standalone: false,
})
export class TicketDisplayComponent implements OnInit {
  tickets: TicketDto[] = [];
  bookingCode: string | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.bookingCode = navigation.extras.state['bookingCode'] || null;
    } else {
      this.bookingCode = history.state.bookingCode || null;
    }

    if (this.bookingCode) {
      this.loadTickets();
    } else {
      this.errorMessage = 'Không tìm thấy mã đặt vé.';
      this.goBack();
    }
  }

  private loadTickets(): void {
    if (!this.bookingCode) return;

    this.isLoading = true;
    this.errorMessage = null;

    const code = parseInt(this.bookingCode, 10);
    if (isNaN(code)) {
      this.isLoading = false;
      this.errorMessage = 'Mã đặt vé không hợp lệ.';
      return;
    }

    this.bookingService.checkin(code).subscribe(
      (response) => {
        this.isLoading = false;
        if (response && response.data) {
          this.tickets = response.data.map((t) => ({
            id: t.id || 0,
            cinemaName: t.cinemaName || 'N/A',
            roomName: t.roomName || 'N/A',
            seatName: t.seatName || 'N/A',
            movieTitle: t.movieTitle || 'N/A',
            showtime: t.showtime || 'N/A',
            address: t.address || 'N/A',
            price: t.price || 0,
            bookingCode: t.bookingCode || 'N/A',
          }));
          console.log('Received tickets:', this.tickets);
        } else {
          this.errorMessage = 'Không có dữ liệu vé từ API.';
        }
      },
      (error) => {
        this.isLoading = false;
        if (error.status === 400 && error.error) {
          const errorDetails =
            error.error.details?.service || error.error.message || 'Lỗi không xác định';
          this.errorMessage = `Lỗi: ${errorDetails}`;
        } else {
          this.errorMessage = 'Lỗi khi gọi API để lấy vé: ' + (error.message || 'Không xác định');
        }
        console.error('API Error:', error);
      }
    );
  }

  generatePDF(): void {
    if (this.tickets.length === 0) {
      this.errorMessage = 'Không có vé để xuất PDF.';
      return;
    }

    const doc = new jsPDF();

    // Sử dụng font Times để hỗ trợ tiếng Việt
    doc.setFont('times', 'normal');

    // Tiêu đề
    doc.setFontSize(18);
    doc.text('Thông Tin Vé', 10, 10);

    // Thông tin mã đặt vé
    doc.setFontSize(12);
    doc.text(`Mã Đặt Vé: ${this.bookingCode || 'Không có'}`, 10, 20);

    // Định nghĩa chiều rộng tối đa của trang (trừ lề)
    const pageWidth = doc.internal.pageSize.getWidth() - 20; // Trừ lề 10px mỗi bên

    let yPosition = 30;
    this.tickets.forEach((ticket, index) => {
      if (!ticket) return;

      // Thêm đường kẻ phân cách giữa các vé
      if (index > 0) {
        doc.setLineWidth(0.5);
        doc.line(10, yPosition, pageWidth + 10, yPosition);
        yPosition += 5;
      }

      // Tiêu đề vé
      doc.setFontSize(14);
      doc.text(`Vé ${index + 1}:`, 10, yPosition);
      yPosition += 10;

      // Thông tin vé
      doc.setFontSize(12);
      const fields = [
        `ID: ${ticket.id || 'N/A'}`,
        `Tên Rạp: ${ticket.cinemaName || 'N/A'}`,
        `Phòng: ${ticket.roomName || 'N/A'}`,
        `Ghế: ${ticket.seatName || 'N/A'}`,
        `Tên Phim: ${ticket.movieTitle || 'N/A'}`,
        `Thời Gian Chiếu: ${ticket.showtime || 'N/A'}`,
        `Địa Chỉ: ${ticket.address || 'N/A'}`,
        `Giá: ${ticket.price ? `$${ticket.price.toFixed(2)}` : 'N/A'}`,
      ];

      fields.forEach((field, fieldIndex) => {
        // Tự động xuống dòng cho nội dung dài (đặc biệt là địa chỉ)
        const splitText = doc.splitTextToSize(field, pageWidth);
        splitText.forEach((line: string) => {
          if (yPosition > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            yPosition = 10;
          }
          doc.text(line, 10, yPosition);
          yPosition += 7;
        });
      });

      yPosition += 10; // Khoảng cách giữa các vé
    });

    // Lưu file PDF
    doc.save(`Ve_${this.bookingCode || 'unknown'}.pdf`);
  }

  goBack(): void {
    this.router.navigate(['/admin/checkin']);
  }
}
