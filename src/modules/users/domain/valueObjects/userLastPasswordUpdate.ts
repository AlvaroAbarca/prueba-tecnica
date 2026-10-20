import { ValidateVO, IsDate, IsOptional } from '@modules/shared/domain/validators/decorators';

export class UserLastPasswordUpdate {
  @IsDate()
  @IsOptional()
  readonly value: Date | null;

  constructor(value: Date | null) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: Date | null): UserLastPasswordUpdate {
    return new UserLastPasswordUpdate(value);
  }

  equals(other: UserLastPasswordUpdate): boolean {
    if (!(other instanceof UserLastPasswordUpdate)) return false;
    return this.value === other.value;
  }
}
