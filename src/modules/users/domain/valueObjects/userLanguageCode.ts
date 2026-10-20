import { IsRequired, IsString, MinLength, MaxLength, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class UserLanguageCode {
  @IsRequired()
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  readonly value: string;

  constructor(value: string) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: string): UserLanguageCode {
    return new UserLanguageCode(value);
  }

  equals(other: UserLanguageCode): boolean {
    if (!(other instanceof UserLanguageCode)) return false;
    return this.value === other.value;
  }
}
