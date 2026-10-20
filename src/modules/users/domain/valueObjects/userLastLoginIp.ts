import { IsString, MinLength, MaxLength, ValidateVO, IsIp, IsOptional } from '@modules/shared/domain/validators/decorators';

export class UserLastLoginIp {
  @IsString()
  @MinLength(8)
  @MaxLength(12)
  @IsIp('v4')
  @IsOptional()
  readonly value: string;

  constructor(value: string) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: string): UserLastLoginIp {
    return new UserLastLoginIp(value);
  }

  equals(other: UserLastLoginIp): boolean {
    if (!(other instanceof UserLastLoginIp)) return false;
    return this.value === other.value;
  }
}
