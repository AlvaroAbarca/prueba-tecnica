import { EnumValueObject } from './valueObject/enumValueObject';

export enum Operator {
  EQUAL = '=',
  NOT_EQUAL = '!=',
  GT = '>',
  LT = '<',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  IN = 'IN',
  // Operadores específicos para JSONB
  JSONB_CONTAINS = 'JSONB_CONTAINS', // @> (el JSON contiene el valor)
  JSONB_CONTAINED = 'JSONB_CONTAINED', // <@ (el JSON está contenido en)
  JSONB_HAS_KEY = 'JSONB_HAS_KEY', // ? (tiene la key)
  JSONB_HAS_ALL_KEYS = 'JSONB_HAS_ALL_KEYS', // ?& (tiene todas las keys)
  JSONB_HAS_ANY_KEY = 'JSONB_HAS_ANY_KEY', // ?| (tiene alguna de las keys)
  // Operador para comparación de fechas con formato
  DATE_FORMAT_EQUAL = 'DATE_FORMAT_EQUAL', // to_char(field, 'DD/MM/YYYY') = value
}

export class FilterOperator extends EnumValueObject<Operator> {
  constructor(value: Operator) {
    super(value, Object.values(Operator));
  }

  public static fromValue(value: string): FilterOperator {
    for (const operatorValue of Object.values(Operator)) {
      if (value === operatorValue.toString()) {
        return new FilterOperator(operatorValue);
      }
    }

    throw new Error(`The filter operator ${value} is invalid`);
  }

  public isPositive(): boolean {
    return this.value !== Operator.NOT_EQUAL && this.value !== Operator.NOT_CONTAINS;
  }

  protected throwErrorForInvalidValue(value: Operator): void {
    throw new Error(`The filter operator ${value} is invalid`);
  }

  public static equal() {
    return this.fromValue(Operator.EQUAL);
  }
}
