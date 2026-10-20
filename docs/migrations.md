# Migraciones de base de datos

Las migraciones viven en la carpeta `migrations/` en la raíz del proyecto y se escriben en TypeScript con SQL crudo (sin QueryBuilder). TypeORM rastrea qué migraciones se han ejecutado en la tabla `migrations` de la base de datos.

## Comandos

```bash
# Crear una nueva migración vacía
npm run migration:create NombreDescriptivo

# Aplicar todas las migraciones pendientes
npm run migration:run

# Revertir la última migración aplicada
npm run migration:revert

# Ver el estado de todas las migraciones (aplicadas / pendientes)
npm run migration:show
```

El archivo generado tendrá el formato: `<timestamp>-NombreDescriptivo.ts`  
Ejemplo: `1753826172257-addFieldsPhoneTokenToUser.ts`

## Estructura de una migración

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductTable1762443013448 implements MigrationInterface {
  name = 'CreateProductTable1762443013448';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
    // Revertir en orden inverso a lo que hizo up()
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

### Crear tabla con FK e índices

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

### Agregar unique constraint

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_email" ON "user" ("email")`);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`DROP INDEX "IDX_user_email"`);
}
```

### Índice GIN para columna JSONB

```typescript
// Índice general sobre todo el campo JSONB
await queryRunner.query(`CREATE INDEX "IDX_entity_data" ON "entity" USING GIN ("data" jsonb_path_ops)`);

// Índice sobre un campo específico dentro del JSONB
await queryRunner.query(`CREATE INDEX "IDX_entity_data_status" ON "entity" (("data" ->> 'status'))`);
```

### Convertir columna `timestamp` a `timestamptz`

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    ALTER TABLE "user"
    ALTER COLUMN "createdAt" TYPE timestamptz
    USING "createdAt" AT TIME ZONE 'UTC'
  `);
}
```

## Tipos de columna PostgreSQL

| TypeScript       | PostgreSQL             |
| ---------------- | ---------------------- |
| `string`         | `character varying(n)` |
| `string` (largo) | `text`                 |
| `number` (int)   | `integer` o `SERIAL`   |
| `number` (float) | `numeric(10,2)`        |
| `boolean`        | `boolean`              |
| `Date`           | `timestamptz`          |
| `object`         | `jsonb`                |
| UUID             | `uuid`                 |

## Reglas

- **Siempre** implementar `down()` que revierta exactamente lo que hace `up()`, en orden inverso.
- Usar SQL crudo, no el QueryBuilder de TypeORM — mayor control y legibilidad.
- Usar **`timestamptz`** (nunca `timestamp`) para fechas — almacena en UTC con zona horaria explícita.
- Agregar `DEFAULT now()` en `createdAt` y `updatedAt`.
- Agregar índices en todas las columnas usadas en `WHERE`, `JOIN` o `ORDER BY`.
- Convención de nombres:
  - Índices: `IDX_<tabla>_<columna>`
  - Foreign keys: `FK_<tabla>_<columna>`
- No usar `synchronize: true` en producción — solo migraciones manuales.
- Ejecutar siempre en rama de feature antes de mergear a main.
