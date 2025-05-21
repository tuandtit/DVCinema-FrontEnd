export interface LoginResponse {
  userId: number;
  username: string;
  displayName: string;
  avatar: string;
  token: string;
  tokenExpiry: string;
  refreshToken: string;
  refreshTokenExpiry: string;
  tokenType: string;
}
