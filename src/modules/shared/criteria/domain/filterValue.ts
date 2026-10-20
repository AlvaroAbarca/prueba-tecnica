import { ValueObject } from './valueObject/valueObject';

export class FilterValue extends ValueObject<any> {
  constructor(value: any) {
    super(value);
  }
}
