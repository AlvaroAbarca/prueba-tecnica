import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import * as sanitizeHtml from 'sanitize-html';

export function SanitizeHtml(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'SanitizeHtml',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const sanitizedValue = sanitizeHtml(value, {
            allowedTags: [],
            allowedAttributes: {},
          });

          return sanitizedValue === value;
        },
        defaultMessage(args: ValidationArguments) {
          return `El campo ${args.property} contiene código no deseado.`;
        },
      },
    });
  };
}
