import { ValidationException } from '@modules/shared/domain/exceptions/classes';
import { IsArray, IsOptional, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class ArrayStringValues {
  @IsArray()
  @IsOptional()
  readonly value: string[];

  constructor(value: string[]) {
    this.value = value ?? [];
    ValidateVO.validate(this, 'string_values');
    if (this.value.some((v) => typeof v !== 'string')) {
      throw new ValidationException('All values must be strings');
    }
  }

  static create(value: string[]): ArrayStringValues {
    return new ArrayStringValues(value);
  }

  equals(other: ArrayStringValues): boolean {
    if (!(other instanceof ArrayStringValues)) return false;
    return this.value === other.value;
  }
}
