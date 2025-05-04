import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/base-response/api.response';
import { PagingResponse } from '../../shared/base-response/paging-response.dto';
import { ContributorSearchRequest } from '../models/movie/contributor-search-request.dto';
import { ContributorSearchResult } from '../models/movie/contributor-search-result.model';

@Injectable({
  providedIn: 'root',
})
export class ContributorService {
  private apiUrl = 'http://localhost:8080/api/contributors/search';
  private apiGetContributorById = 'http://localhost:8080/api/contriubutors';

  constructor(private http: HttpClient) {}

  getContributors(
    page: number,
    size: number,
    query: string,
    type: string
  ): Observable<ApiResponse<PagingResponse<ContributorSearchResult>>> {
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

    return this.http.post<ApiResponse<PagingResponse<ContributorSearchResult>>>(
      this.apiUrl,
      request
    );
  }

  getMovieById(contributorId: number): Observable<ApiResponse<ContributorSearchResult>> {
    return this.http.get<ApiResponse<ContributorSearchResult>>(
      `${this.apiGetContributorById}/${contributorId}`
    );
  }
}
