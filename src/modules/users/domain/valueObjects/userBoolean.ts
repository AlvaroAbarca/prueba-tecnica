import { IsRequired, ValidateVO, IsBoolean } from '@modules/shared/domain/validators/decorators';

export class UserBoolean {
  @IsRequired()
  @IsBoolean()
  readonly value: boolean;

  constructor(value: boolean) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: boolean): UserBoolean {
    return new UserBoolean(value);
  }

  equals(other: UserBoolean): boolean {
    if (!(other instanceof UserBoolean)) return false;
    return this.value === other.value;
  }
}
