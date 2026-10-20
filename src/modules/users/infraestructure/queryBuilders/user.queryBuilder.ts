import { SelectQueryBuilder } from 'typeorm';
import { UserEntity } from '@modules/shared/infrastructure/entities/user.entity';
import { FilterToFindUsers } from '@modules/users/domain/interfaces/filterToFind.interface';
import { TypeOrmCriteriaConverter } from '@modules/shared/criteria/infrastructure/typeormCriteriaConverter';
import { UserCriteriaBuilder } from '@modules/users/domain/services/userCriteriaBuilder.service';

export class UserQueryBuilder extends TypeOrmCriteriaConverter {
  constructor() {
    super();
  }

  async applyFilters(queryBuilder: SelectQueryBuilder<UserEntity>, filter: FilterToFindUsers, column: string): Promise<SelectQueryBuilder<UserEntity>> {
    const options = this.convertFilterToQuery<UserEntity>(UserCriteriaBuilder.create(filter));

    if (options.where) {
      queryBuilder.where(options.where);
    }

    if (options.order) {
      const orderEntries = Object.entries(options.order);
      if (orderEntries.length > 0) {
        const [field, order] = orderEntries[0];
        queryBuilder.orderBy(`user.${field}`, order as 'ASC' | 'DESC');
        for (let i = 1; i < orderEntries.length; i++) {
          const [field2, order2] = orderEntries[i];
          queryBuilder.addOrderBy(`user.${field2}`, order2 as 'ASC' | 'DESC');
        }
      }
    } else {
      queryBuilder.orderBy('user.id', 'ASC');
    }

    if (filter.filter?.search) {
      const search = filter.filter.search;
      queryBuilder.andWhere('(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });
    }

    if (filter.filter.enabled !== undefined) {
      queryBuilder.andWhere('user.enabled = :enabled', { enabled: filter.filter.enabled });
    }

    if (column) {
      queryBuilder.select(`DISTINCT user.${column}`, column).andWhere(`user.${column} IS NOT NULL`);
    }

    if (options.skip !== undefined && options.skip > 0) {
      queryBuilder.skip(options.skip);
    }

    if (options.take !== undefined && options.take > 0) {
      queryBuilder.take(options.take);
    }

    return queryBuilder;
  }
}
