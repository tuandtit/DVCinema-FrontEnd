import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Movie } from '../../../core/models/movie/movie.model';
import { Showtime } from '../../../core/models/showtime/showtime.model';
import { Cinema } from '../../../core/models/cinema/cinema.model';
import { SeatService } from '../../../core/services/seat.service';
import { Seat, SeatRow } from '../../../core/models/seat/seat.model';

@Component({
  selector: 'app-seat-selection',
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.scss'],
  standalone: false,
})
export class SeatSelectionComponent implements OnInit, OnDestroy {
  movie: Movie | null = null;
  cinema: Cinema | null = null;
  showtime: Showtime | null = null;
  seats: Seat[][] = [];
  timeLeft: number = 600;
  timer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private seatService: SeatService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      try {
        this.movie = params['movie'] ? JSON.parse(params['movie']) : null;
        this.cinema = params['cinema'] ? JSON.parse(params['cinema']) : null;
        const showtimeData = params['showtime'] ? JSON.parse(params['showtime']) : null;
        this.showtime = showtimeData
          ? {
              id: showtimeData.id,
              movieId: showtimeData.movieId || 0,
              roomId: showtimeData.roomId || 0,
              cinemaId: showtimeData.cinemaId || 0,
              showDate: showtimeData.date,
              startTime: showtimeData.time,
              ticketPrice: showtimeData.ticketPrice || 85000,
            }
          : null;

        if (!this.movie || !this.cinema || !this.showtime || !this.showtime.roomId) {
          console.error('Thiếu dữ liệu cần thiết, chuyển về trang chính');
          this.router.navigate(['/']);
          return;
        }

        this.loadSeats();
        this.startTimer();
      } catch (error) {
        console.error('Lỗi khi phân tích dữ liệu query params:', error);
        this.router.navigate(['/']);
      }
    });
  }

  loadSeats(): void {
    if (this.showtime?.roomId) {
      this.seatService.getSeatsByRoomId(this.showtime.roomId).subscribe({
        next: (response) => {
          if (response.status.code !== 200) {
            console.error('Lỗi từ API:', response.status.timestamp);
            this.router.navigate(['/']);
            return;
          }
          this.seats = response.data.map((row: SeatRow) =>
            row.seats
              .sort((a, b) => a.seatId - b.seatId)
              .map((seat) => ({
                seatId: seat.seatId,
                seatName: seat.seatName,
                isBooked: seat.isBooked,
                selected: false,
              }))
          );
        },
        error: (err) => {
          console.error('Lỗi khi lấy danh sách ghế:', err);
          this.router.navigate(['/']);
        },
      });
    }
  }

  toggleSeat(row: number, col: number): void {
    const seat = this.seats[row][col];
    if (!seat.isBooked) {
      seat.selected = !seat.selected;
    }
  }

  getSelectedSeats(): string {
    const selected: string[] = [];
    this.seats.forEach((row) => {
      row.forEach((seat) => {
        if (seat.selected) selected.push(seat.seatName);
      });
    });
    return selected.join(', ');
  }

  calculateTotal(): number {
    const selectedCount = this.getSelectedSeats()
      .split(', ')
      .filter((s) => s).length;
    return selectedCount * (this.showtime?.ticketPrice || 85000);
  }

  confirmPayment(): void {
    if (this.showtime && this.getSelectedSeats().length > 0) {
      const paymentData = {
        showtimeId: this.showtime.id,
        cinemaId: this.cinema?.id,
        selectedSeats: this.getSelectedSeats()
          .split(', ')
          .map((seat) => ({ seatName: seat })),
        totalAmount: this.calculateTotal(),
        movieTitle: this.movie?.title,
        showDate: this.showtime.showDate,
        showTime: this.showtime.startTime,
        cinemaName: this.cinema?.name,
      };
      this.router.navigate(['/payment'], { queryParams: { data: JSON.stringify(paymentData) } });
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  startTimer(): void {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        // Cập nhật giao diện với thời gian mới
        const timerElement = document.getElementById('timer');
        if (timerElement) {
          timerElement.textContent = this.formatTime(this.timeLeft);
        }
      } else {
        clearInterval(this.timer);
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
    if (confirm('Hết thời gian đặt vé! Nhấn "OK" để quay lại trang chủ.')) {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
