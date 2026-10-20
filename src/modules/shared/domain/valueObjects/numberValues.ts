import { IsInt, IsNumber, IsOptional, IsPositive, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class NumberValues {
  @IsNumber()
  @IsInt()
  @IsPositive()
  @IsOptional()
  readonly value: number;

  constructor(value: number) {
    this.value = value;
    ValidateVO.validate(this, 'number_values');
  }

  static create(value: number): NumberValues {
    return new NumberValues(value);
  }

  equals(other: NumberValues): boolean {
    if (!(other instanceof NumberValues)) return false;
    return this.value === other.value;
  }
}
