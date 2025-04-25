import { ApiStatusDto } from './api-status.dto';
import { PagingDto } from './paging.dto';

export interface PagingResponse<T> {
  // status: ApiStatusDto;
  // data: {
  contents: T[];
  paging: PagingDto;
  // };
}
