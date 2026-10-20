import { Entity, ManyToOne, JoinColumn, PrimaryColumn, Unique } from 'typeorm';
import { ProfileEntity } from './profile.entity';
import { RoleEntity } from './role.entity';
import { BaseEntity } from './baseEntity.entity';

// Primary key is the combination of profileId and roleId
@Entity('profileRole')
@Unique(['profileId', 'roleId'])
export class ProfileRoleEntity extends BaseEntity {
  @ManyToOne(() => ProfileEntity, (profile) => profile.profileRoles, {
    cascade: false,
    nullable: false,
  })
  @JoinColumn({ name: 'profileId' })
  profile: ProfileEntity;

  @ManyToOne(() => RoleEntity, (role) => role.profileRoles, {
    cascade: false,
    nullable: false,
  })
  @JoinColumn({ name: 'roleId' })
  role: RoleEntity;

  @PrimaryColumn({ comment: 'FK to profile.id' })
  profileId: number;

  @PrimaryColumn({ comment: 'FK to role.id' })
  roleId: number;
}
