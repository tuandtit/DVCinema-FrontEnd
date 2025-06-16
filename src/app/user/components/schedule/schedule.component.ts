import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { Movie } from '../../../core/models/movie/movie.model';
import { MovieResponseDto } from '../../../core/models/movie/movie-response.dto';
import { GenreDto } from '../../../core/models/movie/genre.dto';
import { ContributorDto } from '../../../core/models/contributor/contributor-search-result.model';
import { Cinema } from '../../../core/models/cinema/cinema.model';
import { City } from '../../../core/models/cinema/city.model';
import { Showtime } from '../../../core/models/showtime/showtime.model';

import { MovieService } from '../../../core/services/movie.service';
import { ShowtimeService } from '../../../core/services/showtime.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
  standalone: false,
})
export class ScheduleComponent implements OnInit {
  // Movie data
  movies: Movie[] = [];
  featuredMovies: Movie[] = [];
  filteredMovies: Movie[] = [];

  // Location & date
  cities: City[] = [];
  cinemasInCity: Cinema[] = [];
  availableDates: Date[] = [];
  selectedDate: Date | null = null;
  selectedCity: number | null = null;
  selectedCinema: number | null = null;

  // UI state
  isLoading = false;
  showSubmenu: { [key: number]: boolean } = {};
  isDropdownOpen = false;
  showTrailerModal = false;
  showCinemaModal = false;
  showConfirmModal = false;

  // Trailer
  safeTrailerUrl: SafeResourceUrl | null = null;
  selectMovieModalTitle = '';

  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;

  // Selection
  selectedMovie: Movie | null = null;
  selectedCinemaObj: Cinema | null = null;
  selectedShowtime: Showtime | null = null;

  constructor(
    private movieService: MovieService,
    private showTimeService: ShowtimeService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.generateAvailableDates();
    this.loadCities();
  }

  generateAvailableDates(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.availableDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
    this.selectedDate = this.availableDates[0];
  }

  loadCities(): void {
    this.isLoading = true;
    this.showTimeService.getAllCities().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status.code !== 200) {
          console.error('Lỗi từ API:', response.status.timestamp);
          return;
        }

        this.cities = response.data.map((dto: City) => ({
          id: dto.id,
          name: dto.name,
          cinemas: dto.cinemas || [],
        }));

        if (this.cities.length > 0 && this.cities[0].cinemas.length > 0) {
          this.selectedCity = this.cities[0].id;
          this.cinemasInCity = this.cities[0].cinemas;
          this.selectedCinema = this.cinemasInCity[0].id;
          this.selectedCinemaObj = this.cinemasInCity[0];
          this.loadMovies();
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Lỗi khi lấy danh sách thành phố:', err);
      },
    });
  }

  loadMovies(): void {
    // if (!this.selectedDate || !this.selectedCinema) return;
    // this.isLoading = true;
    // const selectedDateStr = this.selectedDate.toISOString().split('T')[0];
    // this.movieService.getMoviesByDateAndCinema(selectedDateStr, this.selectedCinema).subscribe({
    //   next: (response) => {
    //     this.isLoading = false;
    //     if (response.status.code !== 200) return;
    //     this.movies = response.data.contents.map((dto: MovieResponseDto) => ({
    //       id: dto.id,
    //       title: dto.title,
    //       poster: dto.posterUrl,
    //       trailer: dto.trailerUrl,
    //       description: dto.description,
    //       genres: this.getGenreNames(dto.genres),
    //       director: dto.director.name,
    //       actors: this.getActorNames(dto.actors),
    //       duration: dto.duration,
    //       releaseDate: dto.releaseDate,
    //       status: dto.status || '',
    //     }));
    //     this.filteredMovies = this.movies;
    //     this.totalPages = Math.ceil(this.filteredMovies.length / this.pageSize);
    //     this.loadFeaturedMovies();
    //   },
    //   error: (err) => {
    //     this.isLoading = false;
    //     console.error('Lỗi khi lấy danh sách phim:', err);
    //   },
    // });
  }

  loadFeaturedMovies(): void {
    this.featuredMovies = this.movies.slice(0, 3);
  }

  getPaginatedMovies(): Movie[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMovies.slice(start, start + this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
    }
  }

  selectDateAndLoadMovies(date: Date): void {
    this.selectedDate = date;
    if (this.selectedCinema) {
      this.loadMovies();
    }
  }

  selectCinemaAndLoadMovies(cinemaId: number): void {
    const city = this.cities.find((c) => c.cinemas.some((cinema) => cinema.id === cinemaId));
    if (!city) return;

    this.selectedCity = city.id;
    this.cinemasInCity = city.cinemas;
    this.selectedCinema = cinemaId;
    this.selectedCinemaObj = this.cinemasInCity.find((c) => c.id === cinemaId) || null;
    this.isDropdownOpen = false;

    if (this.selectedDate) {
      this.loadMovies();
    }
  }

  playTrailer(movie: Movie): void {
    this.selectMovieModalTitle = movie.title;
    if (movie.trailer) {
      const embedUrl = movie.trailer.replace('watch?v=', 'embed/');
      this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `${embedUrl}?rel=0&showinfo=0&autoplay=1`
      );
      this.showTrailerModal = true;
    }
  }

  closeTrailerModal(): void {
    this.showTrailerModal = false;
    this.safeTrailerUrl = null;
  }

  bookTicket(movie: Movie): void {
    this.selectedMovie = movie;
    this.showCinemaModal = true;
  }

  closeCinemaModal(): void {
    this.showCinemaModal = false;
    this.selectedMovie = null;
    this.selectedCinemaObj = null;
    this.selectedShowtime = null;
  }

  openConfirmModal(event: { cinema: Cinema; showtime: Showtime }): void {
    this.selectedCinemaObj = event.cinema;
    this.selectedShowtime = event.showtime;
    this.showCinemaModal = false;
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.selectedCinemaObj = null;
    this.selectedShowtime = null;
  }

  proceedToSeatSelection(): void {
    this.showConfirmModal = false;
    if (this.selectedMovie && this.selectedCinemaObj && this.selectedShowtime) {
      this.router.navigate(['/seat-selection'], {
        queryParams: {
          movie: JSON.stringify(this.selectedMovie),
          cinema: JSON.stringify(this.selectedCinemaObj),
          showtime: JSON.stringify(this.selectedShowtime),
        },
      });
    }
  }

  viewDetails(movie: Movie): void {
    this.router.navigate(['/detail-movie', movie.id]);
  }

  watchMovie(movie: Movie): void {
    if (movie.status === 'ONLINE') {
      this.router.navigate(['/watch-movie', movie.id]);
    } else {
      alert('Phim này hiện chưa hỗ trợ xem online. Vui lòng đặt vé để xem tại rạp!');
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  openDropdown() {
    this.isDropdownOpen = true;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
    this.showSubmenu = {}; // reset all submenus
  }
  onMouseEnter(cityId: number): void {
    this.showSubmenu[cityId] = true;
  }

  onMouseLeave(cityId: number): void {
    this.showSubmenu[cityId] = false;
  }

  getGenreNames(genres: GenreDto[]): string {
    return genres.length > 0 ? genres.map((g) => g.name).join(', ') : 'Chưa có';
  }

  getActorNames(actors: ContributorDto[]): string {
    return actors.length > 0 ? actors.map((a) => a.name).join(', ') : 'Chưa có';
  }

  get selectedCinemaName(): string {
    return this.selectedCinema && this.cinemasInCity.length > 0
      ? this.cinemasInCity.find((c) => c.id === this.selectedCinema)?.name || 'Chọn rạp'
      : 'Chọn rạp';
  }
}
