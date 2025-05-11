import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Movie } from '../../../core/models/movie/movie.model';

@Component({
  selector: 'app-movie-carousel',
  templateUrl: './movie-carousel.component.html',
  styleUrls: ['./movie-carousel.component.scss'],
  standalone: false
})
export class MovieCarouselComponent {
  @Input() featuredMovies: Movie[] = [];
  @Input() isLoading: boolean = false;
  @Output() viewDetails = new EventEmitter<Movie>();
}
