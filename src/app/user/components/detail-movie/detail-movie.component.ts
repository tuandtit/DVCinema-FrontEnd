import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Movie } from '../../../core/models/movie/movie.model';
import { Cinema } from '../../../core/models/cinema/cinema.model';
import { Showtime } from '../../../core/models/showtime/showtime.model';
import { MovieService } from '../../../core/services/movie.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.loadMovieDetails(+movieId);
    }
  }

  loadMovieDetails(movieId: number): void {
    this.movieService.getMovieById(movieId).subscribe({
      next: (response) => {
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
          console.error('Lỗi từ API:', response.status.timestamp);
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy chi tiết phim:', err);
      },
    });
  }

  openCinemaModal(): void {
    if (this.movie) {
      this.showCinemaModal = true;
    }
  }

  closeCinemaModal(): void {
    this.showCinemaModal = false;
  }

  onBookShowtime(event: { showtime: Showtime; cinema: Cinema }): void {
    this.selectedShowtime = event.showtime;
    this.selectedCinema = event.cinema;
    this.showConfirmModal = true;
  }

  onShowtimeSelected(event: { cinema: Cinema; showtime: Showtime }): void {
    this.selectedCinema = event.cinema;
    this.selectedShowtime = event.showtime;
    this.showCinemaModal = false;
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.selectedCinema = null;
    this.selectedShowtime = null;
  }

  proceedToSeatSelection(event: { movie: Movie; cinema: Cinema; showtime: Showtime }): void {
    this.showConfirmModal = false;
    this.router.navigate(['/seat-selection'], {
      queryParams: {
        showtimeId: event.showtime.id,
        cinemaId: event.cinema.id,
        movieId: event.movie.id,
      },
    });
  }
}
