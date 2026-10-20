import { IsString, MinLength, MaxLength, ValidateVO, IsOptional } from '@modules/shared/domain/validators/decorators';

export class UserPhone {
  @IsString()
  @MinLength(3)
  @MaxLength(15)
  @IsOptional()
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: string | null): UserPhone {
    return new UserPhone(value);
  }

  equals(other: UserPhone): boolean {
    if (!(other instanceof UserPhone)) return false;
    return this.value === other.value;
  }
}
