export abstract class RepositoryBase<T, V> {
  abstract create(entity: Partial<T>): Promise<T>;
  abstract delete(ids: number[]): Promise<void>;
  abstract update(entity: T): Promise<T>;
  abstract partialUpdate(where: Record<string, unknown>, partialEntity: Partial<V>, withDeleted?: boolean): Promise<T>;
  abstract find(filter: unknown): Promise<T | null>;
  abstract findAll(filter?: any): Promise<T[]>;
}
