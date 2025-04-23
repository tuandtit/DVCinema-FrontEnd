import {
  Component,
  HostListener,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MovieService } from '../../core/service/movie.service';
import { MovieResponseDto } from '../../core/models/movie/movie-response.dto';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, AfterViewInit {
  login() {
    throw new Error('Method not implemented.');
  }
  navigateTo(arg0: string) {
    throw new Error('Method not implemented.');
  }
  searchQuery: string = '';
  suggestions: any[] = [];
  pageSize: number = 5;
  currentPage: number = 1;
  totalPages: number = 0;
  totalRecord: number = 0;
  isLoading: boolean = false;
  isLoadingMore: boolean = false;
  canLoadMore: boolean = true;

  @ViewChild('loadMoreTrigger') loadMoreTrigger!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('suggestionsList') suggestionsList!: ElementRef;

  private searchSubject = new Subject<string>();
  private observer!: IntersectionObserver;

  constructor(private movieService: MovieService) {}

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const header = document.querySelector('.sticky-header');
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Đóng menu autocomplete nếu click ra ngoài
    const clickedInsideSearch =
      this.searchInput?.nativeElement.contains(target) ||
      this.suggestionsList?.nativeElement.contains(target);
    if (!clickedInsideSearch) {
      this.suggestions = [];
    }

    // Đóng menu mobile nếu click ra ngoài
    const navbarCollapse = document.querySelector('#navbarSupportedContent');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const clickedInsideMenu = navbarCollapse?.contains(target) || navbarToggler?.contains(target);
    if (!clickedInsideMenu && navbarCollapse?.classList.contains('show')) {
      navbarCollapse.classList.remove('show');
    }
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          this.isLoading = true;
          this.currentPage = 1;
          this.suggestions = [];
          this.canLoadMore = true;
          return this.movieService.getMovies(this.currentPage, this.pageSize, query, [], null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response.status.code !== 200) {
            console.error('Lỗi từ API:', response.status.message);
            this.isLoading = false;
            return;
          }

          this.totalRecord = response.data.paging.totalRecord;
          this.totalPages = response.data.paging.totalPage;

          const newSuggestions = response.data.contents.map((dto: MovieResponseDto) => ({
            id: dto.id,
            title: dto.title,
            genre: dto.genreNames.join(', '),
          }));

          this.suggestions = newSuggestions;
          this.canLoadMore = this.currentPage < this.totalPages - 1;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Lỗi khi tìm kiếm phim:', err);
          this.isLoading = false;
        },
      });
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.canLoadMore && !this.isLoadingMore) {
          this.loadMoreSuggestions();
        }
      },
      { threshold: 0.1 }
    );

    if (this.loadMoreTrigger) {
      this.observer.observe(this.loadMoreTrigger.nativeElement);
    }
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    if (query.trim() === '') {
      this.suggestions = [];
      this.currentPage = 0;
      this.canLoadMore = true;
      return;
    }
    this.searchSubject.next(query);
  }

  loadMoreSuggestions(): void {
    if (this.currentPage >= this.totalPages - 1) {
      this.canLoadMore = false;
      return;
    }

    this.isLoadingMore = true;
    this.currentPage++;

    this.movieService
      .getMovies(this.currentPage, this.pageSize, this.searchQuery, [], null)
      .subscribe({
        next: (response) => {
          if (response.status.code !== 200) {
            console.error('Lỗi từ API:', response.status.message);
            this.isLoadingMore = false;
            return;
          }

          const newSuggestions = response.data.contents.map((dto: MovieResponseDto) => ({
            id: dto.id,
            title: dto.title,
            genre: dto.genreNames.join(', '),
          }));

          this.suggestions = [...this.suggestions, ...newSuggestions];
          this.canLoadMore = this.currentPage < this.totalPages - 1;
          this.isLoadingMore = false;
        },
        error: (err) => {
          console.error('Lỗi khi load thêm gợi ý:', err);
          this.isLoadingMore = false;
        },
      });
  }

  onSearchEnter(): void {
    if (this.searchQuery.trim() === '') return;
    console.log('Chuyển hướng đến trang tìm kiếm với từ khóa:', this.searchQuery);
    // Sau này: this.router.navigate(['/search', { query: this.searchQuery }]);
    this.suggestions = [];
  }

  selectMovie(movie: any): void {
    console.log('Chuyển hướng đến trang chi tiết phim:', movie.id, movie.title);
    this.suggestions = [];
    this.searchQuery = movie.title;
  }
}
