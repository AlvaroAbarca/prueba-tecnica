import { Entity, Column, OneToMany } from 'typeorm';
import { ProfileRoleEntity } from './profileRole.entity';
import { UserProfileEntity } from './userProfile.entity';
import { BaseEntity } from './baseEntity.entity';

@Entity('profile')
export class ProfileEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50, default: '', comment: 'Display name of the profile' })
  title: string;

  @Column({ type: 'varchar', length: 50, unique: true, comment: 'Unique code identifier for the profile' })
  code: string;

  @Column({ type: 'varchar', length: 100, default: '', comment: 'Brief description of the profile purpose' })
  description: string;

  @Column({ default: true, type: 'boolean', comment: 'Whether the profile is active' })
  enabled: boolean;

  @Column({ nullable: true, type: 'int', comment: 'Display order for sorting purposes' })
  order: number;

  @Column({ default: true, type: 'boolean', comment: 'Whether the profile is visible in listings' })
  visible: boolean;

  @OneToMany(() => ProfileRoleEntity, (profileRole) => profileRole.profile, {
    cascade: false,
    eager: true,
    nullable: true,
  })
  profileRoles?: ProfileRoleEntity[];

  @OneToMany(() => UserProfileEntity, (userProfile) => userProfile.profile, {
    cascade: false,
    eager: true,
    nullable: true,
  })
  userProfiles?: UserProfileEntity[];
}
