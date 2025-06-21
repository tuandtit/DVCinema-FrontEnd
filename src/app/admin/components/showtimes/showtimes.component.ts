import { Component, OnInit } from '@angular/core';
import { ApiResponse } from '../../../core/models/base-response/api.response';
import { PagingResponse } from '../../../core/models/base-response/paging-response.dto';
import { Cinema } from '../../../core/models/cinema/cinema.model';
import { MovieResponseDto } from '../../../core/models/movie/movie-response.dto';
import { ShowtimeRequestDto } from '../../../core/models/showtime/showtime.request';
import { ShowtimeResponseDto } from '../../../core/models/showtime/showtime.response';
import { CinemaService } from '../../../core/services/cinema.service';
import { MovieService } from '../../../core/services/movie.service';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { Room } from '../../../core/models/cinema/room.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-showtimes',
  templateUrl: './showtimes.component.html',
  styleUrls: ['./showtimes.component.scss'],
  standalone: false,
})
export class ShowtimesComponent implements OnInit {
  showtimes: ShowtimeResponseDto[] = [];
  filteredShowtimes: ShowtimeResponseDto[] = [];
  cinemas: Cinema[] = [];
  selectedCinemaId: number = 0;
  selectedCinemaRooms: Room[] = [];
  selectedShowDate: string = new Date().toISOString().split('T')[0];
  today: string = new Date().toISOString().split('T')[0];

  showAddForm: boolean = false;
  showMovieDropdown: boolean = false;
  newShowtime: ShowtimeResponseDto = {
    id: 0,
    movieId: 0,
    movieTitle: '',
    roomId: 0,
    roomName: '',
    cinemaId: 0,
    cinemaName: '',
    showDate: this.selectedShowDate,
    startTime: '',
    endTime: '',
    ticketPrice: 0,
  };

  // Movie search
  movies: MovieResponseDto[] = [];
  movieSearchQuery: string = '';
  moviePage: number = 0;
  moviePageSize: number = 10;
  totalMovies: number = 0;
  loadingMovies: boolean = false;
  hasMoreMovies: boolean = true;

  constructor(
    private showtimeService: ShowtimeService,
    private cinemaService: CinemaService,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    this.loadCinemas();
  }

  loadCinemas(): void {
    this.cinemaService.getAllCinemas().subscribe({
      next: (response: ApiResponse<Cinema[]>) => {
        if (response.status.code === 200 && response.data) {
          this.cinemas = response.data;
          if (this.cinemas.length > 1) {
            this.selectedCinemaId = this.cinemas[1].id;
            this.updateSelectedCinemaRooms();
            this.loadShowtimes();
          } else if (this.cinemas.length > 0) {
            this.selectedCinemaId = this.cinemas[0].id;
            this.updateSelectedCinemaRooms();
            this.loadShowtimes();
          } else {
            console.error('Không có rạp chiếu nào được tải.');
          }
        } else {
          this.cinemas = [];
          console.error('Không thể tải danh sách rạp:', response.message);
        }
      },
      error: (err) => {
        this.cinemas = [];
        console.error('Lỗi khi tải danh sách rạp:', err);
      },
    });
  }

  updateSelectedCinemaRooms(): void {
    const selectedCinema = this.cinemas.find((c) => c.id === this.selectedCinemaId);
    this.selectedCinemaRooms = selectedCinema?.rooms || [];
  }

  updateCinemaRoomsForAddForm(): void {
    console.log('id của rạp được chọn: ', this.newShowtime.cinemaId);
    console.log('cinemas hiện tại', this.cinemas);
    const selectedCinema = this.cinemas.find((c) => c.id == this.newShowtime.cinemaId);
    console.log('selectedCinema: ', selectedCinema);
    if (selectedCinema && selectedCinema.rooms) {
      this.selectedCinemaRooms = selectedCinema.rooms;
      this.newShowtime.cinemaName = selectedCinema.name || '';
      this.newShowtime.roomId = selectedCinema.rooms.length > 0 ? selectedCinema.rooms[0].id : 0;
      this.newShowtime.roomName =
        selectedCinema.rooms.length > 0 ? selectedCinema.rooms[0].name : '';
    } else {
      this.selectedCinemaRooms = [];
      this.newShowtime.cinemaName = '';
      this.newShowtime.roomId = 0;
      this.newShowtime.roomName = '';
      console.warn(
        `Không tìm thấy rạp hoặc phòng chiếu cho cinemaId: ${this.newShowtime.cinemaId}`
      );
    }
  }

  onCinemaChange(): void {
    this.updateSelectedCinemaRooms();
    this.loadShowtimes();
  }

  loadShowtimes(): void {
    if (!this.selectedCinemaId) {
      this.showtimes = [];
      this.filteredShowtimes = [];
      return;
    }
    this.showtimeService
      .getByCinemaIdAndShowDate(this.selectedCinemaId, this.selectedShowDate)
      .subscribe({
        next: (response: ApiResponse<ShowtimeResponseDto[]>) => {
          if (response.status.code === 200 && response.data) {
            this.showtimes = response.data.map((showtime) => ({
              ...showtime,
              startTime: `${showtime.showDate}T${showtime.startTime}`,
              endTime: showtime.endTime ? `${showtime.showDate}T${showtime.endTime}` : '',
            }));
            this.filteredShowtimes = [...this.showtimes];
          } else {
            this.showtimes = [];
            this.filteredShowtimes = [];
            console.error('Không thể tải danh sách suất chiếu:', response.message);
          }
        },
        error: (err) => {
          this.showtimes = [];
          this.filteredShowtimes = [];
          console.error('Lỗi khi tải danh sách suất chiếu:', err);
        },
      });
  }

  openAddForm(): void {
    this.showAddForm = true;
    this.newShowtime = {
      id: 0,
      movieId: 0,
      movieTitle: '',
      roomId: 0,
      roomName: '',
      cinemaId:
        this.cinemas.length > 1
          ? this.cinemas[1].id
          : this.cinemas.length > 0
            ? this.cinemas[0].id
            : 0,
      cinemaName:
        this.cinemas.length > 1
          ? this.cinemas[1].name
          : this.cinemas.length > 0
            ? this.cinemas[0].name
            : '',
      showDate: this.today,
      startTime: '',
      endTime: '',
      ticketPrice: 0,
    };
    this.updateCinemaRoomsForAddForm();
    this.movieSearchQuery = '';
    this.movies = [];
    this.moviePage = 0;
    this.hasMoreMovies = true;
  }

  loadMovies(): void {
    if (this.loadingMovies || !this.hasMoreMovies) return;

    this.loadingMovies = true;
    this.showMovieDropdown = true;

    this.movieService
      .getMovies(this.moviePage, this.moviePageSize, this.movieSearchQuery, '', [])
      .subscribe({
        next: (response: ApiResponse<PagingResponse<MovieResponseDto>>) => {
          if (response.status.code === 200 && response.data) {
            const newMovies = response.data.contents;
            this.movies = this.moviePage === 0 ? newMovies : [...this.movies, ...newMovies];
            this.totalMovies = response.data.paging.totalRecord;
            this.hasMoreMovies = this.movies.length < this.totalMovies;
            this.moviePage++;
          } else {
            this.movies = [];
            this.hasMoreMovies = false;
            console.error('Không thể tải danh sách phim:', response.message);
          }
          this.loadingMovies = false;
        },
        error: (err) => {
          this.movies = [];
          this.hasMoreMovies = false;
          this.loadingMovies = false;
          console.error('Lỗi khi tải danh sách phim:', err);
        },
      });
  }

  searchMovies(): void {
    this.moviePage = 0;
    this.movies = [];
    this.hasMoreMovies = true;
    this.loadMovies();
  }

  onMovieListScroll(event: Event): void {
    const element = event.target as HTMLElement;
    if (
      element.scrollTop + element.clientHeight >= element.scrollHeight - 50 &&
      !this.loadingMovies &&
      this.hasMoreMovies
    ) {
      this.loadMovies();
    }
  }

  selectMovie(movie: MovieResponseDto): void {
    this.newShowtime.movieId = movie.id;
    this.newShowtime.movieTitle = movie.title;
    this.movieSearchQuery = movie.title;
    this.showMovieDropdown = false;
  }

  updateRoomName(): void {
    const selectedRoom = this.selectedCinemaRooms.find((r) => r.id === this.newShowtime.roomId);
    this.newShowtime.roomName = selectedRoom?.name || '';
  }

  getGenres(movie: MovieResponseDto): string {
    return movie.genres?.map((g) => g.name).join(', ') || '';
  }

  addShowtime(): void {
    if (
      !this.newShowtime.movieId ||
      !this.newShowtime.roomId ||
      !this.newShowtime.cinemaId ||
      !this.newShowtime.showDate ||
      !this.newShowtime.startTime
    ) {
      alert(
        'Vui lòng điền đầy đủ thông tin: Rạp, Phòng chiếu, Phim, Ngày chiếu, Thời gian bắt đầu!'
      );
      return;
    }

    const showDate = new Date(this.newShowtime.showDate);
    const today = new Date(this.today);
    const todayStart = new Date(today.setHours(0, 0, 0, 0));

    if (showDate < todayStart) {
      alert('Ngày chiếu phải là hôm nay hoặc trong tương lai!');
      return;
    }

    const showtimeRequest: ShowtimeRequestDto = {
      movieId: this.newShowtime.movieId,
      roomId: this.newShowtime.roomId,
      showDate: this.newShowtime.showDate,
      startTime: this.newShowtime.startTime,
    };

    this.showtimeService.createShowtime(showtimeRequest).subscribe({
      next: (response: ApiResponse<ShowtimeResponseDto>) => {
        if (response.status.code === 200 && response.data) {
          const newShowtime = {
            ...response.data,
            startTime: `${response.data.showDate}T${response.data.startTime}`,
            endTime: response.data.endTime
              ? `${response.data.showDate}T${response.data.endTime}`
              : '',
          };
          this.showtimes.push(newShowtime);
          this.filteredShowtimes = [...this.showtimes];
          this.showAddForm = false;
          this.cancelForm();
        } else {
          alert('Không thể thêm suất chiếu: ' + response.message);
        }
      },
      error: (err: HttpErrorResponse) => {
        let backendMessage = 'Đã xảy ra lỗi khi thêm suất chiếu.';

        try {
          // Nếu err.error là chuỗi JSON, parse ra
          const errorBody = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;

          backendMessage = errorBody?.details?.service || errorBody?.message || backendMessage;
        } catch (e) {
          console.warn('Không thể parse JSON từ err.error:', e);
        }

        alert(backendMessage);
        console.error('Chi tiết lỗi:', err);
      },
    });
  }

  deleteShowtime(id: number): void {
    if (confirm('Bạn có chắc muốn xóa suất chiếu này?')) {
      this.showtimeService.deleteShowtime(id).subscribe({
        next: (response: ApiResponse<void>) => {
          if (response.status.code === 204) {
            this.showtimes = this.showtimes.filter((showtime) => showtime.id !== id);
            this.filteredShowtimes = [...this.showtimes];
            alert('Xóa suất chiếu thành công!');
            this.loadShowtimes();
          } else {
            alert('Không thể xóa suất chiếu: ' + response.message);
          }
        },
        error: (err) => {
          const errorMsg =
            err.error?.details?.service || err.error?.message || 'Đã xảy ra lỗi khi xóa suất chiếu';
          alert(errorMsg);
          console.error('Lỗi khi xóa suất chiếu:', err.error);
        },
      });
    }
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.showMovieDropdown = false;
    this.newShowtime = {
      id: 0,
      movieId: 0,
      movieTitle: '',
      roomId: 0,
      roomName: '',
      cinemaId: 0,
      cinemaName: '',
      showDate: this.selectedShowDate,
      startTime: '',
      endTime: '',
      ticketPrice: 0,
    };
    this.selectedCinemaRooms = [];
    this.movieSearchQuery = '';
    this.movies = [];
    this.moviePage = 0;
    this.hasMoreMovies = true;
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  }
}
