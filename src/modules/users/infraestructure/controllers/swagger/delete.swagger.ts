import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';

const valueApiOperation = {
  summary: 'Delete a user',
  description: 'Deletes a user from the system by their unique ID. This operation will also delete all profiles associated with the user. The operation is irreversible.',
};

const valueApiParam = {
  name: 'id',
  type: 'string',
  description: 'Unique ID of the user to delete',
  example: '123',
  required: true,
};

const valueApiOkResponse = {
  status: 200,
  description: 'User deleted successfully',
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
        description: 'Empty object confirming deletion',
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
            message: {
              type: 'string',
              example: 'Empty ID',
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

export const SwaggerDeleteDecorators = () =>
  applyDecorators(
    ApiOperation(valueApiOperation),
    ApiParam(valueApiParam),
    ApiOkResponse(valueApiOkResponse),
    ApiBadRequestResponse(valueApiRequestResponse),
    ApiNotFoundResponse(valueApiNotFoundResponse),
  );
