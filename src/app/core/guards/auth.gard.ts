import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AccountService } from '../service/account.service';

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
    debugger;
    // Lưu URL hiện tại để quay lại sau khi đăng nhập
    this.accountService.setReturnUrl(state.url);
    this.router.navigate(['/login']);
    return false; // Chặn truy cập nếu chưa đăng nhập
  }
}
