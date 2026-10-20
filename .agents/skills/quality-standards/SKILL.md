---
name: quality-standards
description: Workflow obligatorio al crear o modificar cualquier use case. Exige que el agente cree el test de cobertura correspondiente y que todo el código cumpla con ESLint y Prettier antes de finalizar la tarea.
---

# Estándares de Calidad — Testing + Linting + Formato

**Toda implementación nueva debe cumplir estos tres requisitos antes de considerarse terminada:**

1. Test unitario del use case creado
2. Sin errores de ESLint
3. Sin errores de Prettier

---

## 1. Test de cobertura obligatorio

Cada use case **nuevo o modificado** requiere su spec en `test/<module>/`:

```
test/
└── <module>/
    └── <action>.useCase.spec.ts   ← obligatorio
```

### Qué debe cubrir el spec

| Caso                 | Descripción                                                                       |
| -------------------- | --------------------------------------------------------------------------------- |
| **Happy path**       | El use case ejecuta y retorna el resultado esperado                               |
| **Error path (500)** | El repositorio lanza una excepción genérica (`Error mock`)                        |
| **Not found path**   | El repositorio retorna `null`; el use case lanza la excepción de dominio correcta |

> Si el use case tiene más de una rama de negocio (condicionales, estados), cada rama necesita su propio `it()`.

### Qué archivos requiere la cobertura

La cobertura de Jest solo mide `application/useCases/` (ver `jest.config.js`). Toda la infraestructura, domain models, value objects e interfaces están excluidas. Por esto **no es necesario** agregar tests para repositorios, DTOs, controladores ni value objects.

### Patrón de spec (ver SKILL de testing para detalle completo)

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

---

## 2. Estándares ESLint

El proyecto usa **ESLint con TypeScript** (`@typescript-eslint`) y la integración de Prettier como regla de lint.

### Reglas activas más relevantes

```
@typescript-eslint/no-explicit-any        → off  (permitido)
@typescript-eslint/no-unused-vars         → off en tests/mocks
@typescript-eslint/no-empty-function      → off en tests/mocks
prettier/prettier                         → error (bloqueante)
```

### Cómo verificar

```bash
npm run lint         # Ver errores
npm run lint:fix     # Auto-corregir
```

### Errores comunes a evitar

- Variables declaradas y nunca usadas → eliminar o prefixar con `_` si es param
- Imports no usados → eliminar siempre
- `any` implícito en parámetros de función → tipar o usar `any` explícito
- Comparaciones `==` en lugar de `===`

---

## 3. Estándares Prettier

Configuración en `.prettierrc`:

| Opción          | Valor                                            |
| --------------- | ------------------------------------------------ |
| `singleQuote`   | `true` — comillas simples                        |
| `trailingComma` | `all` — coma final en objetos, arrays, params    |
| `tabWidth`      | `2` — 2 espacios                                 |
| `useTabs`       | `false` — espacios, no tabs                      |
| `semi`          | `true` — punto y coma obligatorio                |
| `printWidth`    | `170` — líneas de hasta 170 caracteres           |
| `endOfLine`     | `lf` — saltos de línea Unix                      |
| `arrowParens`   | `always` — siempre paréntesis en arrow functions |

### Cómo verificar y corregir

```bash
npm run format       # Auto-formatea todos los archivos
npm run formatLint   # Format + lint en secuencia (recomendado antes de commit)
```

---

## Checklist antes de terminar una implementación

Antes de dar por finalizada cualquier tarea, verificar:

- [ ] Se creó `test/<module>/<action>.useCase.spec.ts`
- [ ] El spec cubre happy path, error path y not found path
- [ ] Se crearon los mocks necesarios en `infraestructure/persistences/<entity>.repository.mock.ts`
- [ ] `npm run lint:fix` ejecuta sin errores bloqueantes
- [ ] `npm run format` no modifica los archivos recién creados (ya están formateados)
- [ ] `npm run test -- --testPathPattern='<action>'` pasa sin fallos

---

## Antes de commitear

Ejecutar `npm run lint:fix && npm run format` sobre los archivos tocados. El repositorio no instala hooks de git.
