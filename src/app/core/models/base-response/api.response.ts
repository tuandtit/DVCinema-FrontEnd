import { Status } from './status.response';

export interface ApiResponse<T> {
  status: Status;
  data: T;
}
