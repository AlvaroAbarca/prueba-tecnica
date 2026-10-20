export abstract class ValueObject<T> {
  constructor(protected _value: T) {}

  public value(): T {
    return this._value;
  }

  public equals(other: ValueObject<T>): boolean {
    return this._value === other._value;
  }
}
