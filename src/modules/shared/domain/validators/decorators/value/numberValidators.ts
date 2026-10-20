import { Validator } from '@modules/shared/domain/validators/core/validator';

export const IsPositive = () => Validator.createValidator('positive', (value) => typeof value === 'number' && value >= 0);

export const IsNegative = () => Validator.createValidator('negative', (value) => typeof value === 'number' && value < 0);

export const Min = (minValue: number) => Validator.createValidator(`min ${minValue}`, (value) => typeof value === 'number' && value >= minValue);

export const Max = (maxValue: number) => Validator.createValidator(`max ${maxValue}`, (value) => typeof value === 'number' && value <= maxValue);

export const Range = (minValue: number, maxValue: number) =>
  Validator.createValidator(`range ${minValue} to ${maxValue}`, (value) => typeof value === 'number' && value >= minValue && value <= maxValue);

export const NotRange = (minValue: number, maxValue: number) =>
  Validator.createValidator(`not range ${minValue} to ${maxValue}`, (value) => typeof value === 'number' && (value < minValue || value > maxValue));

export const IsEven = () => Validator.createValidator('even', (value) => typeof value === 'number' && value % 2 === 0);

export const IsOdd = () => Validator.createValidator('odd', (value) => typeof value === 'number' && value % 2 !== 0);

export const IsMultipleOf = (factor: number) =>
  Validator.createValidator(`multiple of ${factor}`, (value) => typeof value === 'number' && value % factor === 0 && !Number.isNaN(value));

export const IsDivisibleBy = (divisor: number) =>
  Validator.createValidator(`divisible by ${divisor}`, (value) => typeof value === 'number' && value % divisor === 0 && !Number.isNaN(value));
