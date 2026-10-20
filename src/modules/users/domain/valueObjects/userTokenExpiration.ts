import { ValidateVO, IsDate, IsOptional } from '@modules/shared/domain/validators/decorators';

export class UserTokenExpiration {
  @IsDate()
  @IsOptional()
  readonly value: Date | null;

  constructor(value: Date | null) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: Date | null): UserTokenExpiration {
    return new UserTokenExpiration(value);
  }

  equals(other: UserTokenExpiration): boolean {
    if (!(other instanceof UserTokenExpiration)) return false;
    return this.value === other.value;
  }
}
