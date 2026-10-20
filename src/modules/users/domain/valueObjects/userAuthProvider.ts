import { IsString, MinLength, MaxLength, IsAlpha, ValidateVO, IsOptional } from '@modules/shared/domain/validators/decorators';

export class UserAuthProvider {
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

  static create(value: string): UserAuthProvider {
    return new UserAuthProvider(value);
  }

  equals(other: UserAuthProvider): boolean {
    if (!(other instanceof UserAuthProvider)) return false;
    return this.value === other.value;
  }
}
