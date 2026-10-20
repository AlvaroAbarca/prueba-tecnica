import { nowISO } from '@modules/shared/infrastructure/utils/date.helper';

export type ErrorTypes = 'DATA_VALIDATION' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL';

export abstract class BaseException extends Error {
  id: string; // Unique error id definir el formato del código interno
  code: ErrorTypes;
  readonly context?: Record<string, any>;
  readonly timeStampUTC: string;
  errors?: unknown[];

  constructor(message: string, type?: { code?: ErrorTypes; id?: string }, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.code = type?.code || 'INTERNAL';
    this.id = type?.id || 'UNKNOWN_ERROR';
    this.context = context;
    this.timeStampUTC = nowISO();
  }
}
