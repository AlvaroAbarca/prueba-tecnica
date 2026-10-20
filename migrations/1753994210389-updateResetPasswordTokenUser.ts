import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateResetPasswordTokenUser1753994210389 implements MigrationInterface {
  name = 'UpdateResetPasswordTokenUser1753994210389';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetPasswordToken"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "resetPasswordToken" text`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "phone" character varying(30) NOT NULL DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "phone" character varying(50) NOT NULL DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetPasswordToken"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "resetPasswordToken" character varying(100)`);
  }
}
