import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  HostListener,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Movie } from '../../../core/models/movie/movie.model';
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
  selector: 'app-cinema-showtime-modal',
  templateUrl: './cinema-showtime-modal.component.html',
  styleUrls: ['./cinema-showtime-modal.component.scss'],
  standalone: false,
})
export class CinemaShowtimeModalComponent implements OnInit {
  @Input() showModal: boolean = false;
  @Input() movie: Movie | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() proceed = new EventEmitter<{ cinema: Cinema; showtime: Showtime }>();

  @ViewChild('modalContent') modalContent!: ElementRef;

  cities: City[] = [];
  cinemasInCity: Cinema[] = [];
  showtimes: Showtime[] = [];
  filteredShowtimes: CinemaShowtime[] = [];
  availableDates: Date[] = [];
  selectedCity: number | null = null;
  selectedCinema: number | null = null;
  selectedDate: Date | null = null;
  selectedShowtime: Showtime | null = null;
  selectedCinemaObj: Cinema | null = null;

  constructor(private showtimeService: ShowtimeService) {}

  ngOnInit(): void {
    // console.log('đặt vé cho phim: ' + this.movie?.id);
    // if (this.movie?.id) {
    //   this.loadCities();
    // }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['movie'] && this.movie && this.movie.id) {
      console.log('Movie input changed, ID:', this.movie.id);
      this.loadCities();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.showModal && this.modalContent) {
      const clickedInside = this.modalContent.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.closeModal();
      }
    }
  }

  loadCities(): void {
    debugger;
    this.showtimeService.getAllCities().subscribe({
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

  loadCinemasInCity(cityId: number): void {
    console.log('Danh sách các thành phố: ', this.cities);

    this.cinemasInCity = this.filterCinemasInCity(cityId) || [];
    this.selectedCinema = this.cinemasInCity[0]?.id || null;
    console.log('Danh sách rạp trong thành phố:', this.cinemasInCity);
    console.log('Rạp được chọn mặc định:', this.selectedCinema);
    if (this.movie?.id && this.selectedCinema)
      this.loadShowtimes(this.movie?.id, this.selectedCinema);
    this.filterShowtimesByDateAndCinema();
  }

  filterCinemasInCity(cityId: number): Cinema[] | undefined {
    return this.cities.find((c) => c.id == cityId)?.cinemas;
  }

  loadShowtimes(movieId: number, cinemaId: number): void {
    this.showtimeService.getShowtimesByMovieId(movieId, cinemaId).subscribe({
      next: (response) => {
        if (response.status.code !== 200) {
          console.error('Lỗi từ API:', response.status.timestamp);
          return;
        }
        this.showtimes = response.data.map((dto: ShowtimeResponseDto) => ({
          id: dto.id,
          movieId: dto.movieId,
          roomId: dto.roomId,
          cinemaId: dto.cinemaId,
          showDate: dto.showDate,
          startTime: dto.startTime,
          ticketPrice: dto.ticketPrice,
        }));
        this.extractAvailableDates();
        if (this.availableDates.length > 0) {
          this.selectDate(this.availableDates[0]);
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy suất chiếu:', err);
      },
    });
  }

  selectCity(cityId: number | null): void {
    this.selectedCity = cityId;
    if (cityId !== null) {
      this.loadCinemasInCity(cityId);
    } else {
      this.cinemasInCity = [];
      this.selectedCinema = null;
      this.filterShowtimesByDateAndCinema();
    }
  }

  selectCinema(cinemaId: number | null): void {
    this.selectedCinema = cinemaId;
    console.log('Rạp được chọn:', this.selectedCinema);
    if (this.movie?.id && this.selectedCinema)
      this.loadShowtimes(this.movie?.id, this.selectedCinema);
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
    // Reset danh sách suất chiếu
    this.filteredShowtimes = [];

    if (!this.selectedDate || !this.selectedCinema) {
      console.log('Chưa đủ điều kiện để lọc: ', {
        selectedDate: this.selectedDate,
        selectedCinema: this.selectedCinema,
      });
      return;
    }

    const selectedDateStr = this.selectedDate.toISOString().split('T')[0];
    console.log('Ngày được chọn: ', selectedDateStr);
    console.log('danh sách showtimes: ', this.showtimes);
    console.log('cinema được chọn: ', this.selectedCinema);
    const filtered = this.showtimes.filter((showtime) => {
      return showtime.showDate === selectedDateStr && showtime.cinemaId == this.selectedCinema;
    });

    console.log('Suất chiếu sau khi lọc:', filtered); // Debug

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
        showtimes: cinemaMap[+cinemaId].sort((a, b) => {
          const timeA = a.startTime;
          const timeB = b.startTime;
          return timeA.localeCompare(timeB);
        }),
      };
    });

    console.log('Danh sách suất chiếu đã lọc để hiển thị:', this.filteredShowtimes); // Debug
  }

  formatTime(time: string): string {
    return time.split(':').slice(0, 2).join(':');
  }

  selectShowtime(cinema: CinemaShowtime, showtime: Showtime): void {
    this.selectedShowtime = showtime;
    this.selectedCinemaObj = this.cinemasInCity.find((c) => c.id === cinema.cinemaId) || null;
  }

  proceedToConfirm(): void {
    if (this.selectedCinemaObj && this.selectedShowtime) {
      this.proceed.emit({ cinema: this.selectedCinemaObj, showtime: this.selectedShowtime });
    }
  }

  closeModal(): void {
    this.close.emit();
    this.selectedCity = null;
    this.selectedCinema = null;
    this.selectedDate = null;
    this.selectedShowtime = null;
    this.selectedCinemaObj = null;
    this.cinemasInCity = [];
    this.filteredShowtimes = [];
  }
}
