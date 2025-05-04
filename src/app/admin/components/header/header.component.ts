import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  isLoggedIn: boolean = false; // Giả định trạng thái đăng nhập, thay bằng logic thật nếu có
  userName: string = 'User'; // Giả định tên người dùng

  constructor(private router: Router) {}

  logout(): void {
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
