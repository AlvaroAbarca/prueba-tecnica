import { IsInt, IsNumber, IsPositive, IsRequired, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class UserAge {
  @IsRequired()
  @IsNumber()
  @IsInt()
  @IsPositive()
  readonly value: number;

  constructor(value: number) {
    this.value = value;
    ValidateVO.validate(this, 'user_age');
  }

  static create(value: number): UserAge {
    return new UserAge(value);
  }

  equals(other: UserAge): boolean {
    if (!(other instanceof UserAge)) return false;
    return this.value === other.value;
  }
}
