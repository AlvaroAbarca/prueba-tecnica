import { IsOptional, IsString, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class UserSecrets2fa {
  @IsString()
  @IsOptional()
  readonly value: string;

  constructor(value: string) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: string): UserSecrets2fa {
    return new UserSecrets2fa(value);
  }

  equals(other: UserSecrets2fa): boolean {
    if (!(other instanceof UserSecrets2fa)) return false;
    return this.value === other.value;
  }
}
