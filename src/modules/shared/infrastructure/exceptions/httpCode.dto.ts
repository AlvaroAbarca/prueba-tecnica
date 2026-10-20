import { ErrorTypes } from '@modules/shared/domain/exceptions/base/baseException';
import { HttpStatus } from '@nestjs/common';

export class TypesExceptionHttpDto {
  static fromTypeToHttpCode(type: ErrorTypes): number {
    switch (type) {
      case 'DATA_VALIDATION':
        return HttpStatus.BAD_REQUEST;
      case 'NOT_FOUND':
        return HttpStatus.NOT_FOUND;
      case 'UNAUTHORIZED':
        return HttpStatus.UNAUTHORIZED;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  static fromTypeToMessage(type: ErrorTypes): string {
    switch (type) {
      case 'DATA_VALIDATION':
        return 'Validation error';
      case 'NOT_FOUND':
        return 'Resource not found';
      case 'UNAUTHORIZED':
        return 'Unauthorized access';
      default:
        return 'Internal server error';
    }
  }
}
