import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { TransactionManagerDB, transactionContext } from '@modules/shared/infrastructure/persistences/transactionManagerDB';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';

describe('TransactionManagerDB', () => {
  let transactionManager: TransactionManagerDB;

  const mockManager = {} as EntityManager;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: mockManager,
  } as unknown as QueryRunner;

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  } as unknown as DataSource;

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionManagerDB, { provide: 'postgresDataSource', useValue: mockDataSource }, { provide: LogProvider, useValue: mockLogger }],
    }).compile();

    // NestJS registra el DataSource inyectado con @InjectDataSource('postgres') bajo este token
    transactionManager = module.get(TransactionManagerDB);
    jest.clearAllMocks();
    mockDataSource.createQueryRunner = jest.fn().mockReturnValue(mockQueryRunner);
  });

  describe('runInTransaction', () => {
    it('debería ejecutar la operación, hacer commit y retornar el resultado', async () => {
      const expectedResult = { id: 1 };
      const operation = jest.fn().mockResolvedValue(expectedResult);

      const result = await transactionManager.runInTransaction(operation);

      expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(operation).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(result).toBe(expectedResult);
    });

    it('debería proporcionar el EntityManager de la transacción via AsyncLocalStorage', async () => {
      let capturedManager: EntityManager | undefined;
      const operation = jest.fn().mockImplementation(async () => {
        capturedManager = transactionContext.getStore();
        return 'ok';
      });

      await transactionManager.runInTransaction(operation);

      expect(capturedManager).toBe(mockManager);
    });

    it('debería hacer rollback y relanzar el error si la operación falla', async () => {
      const error = new Error('fallo en operación');
      const operation = jest.fn().mockRejectedValue(error);

      await expect(transactionManager.runInTransaction(operation)).rejects.toThrow(error);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
    });

    it('debería mantener atomicidad multi-repo y hacer rollback cuando falla la segunda operación', async () => {
      const executionTrace: string[] = [];
      const repoA = {
        create: jest.fn().mockImplementation(async () => {
          const manager = transactionContext.getStore();
          if (!manager) {
            throw new Error('manager transaccional no disponible en repoA');
          }
          executionTrace.push('repoA:create');
          return { id: 1 };
        }),
      };
      const repoBError = new Error('fallo en repoB');
      const repoB = {
        update: jest.fn().mockImplementation(async () => {
          const manager = transactionContext.getStore();
          if (!manager) {
            throw new Error('manager transaccional no disponible en repoB');
          }
          executionTrace.push('repoB:update');
          throw repoBError;
        }),
      };

      const operation = jest.fn(async () => {
        await repoA.create();
        await repoB.update();
      });

      await expect(transactionManager.runInTransaction(operation)).rejects.toThrow(repoBError);

      expect(repoA.create).toHaveBeenCalledTimes(1);
      expect(repoB.update).toHaveBeenCalledTimes(1);
      expect(executionTrace).toEqual(['repoA:create', 'repoB:update']);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('debería liberar el queryRunner aunque ocurra un error', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('error'));

      await expect(transactionManager.runInTransaction(operation)).rejects.toThrow();

      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('runMultipleInTransaction', () => {
    it('debería ejecutar todas las operaciones en orden y retornar los resultados', async () => {
      const op1 = jest.fn().mockResolvedValue('resultado1');
      const op2 = jest.fn().mockResolvedValue('resultado2');

      const results = await transactionManager.runMultipleInTransaction([op1, op2]);

      expect(op1).toHaveBeenCalledTimes(1);
      expect(op2).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
      expect(results).toEqual(['resultado1', 'resultado2']);
    });

    it('debería hacer rollback si alguna operación falla', async () => {
      const error = new Error('fallo en op2');
      const op1 = jest.fn().mockResolvedValue('resultado1');
      const op2 = jest.fn().mockRejectedValue(error);

      await expect(transactionManager.runMultipleInTransaction([op1, op2])).rejects.toThrow(error);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('debería liberar el queryRunner aunque ocurra un error', async () => {
      const op1 = jest.fn().mockRejectedValue(new Error('error'));

      await expect(transactionManager.runMultipleInTransaction([op1])).rejects.toThrow();

      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });
  });
});
