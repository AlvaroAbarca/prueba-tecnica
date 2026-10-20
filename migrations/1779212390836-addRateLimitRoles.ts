import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRateLimitRoles1779212390836 implements MigrationInterface {
  name = 'AddRateLimitRoles1779212390836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO role (code, title, description, enabled, "order", visible)
      VALUES
        ('BACKOFFICE_RATELIMIT_READ', 'Backoffice rate limit ver', 'Configuración para ver la configuración de rate limit en backoffice', true, NULL, true),
        ('BACKOFFICE_RATELIMIT_UPDATE', 'Backoffice rate limit editar', 'Configuración para editar la configuración de rate limit en backoffice', true, NULL, true)
      ON CONFLICT (code) DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO "profileRole" ("profileId", "roleId")
      SELECT p.id AS "profileId", r.id AS "roleId"
      FROM profile p
      JOIN role r ON r.code IN ('BACKOFFICE_RATELIMIT_READ', 'BACKOFFICE_RATELIMIT_UPDATE')
      WHERE p.code = 'ADMIN'
      ON CONFLICT ("profileId", "roleId") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "profileRole"
      WHERE "roleId" IN (
        SELECT id FROM role WHERE code IN ('BACKOFFICE_RATELIMIT_READ', 'BACKOFFICE_RATELIMIT_UPDATE')
      );
    `);

    await queryRunner.query(`
      DELETE FROM role
      WHERE code IN ('BACKOFFICE_RATELIMIT_READ', 'BACKOFFICE_RATELIMIT_UPDATE');
    `);
  }
}
