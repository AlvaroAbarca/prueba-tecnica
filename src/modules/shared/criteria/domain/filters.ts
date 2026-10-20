import { Filter } from './filter';
import { FilterCombinator } from './filterCombinator';
import { FilterGroup } from './filterGroup';

export class Filters {
  public readonly filters: Filter[];
  public readonly combinator: FilterCombinator;
  public readonly groups: FilterGroup[];

  constructor(filters: Filter[], combinator: FilterCombinator = FilterCombinator.AND, groups: FilterGroup[] = []) {
    this.filters = filters;
    this.combinator = combinator;
    this.groups = groups;
  }

  public static fromValues(filters: Array<Map<string, string>>, combinator?: FilterCombinator): Filters {
    return new Filters(filters.map(Filter.fromValues), combinator);
  }

  public static none(): Filters {
    return new Filters([]);
  }

  public isEmpty(): boolean {
    return this.filters.length === 0 && this.groups.length === 0;
  }

  public hasGroups(): boolean {
    return this.groups.length > 0;
  }
}
