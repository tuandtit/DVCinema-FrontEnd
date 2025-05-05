export interface ContributorSearchRequest {
  paging: {
    page: number;
    size: number;
    orders: { [key: string]: string };
  };
  query: string;
  type: string;
}
