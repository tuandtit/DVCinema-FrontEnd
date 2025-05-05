import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/base-response/api.response';
import { environment } from '../../environments/environment';

interface Topic {
  id: number;
  name: string;
  slug: string;
}

@Injectable({
  providedIn: 'root',
})
export class TopicService {
  private apiUrl = `${environment.apiBaseUrl}/api/genres`;

  constructor(private http: HttpClient) {}

  getTopics(): Observable<ApiResponse<Topic[]>> {
    return this.http.get<ApiResponse<Topic[]>>(this.apiUrl);
  }
}
