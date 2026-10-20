import { Injectable } from '@nestjs/common';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { UserProfileRepository } from '../../domain/interfaces/userProfileRepository.interface';
import { ValidationException } from '@modules/shared/domain/exceptions/classes';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    private readonly logger: LogProvider,
    private readonly userTransacction: UserRepository,
    private readonly userProfileRespository: UserProfileRepository,
  ) {}

  async start(params: { ids: number[]; user: string }): Promise<void> {
    try {
      this.logger.debug(`INI | user-delete.use-case - params:${JSON.stringify(params)}`, this.constructor.name);
      if (!params.ids || params.ids.length === 0) {
        throw new ValidationException('No IDs provided for deletion');
      }

      if (!params.user) {
        throw new ValidationException('No user provided');
      }

      const userEntity = await this.userTransacction.find({ email: params.user });
      if (!userEntity) {
        throw new ValidationException('User not found');
      }
      if (params.ids.includes(userEntity.getValues().id)) {
        throw new ValidationException('Cannot delete the authenticated user');
      }

      await this.userTransacction.delete(params.ids);
      for (const id of params.ids) {
        await this.userProfileRespository.deleteProfilesByUserId(id);
      }
      this.logger.debug('END | user-delete.use-cas', this.constructor.name);
    } catch (error) {
      this.logger.error(`ERROR | user-delete.use-case ${error.message}`, this.constructor.name);
      throw error;
    }
  }
}
