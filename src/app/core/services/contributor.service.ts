import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/base-response/api.response';
import { PagingResponse } from '../models/base-response/paging-response.dto';
import { ContributorSearchRequest } from '../models/contributor/contributor-search-request.dto';
import { ContributorDto } from '../models/contributor/contributor-search-result.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContributorService {
  private apiUrl = `${environment.apiBaseUrl}/api/contributors/search`;
  private apiGetContributorById = `${environment.apiBaseUrl}/api/contributors`;

  constructor(private http: HttpClient) {}

  getContributors(
    page: number,
    size: number,
    query: string,
    type: string
  ): Observable<ApiResponse<PagingResponse<ContributorDto>>> {
    const request: ContributorSearchRequest = {
      paging: {
        page: page,
        size: size,
        orders: {
          id: 'DESC',
        },
      },
      query: query,
      type: type,
    };

    return this.http.post<ApiResponse<PagingResponse<ContributorDto>>>(this.apiUrl, request);
  }

  getMovieById(contributorId: number): Observable<ApiResponse<ContributorDto>> {
    return this.http.get<ApiResponse<ContributorDto>>(
      `${this.apiGetContributorById}/${contributorId}`
    );
  }
}
