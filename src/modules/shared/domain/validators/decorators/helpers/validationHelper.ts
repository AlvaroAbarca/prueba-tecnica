type ValidatableEntity = Record<string | symbol, unknown>;
type ValidationResult = string | null | boolean;
type ValidationFunction = (value: unknown, entity: ValidatableEntity) => ValidationResult;

export class ValidationHelper {
  private static readonly validations = new Map<object, Map<string | symbol, ValidationFunction[]>>();

  private static isValidEntity(entity: unknown): entity is ValidatableEntity {
    return Boolean(entity) && typeof entity === 'object';
  }

  private static isOptionalValidator(validator: ValidationFunction): boolean {
    return validator.name === 'optionalValidator' || validator.toString().includes('optional');
  }

  private static shouldSkipRemainingValidations(validator: ValidationFunction, value: unknown, entity: ValidatableEntity): boolean {
    if (!this.isOptionalValidator(validator)) {
      return false;
    }

    return Boolean(validator(value, entity));
  }

  private static collectValidationError(validator: ValidationFunction, value: unknown, entity: ValidatableEntity, errors: string[]): void {
    const error = validator(value, entity);
    if (typeof error === 'string' && error) {
      errors.push(error);
    }
  }

  private static processPropertyValidators(value: unknown, entity: ValidatableEntity, validatorsFns: ValidationFunction[], errors: string[]): void {
    for (const validator of validatorsFns) {
      if (this.shouldSkipRemainingValidations(validator, value, entity)) {
        return;
      }

      this.collectValidationError(validator, value, entity, errors);
    }
  }

  static addValidation(target: object, propertyKey: string | symbol, validationFn: ValidationFunction): void {
    if (!this.validations.has(target)) {
      this.validations.set(target, new Map());
    }

    const propValidations = this.validations.get(target);
    if (!propValidations?.has(propertyKey)) {
      propValidations?.set(propertyKey, []);
    }

    propValidations?.get(propertyKey)?.push(validationFn);
  }

  static validate(entity: unknown): string[] {
    if (!this.isValidEntity(entity)) {
      throw new Error('Invalid entity provided for validation.');
    }

    const target = Object.getPrototypeOf(entity);
    const validations = this.validations.get(target);
    if (!validations) {
      return [];
    }

    const errors: string[] = [];
    for (const [propKey, validationsFns] of validations.entries()) {
      const value = entity[propKey];
      this.processPropertyValidators(value, entity, validationsFns, errors);
    }

    return errors;
  }

  static validateValue(value: unknown, ...validators: ValidationFunction[]): void {
    for (const validator of validators) {
      const error = validator(value, {});
      if (error) {
        throw error;
      }
    }
  }
}
