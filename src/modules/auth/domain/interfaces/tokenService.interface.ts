import { TokenResponse } from './tokenResponse.interface';

export interface TokenService {
  generateTokens(payload: Record<string, any>): Promise<TokenResponse>;
  verifyToken(token: string): Promise<Record<string, any>>;
  verifyRefreshToken(token: string): Promise<Record<string, any>>;
  refreshTokens(refreshToken: string): Promise<TokenResponse>;
  isTokenExpired(token: string): boolean;
}
