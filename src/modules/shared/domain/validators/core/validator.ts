import { nowISO } from '@modules/shared/infrastructure/utils/date.helper';
import { Exception } from '../../exceptions/factory/exceptionFactory';
import { ValidationHelper } from '../decorators/helpers/validationHelper';

type Rule<T> = (value: T) => string | null;

export abstract class Validator<T> {
  protected rules: Rule<T>[] = [];

  private static formatValueForMessage(value: any): string {
    if (typeof value === 'string') {
      return value;
    }

    try {
      const serialized = JSON.stringify(value);
      if (!serialized) {
        return String(value);
      }
      return serialized.length > 300 ? `${serialized.slice(0, 300)}...` : serialized;
    } catch {
      return String(value);
    }
  }

  protected addRule(rule: Rule<T>): this {
    this.rules.push(rule);
    return this;
  }

  protected static throwValidationError(value: any, errors: string[], entityName: string): never {
    throw Exception.validation(
      `Validation error for value: ${Validator.formatValueForMessage(value)}`,
      'VALIDATION_ERROR',
      errors.map((error) => ({
        message: error,
        field: String(value),
        entity: entityName,
        value: value,
        timestamp: nowISO(),
      })),
    );
  }

  value(value: T): void {
    const errors = this.rules.map((rule) => rule(value)).filter((error): error is string => Boolean(error));

    if (errors.length) {
      Validator.throwValidationError(value, errors, this.constructor.name);
    }
  }

  static createValidator(type: string, checkFn: (value: any) => boolean): PropertyDecorator {
    return (target: object, propKey: string | symbol) => {
      let validatorFn;
      if (type === 'optional') {
        validatorFn = function optionalValidator(value: any) {
          if (checkFn(value)) {
            return true;
          }
          return null;
        };
      } else {
        validatorFn = function (value: any, entity: any) {
          if (!checkFn(value)) {
            Validator.throwValidationError(value, [`${String(propKey)} must be a ${type}.`], entity.constructor.name);
          }
          return null;
        };
      }
      ValidationHelper.addValidation(target, propKey, validatorFn);
    };
  }

  static createValidatorWithMessage(type: string, checkFn: (value: any) => string | null): PropertyDecorator {
    return (target: object, propKey: string | symbol) => {
      ValidationHelper.addValidation(target, propKey, (value: any, entity: any) => {
        const error = checkFn(value);
        if (error) {
          Validator.throwValidationError(value, [error], entity.constructor.name);
        }
        return null;
      });
    };
  }
}
