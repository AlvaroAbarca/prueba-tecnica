import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { EmitResponse } from '../dto/respuesta';
import { nowISO } from '../utils/date.helper';

@Injectable()
export class ResponsesInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data) => {
        const responseMap: EmitResponse = {
          code: data?.code ?? data?.statusCode ?? response.statusCode,
          data: data?.data ?? data ?? null,
          message: data?.message ?? '',
          timestamp: nowISO(),
          timezone: 'UTC',
          path: request?.url ?? '',
          // errors: data?.errors ?? [],
        };
        response.statusCode = responseMap.code;
        return responseMap;
      }),
    );
  }
}
