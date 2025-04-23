import { Component, OnInit } from '@angular/core';
import { Movie } from '../../core/models/movie/movie.model';
import { MovieService } from '../../core/service/movie.service';
import { MovieResponseDto } from '../../core/models/movie/movie-response.dto';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  movies: Movie[] = [];
  featuredMovies: Movie[] = [];
  filteredMovies: Movie[] = [];
  filterType: string = 'all';
  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number = 1;
  // totalRecord: number = 0;
  isLoading: boolean = false; // Thêm loading state

  constructor(private movieService: MovieService) {}

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
            console.error('Lỗi từ API:', response.status.message);
            this.isLoading = false;
            return;
          }

          this.movies = response.data.contents.map((dto: MovieResponseDto) => ({
            id: dto.id,
            title: dto.title,
            poster:
              'https://files.betacorp.vn/media%2fimages%2f2025%2f03%2f28%2f400x633%2D114754%2D280325%2D84.jpg',
            description: dto.description,
            genre: dto.genreNames.join(', '),
            duration: dto.duration,
            availableOnline: dto.isAvailableOnline,
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

  playTrailer(movie: Movie): void {
    console.log('Phát trailer phim:', movie.title);
  }

  watchMovie(movie: Movie): void {
    if (movie.availableOnline) {
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
