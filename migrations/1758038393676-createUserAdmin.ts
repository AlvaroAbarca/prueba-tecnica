import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserAdmin1758038393676 implements MigrationInterface {
  name = 'CreateUserAdmin1758038393676';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO public."user"
      (id, "createdAt", "updatedAt", "deletedAt", rut, "firstName", "lastName", email, "emailVerified", "password", "order", visible, enabled, "comment", "lastLoginDate", "lastLoginIp", "lastPasswordUpdate", "lastFailLogDate", "timeZoneCode", "languageCode", "resetPasswordToken", "resetPasswordDate", "failedLoginAttempts", logout, "authProvider", "iata")
      VALUES
        (nextval('user_id_seq'::regclass), now(), now(), null, '99999999-9', 'Pedro', 'Postal', 'pedro.postal@correos.cl', true, '$2b$10$/byMgixypAyqtOtXtz14lOBPaj9kNAmHHaXHi.gLaNKR/BQQ5paAK', 0, true, true, 'Comentario', null, '', null, null, 'America/Santiago', 'es', '', null, 0, false, '', 'LVN')
      ON CONFLICT (email) DO NOTHING;`,
    );
    await queryRunner.query(`
        INSERT INTO profile (title, code, description, enabled, "order", visible)
        VALUES
          ('Administrador', 'ADMIN', 'Perfil administrador', true, 1, true)
        ON CONFLICT (code) DO NOTHING;
      `);
    await queryRunner.query(
      `-- Insertar relaciones entre usuarios y perfiles
      INSERT INTO "userProfile" ("userId", "profileId")
      SELECT
        u.id AS userId,
        p.id AS profileId
      FROM "user" u
      JOIN profile p ON
        CASE u.email
          WHEN 'juan.perez@correos.cl' THEN p.code = 'ADMIN'
          WHEN 'pedro.postal@correos.cl' THEN p.code = 'ADMIN'
          WHEN 'juan2@correos.cl' THEN p.code = 'ADMIN'
          WHEN 'juan3@correos.cl' THEN p.code = 'ADMIN'
          WHEN 'juan4@correos.cl' THEN p.code = 'ADMIN'
          WHEN 'juan5@correos.cl' THEN p.code = 'ADMIN'
        END
      ON CONFLICT ("userId", "profileId") DO NOTHING;
      `,
    );
    await queryRunner.query(`
      -- Insertar relaciones entre perfiles y roles
      INSERT INTO "profileRole" ("profileId", "roleId")
      SELECT
        p.id AS profileId,
        r.id AS roleId
      FROM profile p
      JOIN role r ON
        CASE p.code
          WHEN 'ADMIN' THEN true
        END
      WHERE p.code IN ('ADMIN')
      ON CONFLICT ("profileId", "roleId") DO NOTHING;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM public."user" WHERE email IN (
        'pedro.postal@correos.cl'
      );
    `);
  }
}
