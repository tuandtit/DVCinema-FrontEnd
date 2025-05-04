import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { SignInDto } from '../../user/models/user/signin.dto';
import { environment } from '../../environments/environment';
import { LoginResponse } from '../../user/models/user/login.response';
import { Account } from '../../user/models/user/account.model';
import { ApiResponse } from '../../shared/base-response/api.response';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private apiSignUp = `${environment.apiBaseUrl}/sign-up`;
  private apiSignIn = `${environment.apiBaseUrl}/sign-in`;
  private apiLogOut = `${environment.apiBaseUrl}/logout`;

  private apiConfig = {
    headers: this.createHeaders(),
  };

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private returnUrl: string | null = null;

  constructor(private http: HttpClient) {}

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  register(registerFormData: FormData): Observable<any> {
    return this.http.post(this.apiSignUp, registerFormData);
  }

  signin(signInDto: SignInDto): Observable<ApiResponse<LoginResponse>> {
    return this.http
      .post<ApiResponse<LoginResponse>>(this.apiSignIn, signInDto, this.apiConfig)
      .pipe(
        tap((response) => {
          localStorage.setItem('displayName', response.data.displayName);
          localStorage.setItem('avatar', response.data.avatar);
          this.isLoggedInSubject.next(true);
        })
      );
  }

  logout() {
    this.isLoggedInSubject.next(false);
    this.http.post(this.apiLogOut, this.apiConfig);
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  // Lưu URL để quay lại sau khi đăng nhập
  setReturnUrl(url: string) {
    this.returnUrl = url;
  }

  getReturnUrl(): string | null {
    return this.returnUrl;
  }

  clearReturnUrl() {
    this.returnUrl = null;
  }

  getUsername(): string | null {
    return localStorage.getItem('displayName');
  }
}
