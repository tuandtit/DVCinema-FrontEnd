import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse } from '../../../core/models/base-response/api.response';
import { LoginResponse } from '../../../core/models/user/login.response';
import { SignInDto } from '../../../core/models/user/signin.dto';
import { AccountService } from '../../../core/services/account.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: false,
})
export class LoginComponent {
  @ViewChild('loginForm') loginForm!: NgForm;
  username: string;
  password: string;

  constructor(
    private router: Router,
    private accountService: AccountService,
  ) {
    this.username = '';
    this.password = '';
  }
  onUsernameChange() {
    console.log(`Username typed: ${this.username}`);
  }

  login() {
    const message = `username: ${this.username}` + `password: ${this.password};`;
    const signInData: SignInDto = {
      username: this.username,
      password: this.password,
    };

    this.accountService.signin(signInData).subscribe({
      next: (response: ApiResponse<LoginResponse>) => {
        // Xử lý khi kết quả trả về khi đăng nhập thành công
        if (response && (response.status.code === 200 || response.status.code === 201)) {
          debugger;
          console.log('true');
          this.accountService.clearReturnUrl();

          this.accountService.loginSuccess();
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

  signInWithGoogle(): void {
    this.accountService.signInWithGoogle().subscribe({
      next: () => {
        const returnUrl = this.accountService.getReturnUrl() || '/';
        this.accountService.clearReturnUrl();
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        console.error('Google Sign-In failed', error);
        alert('Có lỗi hệ thống, xin vui lòng thử lại sau!');
      },
    });
  }

  navigate(route: string): void {
    console.log(route);
    this.router.navigate([route]);
    // Đóng menu mobile nếu đang mở
    const navbarCollapse = document.querySelector('#navbarSupportedContent');
    if (navbarCollapse?.classList.contains('show')) {
      navbarCollapse.classList.remove('show');
    }
  }
}
