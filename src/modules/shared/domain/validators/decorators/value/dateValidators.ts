import { Validator } from '@modules/shared/domain/validators/core/validator';

export const MinDate = (minDate: Date) => Validator.createValidator(`min date ${minDate.toISOString()}`, (value) => value instanceof Date && value >= minDate);

export const MaxDate = (maxDate: Date) => Validator.createValidator(`max date ${maxDate.toISOString()}`, (value) => value instanceof Date && value <= maxDate);

export const IsBefore = (date: Date) => Validator.createValidator(`before ${date.toISOString()}`, (value) => value instanceof Date && value < date);

export const IsAfter = (date: Date) => Validator.createValidator(`after ${date.toISOString()}`, (value) => value instanceof Date && value > date);

export const IsSameDay = (date: Date) =>
  Validator.createValidator(
    `same day as ${date.toISOString()}`,
    (value) =>
      value instanceof Date &&
      date instanceof Date &&
      value.getFullYear() === date.getFullYear() &&
      value.getMonth() === date.getMonth() &&
      value.getDate() === date.getDate(),
  );

export const IsDateInRange = (startDate: Date, endDate: Date) =>
  Validator.createValidator(
    `date in range ${startDate.toISOString()} to ${endDate.toISOString()}`,
    (value) => value instanceof Date && value >= startDate && value <= endDate,
  );
