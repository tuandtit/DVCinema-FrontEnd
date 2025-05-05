import { PagingDto } from './paging.dto';

export interface PagingResponse<T> {
  contents: T[];
  paging: PagingDto;
}
