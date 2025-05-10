import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Movie } from '../../../core/models/movie/movie.model';

interface Showtime {
  id: number;
  date: string;
  time: string;
}

interface Cinema {
  id: number;
  name: string;
  showtimes: Showtime[];
}

interface Seat {
  id: string;
  booked: boolean;
  selected: boolean;
}

@Component({
  selector: 'app-seat-selection',
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.scss'],
  standalone: false,
})
export class SeatSelectionComponent implements OnInit {
  movie: Movie | null = null;
  cinema: Cinema | null = null;
  showtime: Showtime | null = null;
  seats: Seat[][] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.movie = JSON.parse(params['movie'] || '{}');
      this.cinema = JSON.parse(params['cinema'] || '{}');
      this.showtime = JSON.parse(params['showtime'] || '{}');
      this.initializeSeats();
    });
  }

  initializeSeats(): void {
    this.seats = Array(5)
      .fill(null)
      .map((_, row) =>
        Array(5)
          .fill(null)
          .map((_, col) => ({
            id: String.fromCharCode(65 + row) + (col + 1),
            booked: Math.random() > 0.8,
            selected: false,
          }))
      );
  }

  toggleSeat(row: number, col: number): void {
    const seat = this.seats[row][col];
    if (!seat.booked) {
      seat.selected = !seat.selected;
    }
  }

  getSelectedSeats(): string {
    const selected: string[] = [];
    this.seats.forEach((row) => {
      row.forEach((seat) => {
        if (seat.selected) selected.push(seat.id);
      });
    });
    return selected.join(', ');
  }

  calculateTotal(): number {
    const selectedCount = this.getSelectedSeats()
      .split(', ')
      .filter((s) => s).length;
    return selectedCount * 80000; // Giá vé 80,000 VND
  }

  confirmPayment(): void {
    alert('Thanh toán thành công! Cảm ơn bạn đã đặt vé.');
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
