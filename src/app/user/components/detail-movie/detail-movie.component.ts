import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Showtime } from '../../models/showtime/showtime.model';
import { Movie } from '../../models/movie/movie.model';
import { Cinema } from '../../models/cinema/cinema.model';
import { MovieService } from '../../services/movie.service';
import { ShowtimeService } from '../../services/showtime.service';
import { MovieResponseDto } from '../../models/movie/movie-response.dto';

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
  cinemas: Cinema[] = [];
  filteredShowtimes: CinemaShowtime[] = [];
  availableDates: Date[] = [];
  selectedDate: Date | null = null;
  showTrailerModal: boolean = false;
  safeTrailerUrl: SafeResourceUrl | null = null;

  @ViewChild('modalTrailer') modalTrailer!: ElementRef;
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Nếu modal đang mở và tồn tại phần tử modalTrailer
    if (this.showTrailerModal && this.modalTrailer) {
      const clickedInside = this.modalTrailer.nativeElement.contains(target);

      if (!clickedInside) {
        this.showTrailerModal = false;
      }
    }
  }

  // Fake data cho rạp chiếu
  private fakeCinemas: Cinema[] = [
    { id: 1, name: 'Cinema Alpha', address: '123 Main Street', city: 'Hanoi' },
    { id: 2, name: 'Cinema Beta', address: '456 Oak Avenue', city: 'Ho Chi Minh City' },
  ];

  // Fake data cho suất chiếu
  private fakeShowtimes: Showtime[] = [
    {
      id: 1,
      movieId: 1,
      roomId: 1,
      cinemaId: 1,
      startTime: '2025-04-24T14:00',
      endTime: '2025-04-24T16:23',
      ticketPrice: 80000,
    },
    {
      id: 2,
      movieId: 1,
      roomId: 1,
      cinemaId: 1,
      startTime: '2025-04-24T17:00',
      endTime: '2025-04-24T19:23',
      ticketPrice: 80000,
    },
    {
      id: 3,
      movieId: 1,
      roomId: 2,
      cinemaId: 1,
      startTime: '2025-04-24T20:00',
      endTime: '2025-04-24T22:23',
      ticketPrice: 80000,
    },
    {
      id: 4,
      movieId: 1,
      roomId: 3,
      cinemaId: 2,
      startTime: '2025-04-25T15:00',
      endTime: '2025-04-25T17:23',
      ticketPrice: 85000,
    },
    {
      id: 5,
      movieId: 1,
      roomId: 3,
      cinemaId: 2,
      startTime: '2025-04-25T18:00',
      endTime: '2025-04-25T20:23',
      ticketPrice: 85000,
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private movieService: MovieService,
    private showTimeService: ShowtimeService
  ) {}

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.loadMovie(+movieId);
      this.loadShowtimes(+movieId);
      this.loadCinemas();
    }
  }

  loadMovie(movieId: number): void {
    debugger;
    this.movieService.getMovieById(movieId).subscribe({
      next: (response) => {
        if (response.status.code !== 200) {
          console.error('Lỗi từ API:', response.status.timestamp);
          return;
        }
        debugger;
        this.movie = {
          id: response.data.id,
          title: response.data.title,
          poster: response.data.posterUrl,
          trailer: response.data.trailerUrl,
          description: response.data.description,
          genres: response.data.genreNames.join(', '),
          director: 'Bùi Thạc Chuyên',
          actors: 'Thái Hòa',
          duration: response.data.duration,
          availableOnline: response.data.isAvailableOnline,
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
    // Sử dụng fake data
    this.showtimes = this.fakeShowtimes.filter((s) => s.movieId === movieId);
    this.extractAvailableDates();
    this.selectDate(this.availableDates[0]); // Chọn ngày đầu tiên mặc định
  }

  loadCinemas(): void {
    // Sử dụng fake data
    this.cinemas = this.fakeCinemas;
    this.filterShowtimesByDate();
  }

  extractAvailableDates(): void {
    const dates = new Set<string>();
    this.showtimes.forEach((showtime) => {
      const date = new Date(showtime.startTime).toISOString().split('T')[0];
      dates.add(date);
    });
    this.availableDates = Array.from(dates)
      .map((date) => new Date(date))
      .sort((a, b) => a.getTime() - b.getTime());
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.filterShowtimesByDate();
  }

  filterShowtimesByDate(): void {
    if (!this.selectedDate) return;
    const selectedDateStr = this.selectedDate.toISOString().split('T')[0];
    const filtered = this.showtimes.filter((showtime) => {
      const showtimeDate = new Date(showtime.startTime).toISOString().split('T')[0];
      return showtimeDate === selectedDateStr;
    });

    const cinemaMap: { [key: number]: Showtime[] } = {};
    filtered.forEach((showtime) => {
      if (!cinemaMap[showtime.cinemaId]) {
        cinemaMap[showtime.cinemaId] = [];
      }
      cinemaMap[showtime.cinemaId].push(showtime);
    });

    this.filteredShowtimes = Object.keys(cinemaMap).map((cinemaId) => {
      const cinema = this.cinemas.find((c) => c.id === +cinemaId);
      return {
        cinemaId: +cinemaId,
        cinemaName: cinema ? cinema.name : 'Unknown Cinema',
        showtimes: cinemaMap[+cinemaId].sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        ),
      };
    });
  }

  openTrailerModal(): void {
    if (this.movie?.trailer) {
      // Bước 1: Chuyển "watch?v=" thành "embed/"
      const embedUrl = this.movie.trailer.replace('watch?v=', 'embed/');

      // Bước 2: Thêm các tham số
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
