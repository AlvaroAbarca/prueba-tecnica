---
name: testing
description: Guía para escribir tests unitarios de use cases en NestJS. Usar cuando se crean o corrigen tests de use cases, mocks de repositorios o servicios.
---

# Testing de Use Cases

Este proyecto usa **Jest** con **NestJS Testing Module**. Los tests viven en `test/` replicando la estructura de `src/modules/`.

## Estructura de archivos

```
test/
└── <module>/
    └── <action>.useCase.spec.ts
```

## Patrón estándar de un test de Use Case

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { configure } from 'log4js';
import { MyUseCase } from '@modules/<module>/application/useCases/my.useCase';
import { MyRepository } from '@modules/<module>/domain/interfaces/myRepository.interface';
import { MyRepositoryMock, MyRepositoryMockError, MyRepositoryMockNotFound } from '@modules/<module>/infraestructure/persistences/my.repository.mock';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { LogProviderMock } from '@modules/shared/infrastructure/providers/log/logProvider.mock';

describe('MyUseCase', () => {
  let useCase: MyUseCase;
  let useCaseError: MyUseCase;
  let useCaseNotFound: MyUseCase;

  beforeAll(() => {
    configure({
      appenders: { console: { type: 'console' } },
      categories: { default: { appenders: ['console'], level: 'fatal' } },
    });
  });

  async function createTestingModule(repoMock: any): Promise<TestingModule> {
    return Test.createTestingModule({
      providers: [MyUseCase, { provide: MyRepository, useClass: repoMock }, { provide: LogProvider, useClass: LogProviderMock }],
    }).compile();
  }

  beforeEach(async () => {
    const okModule = await createTestingModule(MyRepositoryMock);
    const errorModule = await createTestingModule(MyRepositoryMockError);
    const notFoundModule = await createTestingModule(MyRepositoryMockNotFound);

    useCase = okModule.get<MyUseCase>(MyUseCase);
    useCaseError = errorModule.get<MyUseCase>(MyUseCase);
    useCaseNotFound = notFoundModule.get<MyUseCase>(MyUseCase);
  });

  it('happy path', async () => {
    const result = await useCase.start({ id: '123' });
    expect(result).toBeDefined();
    // Assert expected structure
  });

  it('error path, 500', async () => {
    try {
      await useCaseError.start({ id: '123' });
    } catch (error) {
      expect(error.message).toEqual('Error mock');
    }
  });

  it('not found path', async () => {
    try {
      await useCaseNotFound.start({ id: '999' });
    } catch (error) {
      expect(error.message).toContain('not found');
    }
  });
});
```

## Patrón de Mock de Repositorio

Los mocks viven junto a la implementación real en `infrastructure/persistences/`:

```typescript
// <module>/infraestructure/persistences/my.repository.mock.ts

// Happy path
export class MyRepositoryMock {
  async find(_filter: any) {
    return MyModel.create({
      id: '123',
      name: 'Test',
      // ... todos los campos
    });
  }

  async create(model: MyModel) {
    return model;
  }

  async update(_id: string, _data: any) {
    return MyModel.create({ id: '123', name: 'Updated' });
  }
}

// Error path (lanza excepción genérica)
export class MyRepositoryMockError {
  async find(_filter: any): Promise<any> {
    throw new Error('Error mock');
  }

  async create(_model: any): Promise<any> {
    throw new Error('Error mock');
  }
}

// Not found path (retorna null)
export class MyRepositoryMockNotFound {
  async find(_filter: any): Promise<null> {
    return null;
  }
}
```

## Reglas

- **Siempre** cubrir 3 paths: ok, error (500), not found
- Usar `configure` de `log4js` en `beforeAll` con level `fatal` para suprimir logs
- Usar `{ provide: AbstractClass, useClass: MockClass }` — nunca strings como tokens
- El `LogProvider` siempre debe ser mockeado con `LogProviderMock`
- Los mocks deben implementar **todos** los métodos del repositorio abstract
- Nombrar los archivos spec como `<action>.useCase.spec.ts`

## Comandos

```bash
# Correr todos los tests
npm run test

# Correr un test específico
npm run test -- --testPathPattern='myUseCaseName'

# Correr tests de un módulo
npm run test -- --testPathPattern='modules/users'

# Watch mode
npm run test:watch
```
