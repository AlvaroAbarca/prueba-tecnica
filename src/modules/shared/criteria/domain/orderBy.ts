import { StringValueObject } from './valueObject/stringValueObject';

export class OrderBy extends StringValueObject {
  constructor(value: string) {
    super(value);
  }
}
