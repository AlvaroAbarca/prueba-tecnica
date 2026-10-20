import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionTokenToUser1757514524357 implements MigrationInterface {
  name = 'AddSessionTokenToUser1757514524357';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "sessionToken" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "sessionToken"`);
  }
}
