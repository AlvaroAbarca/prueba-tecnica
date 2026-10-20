import { Entity, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { ProfileEntity } from './profile.entity';
import { UserEntity } from './user.entity';
import { BaseEntity } from './baseEntity.entity';

// Primary key is the combination of userId and profileId
@Entity('userProfile')
@Unique(['profileId', 'userId'])
export class UserProfileEntity extends BaseEntity {
  @PrimaryColumn({ comment: 'FK to user.id' })
  userId: number;

  @PrimaryColumn({ comment: 'FK to profile.id' })
  profileId: number;

  @ManyToOne(() => ProfileEntity, (profile) => profile.userProfiles, {
    cascade: false,
    nullable: false,
  })
  profile: ProfileEntity;

  @ManyToOne(() => UserEntity, (user) => user.userProfiles, {
    cascade: false,
    nullable: false,
  })
  user: UserEntity;
}
