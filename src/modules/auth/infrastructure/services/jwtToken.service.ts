import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { TokenService } from '../../domain/interfaces/tokenService.interface';
import { InvalidTokenException, TokenExpiredException, RefreshTokenExpiredException } from '../../domain/exceptions/authExceptions';
import { TokenResponse } from '@modules/auth/domain/interfaces/tokenResponse.interface';

@Injectable()
export class JwtTokenService implements TokenService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') || 'default-secret';
    this.jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret';
  }

  async generateTokens(payload: Record<string, any>): Promise<TokenResponse> {
    const accessTokenExpires = Number(this.configService.get<string>('ACCESS_TOKEN_EXPIRES')) || 900;
    const refreshTokenExpires = Number(this.configService.get<string>('REFRESH_TOKEN_EXPIRES')) || 1800;

    const basePayload = {
      iss: this.configService.get<string>('JWT_ISSUER') || 'sistemaEmisor',
      aud: this.configService.get<string>('JWT_AUDIENCE') || 'sistema',
      iat: Math.floor(Date.now() / 1000),
    };
    const enhancedPayload = {
      ...payload,
      ...basePayload,
    };
    const refreshPayload = {
      ...basePayload,
      email: payload.account.email,
    };
    const accessToken = jwt.sign(enhancedPayload, this.jwtSecret, {
      expiresIn: accessTokenExpires,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(refreshPayload, this.jwtRefreshSecret, {
      expiresIn: refreshTokenExpires,
    } as jwt.SignOptions);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessTokenExpires,
      refreshExpiresIn: refreshTokenExpires,
    };
  }

  async verifyToken(token: string): Promise<Record<string, any>> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as Record<string, any>;
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new TokenExpiredException('Access token expired');
      }
      throw new InvalidTokenException('Invalid access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<Record<string, any>> {
    try {
      const decoded = jwt.verify(token, this.jwtRefreshSecret) as Record<string, any>;
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new RefreshTokenExpiredException('Refresh token expired');
      }
      throw new InvalidTokenException('Invalid refresh token');
    }
  }

  async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    const decoded = await this.verifyRefreshToken(refreshToken);
    const { iat: _iat, exp: _exp, ...payload } = decoded;

    return this.generateTokens(payload);
  }

  isTokenExpired(token: string): boolean {
    try {
      jwt.verify(token, this.jwtSecret);
      return false;
    } catch (error) {
      return error.name === 'TokenExpiredError';
    }
  }
}
