import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, EntityTarget, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class QueryBuilderService {
  private readonly manager: EntityManager;

  constructor(@InjectDataSource('postgres') private readonly dataSource: DataSource) {
    this.manager = this.dataSource.manager;
  }

  createQuery<T extends { orderBy?: string; orderDirection?: 'ASC' | 'DESC' }, E extends object>(
    filter: T,
    entity: EntityTarget<E>,
    tableAliasParam = 'tableAlias',
  ): SelectQueryBuilder<E> {
    const queryBuilder = this.manager.createQueryBuilder(entity, tableAliasParam);

    Object.keys(filter).forEach((key) => {
      if (filter[key]) {
        queryBuilder.andWhere(`${tableAliasParam}.${key} = :${key}`, { [key]: filter[key] });
      }
    });

    if (filter.orderBy && filter.orderDirection) {
      queryBuilder.orderBy(`${tableAliasParam}.${filter.orderBy}`, filter.orderDirection || 'ASC');
    }

    return queryBuilder;
  }
}
