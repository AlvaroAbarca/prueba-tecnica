import { MigrationInterface, QueryRunner } from 'typeorm';

export class UniqueFields1753479162924 implements MigrationInterface {
  name = 'UniqueFields1753479162924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "profileRole" ADD CONSTRAINT "UQ_7cc566818f30bbe37f3ea9c4a40" UNIQUE ("profileId", "roleId")`);
    await queryRunner.query(`ALTER TABLE "userProfile" ADD CONSTRAINT "UQ_2acf072e6dff6bdaf0177012376" UNIQUE ("profileId", "userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "userProfile" DROP CONSTRAINT "UQ_2acf072e6dff6bdaf0177012376"`);
    await queryRunner.query(`ALTER TABLE "profileRole" DROP CONSTRAINT "UQ_7cc566818f30bbe37f3ea9c4a40"`);
  }
}
