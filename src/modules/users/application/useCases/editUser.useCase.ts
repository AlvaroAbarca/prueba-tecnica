import { Injectable } from '@nestjs/common';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { BusinessException, ValidationException } from '@modules/shared/domain/exceptions/classes';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';
import { UserValues } from '@modules/users/domain/interfaces/userValues.interface';
import { User } from '@modules/users/domain/models/user';
import { CipherService } from '@modules/shared/domain/interface/cipherService.interface';
import { UserEmail } from '@modules/users/domain/valueObjects/userEmail';

@Injectable()
export class EditUserUseCase {
  constructor(
    private readonly logger: LogProvider,
    private readonly userRepository: UserRepository,
    private readonly cipherService: CipherService,
  ) {}

  async start(user: Partial<UserValues>, profilesIds?: number[]): Promise<User> {
    try {
      this.logger.debug(`INI | user-edit.use-case - params:${JSON.stringify(user)}`, this.constructor.name);
      if (!user.id) throw new ValidationException('ID empty');
      if (user.email) UserEmail.create(user.email);

      const userFound = await this.userRepository.find({ id: user.id });
      if (!userFound) throw new BusinessException('User not found');

      if (user.password) {
        if (userFound.getValues().authProvider?.toLowerCase() === 'keycloak') {
          throw new BusinessException('No change password for keycloak user');
        }
        user.password = await this.cipherService.generateBcrypt(user.password);
        user.failedLoginAttempts = 0;
        user.logout = true;
      }

      const result = await this.userRepository.update(userFound.getValues().email, user, profilesIds);
      this.logger.debug('END | user-edit.use-case', this.constructor.name);
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(JSON.stringify(error));
      this.logger.error(`ERROR | user-edit.use-case ${errorMessage}`, this.constructor.name);
      throw error;
    }
  }
}
