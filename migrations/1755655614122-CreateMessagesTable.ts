import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMessagesTable1755655614122 implements MigrationInterface {
  name = 'CreateMessagesTable1755655614122';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" SERIAL PRIMARY KEY,
        "receiver" VARCHAR(256) NOT NULL,
        "type" VARCHAR(50) NOT NULL,
        "title" VARCHAR(256) NOT NULL,
        "message" TEXT NOT NULL,
        "publicationDate" timestamp,
        "publicationFinish" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "deletedAt" timestamp
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "messages"`);
  }
}
