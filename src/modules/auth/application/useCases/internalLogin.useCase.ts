import { Injectable } from '@nestjs/common';
import { nowUTC } from '@modules/shared/infrastructure/utils/date.helper';
import * as bcrypt from 'bcrypt';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { AuthResponse } from '@modules/auth/domain/interfaces/authResponse.interface';
import { InvalidCredentialsException } from '@modules/auth/domain/exceptions/authExceptions';
import { AuthResponseBuilder } from '@modules/auth/infrastructure/utils/authResponseBuilder';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';
import { LoginValidationService } from '@modules/auth/application/services/loginValidation.service';
import { JwtTokenService } from '@modules/auth/infrastructure/services/jwtToken.service';

interface Params {
  emailuser: string;
  password: string;
}

@Injectable()
export class InternalLoginUseCase {
  constructor(
    private readonly logger: LogProvider,
    private readonly tokenService: JwtTokenService,
    private readonly userRepository: UserRepository,
    private readonly loginValidationService: LoginValidationService,
  ) {}

  async execute(params: Params): Promise<AuthResponse> {
    this.logger.debug(`INI | InternalLoginUseCase - emailuser: ${params.emailuser}`, this.constructor.name);

    try {
      const user = await this.userRepository.find({ email: params.emailuser });

      if (!user) {
        this.logger.debug(`User ${params.emailuser} not found`, this.constructor.name);
        throw new InvalidCredentialsException('User and Password not found');
      }

      const userValues = user.getValues();

      if (!userValues.password) {
        this.logger.debug(`User ${params.emailuser} has no local password`, this.constructor.name);
        throw new InvalidCredentialsException('User and Password not found');
      }

      await this.loginValidationService.execute(params.emailuser, user);

      const userMail = userValues.email;
      const isValidCredentials = await bcrypt.compare(params.password, userValues.password);
      if (!isValidCredentials) {
        const failedUser = {
          ...userValues,
          failedLoginAttempts: userValues.failedLoginAttempts + 1,
          lastFailLogDate: nowUTC().toDate(),
        };
        await this.userRepository.update(userMail, failedUser);
        this.logger.warn(`Invalid credentials for user: ${params.emailuser}`, this.constructor.name);
        throw new InvalidCredentialsException('User and Password not found');
      } else if (user.getValues().failedLoginAttempts > 0) {
        const resetUser = {
          ...userValues,
          failedLoginAttempts: 0,
          lastFailLogDate: null,
        };
        await this.userRepository.update(userMail, resetUser);
        this.logger.debug(`Failed login attempts reset for user: ${params.emailuser}`, this.constructor.name);
      }

      this.logger.debug(`User authenticated: ${user.getValues().email}`, this.constructor.name);

      const userResponse = AuthResponseBuilder.build(user);
      const tokens = await this.tokenService.generateTokens({
        account: userResponse,
        provider: 'internal',
      });

      await this.userRepository.update(userMail, {
        id: user.getValues().id,
        sessionToken: tokens.accessToken,
      });

      this.logger.debug(`END | InternalLoginUseCase - user authenticated: ${user.getValues().email}`, this.constructor.name);

      return {
        ...tokens,
        user: userResponse,
      };
    } catch (error) {
      this.logger.warn(`ERROR | InternalLoginUseCase - ${error instanceof Error ? error.message : error}`, this.constructor.name);
      throw error;
    }
  }
}
