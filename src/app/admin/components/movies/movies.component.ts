import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MovieRequestDto } from '../../../core/models/movie/movie-request.dto';
import { MovieResponseDto } from '../../../core/models/movie/movie-response.dto';
import { GenreService } from '../../../core/services/genre.service';
import { MovieService } from '../../../core/services/movie.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
})
export class MoviesComponent implements OnInit {
  movies: MovieResponseDto[] = [];
  totalItems = 0;
  page = 1;
  size = 10;
  query = '';
  statusFilter = '';

  showAddForm = false;
  showEditForm = false;
  selectedPoster: File | null = null;

  genres: any[] = [];
  movieForm: FormGroup;
  editMovie: MovieResponseDto | null = null;

  showGenreList = false;
  showEditGenreList = false;
  genreSearch = '';
  editGenreSearch = '';

  constructor(
    private movieService: MovieService,
    private genreService: GenreService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.movieForm = this.fb.group({
      title: ['', Validators.required],
      duration: ['', [Validators.required, Validators.min(1)]],
      releaseDate: ['', Validators.required],
      endDate: [''],
      isAvailableOnline: [false],
      trailerUrl: [''],
      videoUrl: [''],
      status: ['NOW_SHOWING', Validators.required],
      genreIds: [[]],
    });
  }

  ngOnInit(): void {
    this.loadMovies();
    this.loadGenres('');
  }

  loadMovies(): void {
    this.movieService
      .getMovies(this.page, this.size, this.query, this.statusFilter ? [this.statusFilter] : [])
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.movies = response.data.contents;
            this.totalItems = response.data.paging.totalRecord;
          }
        },
        error: (err) => console.error('Lỗi khi tải danh sách phim:', err),
      });
  }

  loadGenres(query: string): void {
    this.genreService.getGenres(query).subscribe({
      next: (response) => {
        if (response.data) this.genres = response.data;
      },
      error: (err) => console.error('Lỗi khi tải genres:', err),
    });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadMovies();
  }

  onPosterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedPoster = input.files[0];
    }
  }

  addMovie(): void {
    if (this.movieForm.invalid || !this.selectedPoster) {
      alert('Vui lòng điền đủ thông tin và chọn poster!');
      return;
    }
    const movie: MovieRequestDto = this.movieForm.value;
    this.movieService.addMovie(movie, this.selectedPoster).subscribe({
      next: (response) => {
        if (response.status.code === 200) alert('Thêm thành công');
        else alert('Thêm thất bại');
        this.loadMovies();
        this.cancelForm();
      },
      error: (error) => {
        if (error.status === 400 && error.error?.details) {
          for (const field in error.error.details) {
            console.log(`${field}: ${error.error.details[field]}`);
          }
        } else {
          console.error('Unexpected error:', error);
        }
      },
    });
  }

  openEditForm(movie: MovieResponseDto): void {
    this.editMovie = { ...movie };
    const genreIds = movie.genreNames
      .map((name: string) => this.genres.find((g: any) => g.name === name)?.id || 0)
      .filter((id: number) => id);
    this.movieForm.patchValue({
      title: movie.title,
      duration: movie.duration,
      releaseDate: movie.releaseDate,
      endDate: movie.endDate || '',
      isAvailableOnline: movie.isAvailableOnline,
      trailerUrl: movie.trailerUrl,
      videoUrl: movie.videoUrl || '',
      status: movie.status || 'NOW_SHOWING',
      genreIds: genreIds,
    });
    this.editGenreSearch = movie.genreNames.join(', ');
    this.showEditForm = true;
  }

  updateMovie(): void {
    if (this.movieForm.invalid || !this.editMovie) return;
    const movie: MovieRequestDto = this.movieForm.value;
    this.movieService.updateMovie(this.editMovie.id, movie).subscribe({
      next: () => {
        this.loadMovies();
        this.cancelForm();
      },
      error: (err) => console.error('Lỗi khi sửa phim:', err),
    });
  }

  deleteMovie(id: number): void {
    if (confirm('Bạn có chắc muốn xóa phim này?')) {
      this.movieService.deleteMovie(id).subscribe({
        next: () => this.loadMovies(),
        error: (err) => console.error('Lỗi khi xóa phim:', err),
      });
    }
  }

  viewMovieDetails(id: number): void {
    this.router.navigate([`/movies/${id}`]);
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.movieForm.reset({
      title: '',
      duration: '',
      releaseDate: '',
      endDate: '',
      isAvailableOnline: false,
      trailerUrl: '',
      videoUrl: '',
      status: 'NOW_SHOWING',
      genreIds: [],
    });
    this.selectedPoster = null;
    this.editMovie = null;
    this.genreSearch = '';
    this.editGenreSearch = '';
    this.showGenreList = false;
    this.showEditGenreList = false;
  }

  filterMovies(): void {
    this.page = 1;
    this.loadMovies();
  }

  onInputFocus(type: string, isEdit: boolean = false): void {
    if (type === 'genre') {
      isEdit ? (this.showEditGenreList = true) : (this.showGenreList = true);
    }
  }

  onInputBlur(type: string, isEdit: boolean = false): void {
    setTimeout(() => {
      if (type === 'genre') {
        isEdit ? (this.showEditGenreList = false) : (this.showGenreList = false);
      }
    }, 200);
  }

  selectGenre(genre: any, isEdit: boolean = false): void {
    const genreIds = isEdit
      ? this.movieForm.get('genreIds')?.value
      : this.movieForm.get('genreIds')?.value;
    if (!genreIds.includes(genre.id)) {
      genreIds.push(genre.id);
      this.movieForm.get('genreIds')?.setValue([...genreIds]);
    }
    if (isEdit) {
      this.editGenreSearch = genreIds
        .map((id: number) => this.genres.find((g: any) => g.id === id)?.name)
        .filter((name: string | undefined) => name)
        .join(', ');
      this.showEditGenreList = false;
    } else {
      this.genreSearch = genreIds
        .map((id: number) => this.genres.find((g: any) => g.id === id)?.name)
        .filter((name: string | undefined) => name)
        .join(', ');
      this.showGenreList = false;
    }
  }

  removeGenre(genreId: number): void {
    const genreIds = this.movieForm.get('genreIds')?.value.filter((id: number) => id !== genreId);
    this.movieForm.get('genreIds')?.setValue(genreIds);
    this.genreSearch = genreIds
      .map((id: number) => this.genres.find((g: any) => g.id === id)?.name)
      .filter((name: string | undefined) => name)
      .join(', ');
    this.editGenreSearch = genreIds
      .map((id: number) => this.genres.find((g: any) => g.id === id)?.name)
      .filter((name: string | undefined) => name)
      .join(', ');
  }

  getGenreNameById(id: number): string | undefined {
    return this.genres.find((g: any) => g.id === id)?.name;
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.size);
  }
}
