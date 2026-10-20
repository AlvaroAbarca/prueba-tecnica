import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiOkResponse, ApiBadRequestResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LoginDTO } from '../../dto/login.dto';

const valueApiOperation = {
  summary: 'Iniciar sesión',
  description:
    'Autentica al usuario con sus credenciales. En caso de éxito, los tokens de acceso y refresco se establecen como cookies HttpOnly. El proveedor por defecto es `internal`; para SSO se debe enviar el `token` externo junto con el proveedor correspondiente.',
};

const valueApiBody = {
  type: LoginDTO,
  description: 'Credenciales de acceso',
  examples: {
    'login-interno': {
      summary: 'Login con proveedor interno',
      value: {
        emailuser: 'usuario@correos.cl',
        password: 'examplePassword123', // NOSONAR - swagger example only
        provider: 'internal',
      },
    },
    'login-sso': {
      summary: 'Login con SSO externo',
      value: {
        emailuser: 'usuario@correos.cl',
        password: '',
        provider: 'keycloak',
        token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  },
};

const valueApiOkResponse = {
  status: 200,
  description: 'Login exitoso. Los tokens se envían como cookies HttpOnly (`accessToken`, `refreshToken`).',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Successful login' },
      data: { type: 'object', example: {} },
      errors: { type: 'array', items: {}, example: [] },
      code: { type: 'number', example: 200 },
    },
  },
};

const valueApiUnauthorizedResponse = {
  status: 401,
  description: 'Credenciales inválidas o usuario no encontrado.',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Invalid Credentials' },
      data: { type: 'object', nullable: true, example: null },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Email or password is incorrect' },
          },
        },
      },
      code: { type: 'number', example: 401 },
    },
  },
};

const valueApiBadRequestResponse = {
  status: 400,
  description: 'Error de validación en los datos enviados.',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Validation Error' },
      data: { type: 'object', nullable: true, example: null },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: { type: 'string', example: 'emailuser' },
            message: { type: 'string', example: 'emailuser must be an email' },
          },
        },
      },
      code: { type: 'number', example: 400 },
    },
  },
};

export const SwaggerLoginDecorators = () =>
  applyDecorators(
    ApiOperation(valueApiOperation),
    ApiBody(valueApiBody),
    ApiOkResponse(valueApiOkResponse),
    ApiUnauthorizedResponse(valueApiUnauthorizedResponse),
    ApiBadRequestResponse(valueApiBadRequestResponse),
  );

const valueLogoutApiOperation = {
  summary: 'Logout',
  description: 'Ends the current session, invalidates the user token and clears authentication cookies.',
};

const valueLogoutApiOkResponse = {
  status: 200,
  description: 'Logout successful. Authentication cookies are cleared.',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Successful logout' },
      data: { type: 'object', nullable: true, example: null },
      errors: { type: 'array', items: {}, example: [] },
      code: { type: 'number', example: 200 },
    },
  },
};

export const SwaggerLogoutDecorators = () => applyDecorators(ApiOperation(valueLogoutApiOperation), ApiOkResponse(valueLogoutApiOkResponse));
