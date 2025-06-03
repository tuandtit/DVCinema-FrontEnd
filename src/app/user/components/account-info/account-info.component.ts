import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../../core/services/account.service';
import { UserService } from '../../../core/services/user.service';
import { ApiResponse } from '../../../core/models/base-response/api.response';
import { UserInfo } from '../../../core/models/user/user.model';

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
  standalone: false,
})
export class AccountInfoComponent implements OnInit {
  userId: number | null = null;

  user: UserInfo = {
    displayName: '',
    avatar:
      'http://res.cloudinary.com/dt8idd99e/image/upload/v1/dvcinema/04444ec4-6e3e-4f15-98f6-4b09ed29bba6_images.png',
    userId: 0,
    username: '',
  };
  avatarFile: File | null = null;

  constructor(
    private accountService: AccountService,
    private userService: UserService
  ) {
    this.userId = accountService.getUserId();
  }

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo() {
    if (this.userId == null) {
      alert('Bạn chưa đăng nhập');
      return;
    }

    this.userService.getAccountInfo(this.userId).subscribe({
      next: (response: ApiResponse<UserInfo>) => {
        debugger;
        this.user = response.data;
      },
      error: (err) => {
        debugger;
        console.error('error:', err);
      },
      complete: () => {
        console.log('Truy vấn userId: ' + this.userId);
      },
    });
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.avatarFile = input.files[0];
    }
  }

  updateProfile(): void {
    if (this.userId == null) {
      alert('Bạn chưa đăng nhập');
      return;
    }

    const formData = new FormData();
    formData.append('userId', this.userId.toString());
    formData.append('displayName', this.user.displayName);
    if (this.avatarFile) {
      formData.append('avatarFile', this.avatarFile);
    }

    this.userService.updateAccountInfo(formData).subscribe({
      next: (response: ApiResponse<number>) => {
        alert('Cập nhật thông tin thành công!');
        this.userId = response.data;
        this.loadUserInfo(); // Tải lại thông tin sau khi cập nhật
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật:', err);
        alert('Cập nhật thông tin thất bại!');
      },
    });
  }
}
