import { IsInt, IsNumber, IsOptional, IsPositive, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class UserOrder {
  @IsNumber()
  @IsInt()
  @IsPositive()
  @IsOptional()
  readonly value: number;

  constructor(value: number) {
    this.value = value;
    ValidateVO.validate(this, 'user_age');
  }

  static create(value: number): UserOrder {
    return new UserOrder(value);
  }

  equals(other: UserOrder): boolean {
    if (!(other instanceof UserOrder)) return false;
    return this.value === other.value;
  }
}
