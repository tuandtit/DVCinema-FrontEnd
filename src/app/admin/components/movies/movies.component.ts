import { Component, OnInit } from '@angular/core';

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number; // Thời lượng (phút)
  releaseDate: string; // Ngày phát hành (YYYY-MM-DD)
  status: 'showing' | 'upcoming'; // Trạng thái: Đang chiếu hoặc Sắp chiếu
}

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss']
})
export class MoviesComponent implements OnInit {
  movies: Movie[] = [
    { id: 1, title: 'The Matrix', genre: 'Khoa học viễn tưởng', duration: 136, releaseDate: '1999-03-31', status: 'showing' },
    { id: 2, title: 'Inception', genre: 'Hành động', duration: 148, releaseDate: '2010-07-16', status: 'showing' },
    { id: 3, title: 'Dune: Part Two', genre: 'Khoa học viễn tưởng', duration: 166, releaseDate: '2024-03-01', status: 'upcoming' }
  ];

  filteredMovies: Movie[] = [...this.movies]; // Danh sách phim sau khi lọc/tìm kiếm
  searchTerm: string = '';
  statusFilter: string = 'all'; // Lọc theo trạng thái: all, showing, upcoming

  showAddForm: boolean = false; // Hiển thị form thêm phim
  showEditForm: boolean = false; // Hiển thị form sửa phim
  newMovie: Movie = { id: 0, title: '', genre: '', duration: 0, releaseDate: '', status: 'showing' };
  editMovie: Movie | null = null;

  ngOnInit(): void {
    this.filterMovies();
  }

  // Tìm kiếm và lọc phim
  filterMovies(): void {
    let tempMovies = [...this.movies];

    // Tìm kiếm theo tên phim
    if (this.searchTerm) {
      tempMovies = tempMovies.filter(movie =>
        movie.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Lọc theo trạng thái
    if (this.statusFilter !== 'all') {
      tempMovies = tempMovies.filter(movie => movie.status === this.statusFilter);
    }

    this.filteredMovies = tempMovies;
  }

  // Thêm phim mới
  addMovie(): void {
    if (!this.newMovie.title || !this.newMovie.genre || !this.newMovie.duration || !this.newMovie.releaseDate) {
      alert('Vui lòng điền đầy đủ thông tin phim!');
      return;
    }

    const newId = this.movies.length ? Math.max(...this.movies.map(m => m.id)) + 1 : 1;
    this.movies.push({ ...this.newMovie, id: newId });
    this.filteredMovies = [...this.movies];
    this.newMovie = { id: 0, title: '', genre: '', duration: 0, releaseDate: '', status: 'showing' };
    this.showAddForm = false;
    this.filterMovies();
  }

  // Mở form sửa phim
  openEditForm(movie: Movie): void {
    this.editMovie = { ...movie };
    this.showEditForm = true;
  }

  // Sửa phim
  updateMovie(): void {
    if (!this.editMovie) return;

    const index = this.movies.findIndex(m => m.id === this.editMovie!.id);
    if (index !== -1) {
      this.movies[index] = { ...this.editMovie };
      this.filteredMovies = [...this.movies];
      this.editMovie = null;
      this.showEditForm = false;
      this.filterMovies();
    }
  }

  // Xóa phim
  deleteMovie(id: number): void {
    if (confirm('Bạn có chắc muốn xóa phim này?')) {
      this.movies = this.movies.filter(movie => movie.id !== id);
      this.filteredMovies = [...this.movies];
      this.filterMovies();
    }
  }

  // Hủy form
  cancelForm(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.newMovie = { id: 0, title: '', genre: '', duration: 0, releaseDate: '', status: 'showing' };
    this.editMovie = null;
  }
}