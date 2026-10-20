import { IsString, MinLength, MaxLength, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class UserPassword {
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value ?? null;
    if (this.value !== null && this.value !== '') {
      ValidateVO.validate(this, this.constructor.name);
    }
  }

  static create(value: string): UserPassword {
    return new UserPassword(value);
  }

  equals(other: UserPassword): boolean {
    if (!(other instanceof UserPassword)) return false;
    return this.value === other.value;
  }
}
