import { BaseException } from '@modules/shared/domain/exceptions/base/baseException';

export class AuthException extends BaseException {
  constructor(message: string, context?: Record<string, any>) {
    super(message, { code: 'UNAUTHORIZED', id: 'AUTH_001' }, context);
  }
}

export class InvalidCredentialsException extends BaseException {
  constructor(message: string = 'Invalid credentials', context?: Record<string, any>) {
    super(message, { code: 'UNAUTHORIZED', id: 'AUTH_002' }, context);
  }
}

export class TokenExpiredException extends BaseException {
  constructor(message: string = 'Token expirado', context?: Record<string, any>) {
    super(message, { code: 'UNAUTHORIZED', id: 'AUTH_003' }, context);
  }
}

export class InvalidTokenException extends BaseException {
  constructor(message: string = 'Token inválido', context?: Record<string, any>) {
    super(message, { code: 'UNAUTHORIZED', id: 'AUTH_004' }, context);
  }
}

export class RefreshTokenExpiredException extends BaseException {
  constructor(message: string = 'Token de refresco expirado', context?: Record<string, any>) {
    super(message, { code: 'UNAUTHORIZED', id: 'AUTH_005' }, context);
  }
}
