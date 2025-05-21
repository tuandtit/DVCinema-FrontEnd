import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/base-response/api.response';
import { LoginResponse } from '../models/user/login.response';
import { SignInDto } from '../models/user/signin.dto';

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
  private userIdSubject = new BehaviorSubject<number | null>(null);
  userId$ = this.userIdSubject.asObservable();
  private returnUrl: string | null = null;

  constructor(private http: HttpClient) {
    // Khôi phục trạng thái từ sessionStorage
    const token = this.getToken();
    const userId = this.getUserIdFromStorage();
    if (token && userId) {
      this.isLoggedInSubject.next(true);
      this.userIdSubject.next(userId);
    }
  }

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
          const data = response.data;
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('userId', data.userId.toString());
          sessionStorage.setItem('displayName', data.displayName);
          sessionStorage.setItem('avatar', data.avatar);
          this.isLoggedInSubject.next(true);
          this.userIdSubject.next(data.userId);
        })
      );
  }

  logout(): Observable<any> {
    this.isLoggedInSubject.next(false);
    this.userIdSubject.next(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('displayName');
    sessionStorage.removeItem('avatar');
    return this.http.post(this.apiLogOut, null, this.apiConfig);
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  getUserId(): number | null {
    return this.userIdSubject.value;
  }

  getUserIdFromStorage(): number | null {
    const userId = sessionStorage.getItem('userId');
    return userId ? Number(userId) : null;
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  setReturnUrl(url: string): void {
    this.returnUrl = url;
  }

  getReturnUrl(): string | null {
    return this.returnUrl;
  }

  clearReturnUrl(): void {
    this.returnUrl = null;
  }

  getUsername(): string | null {
    return sessionStorage.getItem('displayName');
  }
}