import { IsString, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class StringValues {
  @IsString()
  readonly value: string;

  constructor(value: string) {
    this.value = value;
    ValidateVO.validate(this, 'string_type');
  }

  static create(value: string): StringValues {
    return new StringValues(value);
  }

  equals(other: StringValues): boolean {
    if (!(other instanceof StringValues)) return false;
    return this.value === other.value;
  }
}
