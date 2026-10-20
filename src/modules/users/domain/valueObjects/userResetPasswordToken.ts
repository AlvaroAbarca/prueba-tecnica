import { IsString, MinLength, MaxLength, ValidateVO, IsOptional } from '@modules/shared/domain/validators/decorators';

export class UserResetPasswordToken {
  @IsString()
  @MinLength(3)
  @MaxLength(15)
  @IsOptional()
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: string | null): UserResetPasswordToken {
    return new UserResetPasswordToken(value);
  }

  equals(other: UserResetPasswordToken): boolean {
    if (!(other instanceof UserResetPasswordToken)) return false;
    return this.value === other.value;
  }
}
