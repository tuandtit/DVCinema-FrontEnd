import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Movie } from '../../../core/models/movie/movie.model';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
  standalone: false
})
export class MovieListComponent {
  @Input() movies: Movie[] = [];
  @Input() isLoading: boolean = false;
  @Output() playTrailer = new EventEmitter<Movie>();
  @Output() viewDetails = new EventEmitter<Movie>();
  @Output() watchMovie = new EventEmitter<Movie>();
  @Output() bookTicket = new EventEmitter<Movie>();
}
