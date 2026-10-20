import { ValidateVO, IsBoolean } from '@modules/shared/domain/validators/decorators';

export class UserEnable2fa {
  @IsBoolean()
  readonly value: boolean;

  constructor(value: boolean) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: boolean): UserEnable2fa {
    return new UserEnable2fa(value);
  }

  equals(other: UserEnable2fa): boolean {
    if (!(other instanceof UserEnable2fa)) return false;
    return this.value === other.value;
  }
}
