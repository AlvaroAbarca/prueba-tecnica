import { UserProfile, UserProfileWithRoles } from './userProfile.interface';

export abstract class UserProfileRepository {
  abstract getProfilesWithRolesByUserId(userId: number): Promise<UserProfileWithRoles[]>;
  abstract getProfilesByEmail(email: string): Promise<UserProfile[]>;
  abstract deleteProfilesByUserId(userId: number): Promise<void>;
}
