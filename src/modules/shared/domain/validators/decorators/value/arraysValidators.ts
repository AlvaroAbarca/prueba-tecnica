import { Validator } from '@modules/shared/domain/validators/core/validator';

export const ArrayNotEmpty = () =>
  Validator.createValidatorWithMessage('array not empty', (value) => {
    if (!Array.isArray(value)) {
      return 'Value is not an array';
    }
    if (value.length === 0) {
      return 'Array should not be empty';
    }
    return null;
  });

export const ArrayMinSize = (minSize: number) =>
  Validator.createValidatorWithMessage('array min size', (value) => {
    if (!Array.isArray(value)) {
      return 'Value is not an array';
    }
    if (value.length < minSize) {
      return `Array should have at least ${minSize} elements`;
    }
    return null;
  });

export const ArrayMaxSize = (maxSize: number) =>
  Validator.createValidatorWithMessage('array max size', (value) => {
    if (!Array.isArray(value)) {
      return 'Value is not an array';
    }
    if (value.length > maxSize) {
      return `Array should have at most ${maxSize} elements`;
    }
    return null;
  });

export const ArrayUnique = () =>
  Validator.createValidatorWithMessage('array unique', (value) => {
    if (!Array.isArray(value)) {
      return 'Value is not an array';
    }
    const uniqueItems = new Set(value);
    if (uniqueItems.size !== value.length) {
      return 'Array should contain unique elements';
    }
    return null;
  });

export const ArrayContains = (element: any) =>
  Validator.createValidatorWithMessage('array contains', (value) => {
    if (!Array.isArray(value)) {
      return 'Value is not an array';
    }
    if (!value.includes(element)) {
      return `Array should contain the element: ${element}`;
    }
    return null;
  });

export const ArrayNotContains = (element: any) =>
  Validator.createValidatorWithMessage('array not contains', (value) => {
    if (!Array.isArray(value)) {
      return 'Value is not an array';
    }
    if (value.includes(element)) {
      return `Array should not contain the element: ${element}`;
    }
    return null;
  });

export const IsArrayOf = (type: string) =>
  Validator.createValidator(`array of ${type}`, (value) => Array.isArray(value) && value.every((item) => typeof item === type.toLowerCase()));

// array of objects with specific shape

type PrimitiveShapeType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'undefined';
type ShapeRule = PrimitiveShapeType | ((value: any) => boolean);
type OptionalShapeRule = { optional: true; rule: ShapeRule };
type ObjectShape = Record<string, ShapeRule | OptionalShapeRule>;

export const Optional = (rule: ShapeRule): OptionalShapeRule => ({
  optional: true,
  rule,
});

const isOptionalShapeRule = (ruleOrOptional: ShapeRule | OptionalShapeRule): ruleOrOptional is OptionalShapeRule => {
  return typeof ruleOrOptional === 'object' && ruleOrOptional !== null && 'optional' in ruleOrOptional;
};

const matchesShapeRule = (value: any, rule: ShapeRule): boolean => {
  if (typeof rule === 'function') {
    return rule(value);
  }

  if (rule === 'array') {
    return Array.isArray(value);
  }

  if (rule === 'null') {
    return value === null;
  }

  return typeof value === rule;
};

const validateObjectWithShape = (obj: any, shape: ObjectShape, context: string = ''): string | null => {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return `${context} is not a valid object`;
  }

  for (const key in shape) {
    const ruleOrOptional = shape[key];
    const isOptional = isOptionalShapeRule(ruleOrOptional);
    const rule = isOptional ? ruleOrOptional.rule : ruleOrOptional;

    // Si la propiedad no existe
    if (!(key in obj)) {
      if (isOptional) {
        continue; // Propiedad opcional ausente, es válido
      }
      return `${context} is missing required property: ${key}`;
    }

    // Si la propiedad existe, validar su tipo
    if (!matchesShapeRule(obj[key], rule)) {
      const expectedType = typeof rule === 'function' ? 'custom rule' : rule;
      return `${context} has invalid type for property '${key}'. Expected ${expectedType}`;
    }
  }

  return null;
};

export const IsArrayOfObjectsWithShape = (shape: ObjectShape) =>
  Validator.createValidatorWithMessage('array of objects with specific shape', (value) => {
    if (!Array.isArray(value)) {
      return 'Value is not an array';
    }

    for (let index = 0; index < value.length; index++) {
      const error = validateObjectWithShape(value[index], shape, `Element at index ${index}`);
      if (error) {
        return error;
      }
    }

    return null;
  });

export const IsObjectWithShape = (shape: ObjectShape) =>
  Validator.createValidatorWithMessage('object with specific shape', (value) => {
    return validateObjectWithShape(value, shape, 'Value');
  });
