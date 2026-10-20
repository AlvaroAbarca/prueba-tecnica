# Sistema de Validaciones de Dominio - Documentación Técnica

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Sistema de Decoradores](#sistema-de-decoradores)
  - [Estructura Organizacional](#estructura-organizacional)
  - [Categorías de Decoradores](#categorías-de-decoradores)
  - [Creación de Nuevos Decoradores](#creación-de-nuevos-decoradores)
  - [Sistema de Auto-Indexación](#sistema-de-auto-indexación)
- [Value Objects con Decoradores](#value-objects-con-decoradores)
- [ValidateVO - Núcleo del Sistema](#validatevo---núcleo-del-sistema)
- [Tipos de Validación](#tipos-de-validación)
- [Extracción de Interfaces desde Mapeo](#extracción-de-interfaces-desde-mapeo)
- [Uso en DTOs y Value Objects](#uso-en-dtos-y-value-objects)
- [Ejemplos Prácticos del Proyecto](#ejemplos-prácticos-del-proyecto)

---

## Descripción General

El sistema de validaciones implementa un enfoque híbrido que combina **decoradores personalizados** para Value Objects con **ValidateVO** como orquestador central. El sistema permite tanto validación individual (fail-fast) como validación múltiple (acumulativa), siendo aplicable tanto en Value Objects como en DTOs.

### Características Principales

- **Sistema de decoradores organizados por categorías**
- **Auto-indexación automática** de nuevos decoradores
- **Validación fail-fast o acumulativa**
- **Reutilización entre VO y DTOs**
- **Extracción automática de tipos TypeScript**
- **Manejo centralizado de excepciones**

## Arquitectura del Sistema

```typescript
┌─────────────────────────────────────────────────────┐
│                    SISTEMA DE DECORADORES           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   value/    │  │   types/    │  │  helpers/   │  │
│  │ • strings   │  │ • primitives│  │ • utilities │  │
│  │ • numbers   │  │ • arrays    │  │ • validation│  │
│  │ • dates     │  │ • objects   │  │ • helper    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│         │                │                │         │
│         └────────────────┼────────────────┘         │
│                          │                          │
│  ┌─────────────────────────────────────────────────┐│
│  │              index.ts (Auto-Indexación)         ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                     VALIDACIÓN EN CAPAS                │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │ Value Object│───▶│ ValidateVO  │───▶│ Exception   │ │
│  │ @Decorators │    │ Orchestrator│    │  Factory    │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│         │                 │                   │        │
│         ▼                 ▼                   ▼        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │    DTOs     │    │ Batch Valid │    │ Detailed    │ │
│  │ @Decorators │    │ Multi VO    │    │ Errors      │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
└────────────────────────────────────────────────────────┘
```

## Sistema de Decoradores

### Estructura Organizacional

El sistema de decoradores está organizado en una estructura clara que facilita el mantenimiento y la extensibilidad:

```
src/modules/shared/domain/validators/decorators/
├── index.ts                     # Auto-indexación central
├── helpers/
│   ├── validation-helper.ts     # Core del sistema
│   └── validate-vo.ts          # Orquestador principal
├── value/                      # Validadores de valores específicos
│   ├── string-validators.ts    # Validaciones de string
│   ├── number-validators.ts    # Validaciones numéricas
│   ├── date-validators.ts      # Validaciones de fechas
│   ├── arrays-validators.ts    # Validaciones de arrays
│   └── common-validators.ts    # Validaciones comunes
└── types/                     # Validadores de tipos primitivos
    └── types-validators.ts    # Validaciones de tipos básicos
```

### Categorías de Decoradores

#### 1. Decoradores de Tipos (`types/`)

Diseñados para validar tipos primitivos como `string`, `number`, `boolean`, etc. Estos decoradores son utilizados para asegurar que los valores cumplen con las expectativas básicas de tipo.

```typescript
// filepath: src/modules/shared/domain/validators/decorators/types/types-validators.ts

// Validadores básicos de tipos
export const IsString = () => Validator.createValidator('string', (value) => typeof value === 'string');

export const IsNumber = () => Validator.createValidator('number', (value) => typeof value === 'number' && !isNaN(value));

export const IsInt = () => Validator.createValidator('integer', (value) => Number.isInteger(value) && !isNaN(value));

export const IsBoolean = () => Validator.createValidator('boolean', (value) => typeof value === 'boolean');
```

#### 2. Decoradores de Valores (`value/`)

Diseñados para validar valores específicos más allá de su tipado básico como cadenas, números, fechas, etc. Estos decoradores son utilizados para asegurar que los valores cumplen con las expectativas de formato y contenido, así como asegurar la integridad mínima de datos para cumplir con la lógica de negocio necesaria.

```typescript
// filepath: src/modules/shared/domain/validators/decorators/value/string-validators.ts

// Validaciones específicas de string
export const IsEmail = () =>
  Validator.createValidator('email', (value) => {
    if (typeof value !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  });

export const MinLength = (min: number) => Validator.createValidator(`minimum length ${min}`, (value) => typeof value === 'string' && value.length >= min);

export const IsUUID = (version?: 'v3' | 'v4' | 'v5') =>
  Validator.createValidator(`UUID${version ? ` version ${version}` : ''}`, (value) => {
    if (typeof value !== 'string') return false;

    const uuidRegex = {
      v3: /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      v4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      v5: /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    };

    return version && uuidRegex[version] ? uuidRegex[version].test(value) : Object.values(uuidRegex).some((regex) => regex.test(value));
  });
```

### Creación de Nuevos Decoradores

Puedes crear nuevos decoradores en caso de ser necesario! Para ello debes asegurarte de traer el orquestador principal del sistema de validación (`Validator`) y aplicar el método estatico `createValidator`.

#### Paso 1: Crear el Decorador en la Categoría Correcta

```typescript
// filepath: src/modules/shared/domain/validators/decorators/value/string-validators.ts

// Ejemplo: Crear validador para códigos postales chilenos
export const IsChileanPostalCode = () =>
  Validator.createValidator('Chilean postal code', (value) => {
    if (typeof value !== 'string') return false;
    // Código postal chileno: 7 dígitos
    const chileanPostalRegex = /^\d{7}$/;
    return chileanPostalRegex.test(value);
  });

// Ejemplo: Validador con mensaje personalizado
export const IsValidRUT = () =>
  Validator.createValidatorWithMessage('Chilean RUT', (value) => {
    if (typeof value !== 'string') {
      return 'RUT debe ser una cadena de texto';
    }

    // Lógica de validación de RUT chileno
    const rutRegex = /^\d{1,8}-[\dkK]$/;
    if (!rutRegex.test(value)) {
      return 'RUT debe tener formato válido (ej: 12345678-9)';
    }

    // Validación del dígito verificador
    if (!this.validateRUTDigit(value)) {
      return 'RUT tiene dígito verificador inválido';
    }

    return null; // null = válido
  });

// Ejemplo: Validador con parámetros
export const IsValidPhoneNumber = (country: 'CL' | 'US' | 'ES' = 'CL') =>
  Validator.createValidator(`phone number for ${country}`, (value) => {
    if (typeof value !== 'string') return false;

    const phoneRegex = {
      CL: /^(\+56)?[2-9]\d{8}$/, // Teléfono chileno
      US: /^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/, // Teléfono US
      ES: /^(\+34)?[6-9]\d{8}$/, // Teléfono español
    };

    return phoneRegex[country].test(value.replace(/\s/g, ''));
  });
```

#### Paso 2: Crear Decoradores en Nueva Categoría (si es necesario)

```typescript
// filepath: src/modules/shared/domain/validators/decorators/value/business-validators.ts

import { Validator } from '../../core/validator';

// Validadores específicos del negocio
export const IsValidProductCode = () =>
  Validator.createValidator('product code', (value) => {
    if (typeof value !== 'string') return false;
    // Formato: PROD_XXXXXXXX
    return /^PROD_\d{8}$/.test(value);
  });

export const IsValidOrderStatus = () =>
  Validator.createValidator('order status', (value) => {
    if (typeof value !== 'string') return false;
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    return validStatuses.includes(value.toUpperCase());
  });

export const IsValidPrice = () =>
  Validator.createValidator('price', (value) => {
    if (typeof value !== 'number') return false;
    // Precio debe ser positivo y máximo 2 decimales
    return value >= 0 && Number((value * 100).toFixed(0)) / 100 === value;
  });
```

#### Paso 3: Auto-Indexación Automática

```typescript
// filepath: src/modules/shared/domain/validators/decorators/index.ts

// ✅ IMPORTANTE: Respetar las categorías establecidas
export * from './value/arrays-validators';
export * from './value/string-validators';
export * from './value/common-validators';
export * from './value/number-validators';
export * from './value/date-validators';
export * from './value/business-validators'; // ✅ Nueva categoría se auto-indexa

export * from './types/types-validators';

export * from './helpers/validation-helper';
export * from './helpers/validate-vo';
```

### Sistema de Auto-Indexación

Una vez que crear un decorador en cualquier archivo de categoría, **automáticamente se indexa** y está disponible para importación:

```typescript
// ✅ Correcto: Importación automática desde el índice
import { IsEmail, IsUUID, IsChileanPostalCode, IsValidRUT } from '@modules/shared/domain/validators/decorators';

// ❌ Incorrecto: Importación directa del archivo
import { IsEmail } from '@modules/shared/domain/validators/decorators/value/string-validators';
```

## Value Objects con Decoradores

### Implementación Básica

```typescript
// filepath: src/modules/users/domain/value-objects/UserEmail.ts

import { IsEmail, IsString, MinLength } from '@modules/shared/domain/validators/decorators';

export class UserEmail {
  @IsString()
  @IsEmail()
  private readonly _value: string;

  constructor(value: string) {
    this._value = value;
    ValidateVO.validate(this); // Dispara validación
  }

  get value(): string {
    return this._value;
  }
}
```

### Implementación Avanzada con Múltiples Validaciones

```typescript
// filepath: src/modules/users/domain/value-objects/UserId.ts

import { IsString, IsUUID, MinLength } from '@modules/shared/domain/validators/decorators';

export class UserId {
  @IsString()
  @IsUUID('v4')
  @MinLength(36)
  private readonly _value: string;

  constructor(value: string) {
    this._value = value;

    // Validación fail-fast: se detiene en el primer error
    ValidateVO.validate(this, 'userId');
  }

  get value(): string {
    return this._value;
  }

  // Factory method
  static generate(): UserId {
    return new UserId(crypto.randomUUID());
  }

  static fromString(value: string): UserId {
    return new UserId(value);
  }
}
```

### Value Object con Validación Personalizada

```typescript
// filepath: src/modules/shared/domain/value-object/LargoString.ts

import { IsString, MinLength, MaxLength } from '@modules/shared/domain/validators/decorators';

export class LargoString {
  @IsString()
  private readonly _value: string;
  private readonly _maxLength: number;

  constructor(value: string, largo: number) {
    this._value = value;
    this._maxLength = largo;

    // Validación básica con decoradores
    ValidateVO.validate(this);

    // Validación adicional personalizada
    if (value.length > largo) {
      throw new NoDataError(`${this.constructor.name} no puede superar los ${largo} caracteres.`);
    }
  }

  get value(): string {
    return this._value;
  }
}
```

## ValidateVO - Núcleo del Sistema

### Análisis Técnico Detallado

```typescript
export class ValidateVO {
  /**
   * Valida una instancia individual (fail-fast)
   *
   * Funcionamiento:
   * 1. Ejecuta ValidationHelper.validate() para obtener errores
   * 2. Si hay errores, construye excepción detallada
   * 3. Lanza excepción inmediatamente al primer error
   *
   * @param instance - Instancia del VO a validar
   * @param fieldName - Nombre del campo (opcional, se infiere si no se proporciona)
   */
  static validate(instance: any, fieldName?: string): void {
    const errors = ValidationHelper.validate(instance);
    if (errors.length > 0) {
      const entityName = instance.constructor.name;
      const field =
        fieldName ||
        entityName
          .toLowerCase()
          .replace(/([A-Z])/g, '_$1')
          .substring(1);

      throw this.createValidationException(
        `Invalid ${field}`,
        `${entityName.toUpperCase()}_VALIDATION_ERROR`,
        errors.map((error) => ({
          field,
          message: error,
          value: instance.value,
        })),
      );
    }
  }

  /**
   * Obtiene errores sin lanzar excepción
   *
   * Útil para:
   * - Validación previa sin interrumpir flujo
   * - Mostrar warnings en lugar de errores
   * - Validaciones condicionales
   */
  static getErrors(instance: any): string[] {
    return ValidationHelper.validate(instance);
  }

  /**
   * Crea múltiples VOs con validación acumulativa
   *
   * Funcionamiento:
   * 1. Inicializa arrays para resultados y errores
   * 2. Itera cada spec intentando crear el VO
   * 3. Captura errores individuales SIN interrumpir el bucle
   * 4. Al final, si hay errores, lanza excepción con TODOS los detalles
   * 5. Si no hay errores, retorna objeto tipado con todos los VOs
   *
   * @param specs - Array de especificaciones {field, value, VOClass}
   * @returns T - Objeto tipado con todos los VOs creados
   */
  static createMultiple<T extends Record<string, any>>(
    specs: Array<{
      field: string;
      value: any;
      VOClass: { new (value: any): any };
    }>,
  ): T {
    const allErrors: Array<{ field: string; message: string; value: any }> = [];
    const results: Record<string, any> = {};

    // ✅ Capturar TODOS los errores antes de lanzar excepción
    for (const { field, value, VOClass } of specs) {
      try {
        results[field] = new VOClass(value);
      } catch (error) {
        allErrors.push({
          field,
          message: error.message,
          value,
        });
      }
    }

    // ✅ Solo lanza excepción si HAY errores (validación acumulativa)
    if (allErrors.length > 0) {
      this.createValidationException('Multiple validation errors', 'MULTI_VALIDATION_ERROR', allErrors);
    }

    return results as T;
  }

  /**
   * Crea VOs desde mapping con validación acumulativa
   *
   * Funcionamiento:
   * 1. Itera el mapping buscando campos en params
   * 2. Para cada campo existente, intenta crear el VO
   * 3. Acumula errores sin interrumpir el proceso
   * 4. Al final evalúa si lanzar excepción
   *
   * @param params - Objeto con valores fuente
   * @param mapping - Mapeo campo -> constructor VO
   */
  static createFromMapping<T>(params: Record<string, any>, mapping: Record<string, new (value: any) => any>): T {
    const result = {} as T;
    const allErrors: Array<{ field: string; message: string; value: any }> = [];

    for (const [fieldName, VOClass] of Object.entries(mapping)) {
      const value = params[fieldName];

      try {
        const voInstance = new VOClass(value);
        (result as any)[fieldName] = voInstance;
      } catch (error) {
        allErrors.push({
          field: fieldName,
          message: error.message,
          value: value,
        });
      }
    }

    // Si hay errores, lanzar excepción con todos los detalles
    if (allErrors.length > 0) {
      this.createValidationException('Multiple validation errors', 'MULTI_VALIDATION_ERROR', allErrors);
    }
    return result;
  }
}
```

## Tipos de Validación

### 1. Validación Fail-Fast (Individual)

```typescript
// Se detiene en el PRIMER error encontrado
try {
  const email = new UserEmail('invalid-email'); // ❌ Falla inmediatamente
} catch (error) {
  console.log(error.message); // "Invalid userEmail"
  console.log(error.details); // Array con UN error específico
}
```

### 2. Validación Acumulativa (Múltiple)

```typescript
// Acumula TODOS los errores antes de fallar
try {
  const UserVOBuilder = ValidateVO.createMultiple([
    { field: 'userId', value: 'invalid-uuid', VOClass: UserId }, // ❌ Error 1
    { field: 'email', value: 'invalid-email', VOClass: UserEmail }, // ❌ Error 2
    { field: 'name', value: '', VOClass: UserName }, // ❌ Error 3
  ]);
} catch (error) {
  console.log(error.code); // "MULTI_VALIDATION_ERROR"
  console.log(error.details); // Array con los 3 errores detallados
}
```

### 3. Validación Híbrida

```typescript
// Combina ambos enfoques según necesidad
class CreateUserUseCase {
  async execute(userData: any) {
    try {
      // 1. Validación acumulativa para mostrar todos los errores al usuario
      const UserVOBuilder = ValidateVO.createFromMapping(userData, {
        id: UserId,
        email: UserEmail,
        name: UserName,
      });

      // 2. Validación fail-fast para reglas críticas
      const uniqueEmail = new UniqueEmail(UserVOBuilder.email.value); // Falla inmediatamente si no es único

      return await this.userRepository.save(UserVOBuilder);
    } catch (error) {
      // Manejo diferenciado según tipo de error
      throw error;
    }
  }
}
```

## Extracción de Interfaces desde Mapeo

### Definición de Tipos Automáticos

```typescript
// filepath: src/modules/users/domain/types/user-vo-types.ts

import { ValidateVO } from '@modules/shared/domain/validators/decorators';
import { UserId, UserEmail, UserName, UserAge } from '../value-objects';

// 1. Definir mapping de VOs
export const userVOMapping = {
  id: UserId,
  email: UserEmail,
  name: UserName,
  age: UserAge,
} as const;

// 2. Extraer tipos automáticamente
export const userVODefinition = ValidateVO.createVODefinition(userVOMapping);

// 3. Tipos disponibles automáticamente
export type UserVOBuilder = typeof userVODefinition.type;
// Resultado: { id: UserId; email: UserEmail; name: UserName; age: UserAge }

export type UserValues = typeof userVODefinition.values;
// Resultado: { id: string; email: string; name: string; age: number }
```

### Uso de Tipos Extraídos

```typescript
// filepath: src/modules/users/application/use-cases/create-user.use-case.ts

import { userVODefinition, UserVOBuilder, UserValues } from '../../domain/types/user-vo-types';

export class CreateUserUseCase {
  // ✅ Tipos automáticos desde mapeo
  async execute(userData: UserValues): Promise<User> {
    try {
      // ✅ Creación tipada usando definición
      const UserVOBuilder: UserVOBuilder = userVODefinition.create(userData);

      // UserVOBuilder está completamente tipado
      console.log(UserVOBuilder.id.value); // string
      console.log(UserVOBuilder.email.value); // string
      console.log(UserVOBuilder.name.value); // string
      console.log(UserVOBuilder.age.value); // number

      return await this.userRepository.save(UserVOBuilder);
    } catch (error) {
      throw error;
    }
  }
}
```

### Interfaces Complejas con Opcionales

```typescript
// filepath: src/modules/products/domain/types/product-vo-types.ts

// Mapping con campos opcionales
export const productVOMapping = {
  id: ProductId, // Requerido
  name: ProductName, // Requerido
  description: ProductDescription, // Opcional
  price: Price, // Requerido
  category: Category, // Requerido
  tags: ProductTags, // Opcional
} as const;

// Definición base
export const productVODefinition = ValidateVO.createVODefinition(productVOMapping);

// Tipos con opcionales manejados manualmente
export type ProductVOsRequired = Pick<typeof productVODefinition.type, 'id' | 'name' | 'price' | 'category'>;
export type ProductVOsOptional = Partial<Pick<typeof productVODefinition.type, 'description' | 'tags'>>;
export type ProductVOs = ProductVOsRequired & ProductVOsOptional;

// Función de creación que maneja opcionales
export function createProductVOs(data: Record<string, any>): ProductVOs {
  const requiredFields = ['id', 'name', 'price', 'category'];
  const optionalFields = ['description', 'tags'];

  // Validar campos requeridos
  const requiredMapping = Object.fromEntries(requiredFields.map((field) => [field, productVOMapping[field]]));
  const requiredVOs = ValidateVO.createFromMapping(data, requiredMapping);

  // Crear campos opcionales solo si existen
  const optionalVOs: any = {};
  for (const field of optionalFields) {
    if (data[field] !== undefined && data[field] !== null) {
      try {
        optionalVOs[field] = new productVOMapping[field](data[field]);
      } catch (error) {
        // Los errores de campos opcionales se pueden manejar diferente
        console.warn(`Optional field ${field} validation failed:`, error.message);
      }
    }
  }

  return { ...requiredVOs, ...optionalVOs } as ProductVOs;
}
```

## Uso en DTOs y Value Objects

### DTOs con Decoradores del Sistema

```typescript
// filepath: src/modules/users/infrastructure/dto/UserCreateDTO.ts

import { IsString, IsEmail, MinLength, IsInt, Min, Max } from '@modules/shared/domain/validators/decorators';

export class UserCreateDTO {
  @IsString()
  @MinLength(1)
  readonly name: string;

  @IsString()
  @IsEmail()
  readonly email: string;

  @IsInt()
  @Min(18)
  @Max(120)
  readonly age: number;

  @IsString()
  @MinLength(8)
  readonly password: string;
}
```

### Conversión DTO → VOs

```typescript
// filepath: src/modules/users/application/services/user-create-and-list.service.ts

export class UserCreateAndListService {
  async start(userDTO: UserCreateDTO): Promise<any> {
    try {
      // 1. DTO ya validado por NestJS validation pipe

      // 2. Convertir a VOs con validación adicional del dominio
      const UserVOBuilder = ValidateVO.createFromMapping(
        {
          id: crypto.randomUUID(), // Generar ID
          name: userDTO.name,
          email: userDTO.email,
          age: userDTO.age,
        },
        {
          id: UserId,
          name: UserName,
          email: UserEmail,
          age: UserAge,
        },
      );

      // 3. VOs validados listos para el dominio
      const user = User.create(UserVOBuilder.id, UserVOBuilder.name, UserVOBuilder.email, UserVOBuilder.age);

      return await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
  }
}
```

### Reutilización de Validaciones

```typescript
// filepath: src/modules/shared/domain/value-object/Email.ts

import { IsString, IsEmail, MaxLength } from '@modules/shared/domain/validators/decorators';

export class Email {
  @IsString()
  @IsEmail()
  @MaxLength(254)
  private readonly _value: string;

  constructor(value: string) {
    this._value = value;
    ValidateVO.validate(this, 'email');
  }

  get value(): string {
    return this._value;
  }
}

// Reutilización en diferentes DTOs
export class UserCreateDTO {
  @IsString()
  @IsEmail() // ✅ Misma validación que el VO
  @MaxLength(254)
  readonly email: string;
}

export class ContactCreateDTO {
  @IsString()
  @IsEmail() // ✅ Misma validación reutilizada
  @MaxLength(254)
  readonly contactEmail: string;
}

export class NewsletterSubscribeDTO {
  @IsString()
  @IsEmail() // ✅ Consistencia en toda la aplicación
  @MaxLength(254)
  readonly subscriberEmail: string;
}
```

## Ejemplos Prácticos del Proyecto

### Ejemplo 1: User Module Complete

```typescript
// filepath: src/modules/users/domain/value-objects/UserId.ts

import { IsString, IsUUID } from '@modules/shared/domain/validators/decorators';

export class UserId {
  @IsString()
  @IsUUID('v4')
  private readonly _value: string;

  constructor(value: string) {
    this._value = value;
    ValidateVO.validate(this, 'userId');
  }

  get value(): string {
    return this._value;
  }

  static generate(): UserId {
    return new UserId(crypto.randomUUID());
  }
}

// filepath: src/modules/users/infrastructure/controllers/user-create.controller.ts

export class UserCreateAndListController {
  async start(@Body() user: UserCreateDTO): Promise<any> {
    try {
      const users = await this.userCreateService.start(user);
      return new Respuesta('ok', users, [], 200);
    } catch (error) {
      // ✅ El sistema captura automáticamente errores de VO
      if (error.details && Array.isArray(error.details) && error.details.length > 0) {
        const respuesta = new Respuesta(error.message, {}, error.details);
        throw new BadRequestException(respuesta);
      }

      throw new InternalServerErrorException(new Respuesta('Error interno', {}, []));
    }
  }
}
```

### Ejemplo 2: Complex Value Object con Múltiples Validaciones

```typescript
// filepath: src/modules/shared/domain/value-object/LargoString.ts

import { IsString, MinLength } from '@modules/shared/domain/validators/decorators';

export class LargoString {
  @IsString()
  @MinLength(1)
  private readonly _value: string;

  constructor(value: string, largo: number) {
    this._value = value;

    // 1. Validación básica con decoradores (fail-fast)
    ValidateVO.validate(this);

    // 2. Validación específica del negocio
    if (value.length > largo) {
      throw new NoDataError(`${this.constructor.name} no puede superar los ${largo} caracteres.`);
    }
  }

  get value(): string {
    return this._value;
  }
}
```

### Ejemplo 3: Batch Validation en Use Case Real

```typescript
// filepath: src/modules/users/application/use-cases/user-edit.use-case.ts

export class UserEditUseCase {
  async start(userEditDTO: UserEditDTO): Promise<void> {
    try {
      // ✅ Validación acumulativa: captura TODOS los errores a la vez
      const UserVOBuilder = ValidateVO.createMultiple([
        { field: 'userId', value: userEditDTO.id, VOClass: UserId },
        { field: 'name', value: userEditDTO.name, VOClass: UserName },
        { field: 'email', value: userEditDTO.email, VOClass: UserEmail },
      ]);

      // Si llegamos aquí, todos los VOs son válidos
      await this.userRepository.update(UserVOBuilder.userId, {
        name: UserVOBuilder.name,
        email: UserVOBuilder.email,
      });
    } catch (error) {
      // error.details contiene todos los errores específicos
      throw error;
    }
  }
}
```

### Ejemplo 4: Sanitización con Decoradores

```typescript
// filepath: src/modules/shared/infrastructure/decorators/sanitize-html.decorator.ts

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
        validate(value: any, args: ValidationArguments) {
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

// Uso en DTO
export class PostCreateDTO {
  @IsString()
  @SanitizeHtml({ message: 'El contenido no puede contener HTML' })
  readonly content: string;
}
```

## Mejores Prácticas

### 1. Organización de Decoradores

```typescript
// ✅ Correcto: Respetar categorías
// value/ → Validaciones específicas de valores
// types/ → Validaciones de tipos básicos
// helpers/ → Utilidades del sistema

// ❌ Incorrecto: Mezclar categorías
// No crear validadores de string en types/
// No crear utilidades en value/
```

### 2. Nomenclatura Consistente

```typescript
// ✅ Correcto: PascalCase para decoradores
export const IsEmail = () => // ...
export const IsValidRUT = () => // ...
export const MinLength = (min: number) => // ...

// ❌ Incorrecto: Otras convenciones
export const isEmail = () => // minúscula
export const is_valid_rut = () => // snake_case
```

### 3. Fail-Fast vs Acumulativo

```typescript
// ✅ Usar fail-fast para validaciones críticas
const userId = new UserId(value);  // Falla inmediatamente

// ✅ Usar acumulativo para UX mejor
const formVOs = ValidateVO.createMultiple([...]);  // Muestra todos los errores
```

### 4. Reutilización de Validaciones

```typescript
// ✅ Correcto: Mismas reglas en VO y DTO
export class Email {
  @IsString()
  @IsEmail()
  @MaxLength(254)
  // ...
}

export class UserCreateDTO {
  @IsString()
  @IsEmail()
  @MaxLength(254)  // Mismas reglas
  readonly email: string;
}
```

---

## Conclusión

El sistema de validaciones proporciona:

- **Organización clara** de decoradores por categorías
- **Auto-indexación automática** para fácil importación
- **Flexibilidad** entre validación fail-fast y acumulativa
- **Reutilización** de lógica entre VOs y DTOs
- **Tipado automático** desde mapeos de VOs
- **Extensibilidad** sin romper código existente

Este enfoque garantiza validaciones consistentes, mantenibles y escalables en toda la aplicación.
