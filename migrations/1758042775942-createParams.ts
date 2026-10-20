import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateParams1758042775942 implements MigrationInterface {
  name = 'CreateParams1758042775942';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "param" (code, title, value, type, "subType", description, enabled, visible, "order", "createdAt", "updatedAt", "parentId", "customProperties") VALUES
      ('ACCESS_TOKEN_EXPIRATION', 'Access Token Expiration', '15m', 'config', NULL, 'Duración del access token JWT', true, true, 1, now(), now(), null, null),
      ('REFRESH_TOKEN_EXPIRATION', 'Refresh Token Expiration', '1h', 'config', NULL, 'Duración del refresh token JWT', true, true, 2, now(), now(), null, null),
      ('MAXIMUM_FAILED_LOGIN', 'Maximum Failed Login Attempts', '5', 'config', NULL, 'Máximo de intentos fallidos antes de bloqueo', true, true, 3, now(), now(), null, null),
      ('BLOCK_NO_CHANGE_PASSWORD', 'Block No Change Password Days', '90', 'config', NULL, 'Días sin cambio de contraseña antes de bloqueo', true, true, 4, now(), now(), null, null),
      ('BLOCK_INACTIVE_ACCOUNT', 'Block Inactive Account Days', '60', 'config', NULL, 'Días de inactividad antes de bloqueo automático', true, true, 5, now(), now(), null, null),
      ('INACTIVE_ACCOUNT_IN', 'Inactive Account Warning Days', '90', 'config', NULL, 'Días para considerar cuenta inactiva', true, true, 6, now(), now(), null, null),
      ('UNIQUE_SESSION_PER_USER', 'Unique Session Per User', 'true', 'config', NULL, 'Permitir solo una sesión activa por usuario', true, true, 7, now(), now(), null, null)
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar todos los parámetros creados
    await queryRunner.query(`
      DELETE FROM "param" WHERE code IN (
        'ACCESS_TOKEN_EXPIRATION',
        'REFRESH_TOKEN_EXPIRATION',
        'MAXIMUM_FAILED_LOGIN',
        'BLOCK_NO_CHANGE_PASSWORD',
        'BLOCK_INACTIVE_ACCOUNT',
        'INACTIVE_ACCOUNT_IN',
        'UNIQUE_SESSION_PER_USER'
      );
    `);
  }
}
