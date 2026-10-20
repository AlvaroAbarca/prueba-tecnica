import { DataSource, EntityManager } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { UserProfileEntity } from '@modules/shared/infrastructure/entities/userProfile.entity';
import { ProfileEntity } from '@modules/shared/infrastructure/entities/profile.entity';
import { ProfileRoleEntity } from '@modules/shared/infrastructure/entities/profileRole.entity';
import { RoleEntity } from '@modules/shared/infrastructure/entities/role.entity';
import { UserProfileAndRolesRepository } from '@modules/users/domain/interfaces/userProfileAndRoles.interface';
import { UserProfileWithRoles } from '@modules/users/domain/interfaces/userProfile.interface';

@Injectable()
export class UserProfileAndRolesRepositoryDB implements UserProfileAndRolesRepository {
  private manager: EntityManager;

  constructor(@InjectDataSource('postgres') private readonly dataSource: DataSource) {
    this.manager = this.dataSource.manager;
  }

  public set setManager(v: EntityManager) {
    this.manager = v;
  }

  async find(userId: number): Promise<UserProfileWithRoles[]> {
    const queryBuilder = this.manager
      .createQueryBuilder(UserProfileEntity, 'up')
      .innerJoin(ProfileEntity, 'p', 'p.id = up.profileId')
      .leftJoin(ProfileRoleEntity, 'pr', 'pr.profileId = p.id')
      .leftJoin(RoleEntity, 'r', 'r.id = pr.roleId AND r.enabled = :roleEnabled')
      .select(['p.id as profileId', 'p.title as profileName', 'p.description as profileDescription', 'r.code as roleCode'])
      .where('up.userId = :userId', { userId })
      .andWhere('p.enabled = :enabled', { enabled: true })
      .setParameter('roleEnabled', true)
      .orderBy('p.title', 'ASC')
      .addOrderBy('r.order', 'ASC')
      .addOrderBy('r.code', 'ASC');

    const profileRolesRaw = await queryBuilder.getRawMany();
    const profilesMap = new Map<number, { id: number; name: string; description: string; roles: Set<string> }>();

    profileRolesRaw.forEach((row) => {
      const profileId = row.profileid || row.profileId;
      const profileName = row.profilename || row.profileName;
      const profileDescription = row.profiledescription || row.profileDescription;
      const roleCode = row.rolecode || row.roleCode;

      if (!profilesMap.has(profileId)) {
        profilesMap.set(profileId, {
          id: profileId,
          name: profileName,
          description: profileDescription || '',
          roles: new Set<string>(),
        });
      }
      if (roleCode) {
        profilesMap.get(profileId).roles.add(roleCode);
      }
    });

    const result = Array.from(profilesMap.values()).map((profile) => ({
      id: profile.id,
      name: profile.name,
      description: profile.description,
      roles: Array.from(profile.roles),
    }));
    return result;
  }
}
