import { IsRequired, ValidateVO, IsBoolean } from '@modules/shared/domain/validators/decorators';

export class UserIsActive {
  @IsRequired()
  @IsBoolean()
  readonly value: boolean;

  constructor(value: boolean) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: boolean): UserIsActive {
    return new UserIsActive(value);
  }

  equals(other: UserIsActive): boolean {
    if (!(other instanceof UserIsActive)) return false;
    return this.value === other.value;
  }
}
