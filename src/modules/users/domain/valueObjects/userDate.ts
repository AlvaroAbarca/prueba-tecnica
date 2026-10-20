import { IsOptional, ValidateVO } from '@modules/shared/domain/validators/decorators';

export class UserDate {
  @IsOptional()
  readonly value: Date;

  constructor(value: Date) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: Date): UserDate {
    return new UserDate(value);
  }

  equals(other: UserDate): boolean {
    if (!(other instanceof UserDate)) return false;
    return this.value === other.value;
  }
}
