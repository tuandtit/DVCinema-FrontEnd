import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Movie } from '../../../core/models/movie/movie.model';
import { Cinema } from '../../../core/models/cinema/cinema.model';
import { Showtime } from '../../../core/models/showtime/showtime.model';
import { MovieService } from '../../../core/services/movie.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-detail-movie',
  templateUrl: './detail-movie.component.html',
  styleUrls: ['./detail-movie.component.scss'],
  standalone: false,
})
export class DetailMovieComponent implements OnInit {
  movie: Movie | null = null;
  showCinemaModal: boolean = false;
  showConfirmModal: boolean = false;
  selectedCinema: Cinema | null = null;
  selectedShowtime: Showtime | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      await this.loadMovieDetails(+movieId);
    }
  }

  async loadMovieDetails(movieId: number): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;

    try {
      const response = await this.movieService
        .getMovieById(movieId)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          })
        )
        .toPromise();

      if (response.status.code === 200) {
        this.movie = {
          id: response.data.id,
          title: response.data.title,
          poster: response.data.posterUrl,
          trailer: response.data.trailerUrl,
          description: response.data.description,
          genres: response.data.genreNames.join(', '),
          director: response.data.directorName,
          actors: response.data.actorNames.join(', '),
          duration: response.data.duration,
          releaseDate: response.data.releaseDate,
          status: response.data.status || '',
        };
      } else {
        this.errorMessage = `API Error: ${response.message || 'Unknown error'}`;
      }
    } catch (err) {
      this.errorMessage = 'Failed to load movie details. Please try again later.';
      console.error('Error loading movie details:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  openCinemaModal(): void {
    if (this.movie && !this.isLoading) {
      this.showCinemaModal = true;
    }
  }

  closeCinemaModal(): void {
    this.showCinemaModal = false;
    this.cdr.detectChanges();
  }

  onBookShowtime(event: { showtime: Showtime; cinema: Cinema }): void {
    this.selectedShowtime = event.showtime;
    this.selectedCinema = event.cinema;
    this.showConfirmModal = true;
    this.cdr.detectChanges();
  }

  openConfirmModal(event: { cinema: Cinema; showtime: Showtime }): void {
    this.selectedCinema = event.cinema;
    this.selectedShowtime = event.showtime;
    this.showCinemaModal = false;
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.selectedCinema = null;
    this.selectedShowtime = null;
    this.cdr.detectChanges();
  }

  proceedToSeatSelection(): void {
    this.showConfirmModal = false;
    if (this.movie && this.selectedCinema && this.selectedShowtime) {
      this.router.navigate(['/seat-selection'], {
        queryParams: {
          movie: JSON.stringify(this.movie),
          cinema: JSON.stringify(this.selectedCinema),
          showtime: JSON.stringify(this.selectedShowtime),
        },
      });
    }
  }

  watchMovie(): void {
    if (this.movie && this.movie.trailer) {
      window.open(this.movie.trailer, '_blank');
    } else {
      this.errorMessage = 'Trailer not available for this movie.';
      this.cdr.detectChanges();
    }
  }
}
