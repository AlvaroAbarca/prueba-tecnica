import { ValidationException, BusinessException, InternalSystemException } from '../classes';

export class Exception {
  static validation(
    message: string,
    code: string = 'VALIDATION_ERROR',
    details?: Array<{
      field: string;
      message: string;
      entity: string;
      value: any;
      timestamp: string;
    }>,
  ): ValidationException {
    const error = new ValidationException(message, code);
    error.errors = details;
    return error;
  }

  static business(message: string, code: string = 'BUSINESS_ERROR', details?: any): BusinessException {
    return new BusinessException(message, code, details);
  }

  static system(message: string, code: string = 'SYSTEM_ERROR', details?: any): InternalSystemException {
    return new InternalSystemException(message, code, details);
  }

  static notFound(entity: string, id?: string | number): BusinessException {
    const message = `${entity} no encontrado` + (id ? ` con ID: ${id}` : '');
    return new BusinessException(message, 'NOT_FOUND', { entity, id });
  }

  static alreadyExists(entity: string, field?: string, value?: any): BusinessException {
    const message = `${entity} ya existe` + (field ? ` con ${field}: ${value}` : '');
    return new BusinessException(message, 'ALREADY_EXISTS', {
      entity,
      field,
      value,
    });
  }

  static multipleValidation(errors: string[] | Error[], context?: string): ValidationException {
    const errorCount = errors.length;
    const contextMessage = context ? ` en ${context}` : '';
    const mainMessage = `Se encontraron ${errorCount} error${errorCount > 1 ? 'es' : ''} de validación${contextMessage}`;

    const errorMessages = errors.map((error, index) => {
      if (typeof error === 'string') {
        return { index: index + 1, message: error };
      }
      return {
        index: index + 1,
        message: error.message || error.toString(),
        type: error.constructor.name,
      };
    });

    return new ValidationException(mainMessage, 'MULTIPLE_VALIDATION_ERRORS', {
      context,
      totalErrors: errorCount,
      errors: errorMessages,
    });
  }
}
