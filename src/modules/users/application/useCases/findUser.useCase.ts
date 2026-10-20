import { Injectable } from '@nestjs/common';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { NotFoundException } from '@modules/shared/domain/exceptions/classes/notFoundException';
import { UserProfileRepository } from '../../domain/interfaces/userProfileRepository.interface';
import { UserProfileWithRoles } from '../../domain/interfaces/userProfile.interface';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';
import { UserValues } from '@modules/users/domain/interfaces/userValues.interface';
import { FilterToFindUsers } from '@modules/users/domain/interfaces/filterToFind.interface';

@Injectable()
export class FindUserUseCase {
  constructor(
    private readonly logger: LogProvider,
    private readonly userRepository: UserRepository,
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  async start(filter: Pick<FilterToFindUsers['filter'], 'id' | 'email' | 'rut' | 'token'>): Promise<UserValues & { profiles: UserProfileWithRoles[] }> {
    try {
      this.logger.debug(`INI | findUser.useCase.ts - filters:${JSON.stringify(filter)}`, this.constructor.name);
      const user = await this.userRepository.find(filter);
      if (!user) throw new NotFoundException('No user found');
      const profileWithRoles = await this.userProfileRepository.getProfilesWithRolesByUserId(user.getValues().id);
      return { ...user.getValues(), profiles: profileWithRoles };
    } catch (error) {
      this.logger.error(`ERROR | findUser.useCase.ts error=${JSON.stringify(error)}`, this.constructor.name);
      throw error;
    }
  }
}
