export interface MovieSearchRequest {
  paging: {
    page: number;
    size: number;
    orders: { [key: string]: string };
  };
  keyword: string;
  status: string[];
  isAvailableOnline: boolean | null;
}
