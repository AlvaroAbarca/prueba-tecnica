---
name: dto-validation
description: Guía para crear DTOs en la capa de infraestructura con class-validator y Swagger. Usar cuando se crean DTOs para controllers (body, query, params).
---

# DTOs de Infraestructura

Los DTOs de la capa de infraestructura viven en `infrastructure/dto/` y usan **class-validator** para validación y **@nestjs/swagger** para documentación.

## Ubicación

```
src/modules/<module>/infrastructure/dto/
└── <action><Entity>.dto.ts       # ej: createUser.dto.ts, userEdit.dto.ts
```

> Los DTOs de dominio (sin decoradores) viven en `domain/dto/` o `domain/dtos/`.

## Patrón estándar: Body DTO

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsUUID, IsInt, IsEnum, IsDateString, Length, Min, Max } from 'class-validator';

export class CreateEntityDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'juan@correos.cl' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+56912345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
```

## Patrón estándar: Query DTO

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsEnum, Length } from 'class-validator';

export class SearchEntityQueryDto {
  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  code?: string;

  @ApiPropertyOptional({ example: '2025-01-15', description: 'Formato YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ enum: MyStatusEnum, example: MyStatusEnum.ADMITTED })
  @IsOptional()
  @IsEnum(MyStatusEnum)
  status?: MyStatusEnum;
}
```

## Patrón: Edit/Update DTO (todos opcionales)

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EditEntityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
```

## Decoradores disponibles de class-validator

| Decorador             | Uso                     |
| --------------------- | ----------------------- |
| `@IsString()`         | Cadena de texto         |
| `@IsNotEmpty()`       | Requerido, no vacío     |
| `@IsOptional()`       | Campo opcional          |
| `@IsEmail()`          | Formato email           |
| `@IsUUID()`           | Formato UUID            |
| `@IsInt()`            | Número entero           |
| `@IsNumber()`         | Número decimal          |
| `@IsBoolean()`        | Booleano                |
| `@IsEnum(MyEnum)`     | Valor dentro de un enum |
| `@IsDateString()`     | Fecha ISO 8601          |
| `@IsArray()`          | Array                   |
| `@Length(min, max)`   | Longitud de string      |
| `@Min(n)` / `@Max(n)` | Rango numérico          |

## Decoradores de Swagger

| Decorador                | Uso                              |
| ------------------------ | -------------------------------- |
| `@ApiProperty()`         | Campo requerido en Swagger       |
| `@ApiPropertyOptional()` | Campo opcional en Swagger        |
| `@ApiTags('Tag')`        | Grupo en Swagger (en controller) |

## Uso en Controller

```typescript
import { Body, Query, Param } from '@nestjs/common';

// Body
async create(@Body() dto: CreateEntityDto) { ... }

// Query params
async findAll(@Query() query: SearchEntityQueryDto) { ... }

// Route params (simple, sin DTO)
async findOne(@Param('id') id: string) { ... }
```

## Reglas

- Usar `@ApiProperty()` en **todos** los campos (requeridos u opcionales)
- Campos opcionales siempre con `@IsOptional()` **antes** de los otros decoradores
- No agregar lógica de negocio en DTOs — solo validación de formato/tipo
- Los DTOs de body se usan con `@Body()`, los de query con `@Query()`
- Los campos opcionales usan `?` en TypeScript: `name?: string`
