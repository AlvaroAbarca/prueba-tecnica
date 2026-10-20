import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiProduces } from '@nestjs/swagger';

const valuesApiFindByIdOperation = {
  summary: 'Find user by ID',
  description: 'Gets detailed information of a specific user by their unique ID.',
};

const valuesApiFindByIdParam = {
  name: 'id',
  type: 'number',
  description: 'Unique ID of the user to search',
  example: 123,
  required: true,
};

const valuesApiFindByIdOkResponse = {
  status: 200,
  description: 'User found successfully',
  schema: {
    type: 'object',
    properties: {
      code: {
        type: 'number',
        example: 200,
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
            description: 'Unique user ID',
          },
          firstName: {
            type: 'string',
            example: 'Juan',
            description: 'User first name',
          },
          lastName: {
            type: 'string',
            example: 'Pérez',
            description: 'User last name',
          },
          email: {
            type: 'string',
            example: 'juan.perez@example.com',
            description: 'User email',
          },
          rut: {
            type: 'string',
            example: '12345678-9',
            description: 'User RUT',
          },
          phone: {
            type: 'string',
            example: '+56912345678',
            description: 'User phone',
          },
          order: {
            type: 'number',
            example: 1,
            description: 'User order',
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
          authProvider: {
            type: 'string',
            example: 'local',
            description: 'Authentication provider',
          },
          enable2fa: {
            type: 'boolean',
            example: false,
            description: 'If two-factor authentication is enabled',
          },
        },
      },
    },
  },
};

const valuesApiFindAllOperation = {
  summary: 'Find all users',
  description: 'Gets a paginated list of users with optional filters. Allows search by multiple criteria and custom sorting.',
};

const valuesApiFindAllOkResponse = {
  status: 200,
  description: 'User list obtained successfully',
  schema: {
    type: 'object',
    properties: {
      code: {
        type: 'number',
        example: 200,
        description: 'HTTP status code',
      },
      message: {
        type: 'string',
        example: 'ok',
        description: 'Response message',
      },
      data: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              example: 123,
              description: 'Unique user ID',
            },
            firstName: {
              type: 'string',
              example: 'Juan',
              description: 'User first name',
            },
            lastName: {
              type: 'string',
              example: 'Pérez',
              description: 'User last name',
            },
            email: {
              type: 'string',
              example: 'juan.perez@example.com',
              description: 'User email',
            },
            rut: {
              type: 'string',
              example: '12345678-9',
              description: 'User RUT',
            },
            enabled: {
              type: 'boolean',
              example: true,
              description: 'If the user is enabled',
            },
            authProvider: {
              type: 'string',
              example: 'local',
              description: 'Authentication provider',
            },
          },
        },
        description: 'Array of found users',
      },
    },
  },
};

const valuesApiRequestResponse = {
  status: 400,
  description: 'Validation error in submitted parameters',
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
        example: 'Validation Error',
        description: 'Validation error message',
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              example: 'id',
              description: 'Field that has the error',
            },
            message: {
              type: 'string',
              example: 'ID must be a positive number',
              description: 'Specific validation error description',
            },
          },
        },
        description: 'List of validation errors',
      },
    },
  },
};

const valuesApiNotFoundResponse = {
  status: 404,
  description: 'User not found',
  schema: {
    type: 'object',
    properties: {
      code: {
        type: 'number',
        example: 404,
        description: 'HTTP status code',
      },
      message: {
        type: 'string',
        example: 'User not found',
        description: 'Error message',
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
    },
  },
};

export const SwaggerFindByIdDecorators = () =>
  applyDecorators(
    ApiOperation(valuesApiFindByIdOperation),
    ApiParam(valuesApiFindByIdParam),
    ApiOkResponse(valuesApiFindByIdOkResponse),
    ApiBadRequestResponse(valuesApiRequestResponse),
    ApiNotFoundResponse(valuesApiNotFoundResponse),
  );

export const SwaggerFindAllDecorators = () =>
  applyDecorators(
    ApiOperation(valuesApiFindAllOperation),
    ApiQuery({
      name: 'id',
      required: false,
      type: 'number',
      description: 'Unique user ID to filter',
      example: 123,
    }),
    ApiQuery({
      name: 'rut',
      required: false,
      type: 'string',
      description: 'User RUT (can be partial)',
      example: '12345678',
    }),
    ApiQuery({
      name: 'email',
      required: false,
      type: 'string',
      description: 'User email (exact search)',
      example: 'juan@example.com',
    }),
    ApiQuery({
      name: 'firstName',
      required: false,
      type: 'string',
      description: 'User first name (can be partial)',
      example: 'Juan',
    }),
    ApiQuery({
      name: 'lastName',
      required: false,
      type: 'string',
      description: 'User last name (can be partial)',
      example: 'Pérez',
    }),
    ApiQuery({
      name: 'authProvider',
      required: false,
      type: 'string',
      description: 'Authentication provider',
      example: 'local',
    }),
    ApiQuery({
      name: 'enable2fa',
      required: false,
      type: 'boolean',
      description: 'Filter by users with 2FA enabled',
      example: true,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: 'number',
      description: 'Maximum number of results to return',
      example: 10,
    }),
    ApiQuery({
      name: 'offset',
      required: false,
      type: 'number',
      description: 'Number of results to skip (for pagination)',
      example: 0,
    }),
    ApiQuery({
      name: 'orderBy',
      required: false,
      type: 'string',
      description: 'Field to order results by',
      example: 'firstName',
    }),
    ApiQuery({
      name: 'orderType',
      required: false,
      enum: ['asc', 'desc', 'none'],
      description: 'Sort order type',
      example: 'asc',
    }),
    ApiOkResponse(valuesApiFindAllOkResponse),
    ApiBadRequestResponse(valuesApiRequestResponse),
  );

const valuesApiExportOperation = {
  summary: 'Export users to Excel',
  description: 'Exports a list of users to an Excel file with optional filters. Allows search by multiple criteria and custom sorting.',
};

const valuesApiExportOkResponse = {
  status: 200,
  description: 'Excel file generated successfully',
  content: {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
      schema: {
        type: 'string',
        format: 'binary',
      },
    },
  },
};

export const SwaggerExportDecorators = () =>
  applyDecorators(
    ApiOperation(valuesApiExportOperation),
    ApiQuery({
      name: 'id',
      required: false,
      type: 'number',
      description: 'Unique user ID to filter',
      example: 123,
    }),
    ApiQuery({
      name: 'rut',
      required: false,
      type: 'string',
      description: 'User RUT (can be partial)',
      example: '12345678',
    }),
    ApiQuery({
      name: 'email',
      required: false,
      type: 'string',
      description: 'User email (exact search)',
      example: 'juan@example.com',
    }),
    ApiQuery({
      name: 'firstName',
      required: false,
      type: 'string',
      description: 'User first name (can be partial)',
      example: 'Juan',
    }),
    ApiQuery({
      name: 'lastName',
      required: false,
      type: 'string',
      description: 'User last name (can be partial)',
      example: 'Pérez',
    }),
    ApiQuery({
      name: 'authProvider',
      required: false,
      type: 'string',
      description: 'Authentication provider',
      example: 'local',
    }),
    ApiQuery({
      name: 'enable2fa',
      required: false,
      type: 'boolean',
      description: 'Filter by users with 2FA enabled',
      example: true,
    }),
    ApiQuery({
      name: 'orderBy',
      required: false,
      type: 'string',
      description: 'Field to order results by',
      example: 'firstName',
    }),
    ApiQuery({
      name: 'orderType',
      required: false,
      enum: ['asc', 'desc', 'none'],
      description: 'Sort order type',
      example: 'asc',
    }),
    ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    ApiOkResponse(valuesApiExportOkResponse),
    ApiBadRequestResponse(valuesApiRequestResponse),
  );
