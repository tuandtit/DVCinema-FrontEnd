import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  constructor(private http: HttpClient) {}

  searchMovies(query: string) {
    if (!query.trim()) {
      return of([]);
    }

    // 🧪 Fake response (sau bạn đổi thành API thật)
    const dummyMovies = [
      { id: 1, title: 'Avengers: Endgame' },
      { id: 2, title: 'Avengers: Infinity War' },
      { id: 3, title: 'Avatar' },
      { id: 4, title: 'Aquaman' },
    ];

    return of(dummyMovies).pipe(
      delay(300),
      map((movies) =>
        movies.filter((movie) => movie.title.toLowerCase().includes(query.toLowerCase()))
      )
    );
  }
}
