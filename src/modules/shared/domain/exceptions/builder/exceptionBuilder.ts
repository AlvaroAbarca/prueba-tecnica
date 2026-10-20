import { BaseException } from '../base/baseException';

export class ExceptionBuilder {
  private message: string = '';
  private code: string = 'D_000';
  private context: Record<string, any> = {};

  setMessage(message: string): this {
    this.message = message;
    return this;
  }

  setCode(code: string): this {
    this.code = code;
    return this;
  }

  setContext(context: Record<string, any>): this {
    this.context = context;
    return this;
  }

  build<T extends BaseException>(ErrorClass: new (message: string, code: string, context?: Record<string, any>) => T): T {
    return new ErrorClass(this.message, this.code, this.context);
  }
}
