import { Injectable } from '@nestjs/common';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { createUserWithDefaultValues } from '../../domain/services/userCreateWithDefaultsValues.service';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';
import { UserValues } from '@modules/users/domain/interfaces/userValues.interface';
import { ValidationException } from '@modules/shared/domain/exceptions/classes';
import { CipherService } from '@modules/shared/domain/interface/cipherService.interface';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly logger: LogProvider,
    private readonly userRespository: UserRepository,
    private readonly cipherService: CipherService,
  ) {}

  async start(params: { user: Partial<UserValues>; profiles: number[] }): Promise<UserValues> {
    try {
      this.logger.debug(`INI | user-create.use-case.ts - params:${JSON.stringify(params)}`, this.constructor.name);
      const user = params.user;
      if (!params.profiles.length) throw new ValidationException('Profiles cannot be empty');
      if (user.password) {
        user.password = await this.cipherService.generateBcrypt(user.password);
      }
      const createdUser = await this.userRespository.create(createUserWithDefaultValues(user).getValues(), params.profiles);
      this.logger.debug('END | user-create.use-case.ts', this.constructor.name);
      return createdUser.getValues();
    } catch (error) {
      this.logger.error(`ERROR | user-create.use-case.ts ${error.message}`, this.constructor.name);
      throw error;
    }
  }
}
