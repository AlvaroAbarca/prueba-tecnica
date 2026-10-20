import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { transactionContext } from '@modules/shared/infrastructure/persistences/transactionManagerDB';
import { UserProfileEntity } from '@modules/shared/infrastructure/entities/userProfile.entity';
import { ProfileEntity } from '@modules/shared/infrastructure/entities/profile.entity';
import { UserEntity } from '@modules/shared/infrastructure/entities/user.entity';
import { UserProfileRepository } from '@modules/users/domain/interfaces/userProfileRepository.interface';
import { UserProfile } from '@modules/users/domain/interfaces/userProfile.interface';

@Injectable()
export class UserProfileRepositoryDB implements UserProfileRepository {
  private readonly manager: EntityManager;

  constructor(@InjectDataSource('postgres') private readonly dataSource: DataSource) {
    this.manager = this.dataSource.manager;
  }

  private getManager(): EntityManager {
    return transactionContext.getStore() ?? this.manager;
  }

  async getProfilesByEmail(email: string): Promise<UserProfile[]> {
    const profiles = await this.manager
      .createQueryBuilder(ProfileEntity, 'profile')
      .innerJoin(UserProfileEntity, 'userProfile', 'profile.id = userProfile.profileId')
      .innerJoin(UserEntity, 'user', 'user.id = userProfile.userId')
      .where('user.email = :email', { email })
      .andWhere('user.enabled = :userEnabled', { userEnabled: true })
      .andWhere('profile.enabled = :profileEnabled', { profileEnabled: true })
      .orderBy('profile.name', 'ASC')
      .getMany();

    return profiles.map((profile) => ({
      id: profile.id,
      title: profile.title,
      code: profile.code,
      description: profile.description || '',
      enabled: profile.enabled,
    }));
  }

  async getProfilesWithRolesByUserId(userId: number): Promise<any[]> {
    const userProfiles = await this.manager
      .createQueryBuilder(UserProfileEntity, 'userProfile')
      .leftJoinAndSelect('userProfile.profile', 'profile')
      .leftJoinAndSelect('profile.profileRoles', 'profileRole')
      .leftJoinAndSelect('profileRole.role', 'role')
      .where('userProfile.userId = :userId', { userId })
      .andWhere('profile.enabled = :profileEnabled', { profileEnabled: true })
      .andWhere('(role.enabled = :roleEnabled OR role.enabled IS NULL)', { roleEnabled: true })
      .orderBy('role.order', 'ASC', 'NULLS LAST')
      .addOrderBy('role.code', 'ASC')
      .getMany();

    const profilesMap = new Map();

    userProfiles.forEach((userProfile) => {
      const profile = userProfile.profile;

      if (!profilesMap.has(profile.id)) {
        profilesMap.set(profile.id, {
          id: profile.id,
          code: profile.code,
          title: profile.title,
          description: profile.description || '',
          roles: new Set(),
        });
      }

      const profileData = profilesMap.get(profile.id);

      profile.profileRoles?.forEach((profileRole) => {
        if (profileRole.role?.enabled) {
          profileData.roles.add(profileRole.role.code);
        }
      });
    });

    return Array.from(profilesMap.values()).map((profile) => ({
      id: profile.id,
      code: profile.code,
      title: profile.title,
      description: profile.description,
      roles: Array.from(profile.roles),
    }));
  }

  async deleteProfilesByUserId(userId: number): Promise<void> {
    await this.getManager().delete(UserProfileEntity, { userId });
  }
}
