import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import './expressExtensions.middleware';

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  domain?: string;
  path: string;
  expires?: Date;
}

@Injectable()
export class CookieMiddleware implements NestMiddleware {
  private readonly isProduction = process.env.NODE_ENV?.toLowerCase().startsWith('prod');
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.attachCookieMethods(res);
    next();
  }

  private attachCookieMethods(res: Response): void {
    res.setAuthCookies = (accessToken: string, refreshToken: string, expiresIn: number) => {
      const accessTokenMaxAge = expiresIn * 1000;
      const refreshTokenMaxAge = Number(this.configService.get<string>('REFRESH_TOKEN_EXPIRES') || 1800) * 1000;

      res.cookie('access_token', accessToken, {
        ...this.buildCookieOptions('/'),
        maxAge: accessTokenMaxAge,
      });

      res.cookie('refresh_token', refreshToken, {
        ...this.buildCookieOptions('/'),
        maxAge: refreshTokenMaxAge,
      });
    };

    res.clearAuthCookies = () => {
      res.clearCookie('access_token', this.buildCookieOptions('/'));
      res.clearCookie('refresh_token', this.buildCookieOptions('/'));
    };
  }

  private buildCookieOptions(path: string): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      domain: undefined,
      path,
    };
  }
}
