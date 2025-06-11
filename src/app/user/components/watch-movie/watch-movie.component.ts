import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, DatePipe } from '@angular/common';
import { MovieResponseDto } from '../../../core/models/movie/movie-response.dto';
import { MovieService } from '../../../core/services/movie.service';
import { ApiResponse } from '../../../core/models/base-response/api.response';
import { GenreDto } from '../../../core/models/movie/genre.dto';
import { ContributorDto } from '../../../core/models/contributor/contributor-search-result.model';

@Component({
  selector: 'app-watch-movie',
  templateUrl: './watch-movie.component.html',
  styleUrls: ['./watch-movie.component.scss'],
  standalone: false,
})
export class WatchMovieComponent implements OnInit, OnChanges {
  movie: MovieResponseDto | null = null;
  safeVideoUrl: SafeResourceUrl | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const movieId = Number(this.route.snapshot.paramMap.get('id'));
    if (movieId) {
      this.movieService.getMovieById(movieId).subscribe({
        next: (response: ApiResponse<MovieResponseDto>) => {
          this.movie = response.data;
          this.updateVideoUrl();
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Không thể tải thông tin phim. Vui lòng thử lại sau.';
          this.isLoading = false;
          console.error('Error fetching movie:', error);
        },
      });
    } else {
      this.errorMessage = 'ID phim không hợp lệ.';
      this.isLoading = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['movie'] && this.movie?.videoUrl) {
      this.updateVideoUrl();
    } else {
      this.safeVideoUrl = null;
    }
  }

  private updateVideoUrl(): void {
    if (this.movie?.videoUrl) {
      const embedUrl = this.convertToEmbedUrl(this.movie.videoUrl);
      if (embedUrl) {
        const finalUrl = `${embedUrl}?rel=0&showinfo=0&autoplay=1`;
        this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
      } else {
        this.safeVideoUrl = null;
      }
    } else {
      this.safeVideoUrl = null;
    }
  }

  private convertToEmbedUrl(videoUrl: string): string | null {
    // Handle YouTube URLs like https://www.youtube.com/watch?v=videoId or https://youtu.be/videoId
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = videoUrl.match(youtubeRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    // Return null if the URL is invalid or not a YouTube URL
    return null;
  }
  getGenreNames(genres: GenreDto[]): string {
    return genres.length > 0 ? genres.map((g) => g.name).join(', ') : 'Chưa có';
  }

  getActorNames(actors: ContributorDto[]): string {
    return actors.length > 0 ? actors.map((a) => a.name).join(', ') : 'Chưa có';
  }
}
