import { Status } from './status.response';

// api-response.model.ts
export interface ApiResponse<T> {
  status: Status;
  data: T;
}
