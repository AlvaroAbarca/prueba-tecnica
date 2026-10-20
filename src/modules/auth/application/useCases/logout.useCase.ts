import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';
import { UserValues } from '@modules/users/domain/interfaces/userValues.interface';
import { Injectable } from '@nestjs/common';

interface Params {
  emailuser: string;
}

@Injectable()
export class InternalLogoutUseCase {
  constructor(
    private readonly logger: LogProvider,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(params: Params): Promise<void> {
    this.logger.debug(`INI | InternalLogoutUseCase - emailuser: ${params.emailuser}`, this.constructor.name);

    try {
      // Obtener configuraciones dinámicas

      const user = await this.userRepository.find({ email: params.emailuser });
      const userValues = user.getValues();
      if (!userValues) {
        throw new Error('User not found');
      }
      const newUser: UserValues = {
        ...userValues,
        logout: false,
        sessionToken: null,
      };
      await this.userRepository.update(userValues.email, newUser);
      this.logger.info(`Logout for user: ${params.emailuser}`, this.constructor.name);
    } catch (error) {
      this.logger.error(`ERROR | InternalLogoutUseCase - ${error.message}`, this.constructor.name);
      throw error;
    }
  }
}
