export interface User {
  _id?: string;
  id?: string;
  email?: string;
  username?: string;
  role?: string;
  avatarUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface DecodedJwt {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}
