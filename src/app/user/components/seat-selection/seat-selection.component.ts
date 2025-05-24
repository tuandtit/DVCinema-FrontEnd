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
import { SeatStatus } from '../../../core/models/seat/seat-status.enum';
import { DataSharingService } from '../../../core/services/data-sharing.service';
import { BookingData } from '../../../core/models/data/booking-data';

@Component({
  selector: 'app-seat-selection',
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.scss'],
  standalone: false,
})
export class SeatSelectionComponent implements OnInit, OnDestroy {
  bookingData: BookingData | null = null;
  movie: Movie | null = null;
  cinema: Cinema | null = null;
  showtime: Showtime | null = null;
  seats: Seat[][] = [];
  timeLeft = 600; // 10 minutes in seconds
  timer: any;
  heldSeatIds: Set<number> = new Set();
  unselectedSeatIds: Set<number> = new Set();
  userId: number | null = null;
  isPayment: boolean = false;
  private seatUpdateSubscription: Subscription | null = null;
  private readonly MAX_SEATS = 8; // Maximum number of seats that can be selected

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private seatService: SeatService,
    private dataSharingService: DataSharingService
  ) {}

  ngOnInit(): void {
    // Lấy userId từ AccountService
    this.accountService.userId$.subscribe((userId) => {
      this.userId = userId;
    });

    // Lấy dữ liệu từ DataSharingService hoặc history.state
    this.bookingData = this.dataSharingService.getData('bookingData') || history.state.bookingData;

    // Kiểm tra dữ liệu hợp lệ
    if (!this.isValidBookingData(this.bookingData)) {
      this.handleMissingData('Invalid or missing booking data');
      return;
    }

    if (this.bookingData?.showtime) this.showtime = this.bookingData?.showtime;
    if (this.bookingData?.cinema) this.cinema = this.bookingData?.cinema;
    if (this.bookingData?.movie) this.movie = this.bookingData?.movie;

    // Thực hiện các tác vụ
    this.loadSeats();
    this.startTimer();
    this.subscribeToSeatUpdates();
  }

  private isValidBookingData(data: BookingData | null): boolean {
    return (
      !!data &&
      !!data.movie &&
      !!data.cinema &&
      !!data.showtime &&
      !!data.showtime.roomId &&
      !!data.showtime.id
    );
  }

  private handleMissingData(errorMessage: string = 'Missing required data'): void {
    alert(errorMessage);
    console.log('Lỗi thiếu data');
    this.router.navigate(['/']);
  }

  loadSeats(): void {
    if (!this.showtime?.id) {
      this.handleMissingData('No showtime ID available');
      return;
    }

    this.seatService.getSeatsByShowtimeId(this.showtime.id).subscribe({
      next: (response) => {
        if (response.status.code !== 200) {
          this.handleMissingData('Error fetching seats from API');
          return;
        }

        this.heldSeatIds.clear(); // Clear existing held seats to avoid duplicates
        this.seats = response.data.map((row: SeatRow) =>
          row.seats
            .sort((a, b) => a.seatId - b.seatId)
            .map((seat) => {
              if (seat.status === SeatStatus.HOLD && seat.selectedByUserId === this.userId) {
                this.heldSeatIds.add(seat.seatShowtimeId);
              }
              return {
                seatShowtimeId: seat.seatShowtimeId,
                seatId: seat.seatId,
                seatName: seat.seatName,
                status: seat.status,
                selectedByUserId: seat.selectedByUserId ?? -1,
              };
            })
        );
      },
      error: (err: HttpErrorResponse) => {
        this.handleMissingData('Error loading seats: ' + err.message);
      },
    });
  }

  toggleSeat(row: number, col: number): void {
    const seat = this.seats[row][col];
    if (
      seat.status === SeatStatus.BOOKED ||
      (seat.status === SeatStatus.HOLD && seat.selectedByUserId !== this.userId)
    ) {
      return;
    }

    if (seat.status === SeatStatus.AVAILABLE) {
      if (this.heldSeatIds.size >= this.MAX_SEATS) {
        alert(`You can only select up to ${this.MAX_SEATS} seats.`);
        return;
      }
      if (this.showtime?.id) {
        this.holdSelectedSeat(seat.seatId, this.showtime.id);
      } else {
        this.handleMissingData('No showtime available');
      }
    } else {
      this.heldSeatIds.delete(seat.seatShowtimeId);
      this.unselectedSeatIds.add(seat.seatShowtimeId);
      if (this.showtime?.id) {
        this.unselectedSeats(this.showtime.id);
      } else {
        this.handleMissingData('No showtime available');
      }
    }
  }

  holdSelectedSeat(seatId: number, showtimeId: number): void {
    if (!seatId || !showtimeId) {
      this.handleMissingData('Invalid seat or showtime ID');
      return;
    }

    this.seatService.holdSeat(seatId, showtimeId).subscribe({
      next: (response) => {
        this.heldSeatIds.add(response.data.id);
        this.loadSeats();
      },
      error: (err: HttpErrorResponse) => {
        const errorMessage = err?.error?.details?.service || 'Error holding seat';
        alert(errorMessage);
        this.loadSeats();
      },
    });
  }

  unselectedSeats(showtimeId: number): void {
    if (this.unselectedSeatIds.size === 0 || !showtimeId) {
      return;
    }

    this.seatService.releaseSeats(Array.from(this.unselectedSeatIds), showtimeId).subscribe({
      next: () => {
        this.unselectedSeatIds = new Set();
        this.loadSeats();
      },
      error: (err: HttpErrorResponse) => {
        alert('Error releasing seats: ' + err.message);
      },
    });
  }

  releaseSelectedSeats(showtimeId: number): void {
    if (this.heldSeatIds.size === 0 || !showtimeId) {
      return;
    }

    const seatIds = Array.from(this.heldSeatIds); // Convert Set to array for API call
    this.seatService.releaseSeats(seatIds, showtimeId).subscribe({
      next: () => {
        this.heldSeatIds.clear();
        this.loadSeats();
      },
      error: (err: HttpErrorResponse) => {
        alert('Error releasing seats: ' + err.message);
      },
    });
  }

  extendSeatHoldTime(id: number) {
    if (this.heldSeatIds.size === 0 || !id) {
      alert('Vui lòng chọn ghế và suất chiếu');
    }

    const seatIds = Array.from(this.heldSeatIds); // Convert Set to array for API call
    this.seatService.extendSeatHoldTime(seatIds, id).subscribe({
      next: () => {
        this.heldSeatIds.clear();
        this.loadSeats();
      },
      error: (err: HttpErrorResponse) => {
        alert(err.message);
      },
    });
  }

  subscribeToSeatUpdates(): void {
    if (!this.showtime?.id) {
      return;
    }

    this.seatUpdateSubscription = this.seatService
      .subscribeToSeatUpdates(this.showtime.id)
      .subscribe({
        next: (seat: Seat[]) => {
          console.log('Các ghế cập nhật: ' + seat);
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

  getSelectedSeats(): string {
    const selected: string[] = [];
    this.seats.forEach((row) => {
      row.forEach((seat) => {
        if (seat.status === SeatStatus.HOLD && seat.selectedByUserId === this.userId) {
          selected.push(seat.seatName);
        }
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
    if (!this.showtime || !this.cinema || this.heldSeatIds.size === 0) {
      alert(
        'Please select at least one seat and ensure showtime and cinema details are available.'
      );
      return;
    }

    const paymentData = {
      showtimeId: this.showtime.id,
      cinemaId: this.cinema.id,
      selectedSeats: this.getSelectedSeats(),
      totalAmount: this.calculateTotal(),
      movieTitle: this.movie?.title,
      showDate: this.showtime.showDate,
      startTime: this.showtime.startTime,
      cinemaName: this.cinema.name,
      heldSeatIds: Array.from(this.heldSeatIds), // Convert Set to array for payment data
    };

    clearInterval(this.timer);
    this.isPayment = true;
    this.seatService.disconnectWebSocket();
    this.router.navigate(['/payment'], { queryParams: { data: JSON.stringify(paymentData) } });
  }

  goBack(): void {
    if (this.showtime?.id) {
      this.releaseSelectedSeats(this.showtime.id);
    } else {
      alert('No showtime available');
    }
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
        if (this.showtime?.id) {
          this.releaseSelectedSeats(this.showtime.id);
        }
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
    if (confirm('Your session has timed out! Press "OK" to return to the homepage.')) {
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
    if (this.showtime?.id) {
      if (!this.isPayment) this.releaseSelectedSeats(this.showtime.id);
      else this.extendSeatHoldTime(this.showtime.id);
    }
    this.seatService.disconnectWebSocket();
    this.dataSharingService.clearData('bookingData');
    console.log('SeatSelectionComponent destroyed');
  }
}
