import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { TransactionManager } from '../../domain/interface/transactionManager.interface';
import { AsyncLocalStorage } from 'node:async_hooks';
import { v4 } from 'uuid';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';

/**
 * Storage para mantener el contexto transaccional usando AsyncLocalStorage
 * Esto permite que los repositorios accedan al EntityManager de la transacción
 * sin necesidad de pasarlo explícitamente
 */
export const transactionContext = new AsyncLocalStorage<EntityManager>();
export const transactionIdContext = new AsyncLocalStorage<string>();

export function getTransactionId(): string | undefined {
  return transactionIdContext.getStore();
}

@Injectable()
export class TransactionManagerDB implements TransactionManager {
  constructor(
    @InjectDataSource('postgres') private readonly dataSource: DataSource,
    private readonly logger: LogProvider,
  ) {}

  private buildQueryRunnerLogContext(queryRunner: QueryRunner) {
    return {
      isReleased: queryRunner.isReleased,
      isTransactionActive: queryRunner.isTransactionActive,
      data: queryRunner.data,
      connectionType: queryRunner.connection?.options?.type,
    };
  }

  async runInTransaction<T>(operation: () => Promise<T>): Promise<T> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const transactionId = `TXN_${v4().replaceAll('-', '').substring(0, 9)}`;

    try {
      this.logger.info(`INI - Transaction: ${transactionId}`, {
        className: this.constructor.name,
        queryRunner: this.buildQueryRunnerLogContext(queryRunner),
      });
      const result = await transactionIdContext.run(transactionId, () => transactionContext.run(queryRunner.manager, () => operation()));
      await queryRunner.commitTransaction();
      this.logger.info(`END - Transaction: ${transactionId}`, {
        className: this.constructor.name,
        queryRunner: this.buildQueryRunnerLogContext(queryRunner),
      });
      return result;
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`ERROR - Transaction [Rollback]: ${transactionId} due to error: ${errorMessage}`, {
        className: this.constructor.name,
        queryRunner: this.buildQueryRunnerLogContext(queryRunner),
        error,
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async runMultipleInTransaction<T extends any[]>(operations: Array<() => Promise<T[number]>>): Promise<T> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const transactionId = `TXN_${v4().replaceAll('-', '').substring(0, 9)}`;

    try {
      this.logger.info(`INI - Transaction: ${transactionId}`, {
        className: this.constructor.name,
        queryRunner: this.buildQueryRunnerLogContext(queryRunner),
      });
      const results = await transactionIdContext.run(transactionId, () =>
        transactionContext.run(queryRunner.manager, async () => {
          const res = [] as any[];
          for (const operation of operations) {
            res.push(await operation());
          }
          return res;
        }),
      );
      await queryRunner.commitTransaction();
      this.logger.info(`END - Transaction: ${transactionId}`, {
        className: this.constructor.name,
        queryRunner: this.buildQueryRunnerLogContext(queryRunner),
      });
      return results as T;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`ERROR - Transaction [Rollback]: ${transactionId} due to error: ${errorMessage}`, {
        className: this.constructor.name,
        queryRunner: this.buildQueryRunnerLogContext(queryRunner),
        error,
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
