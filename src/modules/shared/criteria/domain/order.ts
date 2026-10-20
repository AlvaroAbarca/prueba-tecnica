import { OrderBy } from './orderBy';
import { OrderType, OrderTypes } from './orderType';

export class Order {
  readonly orderBy: OrderBy;
  readonly orderType: OrderType;

  constructor(orderBy: OrderBy, orderType: OrderType) {
    this.orderBy = orderBy;
    this.orderType = orderType;
  }

  public static fromValues(orderBy?: string, orderType?: string): Order {
    if (!orderBy) {
      return new Order(new OrderBy(''), new OrderType(OrderTypes.NONE));
    }

    return new Order(new OrderBy(orderBy), OrderType.fromValue(orderType || OrderTypes.ASC));
  }

  public hasOrder() {
    return !this.orderType.isNone();
  }
}
