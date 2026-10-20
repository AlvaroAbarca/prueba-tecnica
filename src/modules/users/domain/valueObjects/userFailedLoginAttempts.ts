import { IsInt, IsNumber, IsPositive, IsRequired, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class UserFailedLoginAttempts {
  @IsRequired()
  @IsNumber()
  @IsInt()
  @IsPositive()
  readonly value: number;

  constructor(value: number) {
    this.value = value;
    ValidateVO.validate(this, 'user_age');
  }

  static create(value: number): UserFailedLoginAttempts {
    return new UserFailedLoginAttempts(value);
  }

  equals(other: UserFailedLoginAttempts): boolean {
    if (!(other instanceof UserFailedLoginAttempts)) return false;
    return this.value === other.value;
  }
}
