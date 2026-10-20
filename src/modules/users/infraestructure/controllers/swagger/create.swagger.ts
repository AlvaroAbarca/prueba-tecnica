import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiInternalServerErrorResponse, ApiCreatedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { UserCreateDTO } from '../../dto/userCreate.dto';

const swaggerCredentialPlaceholder = '<REQUIRED_AT_RUNTIME>';

const valueApiOperation = {
  summary: 'Create a new user',
  description:
    'Create a new user in system with optional profiles. If profiles are provided and an error occurs while assigning them, the created user will be automatically deleted.',
};

const valueApiBody = {
  type: UserCreateDTO,
  description: 'Data of the user to create',
  examples: {
    'basic-example': {
      summary: 'Basic user',
      description: 'Example of a user with minimum required fields',
      value: {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        rut: '12345678-9',
        password: swaggerCredentialPlaceholder,
        enabled: true,
        visible: true,
      },
    },
    'complete-example': {
      summary: 'Complete user with profiles',
      description: 'Example of a user with all fields and assigned profiles',
      value: {
        firstName: 'María',
        lastName: 'González',
        email: 'maria.gonzalez@example.com',
        rut: '98765432-1',
        password: swaggerCredentialPlaceholder,
        phone: '+56912345678',
        order: 1,
        visible: true,
        enabled: true,
        comment: 'Administrator user',
        timeZoneCode: 'America/Santiago',
        languageCode: 'es',
        authProvider: 'local',
        enable2fa: false,
        profiles: [1, 2],
      },
    },
  },
};

const valueApiCreateResponse = {
  status: 201,
  description: 'User created successfully',
  schema: {
    type: 'object',
    properties: {
      code: {
        type: 'number',
        example: 201,
        description: 'HTTP status code',
      },
      message: {
        type: 'string',
        example: 'ok',
        description: 'Response message',
      },
      data: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            example: 123,
            description: 'ID unique from created user',
          },
          firstName: {
            type: 'string',
            example: 'Juan',
            description: 'First name of the user',
          },
          lastName: {
            type: 'string',
            example: 'Pérez',
            description: 'Last name of the user',
          },
          email: {
            type: 'string',
            example: 'juan.perez@example.com',
            description: 'Email of the user',
          },
          rut: {
            type: 'string',
            example: '12345678-9',
            description: 'RUT of the user',
          },
          phone: {
            type: 'string',
            example: '+56912345678',
            description: 'Phone of the user',
          },
          order: {
            type: 'number',
            example: 1,
            description: 'Order of the user',
          },
          visible: {
            type: 'boolean',
            example: true,
            description: 'If the user is visible',
          },
          enabled: {
            type: 'boolean',
            example: true,
            description: 'If the user is enabled',
          },
          comment: {
            type: 'string',
            example: 'Usuario administrador',
            description: 'Comment about the user',
          },
          timeZoneCode: {
            type: 'string',
            example: 'America/Santiago',
            description: 'Time zone of the user',
          },
          languageCode: {
            type: 'string',
            example: 'es',
            description: 'Language code of the user',
          },
          authProvider: {
            type: 'string',
            example: 'local',
            description: 'Authentication provider',
          },
          enable2fa: {
            type: 'boolean',
            example: false,
            description: 'If 2FA is enabled',
          },
          profiles: {
            type: 'array',
            items: {
              type: 'number',
            },
            example: [1, 2],
            description: 'IDs of the profiles assigned to the user',
          },
        },
      },
    },
  },
};

const valueApiBadRequestResponse = {
  status: 400,
  description: 'Error in submitted data or error assigning profiles',
  schema: {
    type: 'object',
    properties: {
      code: {
        type: 'number',
        example: 400,
        description: 'HTTP status code',
      },
      message: {
        type: 'string',
        example: 'Error creating user',
        description: 'Error message',
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Error in given profiles',
              description: 'Error description',
            },
          },
        },
        description: 'List of specific errors',
      },
    },
  },
};

const valueApiInternalServerErrorResponse = {
  status: 500,
  description: 'Internal server error',
  schema: {
    type: 'object',
    properties: {
      code: {
        type: 'number',
        example: 500,
        description: 'HTTP status code',
      },
      message: {
        type: 'string',
        example: 'Internal Server Error',
        description: 'Internal error message',
      },
    },
  },
};

export const SwaggerCreateDecorators = () =>
  applyDecorators(
    ApiOperation(valueApiOperation),
    ApiBody(valueApiBody),
    ApiCreatedResponse(valueApiCreateResponse),
    ApiBadRequestResponse(valueApiBadRequestResponse),
    ApiInternalServerErrorResponse(valueApiInternalServerErrorResponse),
  );
