import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { JwtTokenService } from '../services/jwtToken.service';
import { RefreshTokenUseCase } from '../../application/useCases/refreshToken.useCase';
import { RefreshTokenExpiredException } from '../../domain/exceptions/authExceptions';
import { IS_PUBLIC_KEY } from '@modules/shared/infrastructure/decorators/public.decorator';
import '../middleware/expressExtensions.middleware';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';

@Injectable()
export class CookieAuthGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly reflector: Reflector,
    private readonly logger: LogProvider,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si la ruta está marcada como pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const accessToken = request.cookies?.access_token;
    const refreshToken = request.cookies?.refresh_token;

    // Si hay access token, intentar verificarlo
    if (accessToken) {
      try {
        await this.setUserFromToken(accessToken, request);
        return true;
      } catch (error) {
        // Si expiró y hay refresh token, intentar renovar
        if (error.name === 'TokenExpiredError' && refreshToken) {
          return await this.tryRefreshToken(refreshToken, response, request);
        }
        // Si falla por otro motivo, limpiar cookies y rechazar
        this.clearAndReject(response, 'Not authorized');
        return false;
      }
    }

    // Si NO hay access token pero SÍ hay refresh token, intentar renovar
    if (!accessToken && refreshToken) {
      return await this.tryRefreshToken(refreshToken, response, request);
    }

    // Si el error no es por expiración o no hay refresh token, limpiar cookies
    this.clearAndReject(response, 'Not authorized');
    return false;
  }

  private async setUserFromToken(token: string, request: Request): Promise<void> {
    const decoded = await this.jwtTokenService.verifyToken(token);
    request.user = decoded;
  }

  private async tryRefreshToken(refreshToken: string, response: Response, request: Request): Promise<boolean> {
    try {
      const result = await this.refreshTokenUseCase.execute(refreshToken);
      response.setAuthCookies(result.accessToken, result.refreshToken, result.expiresIn);
      await this.setUserFromToken(result.accessToken, request);
      // Marcar que se acaba de hacer refresh para que VerificationService use el token correcto
      request['tokenJustRefreshed'] = result.accessToken;
      request['refreshTokenJustRefreshed'] = result.refreshToken;
      request['tokenExpiresIn'] = result.expiresIn;
      return true;
    } catch {
      response.clearAuthCookies();
      throw new RefreshTokenExpiredException('Session expired');
    }
  }

  private clearAndReject(response: Response, message: string): never {
    response.clearAuthCookies();
    throw new UnauthorizedException(message);
  }
}

// Extender el tipo Request para incluir user
declare module 'express' {
  interface Request {
    user?: Record<string, any>;
  }
}
