export abstract class StringValueObject {
  constructor(protected _value: string) {}

  public value(): string {
    return this._value;
  }
}
