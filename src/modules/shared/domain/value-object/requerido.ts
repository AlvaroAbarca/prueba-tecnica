import { ValidationException } from '../exceptions/classes';

export type Primitives = string | number | boolean | Date;

export abstract class Requerido<T extends Primitives> {
  readonly value: T;

  constructor(value: T) {
    this.value = value;
    this.ensureValueIsDefined(value);
  }

  private ensureValueIsDefined(value: T): void {
    if (value === null || value === undefined || value === '') {
      throw new ValidationException(`${this.constructor.name} el valor debe ser definido`);
    }
  }
}
