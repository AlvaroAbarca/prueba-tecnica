import { IsRequired, IsString, MinLength, MaxLength, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class UserTimeZoneCode {
  @IsRequired()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  readonly value: string;

  constructor(value: string) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: string): UserTimeZoneCode {
    return new UserTimeZoneCode(value);
  }

  equals(other: UserTimeZoneCode): boolean {
    if (!(other instanceof UserTimeZoneCode)) return false;
    return this.value === other.value;
  }
}
