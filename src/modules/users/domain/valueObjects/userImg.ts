import { IsOptional, IsString, MaxLength, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class UserImg {
  @IsString()
  @MaxLength(256)
  @IsOptional()
  readonly value: string;

  constructor(value: string) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: string): UserImg {
    return new UserImg(value);
  }

  equals(other: UserImg): boolean {
    if (!(other instanceof UserImg)) return false;
    return this.value === other.value;
  }
}
