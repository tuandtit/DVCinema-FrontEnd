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
  pageSize: number = 8; // Cập nhật thành 8 item mỗi trang
  totalPages: number = 1;

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.movieService.getMovies(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.status.code !== 200) {
          console.error('Lỗi từ API:', response.status.message);
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
        debugger;
        this.totalPages = response.data.paging.totalPage;

        this.loadFeaturedMovies();
        this.filterMovies();
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách phim:', err);
      },
    });
  }

  loadFeaturedMovies(): void {
    // Tạm thời lấy 3 phim đầu tiên do API hiện tại không có phim nào availableOnline
    this.featuredMovies = this.movies.slice(0, 3);
    // Logic gốc (khôi phục sau khi backend cập nhật):
    // this.featuredMovies = this.movies.filter(movie => movie.availableOnline).slice(0, 3);
  }

  filterMovies(): void {
    let filtered = [...this.movies];
    const now = new Date();

    switch (this.filterType) {
      case 'new':
        filtered = filtered.filter((movie) => {
          const releaseDate = new Date(movie.releaseDate || '');
          return releaseDate <= now && movie.status !== 'COMING_SOON';
        });
        break;
      case 'popular':
        filtered = filtered.filter((movie) => movie.availableOnline);
        break;
      case 'upcoming':
        filtered = filtered.filter((movie) => movie.status === 'COMING_SOON');
        break;
      case 'all':
      default:
        filtered = [...this.movies];
        break;
    }

    this.filteredMovies = filtered;
    // this.calculateTotalPages();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredMovies.length / this.pageSize);
  }

  getPaginatedMovies(): Movie[] {
    return this.filteredMovies;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadMovies();
    }
  }

  setFilter(filterType: string): void {
    this.filterType = filterType;
    this.filterMovies();
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
