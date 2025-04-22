export interface LoginResponse {
  username: string;
  avatar: string;
  token: string;
  tokenExpiry: string;
  refreshToken: string;
  refreshTokenExpiry: string;
  tokenType: string;
}
