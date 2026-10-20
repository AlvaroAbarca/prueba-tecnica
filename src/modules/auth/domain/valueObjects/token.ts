import { IsString, IsRequired, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class Token {
  @IsRequired()
  @IsString()
  private readonly _value: string;

  constructor(value: string) {
    this._value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  get value(): string {
    return this._value;
  }
}
