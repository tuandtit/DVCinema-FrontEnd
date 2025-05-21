import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Movie } from '../../../core/models/movie/movie.model';
import { Showtime } from '../../../core/models/showtime/showtime.model';
import { Cinema } from '../../../core/models/cinema/cinema.model';
import { SeatService } from '../../../core/services/seat.service';
import { Seat, SeatRow } from '../../../core/models/seat/seat.model';
import { AccountService } from '../../../core/services/account.service';
import { HttpErrorResponse } from '@angular/common/http';

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
  heldSeatIds: number[] = [];
  unselectedSeatIds: number[] = [];
  userId: number | null = null;
  private seatUpdateSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private seatService: SeatService
  ) {}

  ngOnInit(): void {
    this.accountService.userId$.subscribe((userId) => {
      this.userId = userId;
    });
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
              roomName: showtimeData.roomName,
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
        this.subscribeToSeatUpdates();
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
              .map((seat) => {
                const existingSeat = this.seats.flat().find((s) => s.seatId === seat.seatId);
                return {
                  seatId: seat.seatId,
                  seatName: seat.seatName,
                  isHeld: seat.isHeld,
                  isBooked: seat.isBooked,
                  selectedByUserId: seat.selectedByUserId,
                  selected: existingSeat?.selected || seat.selectedByUserId === this.userId,
                };
              })
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
    if (seat.isBooked || (seat.isHeld && seat.selectedByUserId !== this.userId)) {
      return;
    }

    seat.selected = !seat.selected;
    if (seat.selected) {
      this.heldSeatIds.push(seat.seatId);
      if (this.showtime?.id) {
        this.holdSelectedSeat(seat.seatId, this.showtime.id);
      } else {
        alert('Không tìm thấy suất chiếu');
      }
    } else {
      this.heldSeatIds = this.heldSeatIds.filter((id) => id !== seat.seatId);
      console.log('sau khi lọc: ' + this.heldSeatIds);
      this.unselectedSeatIds.push(seat.seatId);
      this.unselectedSeats();
    }
  }

  holdSelectedSeat(seatId: number, showtimeId: number): void {
    if (seatId != null) {
      this.seatService.holdSeat(seatId, showtimeId).subscribe({
        next: () => {
          this.loadSeats();
        },
        error: (err: HttpErrorResponse) => {
          debugger;

          const errorMessage = err?.error?.details?.service || 'Đã xảy ra lỗi';
          console.error('Lỗi khi giữ ghế:', errorMessage);
          alert(errorMessage);
          this.loadSeats();
        },
      });
    }
  }

  unselectedSeats(): void {
    if (this.unselectedSeatIds.length > 0) {
      this.seatService.releaseSeats(this.unselectedSeatIds).subscribe({
        next: () => {
          debugger;
          this.loadSeats();
        },
        error: (err) => {
          console.error('Lỗi khi giải phóng ghế:', err);
        },
      });
    }
  }

  releaseSelectedSeats(): void {
    debugger;
    if (this.heldSeatIds.length > 0) {
      this.seatService.releaseSeats(this.heldSeatIds).subscribe({
        next: () => {
          this.loadSeats();
        },
        error: (err) => {
          console.error('Lỗi khi giải phóng ghế:', err);
        },
      });
    }
  }

  subscribeToSeatUpdates(): void {
    if (this.showtime?.id) {
      this.seatUpdateSubscription = this.seatService
        .subscribeToSeatUpdates(this.showtime.id)
        .subscribe({
          next: (seat: Seat) => {
            debugger;
            console.log('Seat updated:', seat);
            this.loadSeats();
          },
          error: (err) => {
            console.error('WebSocket error:', err);
          },
          complete: () => {
            console.log('WebSocket connection closed');
          },
        });
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
        heldSeatIds: this.heldSeatIds,
      };
      clearInterval(this.timer);
      this.seatService.disconnectWebSocket();
      this.router.navigate(['/payment'], { queryParams: { data: JSON.stringify(paymentData) } });
    }
  }

  goBack(): void {
    this.releaseSelectedSeats();
    this.seatService.disconnectWebSocket();
    this.router.navigate(['/']);
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
        this.seatService.disconnectWebSocket();
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
    if (this.seatUpdateSubscription) {
      this.seatUpdateSubscription.unsubscribe();
    }
    this.releaseSelectedSeats();
    this.seatService.disconnectWebSocket();
  }
}
