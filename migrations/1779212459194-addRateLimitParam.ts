import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRateLimitParam1779212459194 implements MigrationInterface {
  name = 'AddRateLimitParam1779212459194';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "param" (
        code,
        title,
        value,
        type,
        "subType",
        description,
        enabled,
        visible,
        "order",
        "createdAt",
        "updatedAt",
        "parentId",
        "customProperties"
      )
      SELECT
        'RATELIMIT',
        'Rate limit config',
        null,
        'config',
        'security',
        'Configuracion centralizada de rate limiting para rutas publicas y autenticadas',
        true,
        true,
        null,
        now(),
        now(),
        null,
        '{"public":{"requests":15,"seconds":60},"authenticated":{"requests":200,"seconds":60},"enabled":true,"whitelist":[]}'::jsonb
      WHERE NOT EXISTS (
        SELECT 1
        FROM "param"
        WHERE code = 'RATELIMIT'
          AND type = 'config'
          AND "deletedAt" IS NULL
      );
    `);

    await queryRunner.query(`
      UPDATE "param"
      SET
        title = 'Rate limit config',
        type = 'config',
        "subType" = 'security',
        description = 'Configuracion centralizada de rate limiting para rutas publicas y autenticadas',
        value = null,
        enabled = true,
        visible = true,
        "updatedAt" = now(),
        "customProperties" = '{"public":{"requests":15,"seconds":60},"authenticated":{"requests":200,"seconds":60},"enabled":true,"whitelist":[]}'::jsonb
      WHERE code = 'RATELIMIT'
        AND "deletedAt" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "param"
      WHERE code = 'RATELIMIT'
        AND type = 'config'
        AND description = 'Configuracion centralizada de rate limiting para rutas publicas y autenticadas';
    `);
  }
}
