import { ValidateVO, IsOptional, IsString, MinLength, MaxLength } from '@modules/shared/domain/validators/decorators';
export class UserIata {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(5)
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
    if (value !== null) ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: string | null): UserIata {
    return new UserIata(value);
  }

  equals(other: UserIata): boolean {
    if (!(other instanceof UserIata)) return false;
    return this.value === other.value;
  }
}
