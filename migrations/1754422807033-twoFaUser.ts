import { MigrationInterface, QueryRunner } from 'typeorm';

export class TwoFaUser1754422807033 implements MigrationInterface {
  name = 'TwoFaUser1754422807033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "enable2fa" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "user" ADD "secret2fa" character varying(256)`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetPasswordToken"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "resetPasswordToken" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetPasswordToken"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "resetPasswordToken" character varying(100)`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "secret2fa"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "enable2fa"`);
  }
}
