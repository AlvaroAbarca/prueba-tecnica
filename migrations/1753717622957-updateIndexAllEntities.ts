import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateIndexAllEntities1753717622957 implements MigrationInterface {
  name = 'UpdateIndexAllEntities1753717622957';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_9f839e522b3b8c8c8223cde81d"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cf453a2ba0945b5b6e4baffaa4"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_72a9eafa474d4ddc4f073845c1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_06a9e699e36d3c204778038562"`);
    await queryRunner.query(`CREATE INDEX "IDX_9f839e522b3b8c8c8223cde81d" ON "user" ("rut") `);
    await queryRunner.query(`CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
    await queryRunner.query(`CREATE INDEX "IDX_cf453a2ba0945b5b6e4baffaa4" ON "auditorLog" ("emailUser") `);
    await queryRunner.query(`CREATE INDEX "IDX_72a9eafa474d4ddc4f073845c1" ON "auditorLog" ("ip") `);
    await queryRunner.query(`CREATE INDEX "IDX_06a9e699e36d3c204778038562" ON "auditorLog" ("type") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_06a9e699e36d3c204778038562"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_72a9eafa474d4ddc4f073845c1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cf453a2ba0945b5b6e4baffaa4"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9f839e522b3b8c8c8223cde81d"`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_06a9e699e36d3c204778038562" ON "auditorLog" ("type") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_72a9eafa474d4ddc4f073845c1" ON "auditorLog" ("ip") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_cf453a2ba0945b5b6e4baffaa4" ON "auditorLog" ("emailUser") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9f839e522b3b8c8c8223cde81d" ON "user" ("rut") `);
  }
}
