import { Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MovieService } from '../../service/movie.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  searchQuery: string = '';
  suggestions: any[] = [];

  private searchSubject = new Subject<string>();

  constructor(
    private translate: TranslateService,
    private movieService: MovieService
  ) {
    translate.addLangs(['vi', 'en']);
    translate.setDefaultLang('vi');
    this.translate.use('vi');
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const header = document.querySelector('.sticky-header');
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => this.movieService.searchMovies(query))
      )
      .subscribe((results) => {
        this.suggestions = results;
      });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }

  selectMovie(movie: any): void {
    console.log('Selected movie:', movie);
    // Ví dụ chuyển trang:
    // this.router.navigate(['/movies', movie.id]);
    this.suggestions = [];
    this.searchQuery = movie.title;
  }
}
