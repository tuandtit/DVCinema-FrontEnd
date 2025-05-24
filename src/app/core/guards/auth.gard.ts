import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AccountService } from '../services/account.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private accountService: AccountService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.accountService.isLoggedIn()) {
      return true; // Cho phép truy cập nếu đã đăng nhập
    }

    // Lưu URL đầy đủ mà người dùng đang cố gắng truy cập
    this.accountService.setReturnUrl(state.url);
    // Chuyển hướng đến trang đăng nhập, truyền URL hiện tại như query param (tùy chọn)
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false; // Chặn truy cập nếu chưa đăng nhập
  }
}
