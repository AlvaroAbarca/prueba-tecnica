import { isIPv4, isIPv6 } from 'node:net';
import { Validator } from '@modules/shared/domain/validators/core/validator';
import { IsEmailOptions, IStrongPasswordOptions } from '@modules/shared/domain/validators/interfaces';
import {
  isRutFormat,
  isCheckDigitValid,
  checkLength,
  checkCharTypesPassword,
  checkMinTypesPassword,
  checkIncludeChars,
  checkConsecutiveChars,
  checkConsecutiveNumbers,
} from '@modules/shared/domain/validators/utils';
import { postalCodePatterns } from '../constants/postalCodePatterns';
import { regexPatterns } from '../constants/regexPatterns';

export const IsBooleanString = () => Validator.createValidator('boolean string', (value) => typeof value === 'string' && (value === 'true' || value === 'false'));

export const IsNumberString = () => Validator.createValidator('number string', (value) => typeof value === 'string' && !Number.isNaN(Number(value)));

export const IsDateString = () => Validator.createValidator('date string', (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value)));

export const Contains = (substring: string) => Validator.createValidator(`contains ${substring}`, (value) => typeof value === 'string' && value.includes(substring));

export const NotContains = (substring: string) =>
  Validator.createValidator(`not contains ${substring}`, (value) => typeof value === 'string' && !value.includes(substring));

export const StartsWith = (prefix: string) => Validator.createValidator(`starts with ${prefix}`, (value) => typeof value === 'string' && value.startsWith(prefix));

export const EndsWith = (suffix: string) => Validator.createValidator(`ends with ${suffix}`, (value) => typeof value === 'string' && value.endsWith(suffix));

export const IsAlpha = () => Validator.createValidator('alpha', (value) => typeof value === 'string' && regexPatterns.ALPHA.test(value));

export const IsAlphanumeric = () => Validator.createValidator('alphanumeric', (value) => typeof value === 'string' && regexPatterns.ALPHANUMERIC.test(value));

export const IsLowerCase = () => Validator.createValidator('lowercase', (value) => typeof value === 'string' && value === value.toLowerCase());

export const IsUpperCase = () => Validator.createValidator('uppercase', (value) => typeof value === 'string' && value === value.toUpperCase());

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const ipDomainRegex = /^\[(\d{1,3}\.){3}\d{1,3}\]$/;
const regexSpecialChars = new Set(['.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', '\\']);

const hasBlacklistedHost = (domain: string, hostBlacklist?: string[]): boolean => {
  return Boolean(hostBlacklist?.length && hostBlacklist.includes(domain));
};

const hasBlacklistedChars = (value: string, blacklistedChars?: string[]): boolean => {
  if (!blacklistedChars?.length) {
    return false;
  }

  return blacklistedChars.some((char) => value.includes(char));
};

const hasInvalidIpDomainSetting = (domain: string, allowIpDomain?: boolean): boolean => {
  if (allowIpDomain === undefined) {
    return false;
  }

  const isIpDomain = ipDomainRegex.test(domain);
  return allowIpDomain ? !isIpDomain : isIpDomain;
};

const matchesSpecificDomain = (value: string, domainSpecific?: string): boolean => {
  if (!domainSpecific) {
    return true;
  }

  const escapedDomain = domainSpecific
    .split('')
    .map((char) => (regexSpecialChars.has(char) ? `\\${char}` : char))
    .join('');
  const specificDomainRegex = new RegExp(`@${escapedDomain}$`, 'i');
  return specificDomainRegex.test(value);
};

export const IsEmail = (options?: IsEmailOptions) =>
  Validator.createValidator('email', (value) => {
    if (typeof value !== 'string') return false;
    if (!emailRegex.test(value)) {
      return false;
    }

    if (!options) {
      return true;
    }

    const domain = value.split('@')[1];
    const { host_blacklist, blacklisted_chars, allow_ip_domain, domain_specific } = options;

    if (hasBlacklistedHost(domain, host_blacklist)) {
      return false;
    }

    if (hasBlacklistedChars(value, blacklisted_chars)) {
      return false;
    }

    if (hasInvalidIpDomainSetting(domain, allow_ip_domain)) {
      return false;
    }

    return matchesSpecificDomain(value, domain_specific);
  });

export const IsBase32 = () => Validator.createValidator('base32', (value) => typeof value === 'string' && /^[A-Z2-7]+=*$/.test(value));

export const IsPostalCode = (locale?: string) =>
  Validator.createValidator(locale ? `postal code for ${locale}` : 'postal code', (value) => {
    if (typeof value !== 'string') return false;

    return locale && postalCodePatterns[locale] ? postalCodePatterns[locale].test(value) : Object.values(postalCodePatterns).some((regex) => regex.test(value));
  });

export const IsUUID = (version?: 'v3' | 'v4' | 'v5') =>
  Validator.createValidator(version ? `UUID version ${version}` : 'UUID', (value) => {
    if (typeof value !== 'string') return false;

    return version && regexPatterns.UUID[version] ? regexPatterns.UUID[version].test(value) : Object.values(regexPatterns.UUID).some((regex) => regex.test(value));
  });

export const IsJWT = () =>
  Validator.createValidator('JWT', (value) => {
    if (typeof value !== 'string') return false;
    return regexPatterns.JWT.test(value);
  });

export const IsJSON = () =>
  Validator.createValidator('JSON', (value) => {
    if (typeof value !== 'string') return false;

    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  });

export const IsIp = (version?: 'v4' | 'v6') =>
  Validator.createValidator(version ? `IP address version ${version}` : 'IP address', (value) => {
    if (typeof value !== 'string') return false;
    if (version === 'v4') return isIPv4(value);
    if (version === 'v6') return isIPv6(value);
    return isIPv4(value) || isIPv6(value);
  });

export const MinLength = (min: number) => Validator.createValidator(`min length ${min}`, (value) => typeof value === 'string' && value.length >= min);

export const MaxLength = (max: number) => Validator.createValidator(`max length ${max}`, (value) => typeof value === 'string' && value.length <= max);

export const Length = (min: number, max?: number) =>
  Validator.createValidator(max ? `length ${min} to ${max}` : `length ${min}`, (value) => {
    if (typeof value !== 'string') return false;
    const lengthValue = value.length;
    return max ? lengthValue >= min && lengthValue <= max : lengthValue === min;
  });

export const Matches = (pattern: RegExp, modifiers?: string) =>
  Validator.createValidator(modifiers ? `matches ${pattern} with modifiers ${modifiers}` : `matches ${pattern}`, (value) => {
    if (typeof value !== 'string') return false;
    const regex = new RegExp(pattern, modifiers);
    return regex.test(value);
  });

export const IsRut = () =>
  Validator.createValidator('Rut', (value) => {
    return isRutFormat(value) && isCheckDigitValid(value);
  });

export const IsStrongPassword = (options?: IStrongPasswordOptions) =>
  Validator.createValidatorWithMessage('strong password', (value) => {
    if (typeof value !== 'string') return 'La contraseña debe ser un string';

    const {
      allowNumbers = true,
      allowSymbols = true,
      allowedSymbols = [],
      minLength = 6,
      maxLength = 20,
      minUppercase = 1,
      minLowercase = 1,
      minNumbers = 1,
      minSymbols = 1,
      maxConsecutiveNumbers = 3,
      maxConsecutiveChars = 3,
      excludeChars = [],
      includeChars = [],
    } = options || {};

    return (
      checkLength(value, minLength, maxLength, `La contraseña debe tener entre ${minLength} y ${maxLength} caracteres`) ||
      (() => {
        const { upper, lower, num, sym, error } = checkCharTypesPassword(value, {
          allowedSymbols,
          excludeChars,
        });
        if (error) return error;
        return checkMinTypesPassword(upper, lower, num, sym, {
          minUppercase,
          minLowercase,
          minNumbers,
          minSymbols,
          allowNumbers,
          allowSymbols,
        });
      })() ||
      checkIncludeChars(value, includeChars) ||
      checkConsecutiveChars(value, maxConsecutiveChars) ||
      checkConsecutiveNumbers(value, maxConsecutiveNumbers) ||
      null
    );
  });
