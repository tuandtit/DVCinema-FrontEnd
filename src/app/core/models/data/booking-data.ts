import { Cinema } from '../cinema/cinema.model';
import { Movie } from '../movie/movie.model';
import { Showtime } from '../showtime/showtime.model';

export interface BookingData {
  movie: Movie;
  cinema: Cinema;
  showtime: Showtime;
}
