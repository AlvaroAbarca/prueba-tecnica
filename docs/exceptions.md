# Tabla de contenidos

- [Tabla de contenidos](#tabla-de-contenidos)
- [Sistema de Excepciones](#sistema-de-excepciones)
  - [Descripción General](#descripción-general)
  - [Estructura de Archivos Principal](#estructura-de-archivos-principal)
  - [Tipos de Excepciones](#tipos-de-excepciones)
    - [1. BaseException](#1-baseexception)
    - [2. ValidationException](#2-validationexception)
    - [3. BusinessException](#3-businessexception)
    - [4. InternalSystemException](#4-internalsystemexception)
  - [Factory de Excepciones](#factory-de-excepciones)
  - [Uso de la Fábrica de Excpeciones](#uso-de-la-fábrica-de-excpeciones)
  - [Exception Factory - Métodos Disponibles](#exception-factory---métodos-disponibles)
    - [Métodos de Creación Básicos](#métodos-de-creación-básicos)
      - [`validation()`](#validation)
      - [`business()`](#business)
      - [`system()`](#system)
    - [Métodos de Conveniencia](#métodos-de-conveniencia)
      - [`notFound()`](#notfound)
      - [`alreadyExists()`](#alreadyexists)
      - [`multipleValidation()`](#multiplevalidation)

# Sistema de Excepciones

## Descripción General

El sistema de excepciones está diseñado siguiendo el patrón **Factory** y una arquitectura en capas que permite un manejo robusto y consistente de errores en toda la aplicación. El sistema separa las responsabilidades entre validación, negocio y errores del sistema teniendo la capacidad de extenderse a nuevos tipos de errores en la medida que se requieran en otras partes del proyecto.

## Estructura de Archivos Principal

```
src/modules/shared/domain/exceptions/
├── base/
│   └── BaseException.ts           # Excepción base abstracta
├── types/
│   ├── ValidationException.ts     # Errores de validación
│   ├── BusinessException.ts       # Errores de negocio
│   ├── InternalSystemException.ts # Errores del sistema
│   └── index.ts                   # Exportaciones
├── factory/
│   └── ExceptionFactory.ts        # Factory para crear excepciones
└── builder/
   └── ExceptionBuilder.ts        # Builder pattern (opcional)
```

## Tipos de Excepciones

### 1. BaseException

Clase abstracta que define la estructura básica de una excepción. Todas las excepciones específicas deben extender:

```typescript
export abstract class BaseException extends Error {
  readonly code: string;
  readonly context?: Record<string, any>;
  readonly timeStampUTC: string;

  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.timeStampUTC = new Date().toISOString();
  }
}
```

**Propiedades:**

- `message`: Mensaje descriptivo del error.
- `code`: Código de error único.
- `context`: Información adicional sobre el error.
- `timeStampUTC`: Marca de tiempo en formato UTC.

### 2. ValidationException

Extiende `BaseException` para manejar errores de validación:

```typescript
import { BaseException } from '../base/base-exception';

export class ValidationException extends BaseException {
  public details?: Array<{
    field: string;
    message: string;
    entity: string;
    value: any;
    timestamp: string;
  }>;

  constructor(message: string, code: string = 'V_000', context?: Record<string, any>) {
    super(message, code, context);
  }
}
```

- `field`: Campo específico que falló la validación.
- `message`: Mensaje descriptivo del error de validación.
- `entity`: Entidad a la que pertenece el campo.
- `value`: Valor que se intentó validar.
- `timeStamp`: Se establece automáticamente al crear la excepción, representando el momento en que ocurrió el error.
- `details`: Array opcional que contiene información detallada sobre los errores de validación, incluyendo el campo afectado, mensaje de error, entidad, valor y marca de tiempo.
- `code`: Por defecto es `'V_000'`, pero puede ser personalizado al crear la excepción.
- `context`: Información adicional opcional que puede ser pasada al constructor.

**Uso Típico:**

- Capturar errores de validación de Value Objects o DTOs.
- Proporcionar detalles específicos sobre qué campos fallaron y por qué, facilitando la depuración y la corrección de errores.
- Errores de formato y tipo en datos de entrada.
- Validaciones cruzadas entre campos.

### 3. BusinessException

Extiende `BaseException` para manejar errores de negocio:

```typescript
import { BaseException } from '../base/base-exception';

export class BusinessException extends BaseException {
  constructor(message: string, code: string = 'B_000', context?: Record<string, any>) {
    super(message, code, context);
  }
}
```

- `code`: Por defecto es `'B_000'`, pero puede ser personalizado al crear la excepción.
- `context`: Información adicional opcional que puede ser pasada al constructor.
- `message`: Mensaje descriptivo del error de negocio.

**Uso Típico:**

- Capturar errores relacionados con la lógica de negocio, como violaciones de reglas de negocio o condiciones no satisfechas.
- Proporcionar un mensaje claro sobre la naturaleza del error de negocio, facilitando la comprensión del problema por parte de los desarrolladores y usuarios finales.
- Errores de lógica de negocio, como intentos de duplicar entidades únicas o violaciones de reglas de negocio.

### 4. InternalSystemException

Extiende `BaseException` para manejar errores del sistema:

```typescript
import { BaseException } from '../base/base-exception';

export class InternalSystemException extends BaseException {
  constructor(message: string, code: string = 'IS_000', context?: Record<string, any>) {
    super(message, code, context);
  }
}
```

- `code`: Por defecto es `'IS_000'`, pero puede ser personalizado al crear la excepción.
- `context`: Información adicional opcional que puede ser pasada al constructor.
- `message`: Mensaje descriptivo del error del sistema.

**Uso Típico:**

- Capturar errores inesperados o fallos del sistema, como problemas de conexión a la base de datos, errores de red o excepciones no controladas.
- Proporcionar un mensaje claro sobre la naturaleza del error del sistema, facilitando la identificación y resolución de problemas críticos.
- Errores de infraestructura, como fallos en servicios externos o problemas de configuración del sistema.

## Factory de Excepciones

La clase `Exception` es una fábrica que permite crear instancias de excepciones específicas de manera centralizada:

```typescript
export class Exception {
  static validation(
    message: string,
    code: string = 'VALIDATION_ERROR',
    details?: Array<{
      field: string;
      message: string;
      entity: string;
      value: any;
      timestamp: string;
    }>,
  ): ValidationException {
    const error = new ValidationException(message, code);
    (error as any).details = details;
    return error;
  }

  static business(message: string, code: string = 'BUSINESS_ERROR', details?: any): BusinessException {
    return new BusinessException(message, code, details);
  }

  static system(message: string, code: string = 'SYSTEM_ERROR', details?: any): InternalSystemException {
    return new InternalSystemException(message, code, details);
  }

  static notFound(entity: string, id?: string | number): BusinessException {
    return new BusinessException(`${entity} no encontrado${id ? ` con ID: ${id}` : ''}`, 'NOT_FOUND', { entity, id });
  }

  static alreadyExists(entity: string, field?: string, value?: any): BusinessException {
    return new BusinessException(`${entity} ya existe${field ? ` con ${field}: ${value}` : ''}`, 'ALREADY_EXISTS', { entity, field, value });
  }

  static multipleValidation(errors: string[] | Error[], context?: string): ValidationException {
    const errorCount = errors.length;
    const contextMessage = context ? ` en ${context}` : '';
    const mainMessage = `Se encontraron ${errorCount} error${errorCount > 1 ? 'es' : ''} de validación${contextMessage}`;

    const errorMessages = errors.map((error, index) => {
      if (typeof error === 'string') {
        return { index: index + 1, message: error };
      }
      return {
        index: index + 1,
        message: error.message || error.toString(),
        type: error.constructor.name,
      };
    });

    return new ValidationException(mainMessage, 'MULTIPLE_VALIDATION_ERRORS', {
      context,
      totalErrors: errorCount,
      errors: errorMessages,
    });
  }
}
```

## Uso de la Fábrica de Excpeciones

Cuando se quiera lanzar una excepción, se puede utilizar la fábrica para crear instancias de las excepciones específicas:

```typescript
import { Exception } from './factory/ExceptionFactory';

try {
  // Lógica que puede fallar
} catch (error) {
  if (error instanceof SomeValidationError) {
    throw Exception.validation('Error de validación', 'V_001', [
      { field: 'email', message: 'Email inválido', entity: 'User', value: 'invalid-email', timestamp: new Date().toISOString() },
    ]);
  } else if (error instanceof SomeBusinessLogicError) {
    throw Exception.business('Error de negocio', 'B_001');
  } else {
    throw Exception.system('Error del sistema', 'IS_001');
  }
}
```

En este ejemplo, se captura un error y se lanza una excepción específica utilizando la fábrica, proporcionando un mensaje claro y un código de error adecuado. Podemos ver que a traves de la fábrica simplemente invocamos el método semántico para crear la excepción deseada y le enviamos los parámetros necesarios.

## Exception Factory - Métodos Disponibles

La clase `Exception` proporciona métodos estáticos para crear diferentes tipos de excepciones de manera consistente.

### Métodos de Creación Básicos

#### `validation()`

```typescript
static validation(
  message: string,
  code: string = 'VALIDATION_ERROR',
  details?: Array<{
    field: string;
    message: string;
    entity: string;
    value: any;
    timestamp: string;
  }>
): ValidationException
```

**Parámetros:**

- `message: string` - Mensaje descriptivo del error de validación
- `code: string` _(opcional, default: 'VALIDATION_ERROR')_ - Código único del error
- `details?: Array<ValidationDetail>` _(opcional)_ - Array con detalles específicos de cada campo que falló

**Retorna:** `ValidationException`

**Ejemplo:**

```typescript
throw Exception.validation('Email format is invalid', 'EMAIL_VALIDATION_ERROR', [
  {
    field: 'email',
    message: 'Must be a valid email address',
    entity: 'User',
    value: 'invalid@',
    timestamp: new Date().toISOString(),
  },
]);
```

---

#### `business()`

```typescript
static business(
  message: string,
  code: string = 'BUSINESS_ERROR',
  details?: any
): BusinessException
```

**Parámetros:**

- `message: string` - Mensaje que describe la regla de negocio violada
- `code: string` _(opcional, default: 'BUSINESS_ERROR')_ - Código específico del error de negocio
- `details?: any` _(opcional)_ - Información adicional sobre el contexto del error

**Retorna:** `BusinessException`

**Ejemplo:**

```typescript
throw Exception.business('Cannot delete user with active subscriptions', 'USER_HAS_ACTIVE_SUBSCRIPTIONS', { userId: '123', activeSubscriptions: 2 });
```

---

#### `system()`

```typescript
static system(
  message: string,
  code: string = 'SYSTEM_ERROR',
  details?: any
): InternalSystemException
```

**Parámetros:**

- `message: string` - Descripción del error del sistema
- `code: string` _(opcional, default: 'SYSTEM_ERROR')_ - Código del error de sistema
- `details?: any` _(opcional)_ - Información técnica adicional (logs, stack traces, etc.)

**Retorna:** `InternalSystemException`

**Ejemplo:**

```typescript
throw Exception.system('Database connection timeout', 'DB_TIMEOUT_ERROR', {
  connectionString: 'postgres://...',
  timeout: 5000,
  attempt: 3,
});
```

### Métodos de Conveniencia

#### `notFound()`

```typescript
static notFound(
  entity: string,
  id?: string | number
): BusinessException
```

**Parámetros:**

- `entity: string` - Nombre de la entidad que no fue encontrada
- `id?: string | number` _(opcional)_ - Identificador específico que se buscaba

**Retorna:** `BusinessException` con código `'NOT_FOUND'`

**Ejemplos:**

```typescript
// Sin ID específico
throw Exception.notFound('User');
// Resultado: "User not found"

// Con ID específico
throw Exception.notFound('User', '12345');
// Resultado: "User with id 12345 not found"

// Con ID numérico
throw Exception.notFound('Product', 42);
// Resultado: "Product with id 42 not found"
```

---

#### `alreadyExists()`

```typescript
static alreadyExists(
  entity: string,
  field?: string,
  value?: any
): BusinessException
```

**Parámetros:**

- `entity: string` - Nombre de la entidad que ya existe
- `field?: string` _(opcional)_ - Campo específico que causa el conflicto
- `value?: any` _(opcional)_ - Valor que ya existe en el sistema

**Retorna:** `BusinessException` con código `'ALREADY_EXISTS'`

**Ejemplos:**

```typescript
// Entidad genérica
throw Exception.alreadyExists('User');
// Resultado: "User already exists"

// Con campo específico
throw Exception.alreadyExists('User', 'email');
// Resultado: "User already exists with this email"

// Con campo y valor
throw Exception.alreadyExists('User', 'email', 'john@example.com');
// Resultado: "User already exists with email: john@example.com"
```

---

#### `multipleValidation()`

```typescript
static multipleValidation(
  errors: string[] | Error[],
  context?: string
): ValidationException
```

**Parámetros:**

- `errors: string[] | Error[]` - Array de mensajes de error (string) o instancias de Error
- `context?: string` _(opcional)_ - Contexto adicional sobre dónde ocurrieron los errores

**Retorna:** `ValidationException` con código `'MULTIPLE_VALIDATION_ERRORS'`

**Ejemplos:**

```typescript
// Con array de strings
throw Exception.multipleValidation(['Email is required', 'Password too short', 'Age must be positive'], 'User registration');

// Con array de Error objects
const validationErrors = [new Error('Invalid email format'), new Error('Password must contain special characters')];
throw Exception.multipleValidation(validationErrors, 'Profile update');

// Solo con errores, sin contexto
throw Exception.multipleValidation(['Field name is required', 'Field description is too long']);
```
