import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../../core/services/movie.service';
import { ContributorService } from '../../../core/services/contributor.service';
import { MovieResponseDto } from '../../../core/models/movie/movie-response.dto';
import { Movie } from '../../../core/models/movie/movie.model';
import { ContributorDto } from '../../../core/models/contributor/contributor-search-result.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GenreDto } from '../../../core/models/movie/genre.dto';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
  standalone: false,
})
export class SearchPageComponent implements OnInit {
  query: string = '';
  searchType: 'movies' | 'actors' = 'movies';
  movies: Movie[] = [];
  actors: ContributorDto[] = [];
  totalPages: number = 0;
  currentPage: number = 1;
  pageSize: number = 12;
  showTrailerModal: boolean = false;
  safeTrailerUrl: SafeResourceUrl | null = null;
  selectMovieTile: string = '';
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private contributorService: ContributorService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.query = params['query'] || '';
      this.searchType = (params['type'] as 'movies' | 'actors') || 'movies';
      this.currentPage = +params['page'] || 1;
      this.search();
    });
  }

  async search(): Promise<void> {
    console.log('search started, isLoading:', this.isLoading);
    this.isLoading = true;
    try {
      if (this.searchType === 'movies') {
        const response = await this.movieService
          .getMovies(this.currentPage, this.pageSize, this.query, [])
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
        this.actors = [];
        this.totalPages = response.data.paging.totalPage || 0;
      } else {
        const response = await this.contributorService
          .getContributors(this.currentPage, this.pageSize, this.query, 'ACTOR')
          .toPromise();

        if (response.status.code !== 200) {
          console.error('Lỗi từ API:', response.status.timestamp);
          return;
        }
        this.actors = response.data.contents;
        this.movies = [];
        this.totalPages = response.data.paging.totalPage || 0;
      }
    } catch (err) {
      console.error(
        `Lỗi khi tìm kiếm ${this.searchType === 'movies' ? 'phim' : 'diễn viên'}:`,
        err
      );
    } finally {
      this.isLoading = false;
      console.log('search finished, isLoading:', this.isLoading);
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.isLoading = true;
      console.log('changePage, isLoading:', this.isLoading);
      this.updateUrl();
    }
  }

  setSearchType(type: 'movies' | 'actors'): void {
    this.searchType = type;
    this.currentPage = 1;
    this.isLoading = true;
    console.log('setSearchType, isLoading:', this.isLoading);
    this.updateUrl();
  }

  updateUrl(): void {
    const queryParams: any = { query: this.query, page: this.currentPage, type: this.searchType };
    this.router.navigate(['/search-page'], { queryParams });
  }

  viewMovieDetails(movie: Movie): void {
    this.router.navigate(['/movies', movie.id]);
  }

  viewActorDetails(actor: ContributorDto): void {
    this.router.navigate(['/actors', actor.id]);
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
      console.log('Chuyển hướng đến trang xem phim:', movie.title);
    } else {
      alert('Phim này hiện chưa hỗ trợ xem online. Vui lòng đặt vé để xem tại rạp!');
    }
  }

  bookTicket(movie: Movie): void {
    console.log('Đặt vé cho phim ' + movie.id);
  }

  closeTrailerModal(): void {
    this.showTrailerModal = false;
    this.safeTrailerUrl = null;
  }
  getGenreNames(genres: GenreDto[]): string {
    return genres.length > 0 ? genres.map((g) => g.name).join(', ') : 'Chưa có';
  }

  getActorNames(actors: ContributorDto[]): string {
    return actors.length > 0 ? actors.map((a) => a.name).join(', ') : 'Chưa có';
  }
}
