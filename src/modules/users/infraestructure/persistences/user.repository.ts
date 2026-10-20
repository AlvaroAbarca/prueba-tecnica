import { DataSource, EntityManager } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserEntity } from '@modules/shared/infrastructure/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';
import { createUserFromEntity } from './dto/createUserFromEntity.dto';
import { User } from '@modules/users/domain/models/user';
import { UserValues } from '@modules/users/domain/interfaces/userValues.interface';
import { FilterToFindUsers } from '@modules/users/domain/interfaces/filterToFind.interface';
import { UserQueryBuilder } from '../queryBuilders/user.queryBuilder';
import { InternalSystemException } from '@modules/shared/domain/exceptions/classes';
import { UserProfileEntity } from '@modules/shared/infrastructure/entities/userProfile.entity';
import { transactionContext } from '@modules/shared/infrastructure/persistences/transactionManagerDB';

@Injectable()
export class UserRepositoryDB implements UserRepository {
  private readonly manager: EntityManager;

  constructor(@InjectDataSource('postgres') private readonly dataSource: DataSource) {
    this.manager = this.dataSource.manager;
  }

  private getManager(): EntityManager {
    const transactionalManager = transactionContext.getStore();
    return transactionalManager || this.manager;
  }

  private async executeInTransaction<T>(operation: (manager: EntityManager) => Promise<T>): Promise<T> {
    const transactionalManager = transactionContext.getStore();

    if (transactionalManager) {
      return operation(transactionalManager);
    }

    return this.dataSource.transaction(async (manager) => operation(manager));
  }

  async create(user: UserValues, profileIds?: number[]): Promise<User> {
    return this.executeInTransaction(async (manager) => {
      const entity = manager.create(UserEntity, user);
      const savedEntity = await manager.save(UserEntity, entity);

      if (!savedEntity) {
        throw new InternalSystemException('Profile not found after creating');
      }

      if (profileIds && profileIds.length > 0) {
        for (const profileId of profileIds) {
          const userProfileEntity = manager.create(UserProfileEntity, {
            userId: savedEntity.id,
            profileId,
          });
          await manager.save(userProfileEntity);
        }
      }

      return createUserFromEntity(savedEntity);
    });
  }

  async find(filter: Partial<UserValues>): Promise<User | null> {
    const manager = this.getManager();
    const entity = await manager.findOne(UserEntity, { where: filter });
    if (!entity) return null;

    return createUserFromEntity(entity);
  }

  async update(email: string, values: Partial<UserValues>, profileIds?: number[]): Promise<User> {
    return this.executeInTransaction(async (manager) => {
      const updateCriteria = values.id ? { id: values.id } : { email };
      const updatedEntityCriteria = values.id ? { id: values.id } : { email: values.email ?? email };

      await manager.update(UserEntity, updateCriteria, values);
      const updatedEntity = await manager.findOne(UserEntity, {
        where: updatedEntityCriteria,
      });

      if (!updatedEntity) {
        throw new InternalSystemException('User not found after updating');
      }

      if (profileIds && profileIds.length > 0) {
        const userId = values.id ?? updatedEntity.id;
        await manager.delete(UserProfileEntity, { userId });

        for (const profileId of profileIds) {
          const userProfileEntity = manager.create(UserProfileEntity, {
            userId,
            profileId,
          });
          await manager.save(userProfileEntity);
        }
      }

      return createUserFromEntity(updatedEntity);
    });
  }

  async findAll(filter?: FilterToFindUsers): Promise<User[]> {
    const manager = this.getManager();
    const queryBuilder = manager.createQueryBuilder(UserEntity, 'user');
    const userBuilder = new UserQueryBuilder();

    if (filter) {
      await userBuilder.applyFilters(queryBuilder, filter, null);
    }

    const entities = await queryBuilder.getMany();

    return entities.map((entity) => createUserFromEntity(entity));
  }

  async delete(ids: number[]): Promise<void> {
    const manager = this.getManager();
    await manager.softDelete(UserEntity, ids);
  }

  async findDistinctValues(column: string, filter: Omit<FilterToFindUsers, 'limit' | 'offset'>): Promise<any[]> {
    const manager = this.getManager();
    const queryBuilder = manager.createQueryBuilder(UserEntity, 'user');
    const userBuilder = new UserQueryBuilder();

    if (filter) {
      await userBuilder.applyFilters(queryBuilder, filter, column);
    }

    const result = await queryBuilder.orderBy(`user.${column}`, 'ASC').getRawMany();

    return result.map((row) => row[column]);
  }

  async count(): Promise<number> {
    const manager = this.getManager();
    return manager.count(UserEntity);
  }
}
