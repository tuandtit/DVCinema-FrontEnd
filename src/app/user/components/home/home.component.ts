import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Movie } from '../../../core/models/movie/movie.model';
import { MovieService } from '../../../core/services/movie.service';
import { MovieResponseDto } from '../../../core/models/movie/movie-response.dto';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
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
  isLoading: boolean = false; // Thêm loading state

  constructor(
    private movieService: MovieService,
    private sanitizer: DomSanitizer
  ) {}

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

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.isLoading = true;

    // Ánh xạ filterType thành các tham số lọc cho API
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

    // Gọi API với các tham số lọc và phân trang
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

          // this.totalRecord = response.data.paging.totalRecord;
          this.totalPages = response.data.paging.totalPage;

          this.filteredMovies = this.movies; // Dữ liệu đã được lọc từ server
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
    // Logic gốc (khôi phục sau khi backend cập nhật):
    // this.featuredMovies = this.movies.filter(movie => movie.availableOnline).slice(0, 3);
  }

  getPaginatedMovies(): Movie[] {
    return this.filteredMovies; // Dữ liệu đã được phân trang từ server
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadMovies();
    }
  }

  setFilter(filterType: string): void {
    this.filterType = filterType;
    this.currentPage = 1; // Reset về trang 1 khi thay đổi bộ lọc
    this.loadMovies();
  }

  viewDetails(movie: Movie): void {
    console.log('Xem chi tiết phim:', movie.title);
  }

  closeTrailerModal(): void {
    this.showTrailerModal = false;
    this.safeTrailerUrl = null;
  }

  playTrailer(movie: Movie): void {
    console.log('Phát trailer phim:', movie.title);
    this.selectMovieTile = movie.title;
    if (movie?.trailer) {
      // Bước 1: Chuyển "watch?v=" thành "embed/"
      const embedUrl = movie.trailer.replace('watch?v=', 'embed/');

      // Bước 2: Thêm các tham số
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
