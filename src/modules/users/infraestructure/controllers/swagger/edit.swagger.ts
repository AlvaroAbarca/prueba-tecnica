import { applyDecorators } from '@nestjs/common';
import { UserEditDTO } from '../../dto/userEdit.dto';
import { ApiBadRequestResponse, ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

const valueApiOperation = {
  summary: 'Edit an existing user',
  description:
    'Updates the data of an existing user in the system. All user fields can be updated including their associated profiles. Fields not sent will maintain their current values.',
};

const valueApiBody = {
  type: UserEditDTO,
  description: 'User data to update',
  examples: {
    'basic-example': {
      summary: 'Basic update',
      description: 'Example of update with basic fields',
      value: {
        id: 123,
        firstName: 'Juan Carlos',
        lastName: 'Pérez Mendoza',
        email: 'juan.carlos@example.com',
        enabled: true,
      },
    },
    'complete-example': {
      summary: 'Complete update',
      description: 'Example of update with all available fields',
      value: {
        id: 123,
        firstName: 'María Elena',
        lastName: 'González Rojas',
        email: 'maria.elena@example.com',
        rut: '98765432-1',
        phone: '+56987654321',
        order: 2,
        visible: true,
        enabled: true,
        comment: 'Senior administrator user',
        timeZoneCode: 'America/Santiago',
        languageCode: 'es',
        authProvider: 'local',
        enable2fa: true,
        profiles: [1, 3, 5],
      },
    },
    'profiles-example': {
      summary: 'Profiles only update',
      description: 'Example of updating only user profiles',
      value: {
        id: 123,
        profiles: [2, 4],
      },
    },
  },
};

const valueApiOkResponse = {
  status: 200,
  description: 'User updated successfully',
  schema: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'ok',
        description: 'Confirmation message',
      },
      data: {
        type: 'object',
        example: {},
        description: 'Empty object confirming update',
      },
      errors: {
        type: 'array',
        items: {},
        example: [],
        description: 'Error list (empty on success)',
      },
      code: {
        type: 'number',
        example: 200,
        description: 'HTTP status code',
      },
    },
  },
};

const valueApiRequestResponse = {
  status: 400,
  description: 'Validation error in submitted data',
  schema: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Validation Error',
        description: 'Validation error message',
      },
      data: {
        type: 'object',
        nullable: true,
        example: null,
        description: 'Null data in case of error',
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              example: 'email',
              description: 'Field that has the error',
            },
            message: {
              type: 'string',
              example: 'Email must be a valid email address',
              description: 'Specific validation error description',
            },
          },
        },
        description: 'List of validation errors',
      },
      code: {
        type: 'number',
        example: 400,
        description: 'HTTP status code',
      },
    },
  },
};

const valueApiNotFoundResponse = {
  status: 404,
  description: 'User not found',
  schema: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'User not found',
        description: 'Error message',
      },
      data: {
        type: 'object',
        nullable: true,
        example: null,
        description: 'Null data in case of error',
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'User with ID 123 not found',
              description: 'Specific error description',
            },
          },
        },
        description: 'List of specific errors',
      },
      code: {
        type: 'number',
        example: 404,
        description: 'HTTP status code',
      },
    },
  },
};

export const SwaggerEditDecorators = () =>
  applyDecorators(
    ApiOperation(valueApiOperation),
    ApiBody(valueApiBody),
    ApiOkResponse(valueApiOkResponse),
    ApiBadRequestResponse(valueApiRequestResponse),
    ApiNotFoundResponse(valueApiNotFoundResponse),
  );
