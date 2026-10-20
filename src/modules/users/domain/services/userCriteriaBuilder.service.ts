import { Criteria } from '@modules/shared/criteria/domain/criteria';
import { Filters } from '@modules/shared/criteria/domain/filters';
import { Filter } from '@modules/shared/criteria/domain/filter';
import { FilterField } from '@modules/shared/criteria/domain/filterField';
import { FilterOperator, Operator } from '@modules/shared/criteria/domain/filterOperator';
import { FilterValue } from '@modules/shared/criteria/domain/filterValue';
import { Order } from '@modules/shared/criteria/domain/order';
import { OrderBy } from '@modules/shared/criteria/domain/orderBy';
import { OrderType, OrderTypes } from '@modules/shared/criteria/domain/orderType';
import { FilterToFindUsers } from '@modules/users/domain/interfaces/filterToFind.interface';

export class UserCriteriaBuilder {
  static create(criteria: FilterToFindUsers): Criteria {
    const { filter, orderBy, orderType, limit, offset } = criteria;
    return new Criteria(
      new Filters([
        ...(filter.id ? [new Filter(new FilterField('id'), new FilterOperator(Operator.EQUAL), new FilterValue(filter.id.toString()))] : []),
        ...(filter?.firstName
          ? [
              new Filter(
                new FilterField('firstName'),
                Array.isArray(filter.firstName) ? new FilterOperator(Operator.IN) : new FilterOperator(Operator.EQUAL),
                new FilterValue(filter.firstName),
              ),
            ]
          : []),
        ...(filter?.lastName
          ? [
              new Filter(
                new FilterField('lastName'),
                Array.isArray(filter.lastName) ? new FilterOperator(Operator.IN) : new FilterOperator(Operator.EQUAL),
                new FilterValue(filter.lastName),
              ),
            ]
          : []),
        ...(filter?.email
          ? [
              new Filter(
                new FilterField('email'),
                Array.isArray(filter.email) ? new FilterOperator(Operator.IN) : new FilterOperator(Operator.EQUAL),
                new FilterValue(filter.email),
              ),
            ]
          : []),
        ...(filter?.rut ? [new Filter(new FilterField('rut'), new FilterOperator(Operator.EQUAL), new FilterValue(filter.rut))] : []),
        ...(filter?.authProvider ? [new Filter(new FilterField('authProvider'), new FilterOperator(Operator.EQUAL), new FilterValue(filter.authProvider))] : []),
        ...(filter?.enable2fa ? [new Filter(new FilterField('enable2fa'), new FilterOperator(Operator.EQUAL), new FilterValue(String(filter.enable2fa)))] : []),
      ]),
      new Order(orderBy ? new OrderBy(orderBy) : new OrderBy('firstName'), orderType ? new OrderType(orderType as OrderTypes) : new OrderType(OrderTypes.ASC)),
      limit,
      offset,
    );
  }
}
