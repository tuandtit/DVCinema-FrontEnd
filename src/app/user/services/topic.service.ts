import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/base-response/api.response';

interface Topic {
  id: number;
  name: string;
  slug: string;
}

@Injectable({
  providedIn: 'root',
})
export class TopicService {
  private apiUrl = 'http://localhost:8080/api/genres';

  constructor(private http: HttpClient) {}

  getTopics(): Observable<ApiResponse<Topic[]>> {
    return this.http.get<ApiResponse<Topic[]>>(this.apiUrl);
  }
}
