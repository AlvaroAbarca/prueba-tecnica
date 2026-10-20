/**
 * Transaction Manager Interface
 * Port (hexagonal architecture) para manejar transacciones de base de datos
 * sin acoplar el dominio a la implementación específica de persistencia
 */
export abstract class TransactionManager {
  /**
   * Ejecuta una operación dentro de una transacción
   * Si la operación tiene éxito, hace commit automáticamente
   * Si falla, hace rollback automáticamente
   *
   * @param operation - Función async que contiene la lógica a ejecutar en la transacción
   * @returns El resultado de la operación
   * @throws Error si la operación falla
   */
  abstract runInTransaction<T>(operation: () => Promise<T>): Promise<T>;

  /**
   * Ejecuta múltiples operaciones dentro de una misma transacción
   * Útil cuando necesitas coordinar múltiples repositorios
   *
   * @param operations - Array de funciones async a ejecutar en la transacción
   * @returns Array con los resultados de cada operación
   */
  abstract runMultipleInTransaction<T extends any[]>(operations: Array<() => Promise<T[number]>>): Promise<T>;
}
