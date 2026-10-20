---
name: migrations
description: Guía para crear y ejecutar migraciones de TypeORM. Usar cuando se agregan tablas, columnas, índices o constraints a la base de datos PostgreSQL.
---

# Migraciones TypeORM

Las migraciones viven en la carpeta `migrations/` en la raíz del proyecto y se escriben en TypeScript con SQL crudo.

## Comandos

```bash
# Crear una nueva migración vacía
npm run migration:create <NombreDeLaMigracion>

# Aplicar migraciones pendientes
npm run migration:run

# Revertir la última migración
npm run migration:revert

# Ver estado de migraciones
npm run migration:show
```

El nombre del archivo generado tendrá el formato: `<timestamp>-<NombreDeLaMigracion>.ts`

## Estructura de una migración

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductTable1762443013448 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cambios a aplicar
    await queryRunner.query(`
      CREATE TABLE "product" (
        "id" SERIAL PRIMARY KEY,
        "code" character varying(50) NOT NULL,
        "name" character varying(200) NOT NULL,
        "data" jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_product_code" ON "product" ("code")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir exactamente lo que hizo up()
    await queryRunner.query(`DROP INDEX "IDX_product_code"`);
    await queryRunner.query(`DROP TABLE "product"`);
  }
}
```

## Patrones comunes

### Agregar columnas a tabla existente

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`ALTER TABLE "user" ADD "phone" character varying(50) NOT NULL DEFAULT ''`);
  await queryRunner.query(`ALTER TABLE "user" ADD "verifiedAt" timestamptz`);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "verifiedAt"`);
  await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone"`);
}
```

### Crear tabla con FK y índices

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    CREATE TABLE "order_item" (
      "id" SERIAL PRIMARY KEY,
      "orderId" integer NOT NULL,
      "productCode" character varying(50) NOT NULL,
      "quantity" integer NOT NULL DEFAULT 1,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "FK_order_item_orderId"
        FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE
    )
  `);
  await queryRunner.query(`CREATE INDEX "IDX_order_item_orderId" ON "order_item" ("orderId")`);
  await queryRunner.query(`CREATE INDEX "IDX_order_item_productCode" ON "order_item" ("productCode")`);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`DROP INDEX "IDX_order_item_productCode"`);
  await queryRunner.query(`DROP INDEX "IDX_order_item_orderId"`);
  await queryRunner.query(`DROP TABLE "order_item"`);
}
```

### Índice GIN para columna JSONB

```typescript
await queryRunner.query(`CREATE INDEX "IDX_entity_data" ON "entity" USING GIN ("data" jsonb_path_ops)`);
// Para queries en campo específico de JSONB:
await queryRunner.query(`CREATE INDEX "IDX_entity_data_status" ON "entity" (("data" ->> 'status'))`);
```

### Agregar unique constraint

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_email" ON "user" ("email")`);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`DROP INDEX "IDX_user_email"`);
}
```

## Tipos de columna PostgreSQL más usados

| TypeScript       | PostgreSQL             |
| ---------------- | ---------------------- |
| `string`         | `character varying(n)` |
| `number` (int)   | `integer` o `SERIAL`   |
| `number` (float) | `numeric(10,2)`        |
| `boolean`        | `boolean`              |
| `Date`           | `timestamptz`          |
| `object`         | `jsonb`                |
| `string` (largo) | `text`                 |
| UUID             | `uuid`                 |

## Reglas

- **Siempre** implementar `down()` que revierta exactamente lo que hace `up()` — en orden inverso
- Usar SQL crudo (no QueryBuilder de TypeORM) para mayor control y legibilidad
- Agregar índices para todas las columnas usadas en `WHERE`, `JOIN` o `ORDER BY`
- Usar **`timestamptz`** (no `timestamp`) para todas las columnas de fecha/hora — almacena siempre en UTC con zona horaria explícita
- Usar `DEFAULT now()` en `createdAt` / `updatedAt`
- Al convertir columnas `timestamp` existentes usar `USING "col" AT TIME ZONE 'UTC'` para preservar los datos
- Nombres de índices: `IDX_<tabla>_<columna>` — nombres de FK: `FK_<tabla>_<columna>`
- No usar `synchronize: true` en producción — solo migraciones manuales
- Ejecutar siempre en una rama de feature antes de mergear
- Para formatear fechas en código TypeScript usar el helper centralizado: `src/modules/shared/infrastructure/utils/date.helper.ts`
