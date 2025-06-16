import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ApiResponse } from '../../../core/models/base-response/api.response';
import { MovieResponseDto } from '../../../core/models/movie/movie-response.dto';
import { UserInfo } from '../../../core/models/user/user.model';
import { AccountService } from '../../../core/services/account.service';
import { MovieService } from '../../../core/services/movie.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnInit, AfterViewInit {
  searchQuery = '';
  suggestions: any[] = [];
  pageSize = 5;
  currentPage = 1;
  totalPages = 0;
  totalRecord = 0;
  isLoading = false;
  isLoadingMore = false;
  canLoadMore = true;
  isLoggedIn = false;
  username: string | null = null;
  avatar =
    'http://res.cloudinary.com/dt8idd99e/image/upload/v1/dvcinema/04444ec4-6e3e-4f15-98f6-4b09ed29bba6_images.png';
  showMoviesDropdown = false;
  showUserDropdown = false;
  private routesRequiringLogin = [
    '/showtimes',
    '/favorites',
    '/lists',
    '/continue-watching',
    '/account',
  ];
  @ViewChild('loadMoreTrigger') loadMoreTrigger!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('suggestionsList') suggestionsList!: ElementRef;
  private searchSubject = new Subject<string>();
  private observer!: IntersectionObserver;

  constructor(
    private movieService: MovieService,
    private router: Router,
    private accountService: AccountService,
    private userService: UserService
  ) {}

  @HostListener('window:scroll')
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
    const clickedInsideSearch =
      this.searchInput?.nativeElement.contains(target) ||
      this.suggestionsList?.nativeElement.contains(target);
    if (!clickedInsideSearch) {
      this.suggestions = [];
    }

    const navbarCollapse = document.querySelector('#navbarSupportedContent');
    const clickedInsideMenu =
      navbarCollapse?.contains(target) ||
      document.querySelector('.navbar-toggler')?.contains(target) ||
      document.querySelector('.user-info')?.contains(target) ||
      document.querySelector('.dropdown-toggle')?.contains(target) ||
      document.querySelector('.dropdown-menu')?.contains(target) ||
      document.querySelector('.user-dropdown')?.contains(target);

    if (!clickedInsideMenu && navbarCollapse?.classList.contains('show')) {
      navbarCollapse.classList.remove('show');
      this.showMoviesDropdown = false;
      this.showUserDropdown = false;
    }
  }

  ngOnInit(): void {
    this.accountService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      const userId = this.accountService.getUserIdFromStorage();
      if (loggedIn && userId) {
        this.loadUserInfo(userId);
      } else {
        this.username = null;
        this.showUserDropdown = false;
      }
    });

    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          this.isLoading = true;
          this.currentPage = 1;
          this.suggestions = [];
          this.canLoadMore = true;
          return this.movieService.getMovies(this.currentPage, this.pageSize, query, []);
        })
      )
      .subscribe({
        next: (response) => {
          if (response.status.code !== 200) {
            this.isLoading = false;
            return;
          }
          this.totalRecord = response.data.paging.totalRecord;
          this.totalPages = response.data.paging.totalPage;
          this.suggestions = response.data.contents.map((dto: MovieResponseDto) => ({
            id: dto.id,
            poster: dto.posterUrl,
            title: dto.title,
            genre: dto.genres.join(', '),
          }));
          this.canLoadMore = this.currentPage < this.totalPages - 1;
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
  }

  loadUserInfo(userId: number) {
    this.userService.getAccountInfo(userId).subscribe({
      next: (response: ApiResponse<UserInfo>) => {
        this.username = response.data.displayName;
        this.avatar = response.data.avatar;
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
    if (!query.trim()) {
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
    this.movieService.getMovies(this.currentPage, this.pageSize, this.searchQuery, []).subscribe({
      next: (response) => {
        if (response.status.code !== 200) {
          this.isLoadingMore = false;
          return;
        }
        const newSuggestions = response.data.contents.map((dto: MovieResponseDto) => ({
          id: dto.id,
          poster: dto.posterUrl,
          title: dto.title,
          genre: dto.genres.join(', '),
        }));
        this.suggestions = [...this.suggestions, ...newSuggestions];
        this.canLoadMore = this.currentPage < this.totalPages - 1;
        this.isLoadingMore = false;
      },
      error: () => (this.isLoadingMore = false),
    });
  }

  onSearchEnter(): void {
    if (!this.searchQuery.trim()) return;
    this.suggestions = [];
    this.router.navigate(['/search-page'], { queryParams: { query: this.searchQuery } });
  }

  login(): void {
    const currentUrl = this.router.url;
    if (currentUrl !== '/login') {
      this.accountService.setReturnUrl(currentUrl);
    }
    this.navigate('/login');
  }

  logout(): void {
    const currentUrl = this.router.url;
    this.accountService.logout();
    if (this.routesRequiringLogin.some((route) => currentUrl.startsWith(route))) {
      this.navigate('/login');
    } else {
      this.navigate(currentUrl);
    }
  }

  navigate(route: string): void {
    this.suggestions = [];
    this.router.navigate([route]);
    const navbarCollapse = document.querySelector('#navbarSupportedContent');
    if (navbarCollapse?.classList.contains('show')) {
      navbarCollapse.classList.remove('show');
    }
    this.showMoviesDropdown = false;
    this.showUserDropdown = false;
  }

  toggleUserDropdown(event?: Event): void {
    this.showUserDropdown = !this.showUserDropdown;
    this.showMoviesDropdown = false;
    event?.stopPropagation();
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/image/logo_dvcinema.jpg';
  }
}
