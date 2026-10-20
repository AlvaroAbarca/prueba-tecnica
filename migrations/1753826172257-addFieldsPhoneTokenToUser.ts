import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldsPhoneTokenToUser1753826172257 implements MigrationInterface {
  name = 'AddFieldsPhoneTokenToUser1753826172257';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "phone" character varying(50) NOT NULL DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "user" ADD "token" text`);
    await queryRunner.query(`ALTER TABLE "user" ADD "tokenExpiration" timestamp`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tokenExpiration"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "token"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone"`);
  }
}
