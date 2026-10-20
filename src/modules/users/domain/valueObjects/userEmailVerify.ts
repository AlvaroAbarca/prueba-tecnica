import { IsRequired, ValidateVO, IsBoolean } from '@modules/shared/domain/validators/decorators';

export class UserEmailVerify {
  @IsRequired()
  @IsBoolean()
  readonly value: boolean;

  constructor(value: boolean) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: boolean): UserEmailVerify {
    return new UserEmailVerify(value);
  }

  equals(other: UserEmailVerify): boolean {
    if (!(other instanceof UserEmailVerify)) return false;
    return this.value === other.value;
  }
}
