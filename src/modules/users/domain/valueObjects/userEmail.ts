import { IsRequired, IsString, MinLength, MaxLength, ValidateVO, IsEmail } from '@modules/shared/domain/validators/decorators';

export class UserEmail {
  @IsRequired()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @IsEmail()
  readonly value: string;

  constructor(value: string) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: string): UserEmail {
    return new UserEmail(value);
  }

  equals(other: UserEmail): boolean {
    if (!(other instanceof UserEmail)) return false;
    return this.value === other.value;
  }
}
