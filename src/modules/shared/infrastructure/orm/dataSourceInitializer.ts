import { AppDataSource } from './dataSource';

export class DataSourceInitializer {
  static async initializeAndRunMigrations() {
    await AppDataSource.initialize();
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      // Bloqueo: solo un contenedor ejecuta las migraciones a la vez.
      await queryRunner.query('SELECT pg_advisory_lock($1::bigint)', [1234567890]);
      const migrations = await AppDataSource.runMigrations();
      for (const migration of migrations) {
        console.log(`[Migration] Executed: ${migration.name}`);
      }
      globalThis.initialized = true;
    } catch (error) {
      globalThis.initialized = false;
      throw error;
    } finally {
      await queryRunner.query('SELECT pg_advisory_unlock($1::bigint)', [1234567890]);
      await queryRunner.release();
      await AppDataSource.destroy();
    }
  }
}
