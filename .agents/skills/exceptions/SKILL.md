---
name: exceptions
description: Guía para usar el sistema de excepciones del dominio. Usar cuando se lanzan errores en use cases, repositorios o servicios (BusinessException, ValidationException, InternalSystemException, ExceptionFactory).
---

# Sistema de Excepciones

Las excepciones de dominio viven en `@modules/shared/domain/exceptions/`. Siempre usar el tipo correcto según el origen del error.

## Import

```typescript
import { BusinessException, ValidationException, InternalSystemException } from '@modules/shared/domain/exceptions/classes';
// O bien, usar la factory:
import { Exception } from '@modules/shared/domain/exceptions/factory/ExceptionFactory';
```

## Tipos de Excepción

### `BusinessException` — Reglas de negocio

Usar cuando se viola una regla de negocio: duplicados, estado inválido, condiciones no cumplidas.

```typescript
// Uso directo
throw new BusinessException('El usuario ya existe');
throw new BusinessException('Saldo insuficiente', 'B_001');

// Via factory
throw Exception.business('El email ya está registrado');
throw Exception.alreadyExists('User', 'email', 'juan@correos.cl');
throw Exception.notFound('User', userId);
```

### `ValidationException` — Validación de entrada

Usar cuando los datos de entrada no cumplen el formato esperado (value objects, campos inválidos).

```typescript
// Uso directo
throw new ValidationException('Formato de email inválido');
throw new ValidationException('Error de validación', 'V_001');

// Via factory
throw Exception.validation('Campo requerido', 'V_002', [
  { field: 'email', message: 'Formato inválido', entity: 'User', value: 'bad@', timestamp: new Date().toISOString() },
]);

// Múltiples errores
throw Exception.multipleValidation(['email inválido', 'rut requerido'], 'UserEntity');
```

### `InternalSystemException` — Errores de infraestructura

Usar cuando falla algo externo: base de datos, APIs, configuración.

```typescript
// Uso directo
throw new InternalSystemException('Error de conexión a la base de datos');

// Via factory
throw Exception.system('Fallo al conectar con servicio externo');
```

## Factory `Exception` — Métodos disponibles

| Método                                             | Cuándo usarlo                    |
| -------------------------------------------------- | -------------------------------- |
| `Exception.business(msg, code?, details?)`         | Error de negocio genérico        |
| `Exception.validation(msg, code?, details?)`       | Error de validación con detalles |
| `Exception.system(msg, code?, details?)`           | Error de infraestructura         |
| `Exception.notFound(entity, id?)`                  | Entidad no encontrada            |
| `Exception.alreadyExists(entity, field?, value?)`  | Recurso ya existe                |
| `Exception.multipleValidation(errors[], context?)` | Múltiples errores de validación  |

## Patrón en Use Cases

```typescript
async start(params: Params): Promise<Result> {
  this.logger.debug(`INI | myUseCase`, this.constructor.name);
  try {
    const entity = await this.repository.find({ id: params.id });

    // Not found → BusinessException
    if (!entity) {
      throw Exception.notFound('Entity', params.id);
    }

    // Business rule violation → BusinessException
    if (!entity.isActive()) {
      throw new BusinessException('La entidad no está activa', 'B_002');
    }

    const result = await this.repository.update(params.id, params.data);

    this.logger.debug('END | myUseCase', this.constructor.name);
    return result.getValues();

  } catch (error) {
    this.logger.error(`ERROR | myUseCase ${JSON.stringify(error.message)}`, this.constructor.name);
    throw error;  // Re-lanzar siempre — el filter global lo maneja
  }
}
```

## Patrón en Repositorios

```typescript
async find(filter: Partial<EntityValues>): Promise<Entity | null> {
  try {
    const record = await this.manager.findOne(EntityORM, { where: filter });
    if (!record) return null;
    return createEntityFromEntity(record);
  } catch (error) {
    throw new InternalSystemException(`Error al buscar entidad: ${error.message}`, 'IS_001');
  }
}
```

## Reglas

- **No** usar `throw new Error()` directo — siempre usar las excepciones de dominio
- **No** usar excepciones de HTTP (`NotFoundException`, `BadRequestException`) en use cases — solo en controllers si es estrictamente necesario
- **Siempre** re-lanzar la excepción en el catch del use case (el global filter la maneja)
- Los codes son opcionales pero ayudan a identificar el error: `'B_001'`, `'V_002'`, `'IS_003'`
