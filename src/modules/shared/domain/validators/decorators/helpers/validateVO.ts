import { nowISO } from '@modules/shared/infrastructure/utils/date.helper';
import { Exception } from '../../../exceptions/factory/exceptionFactory';
import { ValidationHelper } from './validationHelper';
import { ErrorFormatter } from './errorFormatter';
import { VODefinitionFactory } from './voDefinitionFactory';

const extractErrorMessage = (error: any): string => {
  if (Array.isArray(error?.errors) && error.errors.length > 0) {
    const firstError = error.errors.find((item: any) => typeof item?.message === 'string');
    if (firstError?.message) {
      return firstError.message;
    }
  }

  if (typeof error?.message === 'string' && error.message.length > 0) {
    return error.message;
  }

  return 'Validation error';
};

export class ValidateVO {
  private static createValidationException(message: string, code: string, errors: Array<{ field: string; message: string; value: any }>): never {
    const formattedDetails = errors.map((error) => ({
      message: error.message,
      field: error.field,
      entity: ErrorFormatter.getEntityName(error.field),
      value: error.value,
      timestamp: nowISO(),
      stack: new Error('Validation exception stack trace').stack,
    }));

    throw Exception.validation(message, code, formattedDetails);
  }

  static createVODefinition<T extends Record<string, new (value: any) => any>>(mapping: T) {
    return VODefinitionFactory.create(mapping);
  }

  static validate(instance: any, fieldName?: string): void {
    const errors = ValidationHelper.validate(instance);
    if (errors.length > 0) {
      const entityName = instance.constructor.name;
      const field = fieldName || ErrorFormatter.formatFieldName(entityName);

      this.createValidationException(
        `Invalid ${field}`,
        `${entityName.toUpperCase()}_VALIDATION_ERROR`,
        errors.map((error) => ({
          field,
          message: error,
          value: instance.value,
        })),
      );
    }
  }

  static getErrors(instance: any): string[] {
    return ValidationHelper.validate(instance);
  }

  static createFromMapping<T>(params: Record<string, any>, mapping: Record<string, new (value: any) => any>): T {
    const result = {} as T;
    const allErrors: Array<{ field: string; message: string; value: any }> = [];

    for (const [fieldName, VOClass] of Object.entries(mapping)) {
      const value = params[fieldName];

      try {
        const voInstance = new VOClass(value);
        (result as any)[fieldName] = voInstance;
      } catch (error) {
        allErrors.push({
          field: fieldName,
          message: extractErrorMessage(error),
          value: value,
        });
      }
    }

    if (allErrors.length > 0) {
      this.createValidationException('Multiple validation errors', 'MULTI_VALIDATION_ERROR', allErrors);
    }

    return result;
  }
}
