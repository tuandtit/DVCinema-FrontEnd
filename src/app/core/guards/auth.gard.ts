import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { DataSharingService } from '../services/data-sharing.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private accountService: AccountService,
    private dataSharingService: DataSharingService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.accountService.isLoggedIn()) {
      return true; // Cho phép truy cập nếu đã đăng nhập
    }

    // Lưu URL và dữ liệu (nếu có)
    this.accountService.setReturnUrl(state.url);
    const sharedData = route.data['bookingData'] || this.dataSharingService.getData('bookingData');
    if (sharedData) {
      this.dataSharingService.setData('bookingData', sharedData);
    }

    // Chuyển hướng đến trang đăng nhập, truyền dữ liệu qua state
    this.router.navigate(['/login'], { state: { sharedData } });
    return false; // Chặn truy cập nếu chưa đăng nhập
  }
}
