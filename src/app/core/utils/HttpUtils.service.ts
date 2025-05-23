import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpUtilsService {
  constructor() {}

  getHTTPHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  getHTTPOptions(): { headers: HttpHeaders; withCredentials: boolean } {
    return {
      headers: this.getHTTPHeaders(),
      withCredentials: true,
    };
  }
}
