import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetDatabaseTimezoneUTC1753478035650 implements MigrationInterface {
  name = 'SetDatabaseTimezoneUTC1753478035650';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const res: any = await queryRunner.query(`SELECT current_database() as db`);
    const db = res && res[0] && (res[0].db || res[0].current_database);
    if (!db) return;
    await queryRunner.query(`ALTER DATABASE "${db}" SET timezone = 'UTC'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const res: any = await queryRunner.query(`SELECT current_database() as db`);
    const db = res && res[0] && (res[0].db || res[0].current_database);
    if (!db) return;
    await queryRunner.query(`ALTER DATABASE "${db}" RESET timezone`);
  }
}
