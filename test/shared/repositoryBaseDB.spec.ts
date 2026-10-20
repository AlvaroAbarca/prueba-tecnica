import { describe, expect, it, jest } from '@jest/globals';
import { Criteria } from '@modules/shared/criteria/domain/criteria';
import { Filter } from '@modules/shared/criteria/domain/filter';
import { FilterField } from '@modules/shared/criteria/domain/filterField';
import { FilterGroup } from '@modules/shared/criteria/domain/filterGroup';
import { FilterCombinator } from '@modules/shared/criteria/domain/filterCombinator';
import { FilterOperator, Operator } from '@modules/shared/criteria/domain/filterOperator';
import { Filters } from '@modules/shared/criteria/domain/filters';
import { FilterValue } from '@modules/shared/criteria/domain/filterValue';
import { Order } from '@modules/shared/criteria/domain/order';
import { OrderBy } from '@modules/shared/criteria/domain/orderBy';
import { OrderType, OrderTypes } from '@modules/shared/criteria/domain/orderType';
import { RepositoryBaseDB } from '@modules/shared/crud/infrastructure/repositoryBaseDB';

type TestValues = {
  id: number;
  guideCode?: number;
  guideCodeExternal?: string;
};

class TestEntity {
  constructor(private readonly values: TestValues) {}

  static create(params: TestValues): TestEntity {
    return new TestEntity(params);
  }

  getValues(): TestValues {
    return this.values;
  }
}

describe('RepositoryBaseDB', () => {
  it('debe delegar where con OR al manager.find', async () => {
    const find = jest.fn(async (): Promise<TestValues[]> => [{ id: 1, guideCode: 123 }]);
    const manager = { find };
    const dataSource = { manager } as any;

    const repository = new RepositoryBaseDB<TestValues, TestEntity>(dataSource, TestEntity, TestEntity as any);

    const criteria = new Criteria(
      new Filters([new Filter(new FilterField('id'), new FilterOperator(Operator.EQUAL), new FilterValue(1))], FilterCombinator.AND, [
        new FilterGroup(
          [
            new Filter(new FilterField('guideCode'), new FilterOperator(Operator.IN), new FilterValue([123])),
            new Filter(new FilterField('guideCodeExternal'), new FilterOperator(Operator.IN), new FilterValue(['ABC123'])),
          ],
          FilterCombinator.OR,
        ),
      ]),
      new Order(new OrderBy('id'), new OrderType(OrderTypes.ASC)),
      10,
      0,
    );

    const result = await repository.findAll(criteria);

    expect(find).toHaveBeenCalledWith(
      TestEntity,
      expect.objectContaining({
        where: [
          { id: 1, guideCode: expect.anything() },
          { id: 1, guideCodeExternal: expect.anything() },
        ],
        order: { id: 'ASC' },
        skip: 0,
        take: 10,
        loadRelationIds: true,
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(TestEntity);
  });
});
