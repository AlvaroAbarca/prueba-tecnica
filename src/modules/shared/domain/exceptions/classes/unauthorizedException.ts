import { BaseException } from '../base/baseException';

export class UnauthorizedException extends BaseException {
  constructor(message: string, id: string = 'U_000', context?: Record<string, any>) {
    super(message, { code: 'UNAUTHORIZED', id }, context);
  }
}
