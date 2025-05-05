import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Showtime } from '../../../core/models/showtime/showtime.model';
import { Movie } from '../../../core/models/movie/movie.model';
import { Cinema } from '../../../core/models/cinema/cinema.model';
import { MovieService } from '../../../core/services/movie.service';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { ShowtimeResponseDto } from '../../../core/models/showtime/showtime.response';
import { City } from '../../../core/models/cinema/city.model';

interface CinemaShowtime {
  cinemaId: number;
  cinemaName: string;
  showtimes: Showtime[];
}

@Component({
  selector: 'app-detail-movie',
  templateUrl: './detail-movie.component.html',
  styleUrls: ['./detail-movie.component.scss'],
})
export class DetailMovieComponent implements OnInit {
  movie: Movie | null = null;
  showtimes: Showtime[] = [];
  cities: City[] = [];
  cinemasInCity: Cinema[] = [];
  filteredShowtimes: CinemaShowtime[] = [];
  availableDates: Date[] = [];
  selectedDate: Date | null = null;
  selectedCity: number | null = null;
  selectedCinema: number | null = null;
  showTrailerModal: boolean = false;
  safeTrailerUrl: SafeResourceUrl | null = null;

  @ViewChild('modalTrailer') modalTrailer!: ElementRef;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.showTrailerModal && this.modalTrailer) {
      const clickedInside = this.modalTrailer.nativeElement.contains(target);
      if (!clickedInside) {
        this.showTrailerModal = false;
      }
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private movieService: MovieService,
    private showTimeService: ShowtimeService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const movieId = this.route.snapshot.paramMap.get('id');
      if (movieId) {
        this.loadMovie(+movieId);
        this.loadShowtimes(+movieId);
        this.loadCities();
      }
    });
  }

  loadMovie(movieId: number): void {
    this.movieService.getMovieById(movieId).subscribe({
      next: (response) => {
        if (response.status.code !== 200) {
          console.error('Lỗi từ API:', response.status.timestamp);
          return;
        }
        this.movie = {
          id: response.data.id,
          title: response.data.title,
          poster: response.data.posterUrl,
          trailer: response.data.trailerUrl,
          description: response.data.description,
          genres: response.data.genreNames.join(', '),
          director: response.data.directorName,
          actors: response.data.actorNames.join(', '),
          duration: response.data.duration,
          isAvailableOnline: response.data.isAvailableOnline,
          releaseDate: response.data.releaseDate,
          status: response.data.status || '',
        };
      },
      error: (err) => {
        console.error('Lỗi khi lấy chi tiết phim:', err);
      },
    });
  }

  loadShowtimes(movieId: number): void {
    this.showTimeService.getShowtimesByMovieId(movieId).subscribe({
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
        console.log('Dữ liệu suất chiếu:', this.showtimes); // Debug
        this.extractAvailableDates();
        this.selectDate(this.availableDates[0]);
      },
      error: (err) => {
        console.error('Lỗi khi lấy suất chiếu:', err);
      },
    });
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
        console.log('Dữ liệu suất chiếu:', this.showtimes); // Debug
        this.extractAvailableDates();
        this.selectDate(this.availableDates[0]);
      },
      error: (err) => {
        console.error('Lỗi khi lấy suất chiếu:', err);
      },
    });
    this.selectedCity = null;
    this.selectedCinema = null;
    this.cinemasInCity = [];
    this.filterShowtimesByDateAndCinema();
  }

  loadCinemasInCity(cityId: number): void {
    console.log('Danh sách các thành phố: ', this.cities);

    this.cinemasInCity = this.filterCinemasInCity(cityId) || [];
    this.selectedCinema = this.cinemasInCity[0]?.id || null;
    console.log('Danh sách rạp trong thành phố:', this.cinemasInCity); // Debug
    console.log('Rạp được chọn mặc định:', this.selectedCinema); // Debug
    this.filterShowtimesByDateAndCinema();
  }

  filterCinemasInCity(cityId: number): Cinema[] | undefined {
    return this.cities.find((c) => c.id == cityId)?.cinemas;
  }

  selectCity(cityId: number | null): void {
    this.selectedCity = cityId;
    console.log('Thành phố được chọn: ' + this.selectedCity);
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
    console.log('Rạp được chọn:', this.selectedCinema); // Debug
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
    console.log('Danh sách ngày khả dụng:', this.availableDates); // Debug
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    console.log('Ngày được chọn:', this.selectedDate); // Debug
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

  openTrailerModal(): void {
    if (this.movie?.trailer) {
      const embedUrl = this.movie.trailer.replace('watch?v=', 'embed/');
      const finalUrl = `${embedUrl}?rel=0&showinfo=0&autoplay=1`;
      this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
      this.showTrailerModal = true;
    }
  }

  closeTrailerModal(): void {
    this.showTrailerModal = false;
    this.safeTrailerUrl = null;
  }

  bookTicket(): void {
    this.router.navigate(['/bookings']);
  }

  bookShowtime(showtime: Showtime): void {
    this.router.navigate(['/bookings'], { queryParams: { showtimeId: showtime.id } });
  }
}
