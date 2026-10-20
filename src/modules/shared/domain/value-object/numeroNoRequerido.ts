import { ValidationException } from '../exceptions/classes';

export class NumeroNoRequerido {
  readonly value: number | null | undefined;

  constructor(value: number | null | undefined) {
    if ((typeof value !== 'number' || Number.isNaN(value)) && value !== null && value !== undefined)
      throw new ValidationException(`${this.constructor.name} el valor debe ser numérico`);
    this.value = value;
  }
}
