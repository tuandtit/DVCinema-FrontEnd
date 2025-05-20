import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Showtime } from '../../../core/models/showtime/showtime.model';
import { Cinema } from '../../../core/models/cinema/cinema.model';
import { City } from '../../../core/models/cinema/city.model';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { ShowtimeResponseDto } from '../../../core/models/showtime/showtime.response';

interface CinemaShowtime {
  cinemaId: number;
  cinemaName: string;
  showtimes: Showtime[];
}

@Component({
  selector: 'app-showtimes',
  templateUrl: './showtimes.component.html',
  styleUrls: ['./showtimes.component.scss'],
  standalone: false,
})
export class ShowtimesComponent implements OnInit {
  @Input() movieId!: number;
  @Input() status: string = '';
  @Output() bookShowtime = new EventEmitter<{ showtime: Showtime; cinema: Cinema }>();
  showtimes: Showtime[] = [];
  cities: City[] = [];
  cinemasInCity: Cinema[] = [];
  filteredShowtimes: CinemaShowtime[] = [];
  availableDates: Date[] = [];
  selectedDate: Date | null = null;
  selectedCity: number | null = null;
  selectedCinema: number | null = null;

  constructor(private showTimeService: ShowtimeService) {}

  ngOnInit(): void {
    if (this.status !== 'ENDED' && this.status !== 'COMING_SOON') {
      this.loadCities();
    }
  }

  loadCities(): void {
    this.showTimeService.getAllCities().subscribe({
      next: (response) => {
        if (response.status.code !== 200) {
          console.error('Lỗi từ API:', response.status.timestamp);
          return;
        }
        this.cities = response.data.map((dto: City) => ({
          id: dto.id,
          name: dto.name,
          cinemas: dto.cinemas,
        }));
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách thành phố:', err);
      },
    });
  }

  loadShowtimes(cinemaId: number): void {
    this.showTimeService.getShowtimesByMovieId(this.movieId, cinemaId).subscribe({
      next: (response) => {
        if (response.status.code !== 200) {
          console.error('Lỗi từ API:', response.status.timestamp);
          return;
        }
        this.showtimes = response.data.map((dto: ShowtimeResponseDto) => ({
          id: dto.id,
          movieId: dto.movieId,
          roomId: dto.roomId,
          roomName: dto.roomName,
          cinemaId: dto.cinemaId,
          showDate: dto.showDate,
          startTime: dto.startTime,
          ticketPrice: dto.ticketPrice,
        }));
        this.extractAvailableDates();
        if (this.availableDates.length > 0 && !this.selectedDate) {
          this.selectDate(this.availableDates[0]);
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy suất chiếu:', err);
      },
    });
  }

  filterCinemasInCity(cityId: number): Cinema[] | undefined {
    return this.cities.find((c) => c.id == cityId)?.cinemas;
  }

  selectCity(cityId: number | null): void {
    this.selectedCity = cityId;
    if (cityId !== null) {
      this.cinemasInCity = this.filterCinemasInCity(cityId) || [];
      this.selectedCinema = this.cinemasInCity[0]?.id || null;
      if (this.selectedCinema) {
        this.loadShowtimes(this.selectedCinema);
      }
    } else {
      this.cinemasInCity = [];
      this.selectedCinema = null;
      this.filterShowtimesByDateAndCinema();
    }
  }

  selectCinema(cinemaId: number | null): void {
    this.selectedCinema = cinemaId;
    if (this.selectedCinema) {
      this.loadShowtimes(this.selectedCinema);
    }
    this.filterShowtimesByDateAndCinema();
  }

  extractAvailableDates(): void {
    const dates = new Set<string>();
    this.showtimes.forEach((showtime) => {
      dates.add(showtime.showDate);
    });
    this.availableDates = Array.from(dates)
      .map((date) => new Date(date))
      .sort((a, b) => a.getTime() - b.getTime());
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.filterShowtimesByDateAndCinema();
  }

  filterShowtimesByDateAndCinema(): void {
    this.filteredShowtimes = [];
    if (!this.selectedDate || !this.selectedCinema) {
      return;
    }
    const selectedDateStr = this.selectedDate.toISOString().split('T')[0];
    const filtered = this.showtimes.filter(
      (showtime) =>
        showtime.showDate === selectedDateStr && showtime.cinemaId == this.selectedCinema
    );
    const cinemaMap: { [key: number]: Showtime[] } = {};
    filtered.forEach((showtime) => {
      if (!cinemaMap[showtime.cinemaId]) {
        cinemaMap[showtime.cinemaId] = [];
      }
      cinemaMap[showtime.cinemaId].push(showtime);
    });
    this.filteredShowtimes = Object.keys(cinemaMap).map((cinemaId) => {
      const cinema = this.cinemasInCity.find((c) => c.id === +cinemaId);
      return {
        cinemaId: +cinemaId,
        cinemaName: cinema ? cinema.name : 'Unknown Cinema',
        showtimes: cinemaMap[+cinemaId].sort((a, b) => a.startTime.localeCompare(b.startTime)),
      };
    });
  }

  formatTime(time: string): string {
    return time.split(':').slice(0, 2).join(':');
  }

  emitBookShowtime(showtime: Showtime): void {
    const cinema = this.cinemasInCity.find((c) => c.id === showtime.cinemaId);
    if (cinema) {
      this.bookShowtime.emit({ showtime, cinema });
    }
  }
}
