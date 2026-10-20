import { IsRequired, ValidateVO, IsBoolean } from '@modules/shared/domain/validators/decorators';

export class UserLogout {
  @IsRequired()
  @IsBoolean()
  readonly value: boolean;

  constructor(value: boolean) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: boolean): UserLogout {
    return new UserLogout(value);
  }

  equals(other: UserLogout): boolean {
    if (!(other instanceof UserLogout)) return false;
    return this.value === other.value;
  }
}
