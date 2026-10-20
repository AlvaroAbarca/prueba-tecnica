import { UserProfileWithRoles } from './userProfile.interface';

export abstract class UserProfileAndRolesRepository {
  abstract find(userId: number): Promise<UserProfileWithRoles[]>;
}
