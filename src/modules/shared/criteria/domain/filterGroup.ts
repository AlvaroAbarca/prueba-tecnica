import { Filter } from './filter';
import { FilterCombinator } from './filterCombinator';

/**
 * Grupo de filtros con su propio combinador interno.
 * Permite expresar sub-expresiones como (A OR B) dentro de un Criteria AND global.
 *
 * Ejemplo: new FilterGroup([filterGuideCode, filterGuideCodeExternal], FilterCombinator.OR)
 * Genera: (guideCode = X OR guideCodeExternal = Y)
 */
export class FilterGroup {
  readonly filters: Filter[];
  readonly combinator: FilterCombinator;

  constructor(filters: Filter[], combinator: FilterCombinator = FilterCombinator.AND) {
    this.filters = filters;
    this.combinator = combinator;
  }

  public isEmpty(): boolean {
    return this.filters.length === 0;
  }
}
