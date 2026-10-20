import { IsInt, IsNumber, IsOptional, IsPositive, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class UserId {
  @IsNumber()
  @IsInt()
  @IsPositive()
  @IsOptional()
  readonly value: number;

  constructor(value: number) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: number): UserId {
    return new UserId(value);
  }

  equals(other: UserId): boolean {
    if (!(other instanceof UserId)) return false;
    return this.value === other.value;
  }
}
