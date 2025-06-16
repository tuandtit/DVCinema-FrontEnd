import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { firebaseAuth } from '../config/FirebaseConfig';
import { ApiResponse } from '../models/base-response/api.response';
import { LoginResponse } from '../models/user/login.response';
import { SignInDto } from '../models/user/signin.dto';
import { DataSharingService } from './data-sharing.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private apiSignUp = `${environment.apiBaseUrl}/sign-up`;
  private apiSignIn = `${environment.apiBaseUrl}/sign-in`;
  private apiLogOut = `${environment.apiBaseUrl}/logout`;
  private apiSignInGoogle = `${environment.apiBaseUrl}/google/sign-in`;
  private jwtHelper = new JwtHelperService();
  private apiConfig = {
    headers: this.createHeaders(),
  };

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private userIdSubject = new BehaviorSubject<number | null>(null);
  userId$ = this.userIdSubject.asObservable();
  private returnUrl: string | null = null;
  constructor(
    private router: Router,
    private http: HttpClient,
    private dataSharingService: DataSharingService
  ) {
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

  signInWithGoogle(): Observable<ApiResponse<LoginResponse>> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(firebaseAuth, provider)).pipe(
      switchMap((result) => {
        const user = result.user;
        return from(user.getIdToken()).pipe(
          switchMap((idToken) => {
            const signInGoogleDto = {
              googleToken: idToken,
              email: user.email,
              avatar: user.photoURL,
              displayName: user.displayName,
            };
            return this.http
              .post<
                ApiResponse<LoginResponse>
              >(this.apiSignInGoogle, signInGoogleDto, this.apiConfig)
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
          })
        );
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

  loginSuccess(): void {
    const redirectUrl = this.returnUrl || '/';
    const sharedData = this.dataSharingService.getData('sharedData');
    this.returnUrl = null;
    this.router.navigate([redirectUrl], { state: { sharedData } });
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

  getAvatar(): string | null {
    return sessionStorage.getItem('avatar');
  }

  getScopes(): string[] {
    const token = this.getToken();
    if (!token) return [];
    const decoded = this.jwtHelper.decodeToken(token);
    const scope = decoded.scope || '';
    return scope.split(',').map((s: string) => s.trim());
  }

  hasAdminRole(): boolean {
    return this.isLoggedIn() && this.getScopes().includes('ADMIN');
  }
}
