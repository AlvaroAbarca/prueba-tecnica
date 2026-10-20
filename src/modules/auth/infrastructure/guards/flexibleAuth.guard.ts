import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '@modules/shared/infrastructure/decorators/public.decorator';
import { CookieAuthGuard } from './cookieAuth.guard';
import { JwtTokenService } from '../services/jwtToken.service';

@Injectable()
export class FlexibleAuthGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly cookieAuthGuard: CookieAuthGuard,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const bearer = this.extractBearer(request);
    const hasCookieAuth = !!(request.cookies?.access_token || request.cookies?.refresh_token);

    if (bearer) {
      try {
        request.user = await this.jwtTokenService.verifyToken(bearer);
        return true;
      } catch (error) {
        if (hasCookieAuth) {
          return this.cookieAuthGuard.canActivate(context);
        }
        throw error;
      }
    }

    if (hasCookieAuth) {
      return this.cookieAuthGuard.canActivate(context);
    }

    throw new UnauthorizedException('Valid authentication method not found');
  }

  private extractBearer(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
