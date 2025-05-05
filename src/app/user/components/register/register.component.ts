import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { SignUpDto } from '../../../core/models/user/signup.dto';
import { RegisterResponse } from '../../../core/models/user/register.response';
import { ApiResponse } from '../../../core/models/base-response/api.response';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
    standalone: false
})
export class RegisterComponent {
  @ViewChild('registerForm') registerForm!: NgForm;
  @ViewChild('displayNameInput') displayNameInput!: ElementRef;
  @ViewChild('usernameInput') usernameInput!: ElementRef;
  @ViewChild('passwordInput') passwordInput!: ElementRef;
  @ViewChild('retypePasswordInput') retypePasswordInput!: ElementRef;

  username: string;
  password: string;
  retypePassword: string;
  displayName: string;
  isAccepted: boolean;
  passwordMismatch: boolean = false;

  constructor(
    private router: Router,
    private accountService: AccountService
  ) {
    this.username = '';
    this.password = '';
    this.retypePassword = '';
    this.displayName = '';
    this.isAccepted = true;
  }

  onUsernameChange() {
    console.log(`Username typed: ${this.username}`);
  }

  register() {
    const form = this.registerForm.form;
    form.markAllAsTouched();

    if (form.invalid) {
      if (form.controls['displayName']?.invalid) {
        this.displayNameInput.nativeElement.focus();
      } else if (form.controls['username']?.invalid) {
        this.usernameInput.nativeElement.focus();
      } else if (form.controls['password']?.invalid) {
        this.passwordInput.nativeElement.focus();
      } else if (form.controls['retypePassword']?.invalid || this.passwordMismatch) {
        this.retypePasswordInput.nativeElement.focus();
      }
      return;
    }

    debugger;
    const signUpData = new SignUpDto(
      this.username,
      this.password,
      this.retypePassword,
      this.displayName
    );
    this.accountService.register(signUpData.toFormData()).subscribe({
      next: (response: ApiResponse<RegisterResponse>) => {
        debugger;
        // Xử lý khi kết quả trả về khi đăng kí thành công
        if (response && (response.status.code === 200 || response.status.code === 201)) {
          this.router.navigate(['/login']);
        } else {
        }
      },
      complete: () => {
        debugger;
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

        alert(`Cannot sign up: ${errorMessage}`);
      },
    });
  }

  checkPasswordMatch() {
    this.passwordMismatch = this.password !== this.retypePassword;
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
