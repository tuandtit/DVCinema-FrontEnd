import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MovieResponseDto } from '../../../core/models/movie/movie-response.dto';
import { GenreDto } from '../../../core/models/movie/genre.dto';
import { ContributorDto } from '../../../core/models/contributor/contributor-search-result.model';
import { MovieService } from '../../../core/services/movie.service';
import { GenreService } from '../../../core/services/genre.service';
import { ContributorService } from '../../../core/services/contributor.service';
import { MovieRequestDto } from '../../../core/models/movie/movie-request.dto';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
  standalone: false,
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
  editMovie: MovieResponseDto | null = null;

  genres: GenreDto[] = [];
  directors: ContributorDto[] = [];
  actors: ContributorDto[] = [];
  genreSearch = '';
  directorSearch = '';
  actorSearch = '';
  showGenreList = false;
  showDirectorList = false;
  showActorList = false;

  movieForm: FormGroup;

  constructor(
    private movieService: MovieService,
    private genreService: GenreService,
    private contributorService: ContributorService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.movieForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      genreIds: [[]],
      directorId: [0, Validators.min(1)],
      actorIds: [[]],
      duration: ['', [Validators.required, Validators.min(1)]],
      releaseDate: ['', Validators.required],
      endDate: [''],
      trailerUrl: [''],
      videoUrl: [''],
      status: ['NOW_SHOWING', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadMovies();
    this.loadGenres('');
    this.loadContributors('', 'DIRECTOR');
    this.loadContributors('', 'ACTOR');
  }

  loadMovies(): void {
    this.movieService
      .getMovies(this.page - 1, this.size, this.query, this.statusFilter ? [this.statusFilter] : [])
      .subscribe({
        next: (response) => {
          if (response.status.code === 200) {
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
        if (response.status.code === 200) {
          this.genres = response.data;
        }
      },
      error: (err) => console.error('Lỗi khi tải thể loại:', err),
    });
  }

  loadContributors(query: string, type: string): void {
    this.contributorService.getContributors(0, 10, query, type).subscribe({
      next: (response) => {
        if (response.status.code === 200) {
          if (type === 'DIRECTOR') {
            this.directors = response.data.contents;
          } else if (type === 'ACTOR') {
            this.actors = response.data.contents;
          }
        }
      },
      error: (err) => console.error(`Lỗi khi tải ${type.toLowerCase()}:`, err),
    });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadMovies();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.size);
  }

  onPosterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedPoster = input.files[0];
    }
  }

  openAddForm(): void {
    this.showAddForm = true;
    this.movieForm.reset({
      title: '',
      description: '',
      genreIds: [],
      directorId: 0,
      actorIds: [],
      duration: '',
      releaseDate: '',
      endDate: '',
      trailerUrl: '',
      videoUrl: '',
      status: 'NOW_SHOWING',
    });
    this.selectedPoster = null;
    this.genreSearch = '';
    this.directorSearch = '';
    this.actorSearch = '';
  }

  openEditForm(movie: MovieResponseDto): void {
    this.editMovie = { ...movie };
    this.movieForm.patchValue({
      title: movie.title,
      description: movie.description || '',
      genreIds: movie.genres.map((g) => g.id) || [],
      directorId: movie.director?.id || 0,
      actorIds: movie.actors.map((a) => a.id) || [],
      duration: movie.duration,
      releaseDate: movie.releaseDate,
      endDate: movie.endDate || '',
      trailerUrl: movie.trailerUrl || '',
      videoUrl: movie.videoUrl || '',
      status: movie.status || 'NOW_SHOWING',
    });
    this.genreSearch = movie.genres.map((g) => g.name).join(', ') || '';
    this.directorSearch = movie.director?.name || '';
    this.actorSearch = movie.actors.map((a) => a.name).join(', ') || '';
    this.showEditForm = true;
  }

  addMovie(): void {
    if (this.movieForm.invalid) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (!this.selectedPoster) {
      alert('Vui lòng chọn poster!');
      return;
    }
    const movie: MovieRequestDto = this.movieForm.value;
    this.movieService.addMovie(movie, this.selectedPoster).subscribe({
      next: (response) => {
        if (response.status.code === 200) {
          alert('Thêm phim thành công!');
          this.loadMovies();
          this.cancelForm();
        } else {
          alert('Thêm phim thất bại!');
        }
      },
      error: (err) => {
        alert('Lỗi khi thêm phim: ' + (err.error?.message || 'Unknown error'));
      },
    });
  }

  updateMovie(): void {
    if (this.movieForm.invalid || !this.editMovie) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    const movie: MovieRequestDto = this.movieForm.value;
    this.movieService.updateMovie(this.editMovie.id, movie, this.selectedPoster).subscribe({
      next: (response) => {
        if (response.status.code === 200) {
          alert('Cập nhật phim thành công!');
          this.loadMovies();
          this.cancelForm();
        } else {
          alert('Cập nhật phim thất bại!');
        }
      },
      error: (err) => {
        alert('Lỗi khi cập nhật phim: ' + (err.error?.message || 'Unknown error'));
      },
    });
  }

  deleteMovie(id: number): void {
    if (confirm('Bạn có chắc muốn xóa phim này?')) {
      this.movieService.deleteMovie(id).subscribe({
        next: (response) => {
          alert('Xóa phim thành công!');
          this.loadMovies();
        },
        error: (err) => {
          alert('Lỗi khi xóa phim: ' + (err.error?.message || 'Unknown error'));
        },
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
      description: '',
      genreIds: [],
      directorId: 0,
      actorIds: [],
      duration: '',
      releaseDate: '',
      endDate: '',
      trailerUrl: '',
      videoUrl: '',
      status: 'NOW_SHOWING',
    });
    this.selectedPoster = null;
    this.editMovie = null;
    this.genreSearch = '';
    this.directorSearch = '';
    this.actorSearch = '';
    this.showGenreList = false;
    this.showDirectorList = false;
    this.showActorList = false;
  }

  filterMovies(): void {
    this.page = 1;
    this.loadMovies();
  }

  onInputFocus(type: string): void {
    if (type === 'genre') {
      this.showGenreList = true;
    } else if (type === 'director') {
      this.showDirectorList = true;
    } else if (type === 'actor') {
      this.showActorList = true;
    }
  }

  onInputBlur(type: string): void {
    setTimeout(() => {
      if (type === 'genre') {
        this.showGenreList = false;
      } else if (type === 'director') {
        this.showDirectorList = false;
      } else if (type === 'actor') {
        this.showActorList = false;
      }
    }, 200);
  }

  selectGenre(genre: GenreDto): void {
    const genreIds = this.movieForm.get('genreIds')?.value || [];
    if (!genreIds.includes(genre.id)) {
      genreIds.push(genre.id);
      this.movieForm.get('genreIds')?.setValue([...genreIds]);
      this.genreSearch = genreIds
        .map((id: number) => this.genres.find((g) => g.id === id)?.name)
        .filter((name: string | undefined) => name)
        .join(', ');
    }
    this.showGenreList = false;
  }

  selectDirector(director: ContributorDto): void {
    this.movieForm.get('directorId')?.setValue(director.id);
    this.directorSearch = director.name;
    this.showDirectorList = false;
  }

  selectActor(actor: ContributorDto): void {
    const actorIds = this.movieForm.get('actorIds')?.value || [];
    if (!actorIds.includes(actor.id)) {
      actorIds.push(actor.id);
      this.movieForm.get('actorIds')?.setValue([...actorIds]);
      this.actorSearch = actorIds
        .map((id: number) => this.actors.find((a) => a.id === id)?.name)
        .filter((name: string | undefined) => name)
        .join(', ');
    }
    this.showActorList = false;
  }

  removeGenre(genreId: number): void {
    const genreIds = this.movieForm.get('genreIds')?.value.filter((id: number) => id !== genreId);
    this.movieForm.get('genreIds')?.setValue(genreIds);
    this.genreSearch = genreIds
      .map((id: number) => this.genres.find((g) => g.id === id)?.name)
      .filter((name: string | undefined) => name)
      .join(', ');
  }

  removeDirector(): void {
    this.movieForm.get('directorId')?.setValue(0);
    this.directorSearch = '';
  }

  removeActor(actorId: number): void {
    const actorIds = this.movieForm.get('actorIds')?.value.filter((id: number) => id !== actorId);
    this.movieForm.get('actorIds')?.setValue(actorIds);
    this.actorSearch = actorIds
      .map((id: number) => this.actors.find((a) => a.id === id)?.name)
      .filter((name: string | undefined) => name)
      .join(', ');
  }

  getGenreNameById(id: number): string | undefined {
    return this.genres.find((g) => g.id === id)?.name;
  }

  getContributorNameById(id: number, contributors: ContributorDto[]): string | undefined {
    return contributors.find((c) => c.id === id)?.name;
  }

  getGenreNames(genres: GenreDto[]): string {
    return genres.length > 0 ? genres.map((g) => g.name).join(', ') : 'Chưa có';
  }

  getActorNames(actors: ContributorDto[]): string {
    return actors.length > 0 ? actors.map((a) => a.name).join(', ') : 'Chưa có';
  }
}
