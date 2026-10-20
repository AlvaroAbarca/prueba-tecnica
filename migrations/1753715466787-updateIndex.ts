import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateIndex1753715466787 implements MigrationInterface {
  name = 'UpdateIndex1753715466787';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_a339c371fd2cbbede0cc979736"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d657bc484996083a6cbec91828"`);
    await queryRunner.query(`CREATE INDEX "IDX_a339c371fd2cbbede0cc979736" ON "param" ("code") `);
    await queryRunner.query(`CREATE INDEX "IDX_d657bc484996083a6cbec91828" ON "param" ("type") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_d657bc484996083a6cbec91828"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a339c371fd2cbbede0cc979736"`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d657bc484996083a6cbec91828" ON "param" ("type") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a339c371fd2cbbede0cc979736" ON "param" ("code") `);
  }
}
