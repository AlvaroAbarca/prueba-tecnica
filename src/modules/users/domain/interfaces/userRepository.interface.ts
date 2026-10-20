import { User } from '../models/user';
import { FilterToFindUsers } from './filterToFind.interface';
import { UserValues } from './userValues.interface';

export abstract class UserRepository {
  abstract create(user: UserValues, profileIds?: number[]): Promise<User>;
  abstract find(filter: any): Promise<User | null>;
  abstract update(email: string, user: Partial<UserValues>, profileIds?: number[]): Promise<User>;
  abstract findAll(filter: FilterToFindUsers): Promise<User[] | []>;
  abstract delete(ids: number[]): Promise<void>;

  //Queries
  abstract findDistinctValues(column: string, filter: Omit<FilterToFindUsers, 'limit' | 'offset'>): Promise<any[]>;
  abstract count(): Promise<number>;
}
