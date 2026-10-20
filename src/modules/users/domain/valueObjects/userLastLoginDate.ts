import { ValidateVO, IsDate, IsOptional } from '@modules/shared/domain/validators/decorators';

export class UserLastLoginDate {
  @IsDate()
  @IsOptional()
  readonly value: Date | null;

  constructor(value: Date | null) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: Date | null): UserLastLoginDate {
    return new UserLastLoginDate(value);
  }

  equals(other: UserLastLoginDate): boolean {
    if (!(other instanceof UserLastLoginDate)) return false;
    return this.value === other.value;
  }
}
