import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertTimestampToTimestamptz1779315295662 implements MigrationInterface {
  name = 'ConvertTimestampToTimestamptz1779315295662';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
        ALTER COLUMN "createdAt"           TYPE timestamptz USING "createdAt"           AT TIME ZONE 'UTC',
        ALTER COLUMN "updatedAt"           TYPE timestamptz USING "updatedAt"           AT TIME ZONE 'UTC',
        ALTER COLUMN "deletedAt"           TYPE timestamptz USING "deletedAt"           AT TIME ZONE 'UTC',
        ALTER COLUMN "lastLoginDate"       TYPE timestamptz USING "lastLoginDate"       AT TIME ZONE 'UTC',
        ALTER COLUMN "lastPasswordUpdate"  TYPE timestamptz USING "lastPasswordUpdate"  AT TIME ZONE 'UTC',
        ALTER COLUMN "lastFailLogDate"     TYPE timestamptz USING "lastFailLogDate"     AT TIME ZONE 'UTC',
        ALTER COLUMN "resetPasswordDate"   TYPE timestamptz USING "resetPasswordDate"   AT TIME ZONE 'UTC',
        ALTER COLUMN "tokenExpiration"     TYPE timestamptz USING "tokenExpiration"     AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "role"
        ALTER COLUMN "createdAt" TYPE timestamptz USING "createdAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "updatedAt" TYPE timestamptz USING "updatedAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "deletedAt" TYPE timestamptz USING "deletedAt" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "profile"
        ALTER COLUMN "createdAt" TYPE timestamptz USING "createdAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "updatedAt" TYPE timestamptz USING "updatedAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "deletedAt" TYPE timestamptz USING "deletedAt" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "profileRole"
        ALTER COLUMN "createdAt" TYPE timestamptz USING "createdAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "updatedAt" TYPE timestamptz USING "updatedAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "deletedAt" TYPE timestamptz USING "deletedAt" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "userProfile"
        ALTER COLUMN "createdAt" TYPE timestamptz USING "createdAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "updatedAt" TYPE timestamptz USING "updatedAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "deletedAt" TYPE timestamptz USING "deletedAt" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "auditorLog"
        ALTER COLUMN "createdAt" TYPE timestamptz USING "createdAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "updatedAt" TYPE timestamptz USING "updatedAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "deletedAt" TYPE timestamptz USING "deletedAt" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "param"
        ALTER COLUMN "createdAt" TYPE timestamptz USING "createdAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "updatedAt" TYPE timestamptz USING "updatedAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "deletedAt" TYPE timestamptz USING "deletedAt" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "messages"
        ALTER COLUMN "publicationDate"   TYPE timestamptz USING "publicationDate"   AT TIME ZONE 'UTC',
        ALTER COLUMN "publicationFinish" TYPE timestamptz USING "publicationFinish" AT TIME ZONE 'UTC',
        ALTER COLUMN "createdAt"         TYPE timestamptz USING "createdAt"         AT TIME ZONE 'UTC',
        ALTER COLUMN "updatedAt"         TYPE timestamptz USING "updatedAt"         AT TIME ZONE 'UTC',
        ALTER COLUMN "deletedAt"         TYPE timestamptz USING "deletedAt"         AT TIME ZONE 'UTC'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      ALTER TABLE "messages"
        ALTER COLUMN "publicationDate"   TYPE timestamp USING "publicationDate"   AT TIME ZONE 'UTC',
        ALTER COLUMN "publicationFinish" TYPE timestamp USING "publicationFinish" AT TIME ZONE 'UTC',
        ALTER COLUMN "createdAt"         TYPE timestamp USING "createdAt"         AT TIME ZONE 'UTC',
        ALTER COLUMN "updatedAt"         TYPE timestamp USING "updatedAt"         AT TIME ZONE 'UTC',
        ALTER COLUMN "deletedAt"         TYPE timestamp USING "deletedAt"         AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "param"
        ALTER COLUMN "createdAt" TYPE timestamp USING "createdAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "updatedAt" TYPE timestamp USING "updatedAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "deletedAt" TYPE timestamp USING "deletedAt" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "auditorLog"
        ALTER COLUMN "createdAt" TYPE timestamp USING "createdAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "updatedAt" TYPE timestamp USING "updatedAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "deletedAt" TYPE timestamp USING "deletedAt" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "userProfile"
        ALTER COLUMN "createdAt" TYPE timestamp USING "createdAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "updatedAt" TYPE timestamp USING "updatedAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "deletedAt" TYPE timestamp USING "deletedAt" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "profileRole"
        ALTER COLUMN "createdAt" TYPE timestamp USING "createdAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "updatedAt" TYPE timestamp USING "updatedAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "deletedAt" TYPE timestamp USING "deletedAt" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "profile"
        ALTER COLUMN "createdAt" TYPE timestamp USING "createdAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "updatedAt" TYPE timestamp USING "updatedAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "deletedAt" TYPE timestamp USING "deletedAt" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "role"
        ALTER COLUMN "createdAt" TYPE timestamp USING "createdAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "updatedAt" TYPE timestamp USING "updatedAt" AT TIME ZONE 'UTC',
        ALTER COLUMN "deletedAt" TYPE timestamp USING "deletedAt" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "user"
        ALTER COLUMN "createdAt"           TYPE timestamp USING "createdAt"           AT TIME ZONE 'UTC',
        ALTER COLUMN "updatedAt"           TYPE timestamp USING "updatedAt"           AT TIME ZONE 'UTC',
        ALTER COLUMN "deletedAt"           TYPE timestamp USING "deletedAt"           AT TIME ZONE 'UTC',
        ALTER COLUMN "lastLoginDate"       TYPE timestamp USING "lastLoginDate"       AT TIME ZONE 'UTC',
        ALTER COLUMN "lastPasswordUpdate"  TYPE timestamp USING "lastPasswordUpdate"  AT TIME ZONE 'UTC',
        ALTER COLUMN "lastFailLogDate"     TYPE timestamp USING "lastFailLogDate"     AT TIME ZONE 'UTC',
        ALTER COLUMN "resetPasswordDate"   TYPE timestamp USING "resetPasswordDate"   AT TIME ZONE 'UTC',
        ALTER COLUMN "tokenExpiration"     TYPE timestamp USING "tokenExpiration"     AT TIME ZONE 'UTC'
    `);
  }
}
