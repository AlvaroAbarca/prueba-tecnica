import { Injectable } from '@nestjs/common';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';
import { User } from '@modules/users/domain/models/user';
import { createUserFromEntity } from './dto/createUserFromEntity.dto';
import { UserEntity } from '@modules/shared/infrastructure/entities/user.entity';
import { UserValues } from '@modules/users/domain/interfaces/userValues.interface';
import { FilterToFindUsers } from '@modules/users/domain/interfaces/filterToFind.interface';

const mockCredentialPlaceholder = '<MOCK_CREDENTIAL>';

@Injectable()
export class UserRepositoryDBMOCK implements UserRepository {
  async find(): Promise<User> {
    return createUserFromEntity({
      id: 123,
      firstName: 'test',
      lastName: 'user',
      rut: '12345678-9',
      email: 'test@example.com',
      emailVerified: true,
      password: mockCredentialPlaceholder,
      order: 1,
      visible: true,
      enabled: true,
      comment: '',
      lastLoginDate: new Date('2025-09-09T19:44:38.705Z'),
      lastLoginIp: '127.0.0.1',
      lastPasswordUpdate: new Date('2025-09-09T19:44:38.705Z'),
      lastFailLogDate: new Date('2025-09-09T19:44:38.705Z'),
      timeZoneCode: 'CLT',
      languageCode: 'es',
      resetPasswordToken: '',
      resetPasswordDate: new Date('2025-09-09T19:44:38.705Z'),
      failedLoginAttempts: 0,
      logout: false,
      authProvider: 'internal',
      phone: '1234567890',
      token: '123',
      tokenExpiration: new Date('2025-09-09T19:44:38.705Z'),
      img: 'https://example.com/avatar.png',
      enable2fa: false,
      secret2fa: '',
      iata: 'SCL',
      createdAt: new Date('2025-09-09T19:44:38.705Z'),
      updatedAt: new Date('2025-09-09T19:44:38.705Z'),
    } as unknown as UserEntity);
  }

  async update(email: string, data: Partial<UserValues>): Promise<User> {
    return createUserFromEntity({
      id: 123,
      firstName: 'test',
      lastName: 'user',
      rut: '12345678-9',
      email: 'test@example.com',
      emailVerified: true,
      password: mockCredentialPlaceholder,
      order: 1,
      visible: true,
      enabled: true,
      comment: '',
      lastLoginDate: new Date('2025-09-09T19:44:38.705Z'),
      lastLoginIp: '127.0.0.1',
      lastPasswordUpdate: new Date('2025-09-09T19:44:38.705Z'),
      lastFailLogDate: new Date('2025-09-09T19:44:38.705Z'),
      timeZoneCode: 'CLT',
      languageCode: 'es',
      resetPasswordToken: '',
      resetPasswordDate: new Date('2025-09-09T19:44:38.705Z'),
      failedLoginAttempts: 0,
      logout: false,
      authProvider: 'internal',
      phone: '1234567890',
      token: '123',
      tokenExpiration: new Date('2025-09-09T19:44:38.705Z'),
      img: 'https://example.com/avatar.png',
      enable2fa: false,
      secret2fa: '',
      iata: 'N/A',
      createdAt: new Date('2025-09-09T19:44:38.705Z'),
      updatedAt: new Date('2025-09-09T19:44:38.705Z'),
      ...data,
    } as unknown as UserEntity);
  }

  async create(_user: UserValues): Promise<User> {
    //mock
    return null;
  }

  async findAll(_filter: FilterToFindUsers): Promise<User[] | []> {
    //mock
    return [];
  }

  async delete(_ids: number[]): Promise<void> {
    //mock
  }

  async findDistinctValues(_column: string, _filter: Omit<FilterToFindUsers, 'limit' | 'offset'>): Promise<any[]> {
    //mock
    return [];
  }

  async count(): Promise<number> {
    return 0;
  }
}

@Injectable()
export class UserRepositoryDBMOCKError implements UserRepository {
  async find(): Promise<User> {
    throw new Error('Error mock');
  }

  async update(): Promise<User> {
    throw new Error('Error mock');
  }

  async create(_user: UserValues): Promise<User> {
    //mock
    return null;
  }

  async findAll(_filter: FilterToFindUsers): Promise<User[] | []> {
    //mock
    return [];
  }

  async delete(_ids: number[]): Promise<void> {
    //mock
  }

  async findDistinctValues(_column: string, _filter: Omit<FilterToFindUsers, 'limit' | 'offset'>): Promise<any[]> {
    //mock
    return [];
  }

  async count(): Promise<number> {
    return 0;
  }
}

@Injectable()
export class UserRepositoryDBMOCKNotFound implements UserRepository {
  async find(): Promise<User> {
    return null;
  }

  async update(): Promise<User> {
    //mock
    return null;
  }

  async create(_user: UserValues): Promise<User> {
    //mock
    return null;
  }

  async findAll(_filter: FilterToFindUsers): Promise<User[] | []> {
    //mock
    return [];
  }

  async delete(_ids: number[]): Promise<void> {
    //mock
  }

  async findDistinctValues(_column: string, _filter: Omit<FilterToFindUsers, 'limit' | 'offset'>): Promise<any[]> {
    //mock
    return [];
  }

  async count(): Promise<number> {
    return 0;
  }
}
