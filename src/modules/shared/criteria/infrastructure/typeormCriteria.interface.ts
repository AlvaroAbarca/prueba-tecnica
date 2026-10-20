enum TypeOrmOperators {
  EQ = '=',
  NE = '!=',
  GT = '>',
  LT = '<',
  REGEX = 'REGEX',
}

type TypeOrmFilterOperator = TypeOrmOperators;

type TypeOrmFilterValue = boolean | string | number;

type TypeOrmFilterOperation = { [operator in TypeOrmFilterOperator]?: TypeOrmFilterValue };

//TypeOrmFilter indica el filtro completo en forma de objeto, deste el campo a evaluar y su operador con su valor
type TypeOrmFilter = { [field: string]: TypeOrmFilterOperation } | { [field: string]: { $not: TypeOrmFilterOperation } };

type TypeOrmDirection = 'ASC' | 'DESC';

type TypeOrmSort = { [field: string]: TypeOrmDirection };

export interface TypeOrmQuery {
  filter: TypeOrmFilter;
  sort: TypeOrmSort;
  skip: number;
  limit: number;
}

export type TransformerFunction<T, K> = (value: T) => K;
