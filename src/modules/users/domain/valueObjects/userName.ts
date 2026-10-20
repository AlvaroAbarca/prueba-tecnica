import { IsString, MinLength, MaxLength, IsAlpha, ValidateVO, IsOptional } from '@modules/shared/domain/validators/decorators';

export class UserName {
  @IsString()
  @MinLength(3)
  @MaxLength(15)
  @IsAlpha()
  @IsOptional()
  readonly value: string;

  constructor(value: string) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: string): UserName {
    return new UserName(value);
  }

  equals(other: UserName): boolean {
    if (!(other instanceof UserName)) return false;
    return this.value === other.value;
  }
}
