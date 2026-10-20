import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImgColumnToUser1754085017160 implements MigrationInterface {
  name = 'AddImgColumnToUser1754085017160';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "img" character varying(256)`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetPasswordToken"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "resetPasswordToken" character varying(100)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetPasswordToken"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "resetPasswordToken" text`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "img"`);
  }
}
