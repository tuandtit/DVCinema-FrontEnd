import { Component, Input } from '@angular/core';
import { Movie } from '../../../core/models/movie/movie.model';

@Component({
  selector: 'app-movie-info',
  templateUrl: './movie-info.component.html',
  styleUrls: ['./movie-info.component.scss'],
  standalone: false,
})
export class MovieInfoComponent {
  @Input() movie: Movie | null = null;
}
