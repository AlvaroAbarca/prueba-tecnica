import { Injectable } from '@nestjs/common';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { AuthResponse } from '@modules/auth/domain/interfaces/authResponse.interface';
import { InternalLoginUseCase } from '../useCases/internalLogin.useCase';
import { InvalidCredentialsException } from '@modules/auth/domain/exceptions/authExceptions';

@Injectable()
export class LoginService {
  constructor(
    private readonly logger: LogProvider,
    private readonly loginInternal: InternalLoginUseCase,
  ) {}

  async execute(params: { emailuser: string; password: string }): Promise<AuthResponse> {
    try {
      this.logger.debug(`INI | login.service.ts - emailuser:${params.emailuser}`, this.constructor.name);
      const result = await this.loginInternal.execute({
        emailuser: params.emailuser,
        password: params.password,
      });
      this.logger.debug('END | login.service.ts', this.constructor.name);
      return result;
    } catch (error) {
      this.logger.error(`Login error for user ${params.emailuser}: ${error}`, this.constructor.name);
      if (error instanceof InvalidCredentialsException) {
        throw error;
      }
      throw new InvalidCredentialsException('User and Password not found');
    }
  }
}
