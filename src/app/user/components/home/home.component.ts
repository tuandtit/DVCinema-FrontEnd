import { Component, OnInit } from '@angular/core';
import { Movie } from '../../../core/models/movie/movie.model';
import { MovieService } from '../../../core/services/movie.service';
import { MovieResponseDto } from '../../../core/models/movie/movie-response.dto';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Cinema } from '../../../core/models/cinema/cinema.model';
import { Showtime } from '../../../core/models/showtime/showtime.model';
import { GenreDto } from '../../../core/models/movie/genre.dto';
import { ContributorDto } from '../../../core/models/contributor/contributor-search-result.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false,
})
export class HomeComponent implements OnInit {
  movies: Movie[] = [];
  featuredMovies: Movie[] = [];
  filteredMovies: Movie[] = [];
  filterType: string = 'all';
  currentPage: number = 1;
  pageSize: number = 12;
  totalPages: number = 1;
  showTrailerModal: boolean = false;
  safeTrailerUrl: SafeResourceUrl | null = null;
  selectMovieTile: string = '';
  isLoading: boolean = false;

  showCinemaModal: boolean = false;
  showConfirmModal: boolean = false;
  selectedMovie: Movie | null = null;
  selectedCinema: Cinema | null = null;
  selectedShowtime: Showtime | null = null;

  constructor(
    private movieService: MovieService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const page = parseInt(params['page'], 10) || 1;
      const filter = params['filter'] || 'nowshowing';
      this.currentPage = page;
      this.filterType = filter;
      this.loadMovies();
    });
  }

  async loadMovies(): Promise<void> {
    this.isLoading = true;
    try {
      let status: string[] = [];

      switch (this.filterType) {
        case 'online':
          status = ['ONLINE'];
          break;
        case 'upcoming':
          status = ['COMING_SOON'];
          break;
        case 'nowshowing':
        default:
          status = ['NOW_SHOWING'];
          break;
      }

      const response = await this.movieService
        .getMovies(this.currentPage, this.pageSize, '', '', status)
        .toPromise();

      if (response.status.code !== 200) {
        console.error('Lỗi từ API:', response.status.timestamp);
        return;
      }

      this.movies = response.data.contents.map((dto: MovieResponseDto) => ({
        id: dto.id,
        title: dto.title,
        poster: dto.posterUrl,
        trailer: dto.trailerUrl,
        description: dto.description,
        genres: this.getGenreNames(dto.genres),
        director: dto.director.name,
        actors: this.getActorNames(dto.actors),
        duration: dto.duration,
        releaseDate: dto.releaseDate,
        status: dto.status || '',
      }));

      this.totalPages = response.data.paging.totalPage;
      this.filteredMovies = this.movies;
      this.loadFeaturedMovies();
    } catch (err) {
      console.error('Lỗi khi lấy danh sách phim:', err);
    } finally {
      this.isLoading = false;
    }
  }

  loadFeaturedMovies(): void {
    this.featuredMovies = this.movies.slice(0, 3);
  }

  getPaginatedMovies(): Movie[] {
    return this.filteredMovies;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.isLoading = true;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { filter: this.filterType, page: page },
        queryParamsHandling: 'merge',
      });
    }
  }

  setFilter(filterType: string): void {
    this.filterType = filterType;
    this.currentPage = 1;
    this.isLoading = true;
    this.loadMovies();
  }

  viewDetails(movie: Movie): void {
    this.router.navigate(['/detail-movie', movie.id]);
  }

  closeTrailerModal(): void {
    this.showTrailerModal = false;
    this.safeTrailerUrl = null;
  }

  playTrailer(movie: Movie): void {
    this.selectMovieTile = movie.title;
    if (movie?.trailer) {
      const embedUrl = movie.trailer.replace('watch?v=', 'embed/');
      const finalUrl = `${embedUrl}?rel=0&showinfo=0&autoplay=1`;
      this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
      this.showTrailerModal = true;
    }
  }

  watchMovie(movie: Movie): void {
    if (movie.status === 'ONLINE') {
      this.router.navigate(['/watch-movie', movie.id]);
    } else {
      alert('Phim này hiện chưa hỗ trợ xem online. Vui lòng đặt vé để xem tại rạp!');
    }
  }

  bookTicket(movie: Movie): void {
    this.selectedMovie = movie;
    console.log('Đặt vé cho phim ' + movie.id);
    this.showCinemaModal = true;
  }

  closeCinemaModal(): void {
    this.showCinemaModal = false;
    this.selectedMovie = null;
    this.selectedCinema = null;
    this.selectedShowtime = null;
  }

  openConfirmModal(event: { cinema: Cinema; showtime: Showtime }): void {
    this.selectedCinema = event.cinema;
    this.selectedShowtime = event.showtime;
    this.showCinemaModal = false;
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.selectedCinema = null;
    this.selectedShowtime = null;
  }

  proceedToSeatSelection(): void {
    this.showConfirmModal = false;
    if (this.selectedMovie && this.selectedCinema && this.selectedShowtime) {
      this.router.navigate(['/seat-selection'], {
        queryParams: {
          movie: JSON.stringify(this.selectedMovie),
          cinema: JSON.stringify(this.selectedCinema),
          showtime: JSON.stringify(this.selectedShowtime),
        },
      });
    }
  }
  getGenreNames(genres: GenreDto[]): string {
    return genres.length > 0 ? genres.map((g) => g.name).join(', ') : 'Chưa có';
  }

  getActorNames(actors: ContributorDto[]): string {
    return actors.length > 0 ? actors.map((a) => a.name).join(', ') : 'Chưa có';
  }
}
