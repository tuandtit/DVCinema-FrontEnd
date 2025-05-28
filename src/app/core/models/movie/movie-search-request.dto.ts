export interface MovieSearchRequest {
  paging: {
    page: number;
    size: number;
    orders: { [key: string]: string };
  };
  query: string;
  status: string[];
}
