import { ValidationException } from '../exceptions/classes';
import { Requerido } from './requerido';

export class NumeroRequerido extends Requerido<number> {
  constructor(value: number) {
    super(value);

    if (typeof value !== 'number' || Number.isNaN(value)) throw new ValidationException(`${this.constructor.name} el valor debe ser numérico`);
  }
}
