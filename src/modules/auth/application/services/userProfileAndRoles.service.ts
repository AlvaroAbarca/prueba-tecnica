import { Injectable } from '@nestjs/common';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';
import { UserProfileAndRolesRepository } from '@modules/users/domain/interfaces/userProfileAndRoles.interface';

@Injectable()
export class UserProfileAndRolesService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userProfileAndRolesRepository: UserProfileAndRolesRepository,
  ) {}

  async getUserRoles(email: string): Promise<string[]> {
    const user = await this.userRepository.find({ email });
    if (!user) {
      return [];
    }
    const userId = user.getValues().id;
    const profilesWithRoles = await this.userProfileAndRolesRepository.find(userId);
    const allRoles = new Set<string>();

    profilesWithRoles.forEach((profile) => {
      profile.roles.forEach((role) => allRoles.add(role));
    });

    return Array.from(allRoles);
  }
}
