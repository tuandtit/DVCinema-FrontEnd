import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { UserService } from '../../../core/services/user.service';
import { ApiResponse } from '../../../core/models/base-response/api.response';
import { UserInfo } from '../../../core/models/user/user.model';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss'],
  standalone: false,
})
export class AdminHeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  username: string | null = null;
  avatar: string =
    'http://res.cloudinary.com/dt8idd99e/image/upload/v1/dvcinema/04444ec4-6e3e-4f15-98f6-4b09ed29bba6_images.png';
  showUserDropdown: boolean = false;

  constructor(
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
    const userInfo = document.querySelector('.user-info');
    const userDropdownMenu = document.querySelector('.user-dropdown');
    const navbarCollapse = document.querySelector('#navbarSupportedContent');
    const navbarToggler = document.querySelector('.navbar-toggler');

    const clickedInsideMenu =
      userInfo?.contains(target) ||
      userDropdownMenu?.contains(target) ||
      navbarCollapse?.contains(target) ||
      navbarToggler?.contains(target);

    if (!clickedInsideMenu) {
      this.showUserDropdown = false;
      if (navbarCollapse?.classList.contains('show')) {
        navbarCollapse.classList.remove('show');
      }
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
  }

  loadUserInfo(userId: number) {
    this.userService.getAccountInfo(userId).subscribe({
      next: (response: ApiResponse<UserInfo>) => {
        this.username = response.data.displayName;
        this.avatar = response.data.avatar || this.avatar;
      },
      error: (err) => {
        console.error('Lỗi tải thông tin người dùng:', err);
      },
    });
  }

  login(): void {
    this.saveUrl();
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.accountService.logout();
    this.router.navigate(['/login']);
  }

  saveUrl(): void {
    const currentUrl = this.router.url;
    if (currentUrl !== '/login') {
      this.accountService.setReturnUrl(currentUrl);
    }
  }

  toggleUserDropdown(event?: Event): void {
    this.showUserDropdown = !this.showUserDropdown;
    event?.stopPropagation();
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/image/logo_dvcinema.jpg';
  }
}
