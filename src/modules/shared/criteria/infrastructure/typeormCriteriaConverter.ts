import { FindManyOptions, FindOptionsWhere, FindOptionsOrder, Not, MoreThan, LessThan, Like, In, Raw } from 'typeorm';
import { Criteria } from '../domain/criteria';
import { Filter } from '../domain/filter';
import { FilterCombinator } from '../domain/filterCombinator';
import { FilterGroup } from '../domain/filterGroup';
import { Operator } from '../domain/filterOperator';
import { Filters } from '../domain/filters';
import { Order } from '../domain/order';
import { InternalSystemException } from '@modules/shared/domain/exceptions/classes';
import { JsonbFilterField } from '../domain/jsonbFilterField';

export interface TypeOrmQuery<T = any> {
  where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
  order?: FindOptionsOrder<T>;
  skip?: number;
  take?: number;
}

export type TransformerFunction<T, K> = (value: T) => K;

export class TypeOrmCriteriaConverter {
  private readonly filterTransformers: Map<Operator, TransformerFunction<Filter, any>>;

  constructor() {
    this.filterTransformers = new Map<Operator, TransformerFunction<Filter, any>>([
      [Operator.EQUAL, this.equalFilter.bind(this)],
      [Operator.NOT_EQUAL, this.notEqualFilter.bind(this)],
      [Operator.GT, this.greaterThanFilter.bind(this)],
      [Operator.LT, this.lowerThanFilter.bind(this)],
      [Operator.CONTAINS, this.containsFilter.bind(this)],
      [Operator.NOT_CONTAINS, this.notContainsFilter.bind(this)],
      [Operator.IN, this.inFilter.bind(this)],
      [Operator.JSONB_CONTAINS, this.jsonbContainsFilter.bind(this)],
      [Operator.JSONB_CONTAINED, this.jsonbContainedFilter.bind(this)],
      [Operator.JSONB_HAS_KEY, this.jsonbHasKeyFilter.bind(this)],
      [Operator.JSONB_HAS_ALL_KEYS, this.jsonbHasAllKeysFilter.bind(this)],
      [Operator.JSONB_HAS_ANY_KEY, this.jsonbHasAnyKeyFilter.bind(this)],
      [Operator.DATE_FORMAT_EQUAL, this.dateFormatEqualFilter.bind(this)],
    ]);
  }

  public convertFilterToQuery<T = any>(criteria: Criteria): TypeOrmQuery<T> {
    const query: TypeOrmQuery<T> = {};

    if (criteria.hasFilters()) {
      query.where = this.generateFilter(criteria.filters);
    }

    if (criteria.order.hasOrder()) {
      query.order = this.generateSort(criteria.order);
    }

    if (criteria.offset !== undefined && criteria.offset !== null) {
      query.skip = criteria.offset;
    }

    if (criteria.limit) {
      query.take = criteria.limit;
    }

    return query;
  }

  public convertToFindOptions<T = any>(criteria: Criteria): FindManyOptions<T> {
    return this.convertFilterToQuery<T>(criteria) as FindManyOptions<T>;
  }

  protected generateFilter(filters: Filters): FindOptionsWhere<any> | FindOptionsWhere<any>[] {
    // Si hay grupos (FilterGroup), generar producto cartesiano con AND planos
    if (filters.hasGroups()) {
      return this.generateMixedFilter(filters);
    }

    if (filters.combinator === FilterCombinator.OR) {
      return this.generateOrFilter(filters);
    }

    return this.generateAndFilter(filters);
  }

  /**
   * Genera filtros mixtos: filtros AND planos + grupos OR.
   * Ejemplo: (guideCode = 10 OR guideCodeExternal = 10) AND statusCode = StatusCodesShipment.ADMITTED
   * TypeORM lo representa como array de objetos (cada objeto es una rama OR combinada con los AND):
   * [{ guideCode: 10, statusCode: StatusCodesShipment.ADMITTED }, { guideCodeExternal: 10, statusCode: StatusCodesShipment.ADMITTED }]
   */
  private generateMixedFilter(filters: Filters): FindOptionsWhere<any> | FindOptionsWhere<any>[] {
    // 1. Construir las condiciones AND planas (filtros sin grupo)
    const andBase: FindOptionsWhere<any> = filters.filters.length > 0 ? this.generateAndFilter(new Filters(filters.filters)) : {};

    // 2. Expandir cada grupo OR a un array de condiciones individuales
    const groupExpansions: FindOptionsWhere<any>[][] = filters.groups.filter((group) => !group.isEmpty()).map((group) => this.expandGroup(group));

    // Si no hay grupos con contenido, devolver solo el AND base
    if (groupExpansions.length === 0) {
      return andBase;
    }

    // 3. Producto cartesiano de todos los grupos
    let combinations: FindOptionsWhere<any>[] = groupExpansions[0];
    for (let i = 1; i < groupExpansions.length; i++) {
      combinations = this.cartesianProduct(combinations, groupExpansions[i]);
    }

    // 4. Merge del AND base con cada combinación
    return combinations.map((combination) => ({ ...andBase, ...combination }));
  }

  /**
   * Expande un FilterGroup a un array de condiciones individuales.
   * Para OR: cada filtro genera un objeto separado.
   * Para AND: todos los filtros se fusionan en un solo objeto.
   */
  private expandGroup(group: FilterGroup): FindOptionsWhere<any>[] {
    if (group.combinator === FilterCombinator.OR) {
      return group.filters.map((filter) => {
        const transformer = this.filterTransformers.get(filter.operator.value);
        if (!transformer) {
          throw new InternalSystemException(`Unexpected operator value ${filter.operator.value} in CriteriaConverter`);
        }
        return transformer(filter);
      });
    }

    const merged: FindOptionsWhere<any> = {};
    group.filters.forEach((filter) => {
      const transformer = this.filterTransformers.get(filter.operator.value);
      if (!transformer) {
        throw new InternalSystemException(`Unexpected operator value ${filter.operator.value} in CriteriaConverter`);
      }
      Object.assign(merged, transformer(filter));
    });
    return [merged];
  }

  /**
   * Producto cartesiano de dos arrays de condiciones.
   * [{A}, {B}] × [{C}, {D}] = [{A,C}, {A,D}, {B,C}, {B,D}]
   */
  private cartesianProduct(a: FindOptionsWhere<any>[], b: FindOptionsWhere<any>[]): FindOptionsWhere<any>[] {
    const result: FindOptionsWhere<any>[] = [];
    for (const itemA of a) {
      for (const itemB of b) {
        result.push({ ...itemA, ...itemB });
      }
    }
    return result;
  }

  private generateOrFilter(filters: Filters): FindOptionsWhere<any>[] {
    return filters.filters.map((filter) => {
      const transformer = this.filterTransformers.get(filter.operator.value);
      if (!transformer) {
        throw new InternalSystemException(`Unexpected operator value ${filter.operator.value} in CriteriaConverter`);
      }
      return transformer(filter);
    });
  }

  private generateAndFilter(filters: Filters): FindOptionsWhere<any> {
    // Agrupar filtros por nombre de campo/columna
    const filtersByField: Map<string, Filter[]> = new Map();

    filters.filters.forEach((filter) => {
      // Obtener el nombre del campo base (para JSONB, obtener la columna)
      const fieldKey = filter.field instanceof JsonbFilterField ? filter.field.getColumn() : filter.field.value();

      if (!filtersByField.has(fieldKey)) {
        filtersByField.set(fieldKey, []);
      }
      filtersByField.get(fieldKey).push(filter);
    });

    const andConditions: FindOptionsWhere<any> = {};

    // Procesar cada grupo de filtros
    filtersByField.forEach((filtersGroup, fieldKey) => {
      if (filtersGroup.length === 1) {
        // Un solo filtro, procesarlo normalmente
        const filter = filtersGroup[0];

        const transformer = this.filterTransformers.get(filter.operator.value);
        if (!transformer) {
          throw new InternalSystemException(`Unexpected operator value ${filter.operator.value} in CriteriaConverer`);
        }

        const filterCondition = transformer(filter);
        Object.assign(andConditions, filterCondition);
      } else {
        // Múltiples filtros para el mismo campo, combinarlos
        andConditions[fieldKey] = this.combineFiltersForSameField(filtersGroup);
      }
    });

    return andConditions;
  }

  private combineFiltersForSameField(filters: Filter[]): any {
    // Construir un Raw query que combine todas las condiciones con AND
    const allParams: any = {};
    const conditions: string[] = [];

    // Preparar todas las condiciones y parámetros
    filters.forEach((filter, index) => {
      // Para cada filtro, generar su condición SQL
      if (filter.field instanceof JsonbFilterField && filter.field.hasJsonbPath()) {
        const jsonbField = filter.field;
        const pathArray = jsonbField.getPathArray();
        const jsonPath = `{${pathArray.join(',')}}`;
        const value = filter.value.value();
        const operator = this.getSqlOperatorForFilter(filter);

        // Generar parámetros únicos para evitar colisiones
        const pathParam = `path_${index}`;
        const valueParam = `value_${index}`;

        allParams[pathParam] = jsonPath;
        allParams[valueParam] = value;

        // Construir la condición SQL según el tipo de valor
        let condition: string;
        if (typeof value === 'string' || operator === '=') {
          condition = `{alias}#>>:${pathParam} ${operator} :${valueParam}`;
        } else if (typeof value === 'number') {
          condition = `({alias}#>>:${pathParam})::numeric ${operator} :${valueParam}`;
        } else if (typeof value === 'boolean') {
          condition = `({alias}#>>:${pathParam})::boolean ${operator} :${valueParam}`;
        } else {
          condition = `{alias}#>>:${pathParam} ${operator} :${valueParam}`;
        }

        conditions.push(`(${condition})`);
      } else {
        // Para filtros no-JSONB (esto no debería ocurrir si están bien agrupados)
        throw new InternalSystemException(`No se puede combinar filtro no-JSONB en combineFiltersForSameField: ${filter.field.value()}`);
      }
    });

    // Retornar el Raw query con las condiciones combinadas
    return Raw((alias) => {
      // Reemplazar {alias} con el alias real
      const parsedAlias = alias
        .split('.')
        .map((part) => `"${part}"`)
        .join('.');
      return conditions.map((cond) => cond.replaceAll('{alias}', parsedAlias)).join(' AND ');
    }, allParams);
  }

  private getSqlOperatorForFilter(filter: Filter): string {
    switch (filter.operator.value) {
      case Operator.EQUAL:
        return '=';
      case Operator.NOT_EQUAL:
        return '!=';
      case Operator.GT:
        return '>';
      case Operator.LT:
        return '<';
      case Operator.CONTAINS:
        return 'LIKE';
      case Operator.NOT_CONTAINS:
        return 'NOT LIKE';
      default:
        return '=';
    }
  }

  protected generateSort(order: Order): FindOptionsOrder<any> {
    const fieldName = order.orderBy.value();
    return {
      [fieldName]: order.orderType.isAsc() ? 'ASC' : 'DESC',
    };
  }

  private equalFilter(filter: Filter): any {
    // Si es un campo JSONB con path, usar sintaxis especial
    if (filter.field instanceof JsonbFilterField && filter.field.hasJsonbPath()) {
      const jsonbField = filter.field;
      return this.buildJsonbPathQuery(jsonbField, '=', filter.value.value());
    }
    return { [filter.field.value()]: filter.value.value() };
  }

  private notEqualFilter(filter: Filter): any {
    return { [filter.field.value()]: Not(filter.value.value()) };
  }

  private greaterThanFilter(filter: Filter): any {
    return { [filter.field.value()]: MoreThan(filter.value.value()) };
  }

  private lowerThanFilter(filter: Filter): any {
    return { [filter.field.value()]: LessThan(filter.value.value()) };
  }

  private dateFormatEqualFilter(filter: Filter): any {
    return {
      [filter.field.value()]: Raw((alias) => `to_char(${alias}, 'DD/MM/YYYY') = :value`, { value: filter.value.value() }),
    };
  }

  private containsFilter(filter: Filter): any {
    return { [filter.field.value()]: Like(`%${filter.value.value()}%`) };
  }

  private notContainsFilter(filter: Filter): any {
    return { [filter.field.value()]: Not(Like(`%${filter.value.value()}%`)) };
  }

  private inFilter(filter: Filter): any {
    return { [filter.field.value()]: In(filter.value.value()) };
  }

  /**
   * Construye una query para acceder a campos dentro de un JSONB
   * Soporta anidamiento de múltiples niveles
   */
  private buildJsonbPathQuery(field: JsonbFilterField, operator: string, value: any): any {
    const column = field.getColumn();
    const pathArray = field.getPathArray();

    // Construir el path usando #>> para obtener el valor como texto
    // O usar #> para obtener como JSON y luego cast
    const jsonPath = `{${pathArray.join(',')}}`;

    return {
      [column]: Raw(
        (alias) => {
          const aliasParsed = alias
            .split('.')
            .map((part) => `"${part}"`)
            .join('.');
          // Para strings y comparaciones simples, usar #>>
          if (typeof value === 'string' || operator === '=') {
            return `${aliasParsed}#>>:path ${operator} :value`;
          }
          // Para números, convertir el resultado
          if (typeof value === 'number') {
            return `(${aliasParsed}#>>:path)::numeric ${operator} :value`;
          }
          // Para booleanos
          if (typeof value === 'boolean') {
            return `(${aliasParsed}#>>:path)::boolean ${operator} :value`;
          }
          return `${aliasParsed}#>>:path ${operator} :value`;
        },
        { path: jsonPath, value },
      ),
    };
  }

  /**
   * JSONB @> (contiene)
   * Ejemplo: WHERE attributes @> '{"typeCollectorGuide": "tipo1"}'
   */
  private jsonbContainsFilter(filter: Filter): any {
    const column = filter.field instanceof JsonbFilterField ? filter.field.getColumn() : filter.field.value();

    return {
      [column]: Raw((alias) => `${alias} @> :value::jsonb`, {
        value: JSON.stringify(filter.value.value()),
      }),
    };
  }

  /**
   * JSONB <@ (está contenido en)
   */
  private jsonbContainedFilter(filter: Filter): any {
    const column = filter.field instanceof JsonbFilterField ? filter.field.getColumn() : filter.field.value();

    return {
      [column]: Raw((alias) => `${alias} <@ :value::jsonb`, {
        value: JSON.stringify(filter.value.value()),
      }),
    };
  }

  /**
   * JSONB ? (tiene la key)
   * Ejemplo: WHERE attributes ? 'typeCollectorGuide'
   */
  private jsonbHasKeyFilter(filter: Filter): any {
    const column = filter.field instanceof JsonbFilterField ? filter.field.getColumn() : filter.field.value();

    return {
      [column]: Raw((alias) => `${alias} ?? :key`, {
        key: filter.value.value(),
      }),
    };
  }

  /**
   * JSONB ?& (tiene todas las keys)
   */
  private jsonbHasAllKeysFilter(filter: Filter): any {
    const column = filter.field instanceof JsonbFilterField ? filter.field.getColumn() : filter.field.value();

    const keys = Array.isArray(filter.value.value()) ? filter.value.value() : [filter.value.value()];

    return {
      [column]: Raw((alias) => `${alias} ?& ARRAY[:...keys]`, { keys }),
    };
  }

  /**
   * JSONB ?| (tiene alguna de las keys)
   */
  private jsonbHasAnyKeyFilter(filter: Filter): any {
    const column = filter.field instanceof JsonbFilterField ? filter.field.getColumn() : filter.field.value();

    const keys = Array.isArray(filter.value.value()) ? filter.value.value() : [filter.value.value()];

    return {
      [column]: Raw((alias) => `${alias} ?| ARRAY[:...keys]`, { keys }),
    };
  }
}
