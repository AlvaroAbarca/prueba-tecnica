import { IsString, MinLength, MaxLength, ValidateVO, IsOptional } from '@modules/shared/domain/validators/decorators';

export class UserIsActiveDetail {
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  @IsOptional()
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: string | null): UserIsActiveDetail {
    return new UserIsActiveDetail(value);
  }

  equals(other: UserIsActiveDetail): boolean {
    if (!(other instanceof UserIsActiveDetail)) return false;
    return this.value === other.value;
  }
}
