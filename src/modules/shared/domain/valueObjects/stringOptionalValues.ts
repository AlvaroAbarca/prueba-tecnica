import { IsOptional, IsString, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class StringOptionalValues {
  @IsString()
  @IsOptional()
  readonly value: string;

  constructor(value: string) {
    this.value = value;
    ValidateVO.validate(this, 'string_optional_type');
  }

  static create(value: string): StringOptionalValues {
    return new StringOptionalValues(value);
  }

  equals(other: StringOptionalValues): boolean {
    if (!(other instanceof StringOptionalValues)) return false;
    return this.value === other.value;
  }
}
