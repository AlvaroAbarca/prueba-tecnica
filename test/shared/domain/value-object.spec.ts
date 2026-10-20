import { LargoString } from '@modules/shared/domain/value-object/largoString';
import { LargoStringFijo } from '@modules/shared/domain/value-object/largoStringFijo';
import { LargoStringNoRequerido } from '@modules/shared/domain/value-object/largoStringNoRequerido';
import { NumeroNoRequerido } from '@modules/shared/domain/value-object/numeroNoRequerido';
import { NumeroRequerido } from '@modules/shared/domain/value-object/numeroRequerido';
import { Requerido } from '@modules/shared/domain/value-object/requerido';

class RequiredString extends Requerido<string> {}

describe('Shared value objects', () => {
  describe('Requerido', () => {
    it('stores the value when it is defined', () => {
      const valueObject = new RequiredString('valid');

      expect(valueObject.value).toBe('valid');
    });

    it.each([null, undefined, ''])('throws when the value is %s', (value) => {
      expect(() => new RequiredString(value as string)).toThrow('RequiredString el valor debe ser definido');
    });
  });

  describe('LargoString', () => {
    it('accepts strings within the maximum length', () => {
      const valueObject = new LargoString('abc', 5);

      expect(valueObject.value).toBe('abc');
    });

    it('throws when the string exceeds the maximum length', () => {
      expect(() => new LargoString('abcdef', 5)).toThrow('LargoString no puede superar los 5 caracteres.');
    });
  });

  describe('LargoStringFijo', () => {
    it('accepts strings with the exact length', () => {
      const valueObject = new LargoStringFijo('abcd', 4);

      expect(valueObject.value).toBe('abcd');
    });

    it('throws when the string length is different', () => {
      expect(() => new LargoStringFijo('abc', 4)).toThrow('LargoStringFijo no puede superar los 4 caracteres.');
    });
  });

  describe('LargoStringNoRequerido', () => {
    it.each([undefined, null, 'abc'])('accepts optional values: %s', (value) => {
      expect(() => new LargoStringNoRequerido(value, 5)).not.toThrow();
    });

    it('throws when the value is not a string, null or undefined', () => {
      expect(() => new LargoStringNoRequerido(123 as any, 5)).toThrow('LargoStringNoRequerido debe ser un string o undefined.');
    });

    it('throws when the optional string exceeds the limit', () => {
      expect(() => new LargoStringNoRequerido('abcdef', 5)).toThrow('LargoStringNoRequerido no puede superar los 5 caracteres.');
    });
  });

  describe('NumeroNoRequerido', () => {
    it.each([undefined, null, 10, 0, -5])('accepts optional numeric values: %s', (value) => {
      expect(() => new NumeroNoRequerido(value as number)).not.toThrow();
    });

    it('throws when the value is not numeric', () => {
      expect(() => new NumeroNoRequerido('abc' as any)).toThrow('NumeroNoRequerido el valor debe ser numérico');
      expect(() => new NumeroNoRequerido(Number.NaN)).toThrow('NumeroNoRequerido el valor debe ser numérico');
    });
  });

  describe('NumeroRequerido', () => {
    it('accepts numeric values', () => {
      const valueObject = new NumeroRequerido(123);

      expect(valueObject.value).toBe(123);
    });

    it('throws when the value is not numeric', () => {
      expect(() => new NumeroRequerido(Number.NaN)).toThrow('NumeroRequerido el valor debe ser numérico');
      expect(() => new NumeroRequerido('123' as any)).toThrow('NumeroRequerido el valor debe ser numérico');
    });
  });
});
