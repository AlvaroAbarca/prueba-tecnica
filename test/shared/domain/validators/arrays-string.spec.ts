import { ValidationException } from '@modules/shared/domain/exceptions/classes';
import { ValidationHelper } from '@modules/shared/domain/validators/decorators/helpers/validationHelper';
import {
  ArrayContains,
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotContains,
  ArrayNotEmpty,
  ArrayUnique,
  IsArrayOf,
  IsArrayOfObjectsWithShape,
  IsObjectWithShape,
  Optional,
} from '@modules/shared/domain/validators/decorators/value/arraysValidators';
import {
  Contains,
  EndsWith,
  IsAlpha,
  IsAlphanumeric,
  IsBase32,
  IsBooleanString,
  IsDateString,
  IsEmail,
  IsIp,
  IsJSON,
  IsJWT,
  IsLowerCase,
  IsNumberString,
  IsPostalCode,
  IsRut,
  IsStrongPassword,
  IsUpperCase,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  MinLength,
  NotContains,
  StartsWith,
} from '@modules/shared/domain/validators/decorators/value/stringValidators';

const decorateAndValidate = (decorator: PropertyDecorator, value: any): string[] => {
  class DynamicEntity {
    value = value;
  }
  decorator(DynamicEntity.prototype, 'value');
  return ValidationHelper.validate(new DynamicEntity());
};

const expectValidationError = (decorator: PropertyDecorator, value: any): void => {
  expect(() => decorateAndValidate(decorator, value)).toThrow(ValidationException);
};

describe('Arrays and string validators', () => {
  describe('array validators', () => {
    it('validates basic array constraints', () => {
      expect(decorateAndValidate(ArrayNotEmpty(), [1])).toEqual([]);
      expect(decorateAndValidate(ArrayMinSize(2), [1, 2])).toEqual([]);
      expect(decorateAndValidate(ArrayMaxSize(2), [1, 2])).toEqual([]);
      expect(decorateAndValidate(ArrayUnique(), [1, 2])).toEqual([]);
      expect(decorateAndValidate(ArrayContains('a'), ['a', 'b'])).toEqual([]);
      expect(decorateAndValidate(ArrayNotContains('c'), ['a', 'b'])).toEqual([]);
      expect(decorateAndValidate(IsArrayOf('string'), ['a', 'b'])).toEqual([]);

      expectValidationError(ArrayNotEmpty(), []);
      expectValidationError(ArrayMinSize(2), [1]);
      expectValidationError(ArrayMaxSize(1), [1, 2]);
      expectValidationError(ArrayUnique(), [1, 1]);
      expectValidationError(ArrayContains('x'), ['a']);
      expectValidationError(ArrayNotContains('a'), ['a']);
      expectValidationError(IsArrayOf('string'), [1, 2]);
    });

    it('validates object shapes in arrays and objects', () => {
      const shape = {
        id: 'number' as const,
        name: 'string' as const,
        enabled: Optional('boolean'),
      };

      expect(decorateAndValidate(IsArrayOfObjectsWithShape(shape), [{ id: 1, name: 'A', enabled: true }, { id: 2, name: 'B' }])).toEqual([]);
      expect(decorateAndValidate(IsObjectWithShape(shape), { id: 1, name: 'A', enabled: false })).toEqual([]);

      expectValidationError(IsArrayOfObjectsWithShape(shape), 'not-array');
      expectValidationError(IsArrayOfObjectsWithShape(shape), [{ id: 1 }]);
      expectValidationError(IsObjectWithShape(shape), { id: '1', name: 'A' });
    });
  });

  describe('string validators', () => {
    it('validates primitive string checks', () => {
      expect(decorateAndValidate(IsBooleanString(), 'true')).toEqual([]);
      expectValidationError(IsBooleanString(), 'yes');

      expect(decorateAndValidate(IsNumberString(), '123')).toEqual([]);
      expectValidationError(IsNumberString(), 'abc');

      expect(decorateAndValidate(IsDateString(), '2026-06-02')).toEqual([]);
      expectValidationError(IsDateString(), 'not-date');

      expect(decorateAndValidate(Contains('abc'), 'xxabcxx')).toEqual([]);
      expectValidationError(Contains('abc'), 'xx');

      expect(decorateAndValidate(NotContains('abc'), 'xx')).toEqual([]);
      expectValidationError(NotContains('abc'), 'xxabcxx');

      expect(decorateAndValidate(StartsWith('ab'), 'abcd')).toEqual([]);
      expectValidationError(StartsWith('ab'), 'zabcd');

      expect(decorateAndValidate(EndsWith('cd'), 'abcd')).toEqual([]);
      expectValidationError(EndsWith('cd'), 'abce');

      expect(decorateAndValidate(IsAlpha(), 'abcd')).toEqual([]);
      expectValidationError(IsAlpha(), 'abc1');

      expect(decorateAndValidate(IsAlphanumeric(), 'abc1')).toEqual([]);
      expectValidationError(IsAlphanumeric(), 'abc-1');

      expect(decorateAndValidate(IsLowerCase(), 'abc')).toEqual([]);
      expectValidationError(IsLowerCase(), 'Abc');

      expect(decorateAndValidate(IsUpperCase(), 'ABC')).toEqual([]);
      expectValidationError(IsUpperCase(), 'ABc');
    });

    it('validates email options and special branches', () => {
      expect(decorateAndValidate(IsEmail(), 'user@test.com')).toEqual([]);
      expectValidationError(IsEmail(), 'invalid-email');

      expectValidationError(IsEmail({ host_blacklist: ['test.com'] }), 'user@test.com');
      expectValidationError(IsEmail({ blacklisted_chars: ['+'] }), 'user+tag@test.com');
      expectValidationError(IsEmail({ allow_ip_domain: false }), 'user@[127.0.0.1]');
      expectValidationError(IsEmail({ allow_ip_domain: true }), 'user@test.com');
      expectValidationError(IsEmail({ domain_specific: 'company.com' }), 'user@test.com');
      expect(decorateAndValidate(IsEmail({ domain_specific: 'company.com' }), 'user@company.com')).toEqual([]);
      expect(decorateAndValidate(IsEmail({ domain_specific: 'my-company.com' }), 'user@my-company.com')).toEqual([]);
    });

    it('validates format validators', () => {
      expect(decorateAndValidate(IsBase32(), 'MZXW6===')).toEqual([]);
      expectValidationError(IsBase32(), 'base32');

      expect(decorateAndValidate(IsPostalCode('CL'), '1234567')).toEqual([]);
      expect(decorateAndValidate(IsPostalCode(), '12345')).toEqual([]);
      expectValidationError(IsPostalCode('US'), 'abc');

      expect(decorateAndValidate(IsUUID('v4'), '550e8400-e29b-41d4-a716-446655440000')).toEqual([]);
      expect(decorateAndValidate(IsUUID(), '550e8400-e29b-41d4-a716-446655440000')).toEqual([]);
      expectValidationError(IsUUID('v5'), '550e8400-e29b-41d4-a716-446655440000');

      expect(decorateAndValidate(IsJWT(), 'header.payload.signature')).toEqual([]);
      expectValidationError(IsJWT(), 'not-jwt');

      expect(decorateAndValidate(IsJSON(), '{"a":1}')).toEqual([]);
      expectValidationError(IsJSON(), '{invalid');

      expect(decorateAndValidate(IsIp('v4'), '127.0.0.1')).toEqual([]);
      expect(decorateAndValidate(IsIp('v6'), '2001:db8::1')).toEqual([]);
      expect(decorateAndValidate(IsIp(), '127.0.0.1')).toEqual([]);
      expectValidationError(IsIp(), 'invalid-ip');
    });

    it('validates length and match validators', () => {
      expect(decorateAndValidate(MinLength(3), 'abc')).toEqual([]);
      expectValidationError(MinLength(3), 'ab');

      expect(decorateAndValidate(MaxLength(3), 'abc')).toEqual([]);
      expectValidationError(MaxLength(3), 'abcd');

      expect(decorateAndValidate(Length(3), 'abc')).toEqual([]);
      expectValidationError(Length(3), 'abcd');

      expect(decorateAndValidate(Length(2, 4), 'abc')).toEqual([]);
      expectValidationError(Length(2, 4), 'abcde');

      expect(decorateAndValidate(Matches(/^abc$/), 'abc')).toEqual([]);
      expectValidationError(Matches(/^abc$/), 'ab');

      expect(decorateAndValidate(Matches(/^abc$/, 'i'), 'ABC')).toEqual([]);
      expectValidationError(Matches(/^abc$/, 'i'), 'ABCD');
    });

    it('validates rut and strong password rules', () => {
      expect(decorateAndValidate(IsRut(), '12345678-9')).toEqual([]);
      expectValidationError(IsRut(), '12345678-5');

      expect(
        decorateAndValidate(
          IsStrongPassword({
            minLength: 4,
            maxLength: 20,
            minUppercase: 1,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            allowNumbers: true,
            allowSymbols: true,
            allowedSymbols: ['!'],
            includeChars: ['A'],
            maxConsecutiveChars: 3,
            maxConsecutiveNumbers: 3,
          }),
          'Ab1!',
        ),
      ).toEqual([]);

      expectValidationError(IsStrongPassword({ minLength: 4 }), 123 as any);
      expectValidationError(IsStrongPassword({ minLength: 6 }), 'Ab1!');
      expectValidationError(IsStrongPassword({ maxLength: 3 }), 'Ab1!');
      expectValidationError(IsStrongPassword({ excludeChars: ['b'] }), 'Ab1!');
      expectValidationError(IsStrongPassword({ allowedSymbols: ['#'] }), 'Ab1!');
      expectValidationError(IsStrongPassword({ minUppercase: 2 }), 'Ab1!');
      expectValidationError(IsStrongPassword({ minLowercase: 2 }), 'AB1!');
      expectValidationError(IsStrongPassword({ minNumbers: 2, allowNumbers: true }), 'Ab1!');
      expectValidationError(IsStrongPassword({ allowNumbers: false }), 'Ab1!');
      expectValidationError(IsStrongPassword({ minSymbols: 2, allowSymbols: true }), 'Ab1!');
      expectValidationError(IsStrongPassword({ allowSymbols: false }), 'Ab1!');
      expectValidationError(IsStrongPassword({ includeChars: ['Z'] }), 'Ab1!');
      expectValidationError(IsStrongPassword({ maxConsecutiveChars: 1 }), 'AAbb1!');
      expectValidationError(IsStrongPassword({ maxConsecutiveNumbers: 2 }), 'Ab123!');
    });
  });
});
