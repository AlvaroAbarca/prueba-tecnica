import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { EmitResponse } from '../dto/respuesta';
import { BaseException } from '@modules/shared/domain/exceptions/base/baseException';
import { TypesExceptionHttpDto } from '../exceptions/httpCode.dto';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { nowISO } from '../utils/date.helper';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LogProvider) {}
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const logPayload = {
      exception: {
        name: exception?.name,
        message: exception?.message,
        stack: undefined as string | undefined,
        code: exception?.code,
      },
      request: {
        method: request?.method,
        url: request?.url,
        ip: (request as any)?.ip,
        requestId: (request as any)?.requestId,
      },
    };

    let httpCodeResponse = 500;
    let message = exception.message || 'Internal server error';
    let errors = [];

    logPayload.exception.stack = exception?.stack;
    this.logger.error(`Exception from global`, logPayload);
    const isErrorFromDtos = !!exception.response;
    if (isErrorFromDtos) {
      httpCodeResponse = exception.response.status || 400;
      message = 'Invalid data';
      errors = exception.response.message;
    }

    const isErrorFromDb = !!exception.query;
    if (isErrorFromDb) {
      message = 'Internal database error';
      if (exception.code === '23505') {
        //error unique violation
        httpCodeResponse = 500;
        errors = [{ message: 'Entity already exists' }];
      }
    }

    if (exception instanceof BaseException) {
      httpCodeResponse = TypesExceptionHttpDto.fromTypeToHttpCode(exception.code);
      errors = [{ message: exception.message }];
      message = TypesExceptionHttpDto.fromTypeToMessage(exception.code);
    }

    if (exception instanceof EmitResponse) {
      httpCodeResponse = exception.code;
    }

    errors = exception.errors?.length > 0 ? exception.errors.map(errorsDetailDto) : errors;

    return response.status(httpCodeResponse).json({
      code: httpCodeResponse,
      data: null,
      message,
      errors,
      timestamp: nowISO(),
      timezone: 'UTC',
      path: (request as any)?.url ?? '',
    });
  }
}

const errorsDetailDto = (error: { field: string; message: string }) => ({ field: error.field, message: error.message });
