import { Entity, Column, OneToMany } from 'typeorm';
import { ProfileRoleEntity } from './profileRole.entity';
import { BaseEntity } from './baseEntity.entity';

@Entity('role')
export class RoleEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100, default: '', comment: 'Display name of the role' })
  title: string;

  @Column({ type: 'varchar', length: 100, unique: true, comment: 'Unique code identifier for the role' })
  code: string;

  @Column({ type: 'varchar', length: 100, default: '', comment: 'Brief description of the role purpose' })
  description: string;

  @Column({ default: true, type: 'boolean', comment: 'Whether the role is active' })
  enabled: boolean;

  @Column({ nullable: true, type: 'int', comment: 'Display order for sorting purposes' })
  order: number;

  @Column({ default: true, type: 'boolean', comment: 'Whether the role is visible in listings' })
  visible: boolean;

  @OneToMany(() => ProfileRoleEntity, (profileRole) => profileRole.role)
  profileRoles: ProfileRoleEntity[];
}
