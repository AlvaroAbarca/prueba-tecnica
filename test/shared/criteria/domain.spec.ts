import { Criteria } from '@modules/shared/criteria/domain/criteria';
import { Filter } from '@modules/shared/criteria/domain/filter';
import { FilterField } from '@modules/shared/criteria/domain/filterField';
import { FilterGroup } from '@modules/shared/criteria/domain/filterGroup';
import { FilterOperator, Operator } from '@modules/shared/criteria/domain/filterOperator';
import { FilterValue } from '@modules/shared/criteria/domain/filterValue';
import { Filters } from '@modules/shared/criteria/domain/filters';
import { JsonbFilterField } from '@modules/shared/criteria/domain/jsonbFilterField';
import { Order } from '@modules/shared/criteria/domain/order';
import { OrderBy } from '@modules/shared/criteria/domain/orderBy';
import { OrderType, OrderTypes } from '@modules/shared/criteria/domain/orderType';
import { ValueObject } from '@modules/shared/criteria/domain/valueObject/valueObject';
import { StringValueObject } from '@modules/shared/criteria/domain/valueObject/stringValueObject';

class NumericValueObject extends ValueObject<number> {}

class TextValueObject extends StringValueObject {}

class EnumTestValueObject extends ValueObject<number> {
  constructor(value: number) {
    super(value);
  }
}

describe('Criteria domain', () => {
  describe('Base value objects', () => {
    it('compares value objects by value', () => {
      const first = new NumericValueObject(10);
      const second = new NumericValueObject(10);
      const third = new NumericValueObject(20);

      expect(first.equals(second)).toBe(true);
      expect(first.equals(third)).toBe(false);
    });

    it('returns values from string and generic value objects', () => {
      const text = new TextValueObject('hello');
      const numeric = new EnumTestValueObject(7);

      expect(text.value()).toBe('hello');
      expect(numeric.value()).toBe(7);
    });
  });

  describe('FilterField, FilterValue and OrderBy', () => {
    it('returns the wrapped values', () => {
      const field = new FilterField('name');
      const value = new FilterValue('Alice');
      const orderBy = new OrderBy('createdAt');

      expect(field.value()).toBe('name');
      expect(value.value()).toBe('Alice');
      expect(orderBy.value()).toBe('createdAt');
    });
  });

  describe('FilterOperator', () => {
    it('creates operators from values and evaluates polarity', () => {
      expect(FilterOperator.fromValue(Operator.EQUAL).value).toBe(Operator.EQUAL);
      expect(FilterOperator.equal().value).toBe(Operator.EQUAL);
      expect(new FilterOperator(Operator.EQUAL).isPositive()).toBe(true);
      expect(new FilterOperator(Operator.NOT_EQUAL).isPositive()).toBe(false);
      expect(new FilterOperator(Operator.NOT_CONTAINS).isPositive()).toBe(false);
    });

    it('throws when the operator is invalid', () => {
      expect(() => FilterOperator.fromValue('invalid')).toThrow('The filter operator invalid is invalid');
    });
  });

  describe('OrderType', () => {
    it('creates order types from values and checks flags', () => {
      const asc = OrderType.fromValue(OrderTypes.ASC);
      const none = new OrderType(OrderTypes.NONE);

      expect(asc.isAsc()).toBe(true);
      expect(none.isNone()).toBe(true);
      expect(asc.value).toBe(OrderTypes.ASC);
    });

    it('throws when the order type is invalid', () => {
      expect(() => OrderType.fromValue('invalid')).toThrow('The order type invalid is invalid');
    });
  });

  describe('Filter', () => {
    it('creates a filter from serialized values', () => {
      const filter = Filter.fromValues(
        new Map([
          ['field', 'name'],
          ['operator', Operator.EQUAL],
          ['value', 'Alice'],
        ]),
      );

      expect(filter.field.value()).toBe('name');
      expect(filter.operator.value).toBe(Operator.EQUAL);
      expect(filter.value.value()).toBe('Alice');
    });

    it('throws when a required filter part is missing', () => {
      expect(() =>
        Filter.fromValues(
          new Map([
            ['field', 'name'],
            ['operator', Operator.EQUAL],
          ]),
        ),
      ).toThrow('The filter is invalid');
    });
  });

  describe('Filters', () => {
    it('creates filters from values and exposes state helpers', () => {
      const filters = Filters.fromValues(
        [
          new Map([
            ['field', 'name'],
            ['operator', Operator.EQUAL],
            ['value', 'Alice'],
          ]),
        ],
        undefined,
      );

      expect(filters.filters).toHaveLength(1);
      expect(filters.isEmpty()).toBe(false);
      expect(filters.hasGroups()).toBe(false);
      expect(filters.combinator).toBeDefined();
    });

    it('creates an empty filters collection', () => {
      const filters = Filters.none();

      expect(filters.isEmpty()).toBe(true);
      expect(filters.hasGroups()).toBe(false);
    });

    it('detects groups', () => {
      const group = new FilterGroup([], undefined);
      const filters = new Filters([], undefined, [group]);

      expect(filters.hasGroups()).toBe(true);
      expect(group.isEmpty()).toBe(true);
    });
  });

  describe('Order', () => {
    it('creates default order when no field is provided', () => {
      const order = Order.fromValues();

      expect(order.orderBy.value()).toBe('');
      expect(order.orderType.isNone()).toBe(true);
      expect(order.hasOrder()).toBe(false);
    });

    it('creates a normal order when a field is provided', () => {
      const order = Order.fromValues('name', OrderTypes.DESC);

      expect(order.orderBy.value()).toBe('name');
      expect(order.orderType.value).toBe(OrderTypes.DESC);
      expect(order.hasOrder()).toBe(true);
    });
  });

  describe('JsonbFilterField', () => {
    it('splits JSONB paths correctly', () => {
      const field = new JsonbFilterField('attributes.typeCollectorGuide');

      expect(field.value()).toBe('attributes.typeCollectorGuide');
      expect(field.getColumn()).toBe('attributes');
      expect(field.getJsonbPath()).toBe('typeCollectorGuide');
      expect(field.getPathArray()).toEqual(['typeCollectorGuide']);
      expect(field.hasJsonbPath()).toBe(true);
      expect(field.getDepth()).toBe(1);
      expect(field.isJsonb).toBe(true);
    });

    it('handles root JSONB fields without nested path', () => {
      const field = new JsonbFilterField('attributes');

      expect(field.getJsonbPath()).toBeNull();
      expect(field.getPathArray()).toEqual([]);
      expect(field.hasJsonbPath()).toBe(false);
      expect(field.getDepth()).toBe(0);
    });
  });

  describe('Criteria', () => {
    it('detects whether filters exist', () => {
      const emptyCriteria = new Criteria(Filters.none());
      const groupedCriteria = new Criteria(new Filters([], undefined, [new FilterGroup([], undefined)]));

      expect(emptyCriteria.hasFilters()).toBe(false);
      expect(groupedCriteria.hasFilters()).toBe(true);
    });

    it('renders a readable description of active filters', () => {
      const criteria = new Criteria(
        new Filters([
          new Filter(new JsonbFilterField('attributes.typeCollectorGuide'), new FilterOperator(Operator.EQUAL), new FilterValue('ABC')),
          new Filter(new FilterField('deletedAt'), new FilterOperator(Operator.EQUAL), new FilterValue('ignored')),
          new Filter(new FilterField('name'), new FilterOperator(Operator.NOT_EQUAL), new FilterValue('Bob')),
        ]),
      );

      expect(criteria.show()).toBe('attributes.typeCollectorGuide (JSONB) = ABC, name != Bob');
    });
  });
});
