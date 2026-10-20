import { dayjs } from '@modules/shared/infrastructure/utils/date.helper';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';
import { Injectable } from '@nestjs/common';
import { InvalidCredentialsException } from '@modules/auth/domain/exceptions/authExceptions';
import { User } from '@modules/users/domain/models/user';

const MAX_FAILED_LOGINS = 5;
const BLOCK_NO_CHANGE_PASSWORD_DAYS = 90;
const BLOCK_INACTIVE_ACCOUNT_DAYS = 60;
const INACTIVE_ACCOUNT_DAYS = 90;

interface LoginPolicyConfig {
  maxFailedLogins: number;
  blockNoChangePasswordDays: number;
  blockInactiveAccountDays: number;
  inactiveAccountDays: number;
}

@Injectable()
export class LoginValidationService {
  constructor(
    private readonly logger: LogProvider,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(email: string, user: User): Promise<void> {
    this.logger.debug(`INI | LoginValidationService - email: ${email}`, this.constructor.name);

    const config = this.loadPolicyConfig();

    this.validateUserExists(email, user);
    this.validateUserEnabled(email, user);
    this.validateAccountNotLocked(email, user, config.maxFailedLogins);
    this.validatePasswordNotExpired(email, user, config.blockNoChangePasswordDays);
    await this.validateAccountActivity(email, user, config);

    this.logger.debug(`END | LoginValidationService - email: ${email}`, this.constructor.name);
  }

  private loadPolicyConfig(): LoginPolicyConfig {
    return {
      maxFailedLogins: MAX_FAILED_LOGINS,
      blockNoChangePasswordDays: BLOCK_NO_CHANGE_PASSWORD_DAYS,
      blockInactiveAccountDays: BLOCK_INACTIVE_ACCOUNT_DAYS,
      inactiveAccountDays: INACTIVE_ACCOUNT_DAYS,
    };
  }

  private validateUserExists(email: string, user: User): void {
    if (!user) {
      this.logger.error(`User not found: ${email}`, this.constructor.name);
      throw new InvalidCredentialsException('User and Password not found');
    }
  }

  private validateUserEnabled(email: string, user: User): void {
    if (!user.getValues().enabled) {
      this.logger.error(`User disabled: ${email}`, this.constructor.name);
      throw new InvalidCredentialsException('User and Password not found');
    }
  }

  private validateAccountNotLocked(email: string, user: User, maxFailedLogins: number): void {
    if (user.getValues().failedLoginAttempts >= maxFailedLogins) {
      this.logger.error(`Account locked due to failed login attempts: ${email}`, this.constructor.name);
      throw new InvalidCredentialsException('User locked due to failed login attempts');
    }
  }

  private validatePasswordNotExpired(email: string, user: User, blockNoChangePasswordDays: number): void {
    const lastPasswordUpdate = user.getValues().lastPasswordUpdate;
    if (!lastPasswordUpdate) return;

    const daysSincePasswordUpdate = dayjs().diff(dayjs(lastPasswordUpdate), 'day');
    if (daysSincePasswordUpdate > blockNoChangePasswordDays) {
      this.logger.error(`Password expired. Days since last update: ${daysSincePasswordUpdate}, Max allowed: ${blockNoChangePasswordDays}`, this.constructor.name);
      throw new InvalidCredentialsException('User and Password not found');
    }
  }

  private async validateAccountActivity(email: string, user: User, config: LoginPolicyConfig): Promise<void> {
    const lastLoginDate = user.getValues().lastLoginDate;
    if (!lastLoginDate) return;

    const daysSinceLastLogin = dayjs().diff(dayjs(lastLoginDate), 'day');

    if (daysSinceLastLogin > config.blockInactiveAccountDays) {
      const userValues = user.getValues();
      const lockedUser = {
        ...userValues,
        enabled: false,
        comment: `Account locked due to inactivity for more than ${daysSinceLastLogin} days (max: ${config.blockInactiveAccountDays})`,
      };
      await this.userRepository.update(userValues.email, lockedUser);

      this.logger.error(`Account locked due to inactivity: ${email}`, this.constructor.name);
      throw new InvalidCredentialsException('User and Password not found');
    }

    if (daysSinceLastLogin > config.inactiveAccountDays) {
      this.logger.error(`Account inactive: ${daysSinceLastLogin} days (max inactive: ${config.inactiveAccountDays})`, this.constructor.name);
      throw new InvalidCredentialsException('User and Password not found');
    }
  }
}
