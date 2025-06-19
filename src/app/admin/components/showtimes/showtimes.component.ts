import { Component, OnInit } from '@angular/core';
import { ShowtimeResponseDto } from '../../../core/models/showtime/showtime.response';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { CinemaService } from '../../../core/services/cinema.service';
import { ApiResponse } from '../../../core/models/base-response/api.response';
import { Cinema } from '../../../core/models/cinema/cinema.model';

@Component({
  selector: 'app-showtimes',
  templateUrl: './showtimes.component.html',
  styleUrls: ['./showtimes.component.scss'],
  standalone: false,
})
export class ShowtimesComponent implements OnInit {
  showtimes: ShowtimeResponseDto[] = [];
  filteredShowtimes: ShowtimeResponseDto[] = [];
  cinemas: Cinema[] = [];
  selectedCinemaId: number = 0;
  selectedShowDate: string = new Date().toISOString().split('T')[0];
  today: string = new Date().toISOString().split('T')[0];

  showAddForm: boolean = false;
  showEditForm: boolean = false;
  newShowtime: ShowtimeResponseDto = {
    id: 0,
    movieId: 0,
    movieTitle: '',
    roomId: 0,
    roomName: '',
    cinemaId: this.selectedCinemaId,
    cinemaName: '',
    showDate: this.selectedShowDate,
    startTime: '',
    endTime: '',
    ticketPrice: 0,
  };
  editShowtime: ShowtimeResponseDto | null = null;

  constructor(
    private showtimeService: ShowtimeService,
    private cinemaService: CinemaService
  ) {}

  ngOnInit(): void {
    this.loadCinemas();
  }

  loadCinemas(): void {
    this.cinemaService.getAllCinemas().subscribe({
      next: (response: ApiResponse<Cinema[]>) => {
        if (response.status.code === 200 && response.data) {
          this.cinemas = response.data;
          this.selectedCinemaId = this.cinemas[0]?.id || 0;
          this.newShowtime.cinemaId = this.selectedCinemaId;
          this.newShowtime.cinemaName =
            this.cinemas.find((c) => c.id === this.selectedCinemaId)?.name || '';
          this.loadShowtimes();
        } else {
          this.cinemas = [];
          console.error('Failed to load cinemas:', response.message);
        }
      },
      error: (err) => {
        this.cinemas = [];
        console.error('Error loading cinemas:', err);
      },
    });
  }

  loadShowtimes(): void {
    if (!this.selectedCinemaId) {
      this.showtimes = [];
      this.filteredShowtimes = [];
      return;
    }
    this.showtimeService
      .getByCinemaIdAndShowDate(this.selectedCinemaId, this.selectedShowDate)
      .subscribe({
        next: (response: ApiResponse<ShowtimeResponseDto[]>) => {
          if (response.status.code === 200 && response.data) {
            this.showtimes = response.data.map((showtime) => ({
              ...showtime,
              startTime: `${showtime.showDate}T${showtime.startTime}`,
              endTime: showtime.endTime ? `${showtime.showDate}T${showtime.endTime}` : '',
            }));
            this.filteredShowtimes = [...this.showtimes];
          } else {
            this.showtimes = [];
            this.filteredShowtimes = [];
            console.error('Failed to load showtimes:', response.message);
          }
        },
        error: (err) => {
          this.showtimes = [];
          this.filteredShowtimes = [];
          console.error('Error loading showtimes:', err);
        },
      });
  }

  addShowtime(): void {
    if (
      !this.newShowtime.movieTitle ||
      !this.newShowtime.roomName ||
      !this.newShowtime.startTime ||
      this.newShowtime.ticketPrice <= 0
    ) {
      alert('Vui lòng điền đầy đủ thông tin suất chiếu!');
      return;
    }

    const newId = this.showtimes.length ? Math.max(...this.showtimes.map((s) => s.id)) + 1 : 1;
    this.showtimes.push({
      ...this.newShowtime,
      id: newId,
      movieId: 1, // Placeholder, thay bằng select box khi có API phim
      roomId: 1, // Placeholder, thay bằng select box khi có API phòng
      cinemaId: this.selectedCinemaId,
      cinemaName: this.cinemas.find((c) => c.id === this.selectedCinemaId)?.name || '',
      showDate: this.selectedShowDate,
    });
    this.filteredShowtimes = [...this.showtimes];
    this.newShowtime = {
      id: 0,
      movieId: 0,
      movieTitle: '',
      roomId: 0,
      roomName: '',
      cinemaId: this.selectedCinemaId,
      cinemaName: this.cinemas.find((c) => c.id === this.selectedCinemaId)?.name || '',
      showDate: this.selectedShowDate,
      startTime: '',
      endTime: '',
      ticketPrice: 0,
    };
    this.showAddForm = false;
  }

  openEditForm(showtime: ShowtimeResponseDto): void {
    this.editShowtime = { ...showtime };
    this.showEditForm = true;
  }

  updateShowtime(): void {
    if (!this.editShowtime) return;

    const index = this.showtimes.findIndex((s) => s.id === this.editShowtime!.id);
    if (index !== -1) {
      this.showtimes[index] = { ...this.editShowtime };
      this.filteredShowtimes = [...this.showtimes];
      this.editShowtime = null;
      this.showEditForm = false;
    }
  }

  deleteShowtime(id: number): void {
    if (confirm('Bạn có chắc muốn xóa suất chiếu này?')) {
      this.showtimes = this.showtimes.filter((showtime) => showtime.id !== id);
      this.filteredShowtimes = [...this.showtimes];
    }
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.newShowtime = {
      id: 0,
      movieId: 0,
      movieTitle: '',
      roomId: 0,
      roomName: '',
      cinemaId: this.selectedCinemaId,
      cinemaName: this.cinemas.find((c) => c.id === this.selectedCinemaId)?.name || '',
      showDate: this.selectedShowDate,
      startTime: '',
      endTime: '',
      ticketPrice: 0,
    };
    this.editShowtime = null;
  }

  formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  }
}
