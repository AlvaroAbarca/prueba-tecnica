import { Injectable } from '@nestjs/common';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { JwtTokenService } from '@modules/auth/infrastructure/services/jwtToken.service';
import { Token } from '../../domain/valueObjects/token';
import { InvalidTokenException } from '../../domain/exceptions/authExceptions';
import { TokenResponse } from '@modules/auth/domain/interfaces/tokenResponse.interface';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';
import { AuthResponseBuilder } from '@modules/auth/infrastructure/utils/authResponseBuilder';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly logger: LogProvider,
    private readonly tokenService: JwtTokenService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(refreshToken: string): Promise<TokenResponse> {
    this.logger.debug(`INI | RefreshTokenUseCase`, this.constructor.name);

    try {
      if (!refreshToken) {
        throw new InvalidTokenException('Token de refresco requerido');
      }

      const tokenVO = new Token(refreshToken);
      const decoded = await this.tokenService.verifyRefreshToken(tokenVO.value);
      const user = await this.userRepository.find({ email: decoded.email });
      const userResponse = AuthResponseBuilder.build(user);
      const newTokens = await this.tokenService.generateTokens({
        account: userResponse,
        provider: 'internal',
      });
      if (user) {
        this.logger.debug(`Updating sessionToken in DB with new access token: ${newTokens.accessToken.substring(0, 50)}...`, this.constructor.name);
        await this.userRepository.update(user.getValues().email, {
          sessionToken: newTokens.accessToken,
        });
        this.logger.debug(`SessionToken updated successfully for user: ${decoded.email}`, this.constructor.name);
      }

      const tokenResponse: TokenResponse = {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        expiresIn: newTokens.expiresIn,
        refreshExpiresIn: newTokens.refreshExpiresIn,
        tokenType: 'Bearer',
      };

      this.logger.debug(`END | RefreshTokenUseCase - tokens refreshed and sessionToken updated successfully`, this.constructor.name);

      return tokenResponse;
    } catch (error) {
      this.logger.error(`ERROR | RefreshTokenUseCase - ${error.message}`, this.constructor.name);
      throw error;
    }
  }
}
