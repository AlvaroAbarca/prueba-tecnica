import { Entity, Column, OneToMany, Index, BeforeInsert } from 'typeorm';
import { UserProfileEntity } from './userProfile.entity';
import { BaseEntity } from './baseEntity.entity';

import * as crypto from 'node:crypto';

@Entity('user')
export class UserEntity extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 14, nullable: true, comment: 'Chilean national identification number (RUT)' })
  rut?: string;

  @Column({ type: 'varchar', length: 100, default: '', comment: 'User first name' })
  firstName: string;

  @Column({ type: 'varchar', length: 100, default: '', comment: 'User last name' })
  lastName: string;

  @Index()
  @Column({
    unique: true,
    length: 50,
    comment: 'Email address of the user, must be unique',
    type: 'varchar',
  })
  email: string;

  @Column({ default: false, type: 'boolean', comment: 'Whether the user email has been verified' })
  emailVerified: boolean;

  @Column({ nullable: true, length: 100, comment: 'Hashed password for local authentication' })
  password?: string;

  @Column({ nullable: true, type: 'int', comment: 'Display order for sorting purposes' })
  order?: number;

  @Column({ default: true, type: 'boolean', comment: 'Whether the user is visible in listings' })
  visible: boolean;

  @Column({ default: true, type: 'boolean', comment: 'Whether the user account is active' })
  enabled: boolean;

  @Column({ default: '', length: 50, type: 'varchar', comment: 'Administrative notes about the user' })
  comment?: string;

  @Column({ type: 'timestamptz', nullable: true, comment: 'Timestamp of the most recent successful login' })
  lastLoginDate?: Date;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'IP address of the last login',
    default: '',
  })
  lastLoginIp?: string;

  @Column({ nullable: true, type: 'timestamptz', comment: 'Timestamp of the last password change' })
  lastPasswordUpdate?: Date;

  @Column({ nullable: true, type: 'timestamptz', comment: 'Timestamp of the last failed login attempt' })
  lastFailLogDate?: Date;

  @Column({ default: 'America/Santiago', type: 'varchar', length: 30, comment: 'IANA timezone identifier for the user' })
  timeZoneCode: string;

  @Column({ default: 'es', type: 'varchar', length: 10, comment: 'ISO 639-1 language code for UI localization' })
  languageCode: string;

  @Column({ nullable: true, type: 'text', comment: 'Token used for password reset flow' })
  resetPasswordToken?: string;

  @Column({ type: 'timestamptz', nullable: true, comment: 'Expiration timestamp for the password reset token' })
  resetPasswordDate?: Date;

  @Column({ default: 0, type: 'int', comment: 'Counter for consecutive failed login attempts' })
  failedLoginAttempts: number;

  @Column({ default: false, type: 'boolean', comment: 'Whether the user has been forcefully logged out' })
  logout: boolean;

  @Column({ default: '', type: 'varchar', length: 30, comment: 'Authentication provider name (e.g. local, google, azure)' })
  authProvider: string;

  @Column({ default: '', type: 'varchar', length: 30, comment: 'User phone number' })
  phone: string;

  @Column({ nullable: true, type: 'text', comment: 'Internal unique token generated on user creation' })
  token?: string;

  @Column({ nullable: true, type: 'timestamptz', comment: 'Expiration timestamp for the internal token' })
  tokenExpiration?: Date;

  @Column({ type: 'varchar', length: 256, nullable: true, comment: 'URL or path to the user profile image' })
  img?: string;

  @Column({ type: 'boolean', default: false, comment: 'Whether two-factor authentication is enabled' })
  enable2fa: boolean;

  @Column({ type: 'varchar', length: 256, nullable: true, comment: 'TOTP secret key for two-factor authentication' })
  secret2fa?: string;

  @Column({ nullable: true, type: 'text', comment: 'Current active session token for the user' })
  sessionToken?: string;

  @Column({ type: 'varchar', length: 5, nullable: true, comment: 'IATA airport code associated with the user' })
  iata?: string;

  @OneToMany(() => UserProfileEntity, (userProfile) => userProfile.user, {
    cascade: false,
    eager: true,
    nullable: true,
  })
  userProfiles?: UserProfileEntity[];

  @BeforeInsert()
  updateToken() {
    if (!this.token || this.token.length === 0) {
      this.token = this.generateToken();
    }
  }

  private generateToken(length = 32): string {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }
}
