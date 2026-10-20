import { StringValueObject } from './valueObject/stringValueObject';

export class FilterField extends StringValueObject {
  constructor(value: string) {
    super(value);
  }
}
