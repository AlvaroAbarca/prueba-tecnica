import { regexPatterns } from '../decorators/constants/regexPatterns';
import { IStrongPasswordOptions } from '../interfaces/strongPasswordOptions.interfaces';

export const isRutFormat = (rut: string): boolean => {
  if (!rut || typeof rut !== 'string') {
    return false;
  }

  if (rut.trim().length === 0) {
    return false;
  }

  return regexPatterns.RUT.test(rut);
};

export function checkLength(value: string, min: number, max: number, message: string): string | null {
  if (value.length < min || value.length > max) {
    return message || `Debe tener una longitud válida entre ${min} y ${max} caracteres`;
  }
  return null;
}

export function checkBase32(value: string, base32: boolean, message: string): string | null {
  if (base32 && !/^[A-Z2-7]+=*$/.test(value)) {
    return message || 'La cadena debe ser en formato Base32';
  }
  return null;
}

export function checkCharTypesPassword(
  value: string,
  options: IStrongPasswordOptions,
): {
  upper: number;
  lower: number;
  num: number;
  sym: number;
  error: string | null;
} {
  const { allowedSymbols = [], excludeChars = [] } = options;

  let upper = 0,
    lower = 0,
    num = 0,
    sym = 0;
  for (const char of value) {
    if (excludeChars.includes(char))
      return {
        upper,
        lower,
        num,
        sym,
        error: `La contraseña contiene un carácter prohibido: ${char}`,
      };
    if (/[A-Z]/.test(char)) upper++;
    else if (/[a-z]/.test(char)) lower++;
    else if (/\d/.test(char)) num++;
    else if (/[^A-Za-z0-9]/.test(char)) {
      if (allowedSymbols.length > 0 && !allowedSymbols.includes(char))
        return {
          upper,
          lower,
          num,
          sym,
          error: `La contraseña contiene un símbolo no permitido: ${char}`,
        };
      sym++;
    }
  }
  return { upper, lower, num, sym, error: null };
}

export function checkMinTypesPassword(upper: number, lower: number, num: number, sym: number, options: IStrongPasswordOptions): string | null {
  const { minUppercase = 1, minLowercase = 1, minNumbers = 1, minSymbols = 1, allowNumbers = true, allowSymbols = true } = options;

  if (upper < minUppercase) return `Debe tener al menos ${minUppercase} mayúscula(s)`;
  if (lower < minLowercase) return `Debe tener al menos ${minLowercase} minúscula(s)`;
  if (allowNumbers && num < minNumbers) return `Debe tener al menos ${minNumbers} número(s)`;
  if (!allowNumbers && num > 0) return 'No se permiten números';
  if (allowSymbols && sym < minSymbols) return `Debe tener al menos ${minSymbols} símbolo(s)`;
  if (!allowSymbols && sym > 0) return 'No se permiten símbolos';
  return null;
}

export function checkIncludeChars(value: string, includeChars: string[]): string | null {
  for (const char of includeChars) {
    if (!value.includes(char)) return `Debe incluir el carácter obligatorio: ${char}`;
  }
  return null;
}

export function checkConsecutiveChars(value: string, maxConsecutiveChars: number): string | null {
  if (maxConsecutiveChars > 0) {
    let count = 1;
    for (let i = 1; i < value.length; i++) {
      if (value[i] === value[i - 1]) {
        count++;
        if (count > maxConsecutiveChars) return `No se permiten más de ${maxConsecutiveChars} caracteres consecutivos iguales (${value[i]})`;
      } else {
        count = 1;
      }
    }
  }
  return null;
}

const isDigitChar = (char: string): boolean => /\d/.test(char);

export function checkConsecutiveNumbers(value: string, maxConsecutiveNumbers: number): string | null {
  if (maxConsecutiveNumbers <= 0) {
    return null;
  }

  let asc = 1;
  let desc = 1;

  for (let i = 1; i < value.length; i++) {
    const currentChar = value[i];
    const previousChar = value[i - 1];

    if (!isDigitChar(currentChar) || !isDigitChar(previousChar)) {
      asc = 1;
      desc = 1;
      continue;
    }

    const currentDigit = Number(currentChar);
    const previousDigit = Number(previousChar);

    asc = currentDigit === previousDigit + 1 ? asc + 1 : 1;
    desc = currentDigit === previousDigit - 1 ? desc + 1 : 1;

    if (asc > maxConsecutiveNumbers) return `No se permiten más de ${maxConsecutiveNumbers} números consecutivos ascendentes`;
    if (desc > maxConsecutiveNumbers) return `No se permiten más de ${maxConsecutiveNumbers} números consecutivos descendentes`;
  }

  return null;
}
