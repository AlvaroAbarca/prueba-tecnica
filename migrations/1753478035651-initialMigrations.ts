import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigrations1753478035651 implements MigrationInterface {
  name = 'InitialMigrations1753478035651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "role" ("id" SERIAL NOT NULL, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(), "deletedAt" timestamp, "title" character varying(100) NOT NULL DEFAULT '', "code" character varying(100) NOT NULL, "description" character varying(100) NOT NULL DEFAULT '', "enabled" boolean NOT NULL DEFAULT true, "order" integer, "visible" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_ee999bb389d7ac0fd967172c41f" UNIQUE ("code"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profileRole" ("id" SERIAL NOT NULL, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(), "deletedAt" timestamp, "profileId" integer NOT NULL, "roleId" integer NOT NULL, CONSTRAINT "PK_613e27e68ffaeb6f71ae301c5ed" PRIMARY KEY ("id", "profileId", "roleId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile" ("id" SERIAL NOT NULL, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(), "deletedAt" timestamp, "title" character varying(50) NOT NULL DEFAULT '', "code" character varying(50) NOT NULL, "description" character varying(100) NOT NULL DEFAULT '', "enabled" boolean NOT NULL DEFAULT true, "order" integer, "visible" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_ec49dd4bcbdee70e6db31220369" UNIQUE ("code"), CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "userProfile" ("id" SERIAL NOT NULL, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(), "deletedAt" timestamp, "userId" integer NOT NULL, "profileId" integer NOT NULL, CONSTRAINT "PK_58f0560ee2efa6d366128ce3daa" PRIMARY KEY ("id", "userId", "profileId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(), "deletedAt" timestamp, "rut" character varying(14), "firstName" character varying(100) NOT NULL DEFAULT '', "lastName" character varying(100) NOT NULL DEFAULT '', "email" character varying(50) NOT NULL, "emailVerified" boolean NOT NULL DEFAULT false, "password" character varying(100), "order" integer, "visible" boolean NOT NULL DEFAULT true, "enabled" boolean NOT NULL DEFAULT true, "comment" character varying(50) NOT NULL DEFAULT '', "lastLoginDate" timestamp, "lastLoginIp" character varying(50) DEFAULT '', "lastPasswordUpdate" timestamp, "lastFailLogDate" timestamp, "timeZoneCode" character varying(30) NOT NULL DEFAULT 'America/Santiago', "languageCode" character varying(10) NOT NULL DEFAULT 'es', "resetPasswordToken" character varying(100), "resetPasswordDate" timestamp, "failedLoginAttempts" integer NOT NULL DEFAULT '0', "logout" boolean NOT NULL DEFAULT false, "authProvider" character varying(30) NOT NULL DEFAULT '', "iata" character varying(5),  CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")); COMMENT ON COLUMN "user"."email" IS 'Email address of the user'; COMMENT ON COLUMN "user"."lastLoginIp" IS 'IP address of the last login'`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9f839e522b3b8c8c8223cde81d" ON "user" ("rut") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
    await queryRunner.query(
      `CREATE TABLE "auditorLog" ("id" SERIAL NOT NULL, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(), "deletedAt" timestamp, "emailUser" character varying(50) NOT NULL, "ip" character varying(50), "type" character varying(50), "description" character varying(100), "dataJson" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_55f0d94d3126b3de0d991232988" PRIMARY KEY ("id")); COMMENT ON COLUMN "auditorLog"."emailUser" IS 'Email address of the user'`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_cf453a2ba0945b5b6e4baffaa4" ON "auditorLog" ("emailUser") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_72a9eafa474d4ddc4f073845c1" ON "auditorLog" ("ip") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_06a9e699e36d3c204778038562" ON "auditorLog" ("type") `);
    await queryRunner.query(
      `CREATE TABLE "param" ("id" SERIAL NOT NULL, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(), "deletedAt" timestamp, "title" character varying(50) NOT NULL DEFAULT '', "code" character varying(50), "description" character varying(100), "type" character varying(50) NOT NULL, "subType" character varying(50), "externalCode" character varying(50), "value" text, "enabled" boolean NOT NULL DEFAULT true, "visible" boolean NOT NULL DEFAULT true, "order" integer, "parentId" integer, "customProperties" jsonb, CONSTRAINT "PK_954cb8cfb3627c778c6798a487a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a339c371fd2cbbede0cc979736" ON "param" ("code") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d657bc484996083a6cbec91828" ON "param" ("type") `);
    await queryRunner.query(
      `ALTER TABLE "profileRole" ADD CONSTRAINT "FK_d44bf96f8812f38e849537730f7" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profileRole" ADD CONSTRAINT "FK_fb10ab77baf4abf4584bcfc981e" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "userProfile" ADD CONSTRAINT "FK_5df2b278db38a0f6ca21c634ab1" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "userProfile" ADD CONSTRAINT "FK_fd6145155701ec2e0f503d72fa4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "param" ADD CONSTRAINT "FK_1fae9d529a95faf14de7b4bb6ac" FOREIGN KEY ("parentId") REFERENCES "param"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "param" DROP CONSTRAINT "FK_1fae9d529a95faf14de7b4bb6ac"`);
    await queryRunner.query(`ALTER TABLE "userProfile" DROP CONSTRAINT "FK_fd6145155701ec2e0f503d72fa4"`);
    await queryRunner.query(`ALTER TABLE "userProfile" DROP CONSTRAINT "FK_5df2b278db38a0f6ca21c634ab1"`);
    await queryRunner.query(`ALTER TABLE "profileRole" DROP CONSTRAINT "FK_fb10ab77baf4abf4584bcfc981e"`);
    await queryRunner.query(`ALTER TABLE "profileRole" DROP CONSTRAINT "FK_d44bf96f8812f38e849537730f7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d657bc484996083a6cbec91828"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a339c371fd2cbbede0cc979736"`);
    await queryRunner.query(`DROP TABLE "param"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_06a9e699e36d3c204778038562"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_72a9eafa474d4ddc4f073845c1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cf453a2ba0945b5b6e4baffaa4"`);
    await queryRunner.query(`DROP TABLE "auditorLog"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9f839e522b3b8c8c8223cde81d"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "userProfile"`);
    await queryRunner.query(`DROP TABLE "profile"`);
    await queryRunner.query(`DROP TABLE "profileRole"`);
    await queryRunner.query(`DROP TABLE "role"`);
  }
}
