import { IsDate, IsOptional, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class DateValues {
  @IsDate()
  @IsOptional()
  readonly value: Date;

  constructor(value?: Date) {
    this.value = value;
    ValidateVO.validate(this, 'date_type');
  }

  static create(value: Date): DateValues {
    return new DateValues(value);
  }

  equals(other: DateValues): boolean {
    if (!(other instanceof DateValues)) return false;
    return this.value === other.value;
  }
}
