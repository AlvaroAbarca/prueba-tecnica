import { ValidateVO, IsDate, IsOptional } from '@modules/shared/domain/validators/decorators';

export class UserLastFailLogDate {
  @IsDate()
  @IsOptional()
  readonly value: Date | null;

  constructor(value: Date | null) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: Date | null): UserLastFailLogDate {
    return new UserLastFailLogDate(value);
  }

  equals(other: UserLastFailLogDate): boolean {
    if (!(other instanceof UserLastFailLogDate)) return false;
    return this.value === other.value;
  }
}
