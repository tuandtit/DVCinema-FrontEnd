import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { SignInDto } from '../../user/models/user/signin.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  getUsername(): string | null {
    return 'Tên hiển thị';
  }
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

  signin(signInDto: SignInDto): Observable<any> {
    return this.http.post(this.apiSignIn, signInDto, this.apiConfig).pipe(
      tap((response) => {
        localStorage.setItem('token', '');
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
}
