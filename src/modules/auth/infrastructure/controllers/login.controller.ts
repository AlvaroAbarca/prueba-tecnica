import { Body, Controller, Post, Res, Req, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginService } from '@modules/auth/application/services/login.service';
import { Public } from '@modules/shared/infrastructure/decorators/public.decorator';
import { EmitResponse } from '@modules/shared/infrastructure/dto/respuesta';
import { LoginDTO } from '../dto/login.dto';
import '../middleware/expressExtensions.middleware';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { AuthResponse } from '@modules/auth/domain/interfaces/authResponse.interface';
import { ApiTags } from '@nestjs/swagger';
import { InternalLogoutUseCase } from '@modules/auth/application/useCases/logout.useCase';
import { SwaggerLoginDecorators, SwaggerLogoutDecorators } from './swagger/login.swagger';

@ApiTags('Auth')
@Controller(['api', ''])
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly logoutUseCase: InternalLogoutUseCase,
    private readonly logger: LogProvider,
  ) {}

  @Public()
  @Post('auth/login')
  @SwaggerLoginDecorators()
  async login(@Body() loginDto: LoginDTO, @Res({ passthrough: true }) response: Response) {
    const result: AuthResponse = await this.loginService.execute({
      emailuser: loginDto.emailuser,
      password: loginDto.password,
    });

    response.setAuthCookies(result.accessToken, result.refreshToken, result.expiresIn);
    this.logger.debug('Successful login', result);
    return EmitResponse.ok('Successful login', {}, HttpStatus.OK);
  }

  @Post('auth/logout')
  @SwaggerLogoutDecorators()
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    try {
      const email = request.user?.account?.email;

      if (!email) {
        return EmitResponse.error('Invalid token', [{ message: 'Email not found in token' }]);
      }
      await this.logoutUseCase.execute({ emailuser: email });
    } catch (error) {
      this.logger.error('Error during logout', error);
      response.clearAuthCookies();
      return EmitResponse.error('Error during logout', [{ message: error.message }], HttpStatus.INTERNAL_SERVER_ERROR);
    }
    response.clearAuthCookies();
    this.logger.debug('Cookies cleared');
    return EmitResponse.ok('Successful logout', null);
  }
}
