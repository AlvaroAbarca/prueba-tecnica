import {
  checkBase32,
  checkCharTypesPassword,
  checkConsecutiveChars,
  checkConsecutiveNumbers,
  checkIncludeChars,
  checkLength,
  checkMinTypesPassword,
  isCheckDigitValid,
  isRutFormat,
} from '@modules/shared/domain/validators/utils';

describe('Validators utils', () => {
  describe('RUT helpers', () => {
    it('validates a RUT check digit', () => {
      expect(isCheckDigitValid('12345678-9')).toBe(true);
      expect(isCheckDigitValid('12345678-5')).toBe(false);
      expect(isCheckDigitValid('12345678-K')).toBe(false);
    });

    it('validates the RUT format', () => {
      expect(isRutFormat('12345678-9')).toBe(true);
      expect(isRutFormat('12.345.678-9')).toBe(false);
      expect(isRutFormat('')).toBe(false);
      expect(isRutFormat(undefined as any)).toBe(false);
    });
  });

  describe('checkLength', () => {
    it('returns null when the length is within range', () => {
      expect(checkLength('abcd', 2, 5, 'custom')).toBeNull();
    });

    it('returns a custom message when the length is invalid', () => {
      expect(checkLength('a', 2, 5, 'custom')).toBe('custom');
      expect(checkLength('abcdef', 2, 5, '')).toBe('Debe tener una longitud válida entre 2 y 5 caracteres');
    });
  });

  describe('checkBase32', () => {
    it('skips validation when base32 is disabled', () => {
      expect(checkBase32('not-base32', false, 'custom')).toBeNull();
    });

    it('validates Base32 format when enabled', () => {
      expect(checkBase32('MZXW6===', true, 'custom')).toBeNull();
      expect(checkBase32('not-base32', true, 'custom')).toBe('custom');
      expect(checkBase32('not-base32', true, '')).toBe('La cadena debe ser en formato Base32');
    });
  });

  describe('checkCharTypesPassword', () => {
    it('counts character types in a valid password', () => {
      expect(
        checkCharTypesPassword('Ab1$', {
          allowedSymbols: ['$'],
          excludeChars: [],
        }),
      ).toEqual({
        upper: 1,
        lower: 1,
        num: 1,
        sym: 1,
        error: null,
      });
    });

    it('returns an error for excluded characters', () => {
      expect(
        checkCharTypesPassword('Ab1$', {
          allowedSymbols: ['$'],
          excludeChars: ['b'],
        }),
      ).toEqual({
        upper: 1,
        lower: 0,
        num: 0,
        sym: 0,
        error: 'La contraseña contiene un carácter prohibido: b',
      });
    });

    it('returns an error for symbols outside the allowed list', () => {
      expect(
        checkCharTypesPassword('Ab1$', {
          allowedSymbols: ['#'],
          excludeChars: [],
        }),
      ).toEqual({
        upper: 1,
        lower: 1,
        num: 1,
        sym: 0,
        error: 'La contraseña contiene un símbolo no permitido: $',
      });
    });
  });

  describe('checkMinTypesPassword', () => {
    it('validates minimum type counts', () => {
      expect(
        checkMinTypesPassword(1, 1, 1, 1, {
          minUppercase: 1,
          minLowercase: 1,
          minNumbers: 1,
          minSymbols: 1,
          allowNumbers: true,
          allowSymbols: true,
        }),
      ).toBeNull();
    });

    it('reports missing uppercase, numbers and symbols', () => {
      expect(
        checkMinTypesPassword(0, 1, 1, 1, {
          minUppercase: 1,
          minLowercase: 1,
          minNumbers: 1,
          minSymbols: 1,
          allowNumbers: true,
          allowSymbols: true,
        }),
      ).toBe('Debe tener al menos 1 mayúscula(s)');

      expect(
        checkMinTypesPassword(1, 1, 0, 1, {
          minUppercase: 1,
          minLowercase: 1,
          minNumbers: 1,
          minSymbols: 1,
          allowNumbers: true,
          allowSymbols: true,
        }),
      ).toBe('Debe tener al menos 1 número(s)');

      expect(
        checkMinTypesPassword(1, 1, 1, 0, {
          minUppercase: 1,
          minLowercase: 1,
          minNumbers: 1,
          minSymbols: 1,
          allowNumbers: true,
          allowSymbols: true,
        }),
      ).toBe('Debe tener al menos 1 símbolo(s)');
    });

    it('rejects numbers and symbols when they are disabled', () => {
      expect(
        checkMinTypesPassword(1, 1, 1, 0, {
          minUppercase: 1,
          minLowercase: 1,
          allowNumbers: false,
          allowSymbols: true,
        }),
      ).toBe('No se permiten números');

      expect(
        checkMinTypesPassword(1, 1, 1, 1, {
          minUppercase: 1,
          minLowercase: 1,
          allowNumbers: true,
          allowSymbols: false,
        }),
      ).toBe('No se permiten símbolos');
    });
  });

  describe('checkIncludeChars', () => {
    it('returns null when all required characters are present', () => {
      expect(checkIncludeChars('abc123', ['a', '1'])).toBeNull();
    });

    it('returns the missing character message', () => {
      expect(checkIncludeChars('abc123', ['z'])).toBe('Debe incluir el carácter obligatorio: z');
    });
  });

  describe('checkConsecutiveChars', () => {
    it('skips validation when the maximum is zero', () => {
      expect(checkConsecutiveChars('aaaa', 0)).toBeNull();
    });

    it('detects repeated consecutive characters', () => {
      expect(checkConsecutiveChars('aabbcc', 1)).toBe('No se permiten más de 1 caracteres consecutivos iguales (a)');
      expect(checkConsecutiveChars('aaab', 2)).toBe('No se permiten más de 2 caracteres consecutivos iguales (a)');
    });
  });

  describe('checkConsecutiveNumbers', () => {
    it('skips validation when the maximum is zero or negative', () => {
      expect(checkConsecutiveNumbers('1234', 0)).toBeNull();
      expect(checkConsecutiveNumbers('1234', -1)).toBeNull();
    });

    it('detects ascending and descending sequences', () => {
      expect(checkConsecutiveNumbers('1234', 3)).toBe('No se permiten más de 3 números consecutivos ascendentes');
      expect(checkConsecutiveNumbers('4321', 3)).toBe('No se permiten más de 3 números consecutivos descendentes');
    });

    it('resets the streak when non-digit characters appear', () => {
      expect(checkConsecutiveNumbers('12a345', 3)).toBeNull();
    });
  });
});
