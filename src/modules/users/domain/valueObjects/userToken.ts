import { IsString, MinLength, MaxLength, ValidateVO, IsOptional } from '@modules/shared/domain/validators/decorators';

export class UserToken {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @IsOptional()
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: string | null): UserToken {
    return new UserToken(value);
  }

  equals(other: UserToken): boolean {
    if (!(other instanceof UserToken)) return false;
    return this.value === other.value;
  }
}
