import { BaseException } from '../base/baseException';

export class ValidationException extends BaseException {
  public details?: Array<{
    field: string;
    message: string;
    entity: string;
    value: any;
    timestamp: string;
  }>;

  constructor(message: string, id: string = 'V_000', context?: Record<string, any>) {
    super(message, { code: 'DATA_VALIDATION', id }, context);
  }
}
