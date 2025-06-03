import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/base-response/api.response';
import { UserInfo } from '../models/user/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUsers = `${environment.apiBaseUrl}/api/users`;

  constructor(private http: HttpClient) {}

  getAccountInfo(userId: number): Observable<ApiResponse<UserInfo>> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<ApiResponse<UserInfo>>(this.apiUsers, { params });
  }

  updateAccountInfo(formData: FormData): Observable<ApiResponse<number>> {
    return this.http.put<ApiResponse<number>>(this.apiUsers, formData);
  }
}
