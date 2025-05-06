import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Movie } from '../../../core/models/movie/movie.model';
import { MovieService } from '../../../core/services/movie.service';
import { MovieResponseDto } from '../../../core/models/movie/movie-response.dto';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

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
  inputPage: number = 1; // Biến cho ô input phân trang

  constructor(
    private movieService: MovieService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router
  ) {}

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

  ngOnInit(): void {
    // Lắng nghe thay đổi query params
    this.route.queryParams.subscribe((params) => {
      const page = parseInt(params['page'], 10) || 1;
      const filter = params['filter'] || 'all';
      this.currentPage = page;
      this.inputPage = page; // Đồng bộ inputPage với query param page
      this.filterType = filter; // Đồng bộ filterType với query param filter
      this.loadMovies();
    });
  }

  loadMovies(): void {
    this.isLoading = true;
    let status: string[] = [];
    let isAvailableOnline: boolean | null = null;

    switch (this.filterType) {
      case 'new':
        status = ['NOW_SHOWING'];
        break;
      case 'popular':
        isAvailableOnline = true;
        break;
      case 'upcoming':
        status = ['COMING_SOON'];
        break;
      case 'all':
      default:
        status = [];
        isAvailableOnline = null;
        break;
    }

    this.movieService
      .getMovies(this.currentPage, this.pageSize, '', status, isAvailableOnline)
      .subscribe({
        next: (response) => {
          if (response.status.code !== 200) {
            console.error('Lỗi từ API:', response.status.timestamp);
            this.isLoading = false;
            return;
          }

          this.movies = response.data.contents.map((dto: MovieResponseDto) => ({
            id: dto.id,
            title: dto.title,
            poster: dto.posterUrl,
            trailer: dto.trailerUrl,
            description: dto.description,
            genres: dto.genreNames.join(', '),
            director: dto.directorName,
            actors: dto.actorNames.join(', '),
            duration: dto.duration,
            isAvailableOnline: dto.isAvailableOnline,
            releaseDate: dto.releaseDate,
            status: dto.status || '',
          }));

          this.totalPages = response.data.paging.totalPage;
          this.filteredMovies = this.movies;
          this.loadFeaturedMovies();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Lỗi khi lấy danh sách phim:', err);
          this.isLoading = false;
        },
      });
  }

  loadFeaturedMovies(): void {
    this.featuredMovies = this.movies.slice(0, 3);
  }

  getPaginatedMovies(): Movie[] {
    return this.filteredMovies;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.inputPage = page; // Cập nhật inputPage
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { filter: this.filterType, page: page },
        queryParamsHandling: 'merge',
      });
    }
  }

  goToPage(): void {
    const page = Math.floor(Number(this.inputPage));
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { filter: this.filterType, page: page },
        queryParamsHandling: 'merge',
      });
    } else {
      this.inputPage = this.currentPage; // Đặt lại nếu không hợp lệ
    }
  }

  setFilter(filterType: string): void {
    this.filterType = filterType;
    this.currentPage = 1;
    this.inputPage = 1;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filter: this.filterType, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  viewDetails(movie: Movie): void {
    this.router.navigate(['/detail-movie', movie.id]);
  }

  closeTrailerModal(): void {
    this.showTrailerModal = false;
    this.safeTrailerUrl = null;
  }

  playTrailer(movie: Movie): void {
    console.log('Phát trailer phim:', movie.title);
    this.selectMovieTile = movie.title;
    if (movie?.trailer) {
      const embedUrl = movie.trailer.replace('watch?v=', 'embed/');
      const finalUrl = `${embedUrl}?rel=0&showinfo=0&autoplay=1`;
      this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
      this.showTrailerModal = true;
    }
  }

  watchMovie(movie: Movie): void {
    if (movie.isAvailableOnline) {
      console.log('Chuyển hướng đến trang xem phim:', movie.title);
    } else {
      alert('Phim này hiện chưa hỗ trợ xem online. Vui lòng đặt vé để xem tại rạp!');
    }
  }

  bookTicket(movie: Movie): void {
    console.log('Chuyển hướng đến logic đặt vé cho phim:', movie.title);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}
