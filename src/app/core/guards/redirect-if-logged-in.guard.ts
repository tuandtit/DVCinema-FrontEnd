import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AccountService } from '../services/account.service';

@Injectable({
  providedIn: 'root',
})
export class RedirectIfLoggedInGuard implements CanActivate {
  constructor(
    private accountService: AccountService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.accountService.isLoggedIn()) {
      // Nếu đã đăng nhập, chuyển hướng đến returnUrl (nếu có) hoặc trang chính
      const redirectUrl = this.accountService.getReturnUrl() || '/';
      this.router.navigate([redirectUrl]);
      return false; // Chặn truy cập vào trang đăng nhập
    }
    return true; // Cho phép truy cập nếu chưa đăng nhập
  }
}
