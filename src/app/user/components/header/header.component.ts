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
import { MovieService } from '../../../core/services/movie.service';
import { AccountService } from '../../../core/services/account.service';
import { MovieResponseDto } from '../../../core/models/movie/movie-response.dto';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ApiResponse } from '../../../core/models/base-response/api.response';
import { UserInfo } from '../../../core/models/user/user.model';
import { GenreDto } from '../../../core/models/movie/genre.dto';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnInit, AfterViewInit {
  searchQuery: string = '';
  suggestions: any[] = [];
  pageSize: number = 5;
  currentPage: number = 1;
  totalPages: number = 0;
  totalRecord: number = 0;
  isLoading: boolean = false;
  isLoadingMore: boolean = false;
  canLoadMore: boolean = true;
  isLoggedIn: boolean = false;
  username: string | null = null;
  avatar: string =
    'http://res.cloudinary.com/dt8idd99e/image/upload/v1/dvcinema/04444ec4-6e3e-4f15-98f6-4b09ed29bba6_images.png';
  showMoviesDropdown: boolean = false;
  showUserDropdown: boolean = false;
  // Danh sách các route yêu cầu đăng nhập
  private routesRequiringLogin: string[] = [
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

    const clickedInsideSearch =
      this.searchInput?.nativeElement.contains(target) ||
      this.suggestionsList?.nativeElement.contains(target);
    if (!clickedInsideSearch) {
      this.suggestions = [];
    }

    const navbarCollapse = document.querySelector('#navbarSupportedContent');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const userInfo = document.querySelector('.user-info');
    const moviesDropdownToggle = document.querySelector('.dropdown-toggle');
    const moviesDropdownMenu = document.querySelector('.dropdown-menu');
    const userDropdownMenu = document.querySelector('.user-dropdown');

    const clickedInsideMenu =
      navbarCollapse?.contains(target) ||
      navbarToggler?.contains(target) ||
      userInfo?.contains(target) ||
      moviesDropdownToggle?.contains(target) ||
      moviesDropdownMenu?.contains(target) ||
      userDropdownMenu?.contains(target);

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
      if (loggedIn) {
        this.loadUserInfo(userId);
      } else {
        this.username = null;
        this.showUserDropdown = false; // Đóng dropdown khi đăng xuất
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
            console.error('Lỗi từ API:', response.status.timestamp);
            this.isLoading = false;
            return;
          }

          this.totalRecord = response.data.paging.totalRecord;
          this.totalPages = response.data.paging.totalPage;

          const newSuggestions = response.data.contents.map((dto: MovieResponseDto) => ({
            id: dto.id,
            poster: dto.posterUrl,
            title: dto.title,
            genre: dto.genres.join(', '),
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
  loadUserInfo(userId: number | null) {
    if (userId == null) {
      alert('Bạn chưa đăng nhập');
      return;
    }

    this.userService.getAccountInfo(userId).subscribe({
      next: (response: ApiResponse<UserInfo>) => {
        debugger;
        this.username = response.data.displayName;
        this.avatar = response.data.avatar;
      },
      error: (err) => {
        debugger;
        console.error('error:', err);
      },
      complete: () => {
        console.log('Truy vấn userId: ' + userId);
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

    this.movieService.getMovies(this.currentPage, this.pageSize, this.searchQuery, []).subscribe({
      next: (response) => {
        if (response.status.code !== 200) {
          console.error('Lỗi từ API:', response.status.timestamp);
          this.isLoadingMore = false;
          return;
        }

        const newSuggestions = response.data.contents.map((dto: MovieResponseDto) => ({
          id: dto.id,
          title: dto.title,
          genre: this.getGenreNames(dto.genres),
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
    console.log('Chuyển hướng đến trang kết quả tìm kiếm với từ khóa:', this.searchQuery);
    this.suggestions = [];
    this.router.navigate(['/search-page'], { queryParams: { query: this.searchQuery } });
  }

  selectMovie(movie: any): void {
    console.log('Chuyển hướng đến trang chi tiết phim:', movie.id, movie.title);
    this.suggestions = [];
    this.searchQuery = movie.title;
    this.router.navigate(['/detail-product', movie.id]);
  }

  login(): void {
    this.saveUrl();
    this.navigate('/login');
  }

  logout(): void {
    const currentUrl = this.router.url;
    this.accountService.logout();
    // Kiểm tra xem trang hiện tại có yêu cầu đăng nhập không
    const requiresLogin = this.routesRequiringLogin.some((route) => currentUrl.startsWith(route));
    if (requiresLogin) {
      // Nếu trang hiện tại yêu cầu đăng nhập, điều hướng đến trang đăng nhập
      this.navigate('/login');
    } else {
      // Nếu không, điều hướng về trang chủ
      this.navigate(currentUrl);
    }
  }

  saveUrl(): void {
    const currentUrl = this.router.url;
    if (currentUrl !== '/login') {
      this.accountService.setReturnUrl(currentUrl);
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

  toggleMoviesDropdown(event?: Event): void {
    this.showMoviesDropdown = !this.showMoviesDropdown;
    this.showUserDropdown = false;
    event?.stopPropagation();
  }

  toggleUserDropdown(event?: Event): void {
    console.log('Toggling user dropdown', this.showUserDropdown);
    this.showUserDropdown = !this.showUserDropdown;
    this.showMoviesDropdown = false;
    event?.stopPropagation();
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/image/logo_dvcinema.jpg';
  }
  getGenreNames(genres: GenreDto[]): string {
    return genres.length > 0 ? genres.map((g) => g.name).join(', ') : 'Chưa có';
  }
}
