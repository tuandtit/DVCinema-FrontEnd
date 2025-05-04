import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @Output() toggle = new EventEmitter<boolean>();

  isCollapsed: boolean = false;

  menuItems = [
    { label: 'Thống Kê', path: '/dashboard/statistics', icon: 'fas fa-chart-bar' },
    { label: 'Quản Lý Phim', path: '/dashboard/movies', icon: 'fas fa-film' },
    { label: 'Quản Lý Rạp', path: '/dashboard/cinemas', icon: 'fas fa-theater-masks' },
    { label: 'Quản Lý Đặt Vé', path: '/dashboard/bookings', icon: 'fas fa-ticket-alt' },
    { label: 'Quản Lý Suất Chiếu', path: '/dashboard/showtimes', icon: 'fas fa-clock' },
    { label: 'Quản Lý Người Dùng', path: '/dashboard/users', icon: 'fas fa-users' },
  ];

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.toggle.emit(this.isCollapsed);
  }
}
