import { BaseException } from '../base/baseException';

export class InternalSystemException extends BaseException {
  constructor(message: string, id: string = 'IS_000', context?: Record<string, any>) {
    super(message, { code: 'INTERNAL', id }, context);
  }
}
