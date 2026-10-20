import { HttpStatus } from '@nestjs/common';

export class Respuesta {
  public message: string;
  public data: any;
  public errors: Array<{
    field: string;
    message: string;
    entity?: string;
    value?: any;
    timestamp?: string;
    stack?: string;
  }>;
  public code: number;

  constructor(
    message: string,
    data: any,
    errors: Array<{
      field: string;
      message: string;
      entity?: string;
      value?: any;
      timestamp?: string;
      stack?: string;
    }> = [],
    code: number = 200,
  ) {
    this.message = message;
    this.data = data;
    this.errors = errors;
    this.code = code;
  }

  set setCode(code: number) {
    this.code = code;
  }
}

type ErrorDetail = {
  field?: string;
  message: string;
  entity?: string;
  value?: any;
  timestamp?: string;
  stack?: string;
  code?: string;
};

export class EmitResponse {
  public message: string;
  public data?: any;
  public errors?: ErrorDetail[];
  public code: number;
  public timestamp?: string;
  public timezone?: string;
  public path?: string;

  private constructor(message: string, code: number, data?: any, errors?: ErrorDetail[]) {
    this.message = message;
    this.code = code;
    if (data !== undefined) this.data = data;
    if (errors && errors.length > 0) this.errors = errors;
  }

  static ok(message: string, data: any, code: HttpStatus = 200): EmitResponse {
    return new EmitResponse(message, code, data);
  }

  static error(message: string, errors: ErrorDetail[], code = 400): EmitResponse {
    throw new EmitResponse(message, code, undefined, errors);
  }
}
