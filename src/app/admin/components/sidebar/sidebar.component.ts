import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false,
})
export class SidebarComponent {
  @Output() toggle = new EventEmitter<boolean>();

  isCollapsed: boolean = false;

  menuItems = [
    { label: 'Trang chủ', path: '/admin/report', icon: 'fas fa-chart-bar' },
    { label: 'Quản Lý Phim', path: '/admin/movies', icon: 'fas fa-film' },
    { label: 'Quản Lý Rạp', path: '/admin/cinemas', icon: 'fas fa-theater-masks' },
    { label: 'Quản Lý Đặt Vé', path: '/admin/bookings', icon: 'fas fa-ticket-alt' },
    { label: 'Quản Lý Suất Chiếu', path: '/admin/showtimes', icon: 'fas fa-clock' },
    { label: 'Quản Lý Người Dùng', path: '/admin/users', icon: 'fas fa-users' },
    { label: 'Checkin', path: '/admin/checkin', icon: 'fas fa-users' },
  ];

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.toggle.emit(this.isCollapsed);
  }
}
