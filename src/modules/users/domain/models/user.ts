import { dayjs } from '@modules/shared/infrastructure/utils/date.helper';
import { UserValues, UserVO } from '../interfaces/userValues.interface';
import { UserVOBuilder } from '../../domain/valueObjects/';
import { AccessorEntity } from '@modules/shared/domain/models/accesorEntity';

export class User extends AccessorEntity<UserVO> {
  static create(params: UserValues): User {
    const data = UserVOBuilder.create(params);
    return new User(data);
  }

  getFullName(): string {
    return `${this.firstName.value} ${this.lastName.value}`;
  }

  isTokenExpired(): boolean {
    const now = dayjs();
    const expirationDate = dayjs(this.tokenExpiration.value);
    return expirationDate.isBefore(now);
  }
}
