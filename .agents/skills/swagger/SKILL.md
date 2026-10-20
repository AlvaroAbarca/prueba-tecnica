---
name: swagger
description: Guía para implementar Swagger en controllers y endpoints nuevos. Usar cuando se crea un controller nuevo o se agrega un endpoint a uno existente. Todo endpoint debe tener su decorador Swagger correspondiente.
---

# Swagger en Controllers

Todo controller o endpoint nuevo **debe** tener documentación Swagger. El patrón del proyecto separa los decoradores en un archivo dedicado dentro de `swagger/`.

## Estructura de archivos

```
infrastructure/
└── controllers/
    ├── myAction.controller.ts          ← controller principal
    └── swagger/
        └── myAction.swagger.ts         ← decoradores Swagger (convención `*.swagger.ts`)
```

> Nombre del archivo swagger: `<camelCaseAcción>.swagger.ts`  
> Ejemplos reales del proyecto: `edit.swagger.ts`, `openLoadManagement.swagger.ts`, `findCollectorGuides.swagger.ts`

---

## Paso 1: Crear el archivo de decoradores Swagger

Los objetos de configuración se definen como `const` antes de la función exportada. La función se exporta como **arrow function const**.

### Patrón POST / PUT (con body)

```typescript
// infrastructure/controllers/swagger/createProduct.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { CreateProductDto } from '../dto/createProduct.dto';

const valueApiOperation = {
  summary: 'Create a product',
  description: 'Creates a new product in the system.',
};

const valueApiBody = {
  type: CreateProductDto,
  description: 'Product data to create',
  examples: {
    'basic-example': {
      summary: 'Basic product',
      description: 'Example with required fields',
      value: {
        name: 'Caja 30x30',
        code: 'BOX-001',
        weight: 1.5,
      },
    },
    'complete-example': {
      summary: 'Complete product',
      description: 'Example with all fields',
      value: {
        name: 'Caja 30x30',
        code: 'BOX-001',
        weight: 1.5,
        description: 'Caja estándar de cartón',
      },
    },
  },
};

const valueApiCreatedResponse = {
  status: 201,
  description: 'Product created successfully',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'ok', description: 'Confirmation message' },
      data: {
        type: 'object',
        description: 'Created product',
        properties: {
          id: { type: 'string', example: '123' },
          code: { type: 'string', example: 'BOX-001' },
        },
      },
      errors: { type: 'array', items: {}, example: [], description: 'Error list (empty on success)' },
      code: { type: 'number', example: 201, description: 'HTTP status code' },
    },
  },
};

const valueApiBadRequestResponse = {
  status: 400,
  description: 'Validation error in submitted data',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Validation Error', description: 'Validation error message' },
      data: { type: 'object', nullable: true, example: null, description: 'Null data in case of error' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: { type: 'string', example: 'code', description: 'Field that has the error' },
            message: { type: 'string', example: 'code must be a string', description: 'Specific validation error description' },
          },
        },
        description: 'List of validation errors',
      },
      code: { type: 'number', example: 400, description: 'HTTP status code' },
    },
  },
};

const valueApiNotFoundResponse = {
  status: 404,
  description: 'Resource not found',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Product not found', description: 'Error message' },
      data: { type: 'object', nullable: true, example: null, description: 'Null data in case of error' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Product with ID 123 not found', description: 'Specific error description' },
          },
        },
        description: 'List of specific errors',
      },
      code: { type: 'number', example: 404, description: 'HTTP status code' },
    },
  },
};

export const SwaggerCreateProductDecorators = () =>
  applyDecorators(
    ApiOperation(valueApiOperation),
    ApiBody(valueApiBody),
    ApiCreatedResponse(valueApiCreatedResponse),
    ApiBadRequestResponse(valueApiBadRequestResponse),
    ApiNotFoundResponse(valueApiNotFoundResponse),
  );
```

### Patrón GET con query params

Los `ApiQuery` van **inline** dentro de `applyDecorators()`, no como constantes separadas:

```typescript
// infrastructure/controllers/swagger/findProducts.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';

const valuesApiOperation = {
  summary: 'Find all products',
  description: 'Gets a paginated list of products with optional filters.',
};

const valuesApiOkResponse = {
  status: 200,
  description: 'Products list obtained successfully',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'ok' },
      data: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            code: { type: 'string', example: 'BOX-001' },
            name: { type: 'string', example: 'Caja 30x30' },
          },
        },
      },
      errors: { type: 'array', items: {}, example: [] },
      code: { type: 'number', example: 200 },
    },
  },
};

const valuesApiBadRequestResponse = {
  status: 400,
  description: 'Validation error in submitted parameters',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Validation Error' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: { type: 'string', example: 'limit', description: 'Field that has the error' },
            message: { type: 'string', example: 'limit must be a number', description: 'Specific validation error description' },
          },
        },
      },
      code: { type: 'number', example: 400 },
    },
  },
};

export const SwaggerFindProductsDecorators = () =>
  applyDecorators(
    ApiOperation(valuesApiOperation),
    ApiQuery({ name: 'code', required: false, type: 'string', description: 'Filter by product code', example: 'BOX-001' }),
    ApiQuery({ name: 'name', required: false, type: 'string', description: 'Filter by product name', example: 'Caja' }),
    ApiQuery({ name: 'page', required: false, type: 'number', description: 'Page number', example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Items per page', example: 10 }),
    ApiOkResponse(valuesApiOkResponse),
    ApiBadRequestResponse(valuesApiBadRequestResponse),
  );
```

### Patrón GET / DELETE por parámetro de ruta (compact)

Para endpoints simples, se puede pasar todo inline sin constantes separadas:

```typescript
// infrastructure/controllers/swagger/getProduct.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';

export const SwaggerGetProductDecorators = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get product by code',
      description: 'Retrieves a single product by its unique code.',
    }),
    ApiParam({ name: 'code', required: true, type: 'string', description: 'Product code', example: 'BOX-001' }),
    ApiOkResponse({ description: 'Product retrieved successfully' }),
    ApiBadRequestResponse({ description: 'Invalid code parameter' }),
    ApiNotFoundResponse({ description: 'Product not found' }),
  );
```

---

## Paso 2: Aplicar el decorador en el controller

```typescript
// infrastructure/controllers/createProduct.controller.ts
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmitResponse } from '@modules/shared/infrastructure/dto/respuesta';
import { RolesCan } from '@modules/shared/infrastructure/decorators/rolesCan.decorator';
import { CreateProductUseCase } from '../../application/useCases/createProduct.useCase';
import { CreateProductDto } from '../dto/createProduct.dto';
import { SwaggerCreateProductDecorators } from './swagger/createProduct.swagger';

@ApiTags('Products') // ← A nivel de clase, PascalCase
@Controller(['api', ''])
export class CreateProductController {
  constructor(private readonly createProductUseCase: CreateProductUseCase) {}

  @Post('products')
  @RolesCan(['ADMIN', 'PRODUCT_MANAGER'])
  @SwaggerCreateProductDecorators() // ← Se aplica en el método
  async start(@Body() body: CreateProductDto): Promise<any> {
    const result = await this.createProductUseCase.start(body);
    return EmitResponse.ok('ok', { result }, HttpStatus.CREATED);
  }
}
```

---

## Decoradores por tipo de endpoint

| HTTP Method          | Decoradores obligatorios                                                 | Opcionales                                              |
| -------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------- |
| `POST`               | `ApiOperation`, `ApiBody`, `ApiCreatedResponse`, `ApiBadRequestResponse` | `ApiNotFoundResponse`, `ApiInternalServerErrorResponse` |
| `PUT` / `PATCH`      | `ApiOperation`, `ApiBody`, `ApiOkResponse`, `ApiBadRequestResponse`      | `ApiNotFoundResponse`                                   |
| `GET` (lista)        | `ApiOperation`, `ApiOkResponse`, `ApiBadRequestResponse`                 | `ApiQuery` (inline)                                     |
| `GET` (por ID/param) | `ApiOperation`, `ApiParam`, `ApiOkResponse`, `ApiNotFoundResponse`       | `ApiBadRequestResponse`                                 |
| `DELETE`             | `ApiOperation`, `ApiParam`, `ApiOkResponse`, `ApiNotFoundResponse`       |                                                         |

---

## Reglas

- Nombre del archivo: `<camelCaseAcción>.swagger.ts` — sufijo fijo `.swagger.ts` tras el nombre en camelCase
- Nombre de la función exportada: `Swagger<Acción>Decorators` — ej: `SwaggerCreateProductDecorators`
- Exportar siempre como **arrow function const**: `export const SwaggerXxx = () => applyDecorators(...)`
- `@ApiTags('NombreDelDominio')` va **a nivel de clase** del controller, no en el método
- `ApiQuery` se pasa **inline** dentro de `applyDecorators()` — no como constantes separadas
- Los objetos de configuración grandes (body, responses) sí se definen como constantes `const valueXxx = {...}` antes de la función
- Los ejemplos en `ApiBody.examples` deben usar valores realistas del dominio, no `"string"` genérico
- Cada controller tiene **su propio archivo** swagger — no mezclar múltiples controllers en uno

```
infrastructure/
└── controllers/
    ├── myAction.controller.ts          ← controller principal
    └── swagger/
        └── myAction.swagger.ts         ← decoradores Swagger
```

---

## Paso 1: Crear el archivo de decoradores Swagger

Cada controller tiene su propio archivo en `controllers/swagger/`. El archivo exporta una función decoradora que agrupa todos los decoradores de Swagger con `applyDecorators`.

```typescript
// infrastructure/controllers/swagger/createProduct.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { CreateProductDto } from '../dto/createProduct.dto';

const valueApiOperation = {
  summary: 'Create a product',
  description: 'Creates a new product in the system.',
};

const valueApiBody = {
  type: CreateProductDto,
  description: 'Product data to create',
  examples: {
    'basic-product': {
      summary: 'Basic product',
      value: {
        name: 'Caja 30x30',
        code: 'BOX-001',
        weight: 1.5,
      },
    },
  },
};

const valueApiOkResponse = {
  status: 201,
  description: 'Product created successfully',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'ok' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '123' },
          code: { type: 'string', example: 'BOX-001' },
        },
      },
      errors: { type: 'array', items: {}, example: [] },
      code: { type: 'number', example: 201 },
    },
  },
};

const valueApiBadRequestResponse = {
  status: 400,
  description: 'Validation error in submitted data',
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
            message: { type: 'string', example: 'name is required' },
          },
        },
      },
      code: { type: 'number', example: 400 },
    },
  },
};

const valueApiNotFoundResponse = {
  status: 404,
  description: 'Resource not found',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Product not found' },
      data: { type: 'object', nullable: true, example: null },
      errors: { type: 'array', items: {}, example: [] },
      code: { type: 'number', example: 404 },
    },
  },
};

export function SwaggerCreateProductDecorators() {
  return applyDecorators(
    ApiOperation(valueApiOperation),
    ApiBody(valueApiBody),
    ApiOkResponse(valueApiOkResponse),
    ApiBadRequestResponse(valueApiBadRequestResponse),
    ApiNotFoundResponse(valueApiNotFoundResponse),
  );
}
```

---

## Paso 2: Usar el decorador en el controller

```typescript
// infrastructure/controllers/createProduct.controller.ts
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmitResponse } from '@modules/shared/infrastructure/dto/respuesta';
import { RolesCan } from '@modules/shared/infrastructure/decorators/rolesCan.decorator';
import { CreateProductUseCase } from '../../application/useCases/createProduct.useCase';
import { CreateProductDto } from '../dto/createProduct.dto';
import { SwaggerCreateProductDecorators } from './swagger/createProduct.swagger';

@ApiTags('Products') // ← Agrupa en Swagger UI (PascalCase, nombre del dominio)
@Controller(['api', ''])
export class CreateProductController {
  constructor(private readonly createProductUseCase: CreateProductUseCase) {}

  @Post('products')
  @RolesCan(['ADMIN', 'PRODUCT_MANAGER'])
  @SwaggerCreateProductDecorators() // ← Aplica todos los decoradores Swagger
  async start(@Body() body: CreateProductDto): Promise<any> {
    const result = await this.createProductUseCase.start(body);
    return EmitResponse.ok('Product created', { result }, HttpStatus.CREATED);
  }
}
```

---

## Decoradores disponibles por tipo de endpoint

| HTTP Method     | Decoradores Swagger obligatorios                                    | Opcionales                        |
| --------------- | ------------------------------------------------------------------- | --------------------------------- |
| `POST`          | `ApiOperation`, `ApiBody`, `ApiOkResponse`, `ApiBadRequestResponse` | `ApiNotFoundResponse`             |
| `PUT` / `PATCH` | `ApiOperation`, `ApiBody`, `ApiOkResponse`, `ApiBadRequestResponse` | `ApiNotFoundResponse`, `ApiParam` |
| `GET` (lista)   | `ApiOperation`, `ApiOkResponse`, `ApiBadRequestResponse`            | `ApiQuery`                        |
| `GET` (por ID)  | `ApiOperation`, `ApiParam`, `ApiOkResponse`, `ApiNotFoundResponse`  |                                   |
| `DELETE`        | `ApiOperation`, `ApiParam`, `ApiOkResponse`, `ApiNotFoundResponse`  |                                   |

---

## Decoradores de Swagger — referencia rápida

### `ApiOperation` — describe el endpoint

```typescript
ApiOperation({
  summary: 'Título corto (aparece en la UI)',
  description: 'Descripción completa del comportamiento.',
});
```

### `ApiBody` — describe el body del request

```typescript
ApiBody({
  type: CreateProductDto, // clase DTO (muestra las propiedades)
  description: 'Datos del producto',
  examples: {
    'ejemplo-1': {
      summary: 'Caso básico',
      value: { name: 'Test', code: 'T-001' },
    },
  },
});
```

### `ApiParam` — describe un path param

```typescript
ApiParam({
  name: 'id',
  type: 'string',
  description: 'ID único del recurso',
  example: 'abc-123',
  required: true,
});
```

### `ApiQuery` — describe un query param

```typescript
ApiQuery({
  name: 'status',
  type: 'string',
  required: false,
  description: 'Filtrar por estado',
  example: 'ADMITTED',
});
```

### Respuestas estándar

```typescript
// 200 OK
ApiOkResponse({ status: 200, description: 'Operación exitosa', schema: { ... } })

// 201 Created
ApiCreatedResponse({ description: 'Recurso creado', schema: { ... } })

// 400 Bad Request
ApiBadRequestResponse({ description: 'Error de validación', schema: { ... } })

// 404 Not Found
ApiNotFoundResponse({ description: 'Recurso no encontrado', schema: { ... } })

// 500 Internal Server Error
ApiInternalServerErrorResponse({ description: 'Error interno del servidor', schema: { ... } })
```

---

## Schema de respuesta estándar (EmitResponse)

Todos los endpoints responden con la estructura de `EmitResponse`. Usar este schema como base en los `ApiOkResponse`:

```typescript
schema: {
  type: 'object',
  properties: {
    message: { type: 'string', example: 'ok' },
    data: { type: 'object', example: { id: '123' } },
    errors: { type: 'array', items: {}, example: [] },
    code: { type: 'number', example: 200 },
  },
}
```

Para respuestas de error (4xx):

```typescript
schema: {
  type: 'object',
  properties: {
    message: { type: 'string', example: 'Mensaje de error' },
    data: { type: 'object', nullable: true, example: null },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Detalle del error' },
        },
      },
    },
    code: { type: 'number', example: 400 },
  },
}
```

---

## Reglas

- `@ApiTags('NombreDelDominio')` va **a nivel de clase** del controller, no en el método
- Cada controller tiene **su propio archivo** en `swagger/` — no mezclar decoradores de múltiples controllers
- La función exportada se llama `Swagger<Action>Decorators()` — ej: `SwaggerCreateProductDecorators()`
- Los objetos de configuración se definen como constantes **antes** de la función exportada, no inline
- Siempre documentar al menos: `ApiOperation` + respuesta exitosa + respuesta de error 400
- Los ejemplos en `ApiBody` deben usar valores realistas del dominio, no datos genéricos como `"string"`
