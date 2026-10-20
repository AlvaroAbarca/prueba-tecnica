import { nowISO } from '@modules/shared/infrastructure/utils/date.helper';

export class ErrorFormatter {
  static getEntityName(field: string): string {
    // Convierte 'userId' -> 'UserId', 'userName' -> 'UserName', etc.
    return field
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  static formatFieldName(entityName: string): string {
    return entityName.toLowerCase().replaceAll('([A-Z])', '_$1').substring(1);
  }

  static formatValidationError(
    field: string,
    message: string,
    value: any,
  ): {
    message: string;
    field: string;
    entity: string;
    value: any;
    timestamp: string;
    stack?: string;
  } {
    return {
      message,
      field,
      entity: this.getEntityName(field),
      value,
      timestamp: nowISO(),
      stack: new Error('Validation error stack trace').stack,
    };
  }
}
