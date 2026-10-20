import { IsRequired, ValidateVO, IsBoolean } from '@modules/shared/domain/validators/decorators';

export class UserVisible {
  @IsRequired()
  @IsBoolean()
  readonly value: boolean;

  constructor(value: boolean) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: boolean): UserVisible {
    return new UserVisible(value);
  }

  equals(other: UserVisible): boolean {
    if (!(other instanceof UserVisible)) return false;
    return this.value === other.value;
  }
}
