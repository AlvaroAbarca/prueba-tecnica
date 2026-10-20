import { Filters } from './filters';
import { Order } from './order';
import { JsonbFilterField } from './jsonbFilterField';

export class Criteria {
  readonly filters: Filters;
  readonly order?: Order;
  readonly limit?: number;
  readonly offset?: number;

  constructor(filters: Filters, order?: Order, limit?: number, offset?: number) {
    this.filters = filters;
    this.order = order;
    this.limit = limit;
    this.offset = offset;
  }

  public hasFilters(): boolean {
    return this.filters.filters.length > 0 || this.filters.hasGroups();
  }

  public show(): string {
    return this.filters.filters
      .filter((filter) => !['deletedAt', 'createdAt', 'updatedAt'].includes(filter.field.value()))
      .map((filter) => {
        const fieldName = filter.field instanceof JsonbFilterField ? `${filter.field.value()} (JSONB)` : filter.field.value();
        return `${fieldName} ${filter.operator.value} ${filter.value.value()}`;
      })
      .join(', ');
  }
}
