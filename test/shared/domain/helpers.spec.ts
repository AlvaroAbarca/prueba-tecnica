import { ErrorFormatter } from '@modules/shared/domain/validators/decorators/helpers/errorFormatter';
import { ValidateVO } from '@modules/shared/domain/validators/decorators/helpers/validateVO';
import { ValidationHelper } from '@modules/shared/domain/validators/decorators/helpers/validationHelper';
import { VODefinitionFactory } from '@modules/shared/domain/validators/decorators/helpers/voDefinitionFactory';
import { ValidationException } from '@modules/shared/domain/exceptions/classes';

class GoodValueObject {
  constructor(public readonly value: string) {}
}

class ThrowsErrorListValueObject {
  constructor(_value: string) {
    throw {
      errors: [{ message: 'error from errors' }],
    };
  }
}

class ThrowsMessageValueObject {
  constructor(_value: string) {
    throw new Error('error from message');
  }
}

describe('Validation helpers', () => {
  describe('ErrorFormatter', () => {
    it('formats entity and field names', () => {
      expect(ErrorFormatter.getEntityName('userId')).toBe('UserId');
      expect(ErrorFormatter.formatFieldName('UserEntity')).toBe('serentity');
    });

    it('formats validation errors with metadata', () => {
      const error = ErrorFormatter.formatValidationError('userId', 'invalid', 'value');

      expect(error.message).toBe('invalid');
      expect(error.field).toBe('userId');
      expect(error.entity).toBe('UserId');
      expect(error.value).toBe('value');
      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(error.stack).toContain('Validation error stack trace');
    });
  });

  describe('ValidationHelper', () => {
    it('throws when the entity is invalid', () => {
      expect(() => ValidationHelper.validate(null)).toThrow('Invalid entity provided for validation.');
    });

    it('returns no errors when no validators are registered', () => {
      class EmptyEntity {}

      expect(ValidationHelper.validate(new EmptyEntity())).toEqual([]);
    });

    it('collects validation errors from registered validators', () => {
      class RequiredEntity {
        value?: string;
      }

      const validator = () => 'field is invalid';
      ValidationHelper.addValidation(RequiredEntity.prototype, 'value', validator);

      expect(ValidationHelper.validate(new RequiredEntity())).toEqual(['field is invalid']);
    });

    it('skips remaining validators for optional validators', () => {
      class OptionalEntity {
        value?: string;
      }

      const optionalValidator = function optionalValidator() {
        return true;
      };
      const shouldNotRun = () => 'should not run';

      ValidationHelper.addValidation(OptionalEntity.prototype, 'value', optionalValidator as any);
      ValidationHelper.addValidation(OptionalEntity.prototype, 'value', shouldNotRun);

      expect(ValidationHelper.validate(new OptionalEntity())).toEqual([]);
    });

    it('validates values directly with validateValue', () => {
      expect(() =>
        ValidationHelper.validateValue('ok', (value) => {
          return value === 'ok' ? null : 'bad';
        }),
      ).not.toThrow();

      expect(() =>
        ValidationHelper.validateValue('bad', (value) => {
          return value === 'ok' ? null : 'bad';
        }),
      ).toThrow('bad');
    });
  });

  describe('ValidateVO', () => {
    it('returns the errors collected by ValidationHelper', () => {
      class ErrorsEntity {
        value?: string;
      }

      const instance = new ErrorsEntity();
      ValidationHelper.addValidation(ErrorsEntity.prototype, 'value', () => 'invalid value');

      expect(ValidateVO.getErrors(instance)).toEqual(['invalid value']);
    });

    it('throws a validation exception when the VO is invalid', () => {
      class InvalidVo {
        value = 'invalid';
      }

      ValidationHelper.addValidation(InvalidVo.prototype, 'value', () => 'value must be valid');

      expect(() => ValidateVO.validate(new InvalidVo())).toThrow(ValidationException);
      try {
        ValidateVO.validate(new InvalidVo());
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationException);
        expect((error as ValidationException).message).toBe('Invalid nvalidvo');
        expect((error as ValidationException).errors).toHaveLength(1);
        expect((error as ValidationException).errors?.[0]).toEqual(
          expect.objectContaining({
            field: 'nvalidvo',
            message: 'value must be valid',
            value: 'invalid',
          }),
        );
      }
    });

    it('creates VO definitions and instantiates mapped values', () => {
      const definition = VODefinitionFactory.create({
        value: GoodValueObject,
      });

      const result = definition.create({ value: 'abc' });

      expect(definition.mapping).toEqual({ value: GoodValueObject });
      expect(result.value).toBeInstanceOf(GoodValueObject);
      expect(result.value.value).toBe('abc');
    });

    it('aggregates mapping errors from constructors', () => {
      expect(() =>
        ValidateVO.createFromMapping(
          {
            good: 'abc',
            listError: 'bad-1',
            messageError: 'bad-2',
          },
          {
            good: GoodValueObject,
            listError: ThrowsErrorListValueObject,
            messageError: ThrowsMessageValueObject,
          },
        ),
      ).toThrow('Multiple validation errors');

      try {
        ValidateVO.createFromMapping(
          {
            good: 'abc',
            listError: 'bad-1',
            messageError: 'bad-2',
          },
          {
            good: GoodValueObject,
            listError: ThrowsErrorListValueObject,
            messageError: ThrowsMessageValueObject,
          },
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationException);
        expect((error as ValidationException).errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ field: 'listError', message: 'error from errors', value: 'bad-1' }),
            expect.objectContaining({ field: 'messageError', message: 'error from message', value: 'bad-2' }),
          ]),
        );
      }
    });
  });
});
