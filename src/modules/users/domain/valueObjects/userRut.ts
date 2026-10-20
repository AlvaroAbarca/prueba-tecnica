import { IsString, MinLength, MaxLength, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class UserRut {
  @IsString()
  @MinLength(8)
  @MaxLength(12)
  readonly value: string;

  constructor(value: string) {
    this.value = value;
    if (this.value) {
      ValidateVO.validate(this, this.constructor.name);
    }
  }

  static create(value: string): UserRut {
    return new UserRut(value);
  }

  equals(other: UserRut): boolean {
    if (!(other instanceof UserRut)) return false;
    return this.value === other.value;
  }
}
