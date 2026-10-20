import { ValidateVO, IsDate, IsOptional } from '@modules/shared/domain/validators/decorators';

export class UserResetPasswordDate {
  @IsDate()
  @IsOptional()
  readonly value: Date | null;

  constructor(value: Date | null) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: Date | null): UserResetPasswordDate {
    return new UserResetPasswordDate(value);
  }

  equals(other: UserResetPasswordDate): boolean {
    if (!(other instanceof UserResetPasswordDate)) return false;
    return this.value === other.value;
  }
}
