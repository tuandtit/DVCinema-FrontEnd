import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Movie } from '../../../core/models/movie/movie.model';

@Component({
  selector: 'app-trailer',
  templateUrl: './trailer.component.html',
  styleUrls: ['./trailer.component.scss'],
  standalone: false,
})
export class TrailerComponent implements OnChanges {
  @Input() movie: Movie | null = null;
  safeTrailerUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['movie'] && this.movie?.trailer) {
      const embedUrl = this.convertToEmbedUrl(this.movie.trailer);
      if (embedUrl) {
        const finalUrl = `${embedUrl}?rel=0&showinfo=0&autoplay=1`;
        this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
      } else {
        this.safeTrailerUrl = null;
      }
    } else {
      this.safeTrailerUrl = null;
    }
  }

  private convertToEmbedUrl(trailer: string): string | null {
    // Handle YouTube URLs like https://www.youtube.com/watch?v=videoId or https://youtu.be/videoId
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = trailer.match(youtubeRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    // Return null if the URL is invalid or not a YouTube URL
    return null;
  }
}
