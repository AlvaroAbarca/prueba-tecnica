import { TypeOrmCriteriaConverter } from '@modules/shared/criteria/infrastructure/typeormCriteriaConverter';
import { Criteria } from '@modules/shared/criteria/domain/criteria';
import { Filters } from '@modules/shared/criteria/domain/filters';
import { Filter } from '@modules/shared/criteria/domain/filter';
import { FilterField } from '@modules/shared/criteria/domain/filterField';
import { FilterGroup } from '@modules/shared/criteria/domain/filterGroup';
import { FilterCombinator } from '@modules/shared/criteria/domain/filterCombinator';
import { JsonbFilterField } from '@modules/shared/criteria/domain/jsonbFilterField';
import { FilterOperator, Operator } from '@modules/shared/criteria/domain/filterOperator';
import { FilterValue } from '@modules/shared/criteria/domain/filterValue';
import { Order } from '@modules/shared/criteria/domain/order';
import { OrderBy } from '@modules/shared/criteria/domain/orderBy';
import { OrderType, OrderTypes } from '@modules/shared/criteria/domain/orderType';

describe('TypeOrmCriteriaConverter with JSONB support', () => {
  let converter: TypeOrmCriteriaConverter;

  beforeEach(() => {
    converter = new TypeOrmCriteriaConverter();
  });

  describe('Simple JSONB field filters', () => {
    it('should convert EQUAL filter for JSONB field', () => {
      const criteria = new Criteria(
        new Filters([new Filter(new JsonbFilterField('attributes.typeCollectorGuide'), new FilterOperator(Operator.EQUAL), new FilterValue('tipo1'))]),
        new Order(new OrderBy('id'), new OrderType(OrderTypes.ASC)),
      );

      const query = converter.convertFilterToQuery(criteria);

      expect(query.where).toBeDefined();
      expect(query.where).toEqual(
        expect.objectContaining({
          attributes: expect.any(Object),
        }),
      );
    });

    it('should convert filter for regular field alongside JSONB field (AND)', () => {
      const criteria = new Criteria(
        new Filters([
          new Filter(new FilterField('id'), new FilterOperator(Operator.EQUAL), new FilterValue('123')),
          new Filter(new JsonbFilterField('attributes.typeCollectorGuide'), new FilterOperator(Operator.EQUAL), new FilterValue('tipo1')),
        ]),
        new Order(new OrderBy('id'), new OrderType(OrderTypes.ASC)),
      );

      const query = converter.convertFilterToQuery(criteria);

      expect(query.where).toBeDefined();
      // Debe ser un objeto con ambos campos (AND)
      expect(query.where).toEqual(
        expect.objectContaining({
          id: '123',
          attributes: expect.any(Object),
        }),
      );
    });
  });

  describe('Nested JSONB field filters', () => {
    it('should convert filter for deeply nested JSONB field', () => {
      const criteria = new Criteria(
        new Filters([new Filter(new JsonbFilterField('shipmentData.user.address.city'), new FilterOperator(Operator.EQUAL), new FilterValue('Maule'))]),
        new Order(new OrderBy('id'), new OrderType(OrderTypes.ASC)),
      );

      const query = converter.convertFilterToQuery(criteria);

      expect(query.where).toBeDefined();
      expect(query.where).toEqual(
        expect.objectContaining({
          shipmentData: expect.any(Object),
        }),
      );
    });

    it('should convert GT filter for numeric JSONB field', () => {
      const criteria = new Criteria(
        new Filters([new Filter(new JsonbFilterField('attributes.otroParam'), new FilterOperator(Operator.GT), new FilterValue(10))]),
        new Order(new OrderBy('id'), new OrderType(OrderTypes.ASC)),
      );

      const query = converter.convertFilterToQuery(criteria);

      expect(query.where).toBeDefined();
      expect(query.where).toEqual(
        expect.objectContaining({
          'attributes.otroParam': expect.any(Object),
        }),
      );
    });
  });

  describe('JSONB specific operators', () => {
    it('should convert JSONB_CONTAINS filter', () => {
      const criteria = new Criteria(
        new Filters([new Filter(new JsonbFilterField('attributes'), new FilterOperator(Operator.JSONB_CONTAINS), new FilterValue({ typeCollectorGuide: 'tipo1' }))]),
        new Order(new OrderBy('id'), new OrderType(OrderTypes.ASC)),
      );

      const query = converter.convertFilterToQuery(criteria);

      expect(query.where).toBeDefined();
      expect(query.where).toEqual(
        expect.objectContaining({
          attributes: expect.any(Object),
        }),
      );
    });

    it('should convert JSONB_HAS_KEY filter', () => {
      const criteria = new Criteria(
        new Filters([new Filter(new JsonbFilterField('attributes'), new FilterOperator(Operator.JSONB_HAS_KEY), new FilterValue('typeCollectorGuide'))]),
        new Order(new OrderBy('id'), new OrderType(OrderTypes.ASC)),
      );

      const query = converter.convertFilterToQuery(criteria);

      expect(query.where).toBeDefined();
      expect(query.where).toEqual(
        expect.objectContaining({
          attributes: expect.any(Object),
        }),
      );
    });

    it('should convert JSONB_HAS_ALL_KEYS filter', () => {
      const criteria = new Criteria(
        new Filters([
          new Filter(new JsonbFilterField('attributes'), new FilterOperator(Operator.JSONB_HAS_ALL_KEYS), new FilterValue(['typeCollectorGuide', 'otroParam'])),
        ]),
        new Order(new OrderBy('id'), new OrderType(OrderTypes.ASC)),
      );

      const query = converter.convertFilterToQuery(criteria);

      expect(query.where).toBeDefined();
      expect(query.where).toEqual(
        expect.objectContaining({
          attributes: expect.any(Object),
        }),
      );
    });

    it('should convert JSONB_HAS_ANY_KEY filter', () => {
      const criteria = new Criteria(
        new Filters([
          new Filter(new JsonbFilterField('attributes'), new FilterOperator(Operator.JSONB_HAS_ANY_KEY), new FilterValue(['typeCollectorGuide', 'otroParam'])),
        ]),
        new Order(new OrderBy('id'), new OrderType(OrderTypes.ASC)),
      );

      const query = converter.convertFilterToQuery(criteria);

      expect(query.where).toBeDefined();
      expect(query.where).toEqual(
        expect.objectContaining({
          attributes: expect.any(Object),
        }),
      );
    });

    it('should convert JSONB_CONTAINED filter', () => {
      const criteria = new Criteria(
        new Filters([
          new Filter(new JsonbFilterField('attributes'), new FilterOperator(Operator.JSONB_CONTAINED), new FilterValue({ typeCollectorGuide: 'tipo1', otroParam: 12 })),
        ]),
        new Order(new OrderBy('id'), new OrderType(OrderTypes.ASC)),
      );

      const query = converter.convertFilterToQuery(criteria);

      expect(query.where).toBeDefined();
      expect(query.where).toEqual(
        expect.objectContaining({
          attributes: expect.any(Object),
        }),
      );
    });
  });

  describe('Complex JSONB queries', () => {
    it('should handle multiple JSONB filters with AND', () => {
      const criteria = new Criteria(
        new Filters([
          new Filter(new JsonbFilterField('shipmentData.typeShipment'), new FilterOperator(Operator.EQUAL), new FilterValue('postal')),
          new Filter(new JsonbFilterField('shipmentData.user.name'), new FilterOperator(Operator.EQUAL), new FilterValue('Franco')),
          new Filter(new JsonbFilterField('shipmentData.user.address.city'), new FilterOperator(Operator.EQUAL), new FilterValue('Maule')),
        ]),
        new Order(new OrderBy('createdAt'), new OrderType(OrderTypes.DESC)),
      );

      const query = converter.convertFilterToQuery(criteria);

      expect(query.where).toBeDefined();
      // Debe ser un objeto con todos los campos combinados (AND)
      expect(query.where).toEqual(
        expect.objectContaining({
          shipmentData: expect.any(Object),
        }),
      );
      expect(query.order).toBeDefined();
    });

    it('should handle mixed regular and JSONB filters with pagination (AND)', () => {
      const criteria = new Criteria(
        new Filters([
          new Filter(new FilterField('statusCode'), new FilterOperator(Operator.EQUAL), new FilterValue('active')),
          new Filter(new JsonbFilterField('attributes.typeCollectorGuide'), new FilterOperator(Operator.EQUAL), new FilterValue('tipo1')),
        ]),
        new Order(new OrderBy('createdAt'), new OrderType(OrderTypes.DESC)),
        10,
        0,
      );

      const query = converter.convertFilterToQuery(criteria);

      expect(query.where).toBeDefined();
      // Debe ser un objeto con ambos campos (AND)
      expect(query.where).toEqual(
        expect.objectContaining({
          statusCode: 'active',
          attributes: expect.any(Object),
        }),
      );
      expect(query.take).toBe(10);
      expect(query.skip).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle JSONB field without nested path', () => {
      const criteria = new Criteria(
        new Filters([new Filter(new JsonbFilterField('attributes'), new FilterOperator(Operator.JSONB_CONTAINS), new FilterValue({ typeCollectorGuide: 'tipo1' }))]),
        new Order(new OrderBy('id'), new OrderType(OrderTypes.ASC)),
      );

      const query = converter.convertFilterToQuery(criteria);

      expect(query.where).toBeDefined();
    });

    it('should handle boolean values in JSONB', () => {
      const criteria = new Criteria(
        new Filters([new Filter(new JsonbFilterField('attributes.isActive'), new FilterOperator(Operator.EQUAL), new FilterValue(true))]),
        new Order(new OrderBy('id'), new OrderType(OrderTypes.ASC)),
      );

      const query = converter.convertFilterToQuery(criteria);

      expect(query.where).toBeDefined();
    });
  });
});
