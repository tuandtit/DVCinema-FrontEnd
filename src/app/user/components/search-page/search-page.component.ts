import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { ContributorService } from '../../services/contributor.service';
import { MovieResponseDto } from '../../models/movie/movie-response.dto';
import { Movie } from '../../models/movie/movie.model';
import { ContributorSearchResult } from '../../models/movie/contributor-search-result.model';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
})
export class SearchPageComponent implements OnInit {
  query: string = '';
  searchType: 'movies' | 'actors' = 'movies';
  movies: Movie[] = [];
  actors: ContributorSearchResult[] = [];
  totalPages: number = 0;
  currentPage: number = 1;
  pageSize: number = 12;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private contributorService: ContributorService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.query = params['query'] || '';
      this.searchType = (params['type'] as 'movies' | 'actors') || 'movies';
      this.currentPage = +params['page'] || 1;
      this.search();
    });
  }

  search(): void {
    if (this.searchType === 'movies') {
      this.movieService.getMovies(this.currentPage, this.pageSize, this.query, [], null).subscribe({
        next: (response) => {
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
            genres: dto.genreNames.join(', '),
            director: dto.directorName,
            actors: dto.actorNames.join(', '),
            duration: dto.duration,
            availableOnline: dto.isAvailableOnline,
            releaseDate: dto.releaseDate,
            status: dto.status || '',
          }));
          this.actors = [];
          this.totalPages = response.data.paging.totalPage || 0;
        },
        error: (err) => {
          console.error('Lỗi khi tìm kiếm phim:', err);
        },
      });
    } else {
      this.contributorService
        .getContributors(this.currentPage, this.pageSize, this.query, 'ACTOR')
        .subscribe({
          next: (response) => {
            if (response.status.code !== 200) {
              console.error('Lỗi từ API:', response.status.timestamp);
              return;
            }
            this.actors = response.data.contents;
            this.movies = [];
            this.totalPages = response.data.paging.totalPage || 0;
          },
          error: (err) => {
            console.error('Lỗi khi tìm kiếm diễn viên:', err);
          },
        });
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateUrl();
    }
  }

  setSearchType(type: 'movies' | 'actors'): void {
    this.searchType = type;
    this.currentPage = 1;
    this.updateUrl();
  }

  updateUrl(): void {
    const queryParams: any = { query: this.query, page: this.currentPage, type: this.searchType };
    this.router.navigate(['/search-page'], { queryParams });
  }
}
