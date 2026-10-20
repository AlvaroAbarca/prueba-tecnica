import {
  Equals,
  IsEmpty,
  IsIn,
  IsNotEmpty,
  IsNotIn,
  IsOptional,
  IsRequired,
  IsRequiredWithNull,
  NotEquals,
} from '@modules/shared/domain/validators/decorators/value/commonValidators';
import { IsAfter, IsBefore, IsDateInRange, IsSameDay, MaxDate, MinDate } from '@modules/shared/domain/validators/decorators/value/dateValidators';
import {
  IsDivisibleBy,
  IsEven,
  IsNegative,
  IsOdd,
  IsMultipleOf,
  IsPositive,
  Max,
  Min,
  NotRange,
  Range,
} from '@modules/shared/domain/validators/decorators/value/numberValidators';
import { ValidationHelper } from '@modules/shared/domain/validators/decorators/helpers/validationHelper';
import { ValidationException } from '@modules/shared/domain/exceptions/classes';

class CommonDecoratedEntity {
  optional?: string;
  required?: string;
  requiredWithNull?: string | null;
  equals?: string;
  notEquals?: string;
  in?: string;
  notIn?: string;
  empty?: string | null;
  notEmpty?: string | null;
}

class NumberDecoratedEntity {
  positive?: number;
  negative?: number;
  min?: number;
  max?: number;
  range?: number;
  notRange?: number;
  even?: number;
  odd?: number;
  multipleOf?: number;
  divisibleBy?: number;
}

class DateDecoratedEntity {
  min?: Date;
  max?: Date;
  before?: Date;
  after?: Date;
  sameDay?: Date;
  inRange?: Date;
}

const decorate = (decorator: PropertyDecorator, target: object, propertyKey: string) => {
  decorator(target, propertyKey);
};

const expectValidationErrorDetail = (action: () => void, expectedDetailMessage: string) => {
  expect(action).toThrow(ValidationException);

  try {
    action();
  } catch (error) {
    const validationError = error as ValidationException;
    expect(validationError.errors?.[0]?.message).toBe(expectedDetailMessage);
  }
};

describe('Common, number and date validators', () => {
  beforeAll(() => {
    decorate(IsOptional(), CommonDecoratedEntity.prototype, 'optional');
    decorate(IsNotEmpty(), CommonDecoratedEntity.prototype, 'optional');
    decorate(IsRequired(), CommonDecoratedEntity.prototype, 'required');
    decorate(IsRequiredWithNull(), CommonDecoratedEntity.prototype, 'requiredWithNull');
    decorate(Equals('abc'), CommonDecoratedEntity.prototype, 'equals');
    decorate(NotEquals('abc'), CommonDecoratedEntity.prototype, 'notEquals');
    decorate(IsIn(['a', 'b']), CommonDecoratedEntity.prototype, 'in');
    decorate(IsNotIn(['a', 'b']), CommonDecoratedEntity.prototype, 'notIn');
    decorate(IsEmpty(), CommonDecoratedEntity.prototype, 'empty');
    decorate(IsNotEmpty(), CommonDecoratedEntity.prototype, 'notEmpty');

    decorate(IsPositive(), NumberDecoratedEntity.prototype, 'positive');
    decorate(IsNegative(), NumberDecoratedEntity.prototype, 'negative');
    decorate(Min(10), NumberDecoratedEntity.prototype, 'min');
    decorate(Max(20), NumberDecoratedEntity.prototype, 'max');
    decorate(Range(10, 20), NumberDecoratedEntity.prototype, 'range');
    decorate(NotRange(10, 20), NumberDecoratedEntity.prototype, 'notRange');
    decorate(IsEven(), NumberDecoratedEntity.prototype, 'even');
    decorate(IsOdd(), NumberDecoratedEntity.prototype, 'odd');
    decorate(IsMultipleOf(5), NumberDecoratedEntity.prototype, 'multipleOf');
    decorate(IsDivisibleBy(4), NumberDecoratedEntity.prototype, 'divisibleBy');

    decorate(MinDate(new Date('2026-01-01T00:00:00.000Z')), DateDecoratedEntity.prototype, 'min');
    decorate(MaxDate(new Date('2026-12-31T23:59:59.999Z')), DateDecoratedEntity.prototype, 'max');
    decorate(IsBefore(new Date('2026-06-10T00:00:00.000Z')), DateDecoratedEntity.prototype, 'before');
    decorate(IsAfter(new Date('2026-06-01T00:00:00.000Z')), DateDecoratedEntity.prototype, 'after');
    decorate(IsSameDay(new Date('2026-06-02T12:00:00.000Z')), DateDecoratedEntity.prototype, 'sameDay');
    decorate(IsDateInRange(new Date('2026-06-01T00:00:00.000Z'), new Date('2026-06-30T23:59:59.999Z')), DateDecoratedEntity.prototype, 'inRange');
  });

  describe('common validators', () => {
    const buildCommonEntity = (overrides: Partial<CommonDecoratedEntity> = {}) =>
      Object.assign(new CommonDecoratedEntity(), {
        optional: undefined,
        required: 'required',
        requiredWithNull: null,
        equals: 'abc',
        notEquals: 'xyz',
        in: 'a',
        notIn: 'z',
        empty: '',
        notEmpty: 'filled',
        ...overrides,
      });

    it('allows optional values to skip the remaining validators', () => {
      expect(ValidationHelper.validate(buildCommonEntity({ optional: undefined }))).toEqual([]);
    });

    it('validates required and nullable-required fields', () => {
      expectValidationErrorDetail(() => ValidationHelper.validate(buildCommonEntity({ required: undefined })), 'required must be a required.');
      expectValidationErrorDetail(() => ValidationHelper.validate(buildCommonEntity({ requiredWithNull: undefined })), 'requiredWithNull must be a required with null.');
    });

    it('validates equality and membership rules', () => {
      expectValidationErrorDetail(() => ValidationHelper.validate(buildCommonEntity({ equals: 'def' })), 'equals must be a equals abc.');
      expectValidationErrorDetail(() => ValidationHelper.validate(buildCommonEntity({ notEquals: 'abc' })), 'notEquals must be a not equals abc.');
      expectValidationErrorDetail(() => ValidationHelper.validate(buildCommonEntity({ in: 'c' })), 'in must be a in a, b.');
      expectValidationErrorDetail(() => ValidationHelper.validate(buildCommonEntity({ notIn: 'a' })), 'notIn must be a not in a, b.');
    });

    it('validates empty and not empty values', () => {
      expectValidationErrorDetail(() => ValidationHelper.validate(buildCommonEntity({ empty: 'not-empty' })), 'empty must be a empty.');
      expectValidationErrorDetail(() => ValidationHelper.validate(buildCommonEntity({ notEmpty: '' })), 'notEmpty must be a not empty.');
    });
  });

  describe('number validators', () => {
    const buildNumberEntity = (overrides: Partial<NumberDecoratedEntity> = {}) =>
      Object.assign(new NumberDecoratedEntity(), {
        positive: 1,
        negative: -1,
        min: 10,
        max: 20,
        range: 15,
        notRange: 25,
        even: 2,
        odd: 3,
        multipleOf: 10,
        divisibleBy: 8,
        ...overrides,
      });

    it('accepts valid numbers', () => {
      expect(ValidationHelper.validate(buildNumberEntity())).toEqual([]);
    });

    it('rejects invalid positive, negative and range values', () => {
      expectValidationErrorDetail(() => ValidationHelper.validate(buildNumberEntity({ positive: -1 })), 'positive must be a positive.');
      expectValidationErrorDetail(() => ValidationHelper.validate(buildNumberEntity({ negative: 0 })), 'negative must be a negative.');
      expectValidationErrorDetail(() => ValidationHelper.validate(buildNumberEntity({ min: 9 })), 'min must be a min 10.');
      expectValidationErrorDetail(() => ValidationHelper.validate(buildNumberEntity({ max: 21 })), 'max must be a max 20.');
      expectValidationErrorDetail(() => ValidationHelper.validate(buildNumberEntity({ range: 21 })), 'range must be a range 10 to 20.');
      expectValidationErrorDetail(() => ValidationHelper.validate(buildNumberEntity({ notRange: 15 })), 'notRange must be a not range 10 to 20.');
    });

    it('rejects parity and divisibility violations', () => {
      expectValidationErrorDetail(() => ValidationHelper.validate(buildNumberEntity({ even: 3 })), 'even must be a even.');
      expectValidationErrorDetail(() => ValidationHelper.validate(buildNumberEntity({ odd: 4 })), 'odd must be a odd.');
      expectValidationErrorDetail(() => ValidationHelper.validate(buildNumberEntity({ multipleOf: 11 })), 'multipleOf must be a multiple of 5.');
      expectValidationErrorDetail(() => ValidationHelper.validate(buildNumberEntity({ divisibleBy: 10 })), 'divisibleBy must be a divisible by 4.');
    });
  });

  describe('date validators', () => {
    const buildDateEntity = (overrides: Partial<DateDecoratedEntity> = {}) =>
      Object.assign(new DateDecoratedEntity(), {
        min: new Date('2026-06-01T00:00:00.000Z'),
        max: new Date('2026-06-30T23:59:59.999Z'),
        before: new Date('2026-06-01T00:00:00.000Z'),
        after: new Date('2026-06-11T00:00:00.000Z'),
        sameDay: new Date('2026-06-02T08:00:00.000Z'),
        inRange: new Date('2026-06-15T00:00:00.000Z'),
        ...overrides,
      });

    it('accepts valid dates', () => {
      expect(ValidationHelper.validate(buildDateEntity())).toEqual([]);
    });

    it('rejects dates outside the configured bounds', () => {
      expectValidationErrorDetail(
        () => ValidationHelper.validate(buildDateEntity({ min: new Date('2025-12-31T23:59:59.999Z') })),
        'min must be a min date 2026-01-01T00:00:00.000Z.',
      );
      expectValidationErrorDetail(
        () => ValidationHelper.validate(buildDateEntity({ max: new Date('2027-01-01T00:00:00.000Z') })),
        'max must be a max date 2026-12-31T23:59:59.999Z.',
      );
      expectValidationErrorDetail(
        () => ValidationHelper.validate(buildDateEntity({ before: new Date('2026-06-10T00:00:00.000Z') })),
        'before must be a before 2026-06-10T00:00:00.000Z.',
      );
      expectValidationErrorDetail(
        () => ValidationHelper.validate(buildDateEntity({ after: new Date('2026-06-01T00:00:00.000Z') })),
        'after must be a after 2026-06-01T00:00:00.000Z.',
      );
      expectValidationErrorDetail(
        () => ValidationHelper.validate(buildDateEntity({ sameDay: new Date('2026-06-04T12:00:00.000Z') })),
        'sameDay must be a same day as 2026-06-02T12:00:00.000Z.',
      );
      expectValidationErrorDetail(
        () => ValidationHelper.validate(buildDateEntity({ inRange: new Date('2026-07-01T00:00:00.000Z') })),
        'inRange must be a date in range 2026-06-01T00:00:00.000Z to 2026-06-30T23:59:59.999Z.',
      );
    });
  });
});
