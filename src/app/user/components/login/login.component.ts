import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse } from '../../../core/models/base-response/api.response';
import { LoginResponse } from '../../../core/models/user/login.response';
import { SignInDto } from '../../../core/models/user/signin.dto';
import { AccountService } from '../../../core/services/account.service';
import { TokenService } from '../../../core/services/token.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  @ViewChild('loginForm') loginForm!: NgForm;
  username: string;
  password: string;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private tokenService: TokenService
  ) {
    this.username = '';
    this.password = '';
  }
  onUsernameChange() {
    console.log(`Username typed: ${this.username}`);
  }

  login() {
    const message = `username: ${this.username}` + `password: ${this.password};`;
    // debugger;
    const signInData: SignInDto = {
      username: this.username,
      password: this.password,
    };

    this.accountService.signin(signInData).subscribe({
      next: (response: ApiResponse<LoginResponse>) => {
        // debugger;
        // Xử lý khi kết quả trả về khi đăng nhập thành công
        if (response && (response.status.code === 200 || response.status.code === 201)) {
          const result = response.data;
          const token = result.token;
          this.tokenService.setToken(token);
          console.log('true');
          const returnUrl = this.accountService.getReturnUrl() || '/';
          this.accountService.clearReturnUrl();

          // Chuyển hướng về trang trước đó
          this.navigate(returnUrl);
        } else {
        }
      },
      complete: () => {
        // debugger;
      },
      error: (error: any) => {
        let errorMessage = 'Something went wrong. Please try again.';
        debugger;
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error; // Nếu backend trả về một chuỗi lỗi
          } else if (error.error.message) {
            errorMessage = error.error.message; // Nếu backend trả về một object có field `message`
          } else if (error.error.errors) {
            errorMessage = Object.values(error.error.errors).join(', '); // Nếu có danh sách lỗi
          }
        }

        alert(`Cannot sign in: ${errorMessage}`);
      },
    });
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    // Đóng menu mobile nếu đang mở
    const navbarCollapse = document.querySelector('#navbarSupportedContent');
    if (navbarCollapse?.classList.contains('show')) {
      navbarCollapse.classList.remove('show');
    }
  }
}
