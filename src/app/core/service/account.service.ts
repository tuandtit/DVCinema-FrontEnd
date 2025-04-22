import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SignInDto } from '../models/user/signin.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private apiSignUp = `${environment.apiBaseUrl}/sign-up`;
  private apiSignIn = `${environment.apiBaseUrl}/sign-in`;
  private apiConfig = {
    headers: this.createHeaders(),
  };

  constructor(private http: HttpClient) {}

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  register(registerFormData: FormData): Observable<any> {
    return this.http.post(this.apiSignUp, registerFormData);
  }

  signin(signInDto: SignInDto): Observable<any> {
    return this.http.post(this.apiSignIn, signInDto, this.apiConfig);
  }
}
