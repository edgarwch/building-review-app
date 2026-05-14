export type UserRole = 'admin' | 'inspector';

export interface User {
  _id: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
