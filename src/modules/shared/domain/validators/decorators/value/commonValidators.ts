import { Validator } from '@modules/shared/domain/validators/core/validator';

export const IsOptional = () =>
  Validator.createValidator('optional', function optionalValidator() {
    return true;
  });

export const IsRequired = () => Validator.createValidator('required', (value) => value !== undefined && value !== null);

export const IsRequiredWithNull = () => Validator.createValidator('required with null', (value) => value !== undefined);

export const Equals = (expectedValue: any) => Validator.createValidator(`equals ${expectedValue}`, (value) => value === expectedValue);

export const NotEquals = (unexpectedValue: any) => Validator.createValidator(`not equals ${unexpectedValue}`, (value) => value !== unexpectedValue);

export const IsIn = (allowedValues: any[]) => Validator.createValidator(`in ${allowedValues.join(', ')}`, (value) => allowedValues.includes(value));

export const IsNotIn = (disallowedValues: any[]) => Validator.createValidator(`not in ${disallowedValues.join(', ')}`, (value) => !disallowedValues.includes(value));

export const IsEmpty = () => Validator.createValidator('empty', (value) => value === null || value === undefined || value === '');

export const IsNotEmpty = () => Validator.createValidator('not empty', (value) => value !== null && value !== undefined && value !== '');
