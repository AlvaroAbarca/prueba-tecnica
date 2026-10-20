import { IsObject, IsOptional, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class JsonValues {
  @IsOptional()
  @IsObject()
  readonly value: Record<string, any> | null;

  constructor(value: Record<string, any> | null) {
    this.value = value;
    if (value !== null) ValidateVO.validate(this, 'json_type');
  }

  static create(value: Record<string, any> | null): JsonValues {
    return new JsonValues(value);
  }

  equals(other: JsonValues): boolean {
    if (!(other instanceof JsonValues)) return false;
    return this.value === other.value;
  }
}
