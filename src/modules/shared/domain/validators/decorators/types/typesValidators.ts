import { Validator } from '../../core/validator';

// Validadores de tipos primitivos
export const IsString = () => Validator.createValidator('string', (value) => typeof value === 'string');

export const IsNumber = () => Validator.createValidator('number', (value) => typeof value === 'number' && !Number.isNaN(value));

export const IsInt = () => Validator.createValidator('integer', (value) => Number.isInteger(value) && !Number.isNaN(value));

export const IsFloat = () => Validator.createValidator('float', (value) => typeof value === 'number' && !Number.isNaN(value) && !Number.isInteger(value));

export const IsBoolean = () => Validator.createValidator('boolean', (value) => typeof value === 'boolean');

export const IsArray = () => Validator.createValidator('array', (value) => Array.isArray(value));

export const IsObject = () => Validator.createValidator('object', (value) => value !== null && typeof value === 'object' && !Array.isArray(value));

export const IsDate = () => Validator.createValidator('date', (value) => value instanceof Date && !Number.isNaN(value.getTime()));

export const IsNull = () => Validator.createValidator('null', (value) => value === null);

export const IsUndefined = () => Validator.createValidator('undefined', (value) => value === undefined);

export const IsObjectWithKeys = (keys: string[]) =>
  Validator.createValidator(
    `object with keys ${keys.join(', ')}`,
    (value) => value !== null && typeof value === 'object' && !Array.isArray(value) && keys.every((key) => key in value),
  );

export const IsEnum = (enumObj: object) => Validator.createValidator(`enum ${Object.keys(enumObj).join(', ')}`, (value) => Object.values(enumObj).includes(value));
