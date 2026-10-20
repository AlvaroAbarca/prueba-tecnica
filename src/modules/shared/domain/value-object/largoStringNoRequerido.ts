import { ValidationException } from '../exceptions/classes';

export class LargoStringNoRequerido {
  readonly value: string | undefined;

  constructor(value: any, largo: number) {
    if (typeof value != 'string' && value != undefined && value != null) throw new ValidationException(`${this.constructor.name} debe ser un string o undefined.`);

    if (typeof value == 'string' && value.length > largo) throw new ValidationException(`${this.constructor.name} no puede superar los ${largo} caracteres.`);

    this.value = value;
  }
}
