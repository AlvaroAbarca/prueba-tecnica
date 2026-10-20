import { BaseException } from '../base/baseException';

export class BusinessException extends BaseException {
  constructor(message: string, id: string = 'B_000', context?: Record<string, any>) {
    super(message, { code: 'DATA_VALIDATION', id }, context);
  }
}
