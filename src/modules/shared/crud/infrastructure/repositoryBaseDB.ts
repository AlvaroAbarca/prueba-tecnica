import { TypeOrmCriteriaConverter } from '@modules/shared/criteria/infrastructure/typeormCriteriaConverter';
import { RepositoryBase } from '../domain/repositoryBase.interface';
import { DataSource, EntityManager, DeepPartial, EntityTarget, FindManyOptions } from 'typeorm';
import { Criteria } from '@modules/shared/criteria/domain/criteria';
import { transactionContext } from '../../infrastructure/persistences/transactionManagerDB';

type EntityInstance<Values> = {
  getValues(): Values;
};

type EntityModel<Values, Entity extends EntityInstance<Values>> = {
  new (...args: any[]): Entity;
  create(params: Values): Entity;
};

export class RepositoryBaseDB<Values, Entity extends EntityInstance<Values>> extends TypeOrmCriteriaConverter implements RepositoryBase<Entity, Values> {
  protected readonly manager: EntityManager;

  constructor(
    private readonly dataSource: DataSource,
    private readonly entityModel: EntityModel<Values, Entity>,
    private readonly entityDB: EntityTarget<Entity>,
  ) {
    super();
    this.manager = this.dataSource.manager;
  }

  /**
   * Obtiene el EntityManager actual.
   * Si hay una transacción activa, usa el manager de la transacción.
   * Si no, usa el manager por defecto.
   */
  protected getManager(): EntityManager {
    const transactionalManager = transactionContext.getStore();
    return transactionalManager || this.manager;
  }

  async create(entity: Partial<Entity>): Promise<Entity> {
    this.verifyBaseMethods(entity as Entity);
    const manager = this.getManager();
    const entityInstance = manager.create(this.entityDB, entity.getValues() as DeepPartial<Entity>);
    const savedEntity = await manager.save(entityInstance);
    return this.entityModel.create(savedEntity as unknown as Values);
  }

  async delete(ids: number[] | number): Promise<void> {
    const idArray = Array.isArray(ids) ? ids : [ids];
    const namePrimaryKey = this.dataSource.getMetadata(this.entityDB).primaryColumns[0].propertyName;
    const manager = this.getManager();
    await Promise.all(
      idArray.map(async (id) => {
        const entity = await manager.findOne(this.entityDB, { where: { [namePrimaryKey]: id } } as any);

        if (!entity) {
          throw new Error(`Entity with id ${id} not found`);
        }

        await manager.softDelete(this.entityDB, { id });
      }),
    );
  }

  async update(entity: Entity): Promise<Entity> {
    this.verifyBaseMethods(entity);
    const values = entity.getValues();
    const namePrimaryKey = this.dataSource.getMetadata(this.entityDB).primaryColumns[0].propertyName;

    const metadata = this.dataSource.getMetadata(this.entityDB);
    const relationColumns = new Set(metadata.relations.map((relation) => relation.propertyName));

    const updateValues = Object.keys(values).reduce((acc, key) => {
      if (!relationColumns.has(key)) {
        acc[key] = values[key];
      }
      return acc;
    }, {} as any);

    const manager = this.getManager();
    await manager.update(this.entityDB, values[namePrimaryKey], updateValues);
    const updatedEntity = await manager.findOne(this.entityDB, {
      where: { [namePrimaryKey]: values[namePrimaryKey] } as any,
    });
    return this.entityModel.create(updatedEntity as unknown as Values);
  }

  async partialUpdate(where: Record<string, unknown>, partialEntity: Partial<Values>, withDelete: false): Promise<Entity> {
    const manager = this.getManager();
    await manager.update(this.entityDB, where as any, partialEntity as any);
    const updatedEntity = await manager.findOne(this.entityDB, { where: where as any, withDeleted: withDelete });

    if (!updatedEntity) {
      throw new Error('Entity not found for partial update');
    }
    return this.entityModel.create(updatedEntity as unknown as Values);
  }

  async find(filter: object): Promise<Entity | null> {
    const manager = this.getManager();
    const entity = await manager.findOne(this.entityDB, { where: filter as any });
    if (entity) {
      return this.entityModel.create(entity as unknown as Values);
    }
    return null;
  }

  async findAll(filter?: Criteria): Promise<Entity[]> {
    const options = (filter && this.convertFilterToQuery<Entity>(filter as any)) ?? {};
    const manager = this.getManager();
    const entities = await manager.find(this.entityDB, {
      ...(options as FindManyOptions<any>),
      skip: options.skip ?? 0,
      take: options.take ?? 10,
      loadRelationIds: true,
    });
    return entities.map((entity) => this.entityModel.create(entity as unknown as Values));
  }

  private verifyBaseMethods(entity: Entity): void {
    if (typeof entity.getValues !== 'function') {
      throw new TypeError('Entity must have a getValues method');
    }
    if (typeof this.entityModel.create !== 'function') {
      throw new TypeError('Entity class must have a static create method');
    }
  }
}
