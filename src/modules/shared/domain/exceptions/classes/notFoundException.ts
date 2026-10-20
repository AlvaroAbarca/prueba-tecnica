import { BaseException } from '../base/baseException';

export class NotFoundException extends BaseException {
  constructor(message: string, id: string = 'V_000', context?: Record<string, any>) {
    super(message, { code: 'NOT_FOUND', id }, context);
  }
}
