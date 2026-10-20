import { FilterField } from './filterField';

/**
 * Clase especializada para manejar campos JSONB con rutas anidadas.
 *
 * Ejemplos de uso:
 * - Campo plano JSONB: `attributes.typeCollectorGuide`
 * - Campo anidado JSONB: `shipmentData.user.address.city`
 * - Campo JSONB raíz: `attributes` (sin ruta anidada)
 */
export class JsonbFilterField extends FilterField {
  readonly path: string[];
  readonly isJsonb: boolean = true;

  constructor(value: string) {
    super(value);
    // Separar la ruta por puntos para identificar campos anidados
    this.path = value.split('.');
  }

  /**
   * Retorna el nombre de la columna JSONB (primer elemento de la ruta)
   */
  public getColumn(): string {
    return this.path[0];
  }

  /**
   * Retorna el path dentro del JSONB (sin la columna raíz)
   * Ejemplo: attributes.typeCollectorGuide -> typeCollectorGuide
   * Ejemplo: shipmentData.user.name -> user.name
   */
  public getJsonbPath(): string | null {
    if (this.path.length <= 1) {
      return null;
    }
    return this.path
      .slice(1)
      .map((segment) => segment)
      .join('.');
  }

  /**
   * Retorna el array de path para construcción de queries
   * Ejemplo: ['user', 'address', 'city']
   */
  public getPathArray(): string[] {
    return this.path.slice(1);
  }

  /**
   * Verifica si es un campo JSONB con ruta anidada
   */
  public hasJsonbPath(): boolean {
    return this.path.length > 1;
  }

  /**
   * Retorna la profundidad del anidamiento (0 = sin anidamiento)
   */
  public getDepth(): number {
    return this.path.length - 1;
  }
}
