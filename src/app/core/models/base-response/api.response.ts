import { Status } from './status.response';

export interface ApiResponse<T> {
  status: Status;
  error: number;
  message: string;
  data: T;
}
