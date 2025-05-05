// Đã chỉnh sửa và tối ưu mã nguồn
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MovieRequestDto } from '../../../core/models/movie/movie-request.dto';
import { MovieResponseDto } from '../../../core/models/movie/movie-response.dto';
import { ContributorService } from '../../../core/services/contributor.service';
import { GenreService } from '../../../core/services/genre.service';
import { MovieService } from '../../../core/services/movie.service';

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
  isAvailableOnline: boolean | null = null;

  showAddForm = false;
  showEditForm = false;
  selectedPoster: File | null = null;

  directors: any[] = [];
  actors: any[] = [];
  genres: any[] = [];

  movieForm: FormGroup;
  editMovie: MovieResponseDto | null = null;

  showDirectorList = false;
  showActorList = false;
  showGenreList = false;
  showEditDirectorList = false;
  showEditActorList = false;
  showEditGenreList = false;

  directorSearch = '';
  actorSearch = '';
  genreSearch = '';
  editDirectorSearch = '';
  editActorSearch = '';
  editGenreSearch = '';

  constructor(
    private movieService: MovieService,
    private contributorService: ContributorService,
    private genreService: GenreService,
    private fb: FormBuilder
  ) {
    this.movieForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      duration: ['', [Validators.required, Validators.min(1)]],
      releaseDate: ['', Validators.required],
      isAvailableOnline: [false],
      trailerUrl: [''],
      videoUrl: [''],
      status: ['SHOWING', Validators.required],
      directorId: [0, Validators.required],
      actorIds: [[]],
      genreIds: [[]],
    });
  }

  ngOnInit(): void {
    this.loadMovies();
    this.loadContributors('DIRECTOR');
    this.loadContributors('ACTOR');
    this.loadGenres('');
  }

  loadMovies(): void {
    this.movieService
      .getMovies(this.page, this.size, this.query, this.statusFilter ? [this.statusFilter] : [], this.isAvailableOnline)
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

  loadContributors(type: 'DIRECTOR' | 'ACTOR'): void {
    const search = type === 'DIRECTOR' ? this.directorSearch : this.actorSearch;
    this.contributorService.getContributors(this.page, this.size, search, type).subscribe({
      next: (response) => {
        if (response.data) {
          if (type === 'DIRECTOR') this.directors = response.data.contents;
          else this.actors = response.data.contents;
        }
      },
      error: (err) => console.error('Lỗi khi tải contributors:', err),
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
    const director = this.directors.find((d: any) => d.name === movie.directorName);
    const actorIds = movie.actorNames
      .map((name: string) => this.actors.find((a: any) => a.name === name)?.id || 0)
      .filter((id: number) => id);
    const genreIds = movie.genreNames
      .map((name: string) => this.genres.find((g: any) => g.name === name)?.id || 0)
      .filter((id: number) => id);
    this.movieForm.patchValue({
      title: movie.title,
      description: movie.description,
      duration: movie.duration,
      releaseDate: movie.releaseDate,
      isAvailableOnline: movie.isAvailableOnline,
      trailerUrl: movie.trailerUrl,
      videoUrl: movie.videoUrl || '',
      status: movie.status || 'SHOWING',
      directorId: director ? director.id : 0,
      actorIds: actorIds,
      genreIds: genreIds,
    });
    this.editDirectorSearch = director ? director.name : '';
    this.editActorSearch = movie.actorNames.join(', ');
    this.editGenreSearch = movie.genreNames.join(', ');
    this.showEditForm = true;
  }

  updateMovie(): void {
    if (this.movieForm.invalid || !this.editMovie) return;

    const movie: MovieRequestDto = this.movieForm.value;
    this.movieService.updateMovie(this.editMovie.id, movie).subscribe({
      next: (response: any) => {
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

  cancelForm(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.movieForm.reset({
      title: '',
      description: '',
      duration: '',
      releaseDate: '',
      isAvailableOnline: false,
      trailerUrl: '',
      videoUrl: '',
      status: 'SHOWING',
      directorId: 0,
      actorIds: [],
      genreIds: [],
    });
    this.selectedPoster = null;
    this.editMovie = null;
    this.directorSearch = '';
    this.actorSearch = '';
    this.genreSearch = '';
    this.editDirectorSearch = '';
    this.editActorSearch = '';
    this.editGenreSearch = '';
    this.showDirectorList = false;
    this.showActorList = false;
    this.showGenreList = false;
    this.showEditDirectorList = false;
    this.showEditActorList = false;
    this.showEditGenreList = false;
  }

  filterMovies(): void {
    debugger;
    this.page = 1; // Reset về trang 1 khi lọc
    this.loadMovies(); // Gọi lại loadMovies với các tham số lọc đã cập nhật
  }

  // Autocomplete handlers
  onInputFocus(type: string, isEdit: boolean = false): void {
    if (isEdit) {
      switch (type) {
        case 'director':
          this.showEditDirectorList = true;
          break;
        case 'actor':
          this.showEditActorList = true;
          break;
        case 'genre':
          this.showEditGenreList = true;
          break;
      }
    } else {
      switch (type) {
        case 'director':
          this.showDirectorList = true;
          break;
        case 'actor':
          this.showActorList = true;
          break;
        case 'genre':
          this.showGenreList = true;
          break;
      }
    }
  }

  onInputBlur(type: string, isEdit: boolean = false): void {
    setTimeout(() => {
      if (isEdit) {
        switch (type) {
          case 'director':
            this.showEditDirectorList = false;
            break;
          case 'actor':
            this.showEditActorList = false;
            break;
          case 'genre':
            this.showEditGenreList = false;
            break;
        }
      } else {
        switch (type) {
          case 'director':
            this.showDirectorList = false;
            break;
          case 'actor':
            this.showActorList = false;
            break;
          case 'genre':
            this.showGenreList = false;
            break;
        }
      }
    }, 200);
  }

  selectDirector(director: any, isEdit: boolean = false): void {
    if (isEdit) {
      this.movieForm.get('directorId')?.setValue(director.id);
      this.editDirectorSearch = director.name;
      this.showEditDirectorList = false;
    } else {
      this.movieForm.get('directorId')?.setValue(director.id);
      this.directorSearch = director.name;
      this.showDirectorList = false;
    }
  }

  selectActor(actor: any, isEdit: boolean = false): void {
    const actorIds = isEdit
      ? this.movieForm.get('actorIds')?.value
      : this.movieForm.get('actorIds')?.value;
    if (!actorIds.includes(actor.id)) {
      actorIds.push(actor.id);
      this.movieForm.get('actorIds')?.setValue([...actorIds]);
    }
    if (isEdit) {
      this.editActorSearch = actorIds
        .map((id: number) => this.actors.find((a: any) => a.id === id)?.name)
        .filter((name: string | undefined) => name)
        .join(', ');
      this.showEditActorList = false;
    } else {
      this.actorSearch = actorIds
        .map((id: number) => this.actors.find((a: any) => a.id === id)?.name)
        .filter((name: string | undefined) => name)
        .join(', ');
      this.showActorList = false;
    }
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

  removeActor(actorId: number): void {
    const actorIds = this.movieForm.get('actorIds')?.value.filter((id: number) => id !== actorId);
    this.movieForm.get('actorIds')?.setValue(actorIds);
    this.actorSearch = actorIds
      .map((id: number) => this.actors.find((a: any) => a.id === id)?.name)
      .filter((name: string | undefined) => name)
      .join(', ');
    this.editActorSearch = actorIds
      .map((id: number) => this.actors.find((a: any) => a.id === id)?.name)
      .filter((name: string | undefined) => name)
      .join(', ');
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

  getActorNameById(id: number): string | undefined {
    return this.actors.find((a: any) => a.id === id)?.name;
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.size);
  }
}
