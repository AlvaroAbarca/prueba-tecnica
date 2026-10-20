import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import { AsyncLocalStorage } from 'node:async_hooks';

export const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = nanoid(9);
    req['requestId'] = requestId;
    res.setHeader('X-Request-ID', requestId);

    const store = new Map<string, any>();
    store.set('requestId', requestId);

    asyncLocalStorage.run(store, () => {
      next();
    });
  }
}
