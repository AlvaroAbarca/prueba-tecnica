import { ValidationException } from '../exceptions/classes';
import { Requerido } from './requerido';

export class LargoStringFijo extends Requerido<string> {
  constructor(value: string, largo: number) {
    super(value);
    if (value.length != largo) throw new ValidationException(`${this.constructor.name} no puede superar los ${largo} caracteres.`);
  }
}
