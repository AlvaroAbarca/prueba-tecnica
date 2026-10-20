---
name: transactions
description: Guía para usar TransactionManager en use cases que necesitan atomicidad entre múltiples operaciones de repositorio. Usar cuando se crean, actualizan o eliminan datos en más de un repositorio en una misma operación.
---

# Transacciones con TransactionManager

El proyecto usa `AsyncLocalStorage` internamente para propagar el contexto transaccional. Los repositorios detectan automáticamente si hay una transacción activa, sin necesidad de cambios en su API.

El patrón oficial del repo es:

1. El use case coordina atomicidad con `TransactionManager.runInTransaction()`.
2. Los repositorios priorizan el manager del contexto transaccional (`transactionContext.getStore()`).
3. Si una operación necesita atomicidad propia y no existe contexto activo, el repositorio puede usar `dataSource.transaction(...)` como fallback.
4. No se debe abrir `createQueryRunner()` directamente en repositorios de dominio; ese control queda centralizado en `TransactionManagerDB`.

## Import

```typescript
import { TransactionManager } from '@modules/shared/domain/interface/transactionManager.interface';
```

## Patrón en Use Case

### 1. Inyectar en el constructor

```typescript
@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly logger: LogProvider,
    private readonly transactionManager: TransactionManager,
    private readonly orderRepository: OrderRepository,
    private readonly inventoryRepository: InventoryRepository,
  ) {}
```

### 2. Envolver operaciones en `runInTransaction`

```typescript
  async start(params: CreateOrderParams): Promise<OrderValues> {
    this.logger.debug(`INI | createOrder.useCase - params:${JSON.stringify(params)}`, this.constructor.name);
    try {
      const result = await this.transactionManager.runInTransaction(async () => {
        // Todas las operaciones aquí son atómicas
        const order = await this.orderRepository.create(Order.create(params));
        await this.inventoryRepository.decreaseStock(params.productId, params.quantity);
        return order;
      });

      this.logger.debug('END | createOrder.useCase', this.constructor.name);
      return result.getValues();

    } catch (error) {
      this.logger.error(`ERROR | createOrder.useCase ${JSON.stringify(error.message)}`, this.constructor.name);
      throw error;
    }
  }
```

## Ejemplo completo: múltiples repositorios

```typescript
@Injectable()
export class AddGuideEventUseCase {
  constructor(
    private readonly logger: LogProvider,
    private readonly transactionManager: TransactionManager,
    private readonly eventRepository: EventGuideRepository,
    private readonly guideRepository: GuideRepository,
  ) {}

  async start(params: AddGuideEventParams): Promise<EventGuideValues> {
    this.logger.debug(`INI | addGuideEvent.useCase - params:${JSON.stringify(params)}`, this.constructor.name);

    try {
      return await this.transactionManager.runInTransaction(async () => {
        // 1. Crear el evento
        const event = await this.eventRepository.create(EventGuide.create(params));

        // 2. Actualizar estado de la guía
        const guide = await this.guideRepository.find({ guideCode: params.guideCode });
        if (!guide) throw new BusinessException('Guía no encontrada');

        guide.setStatusCode(params.statusCode);
        await this.guideRepository.update(guide);

        return event.getValues();
      });
    } catch (error) {
      this.logger.error(`ERROR | addGuideEvent.useCase ${JSON.stringify(error.message)}`, this.constructor.name);
      throw error;
    }
  }
}
```

## Registrar en el módulo

```typescript
// <module>.module.ts
import { TransactionManager } from '@modules/shared/domain/interface/transactionManager.interface';
import { TransactionManagerDB } from '@modules/shared/infrastructure/persistences/transactionManagerDB';

@Module({
  providers: [
    AddGuideEventUseCase,
    { provide: TransactionManager, useClass: TransactionManagerDB },
    { provide: OrderRepository, useClass: OrderRepositoryDB },
    { provide: InventoryRepository, useClass: InventoryRepositoryDB },
  ],
})
export class OrdersModule {}
```

## Cómo funciona internamente

```
runInTransaction(callback)
  └─> Crea QueryRunner + EntityManager transaccional
      └─> AsyncLocalStorage.run(entityManager, callback)
          └─> Repositorio.create()  →  detecta el EntityManager via getStore()
          └─> Repositorio.update()  →  mismo EntityManager
      └─> COMMIT si ok / ROLLBACK si error
```

Los repositorios extienden `RepositoryBaseDB`, que usa `transactionContext.getStore()` en `getManager()`. Si no hay transacción activa, usa el manager normal.

## Patrón permitido en repositorios

Cuando un repositorio necesita varias escrituras internas atómicas, debe respetar primero el contexto activo y solo después usar fallback local.

```typescript
private getManager(): EntityManager {
  const transactionalManager = transactionContext.getStore();
  return transactionalManager || this.manager;
}

private async executeInTransaction<T>(operation: (manager: EntityManager) => Promise<T>): Promise<T> {
  const transactionalManager = transactionContext.getStore();

  if (transactionalManager) {
    return operation(transactionalManager);
  }

  return this.dataSource.transaction(async (manager) => operation(manager));
}
```

Uso recomendado:

```typescript
async updateAggregate(values: AggregateValues): Promise<Aggregate> {
  return this.executeInTransaction(async (manager) => {
    await manager.update(EntityA, values.id, values);
    await manager.delete(EntityB, { aggregateId: values.id });
    await manager.save(EntityB, values.items);

    const updated = await manager.findOne(EntityA, { where: { id: values.id } });
    return Aggregate.create(updated);
  });
}
```

Este patrón evita transacciones paralelas cuando el repositorio es invocado dentro de `runInTransaction()`.

## Matriz rápida de compatibilidad

- `RepositoryBaseDB`: compatible por defecto, porque resuelve `getManager()` desde el contexto.
- Repositorios personalizados con múltiples escrituras: compatibles si usan `transactionContext.getStore()` y `dataSource.transaction(...)` solo como fallback.
- Operaciones con locking pesimista: pueden usar fallback local justificado, pero deben reutilizar el manager contextual si ya existe.
- `createQueryRunner()` fuera de `TransactionManagerDB`: no permitido como patrón general.

## Reglas

- Usar `runInTransaction` **solo cuando hay más de una operación de escritura** que deben ser atómicas
- El callback debe ser `async` y retornar el resultado final
- Si una operación falla dentro del callback, el rollback es automático
- No anidar `runInTransaction` — el contexto AsyncLocalStorage no soporta transacciones anidadas
- El `TransactionManager` se inyecta como **interface abstracta**, no la clase concreta
- Si un repositorio necesita transacción interna, primero debe reutilizar el contexto activo antes de abrir fallback local
- Evitar `createQueryRunner()` en repositorios; usar `TransactionManagerDB` o `dataSource.transaction(...)` como fallback controlado
- Después de implementar cambios transaccionales, validar con pruebas de rollback multi-repo

## Checklist de implementación

1. Identificar si el use case coordina dos o más escrituras relacionadas.
2. Envolver el flujo en `runInTransaction()` desde el use case.
3. Verificar que los repositorios usados sean compatibles con manager contextual.
4. Si un repositorio personalizado maneja varias escrituras, implementar helper `executeInTransaction()` con prioridad al contexto activo.
5. Ejecutar pruebas del módulo afectado.
6. Agregar o actualizar una prueba que cubra rollback cuando falla una operación intermedia.
