import { UserCriteriaBuilder } from '@modules/users/domain/services/userCriteriaBuilder.service';
import { Criteria } from '@modules/shared/criteria/domain/criteria';
import { Operator } from '@modules/shared/criteria/domain/filterOperator';

describe('UserCriteriaBuilder', () => {
  it('should return a Criteria instance', () => {
    expect(UserCriteriaBuilder.create({ filter: {} })).toBeInstanceOf(Criteria);
  });

  it('should have no filters when filter is empty', () => {
    const result = UserCriteriaBuilder.create({ filter: {} });
    expect(result.filters.filters).toHaveLength(0);
  });

  it('should add id filter', () => {
    const result = UserCriteriaBuilder.create({ filter: { id: 1 } });
    const f = result.filters.filters;
    expect(f).toHaveLength(1);
    expect(f[0].field.value()).toBe('id');
    expect(f[0].value.value()).toBe('1');
  });

  it('should add firstName filter', () => {
    const result = UserCriteriaBuilder.create({ filter: { firstName: 'Juan' } });
    expect(result.filters.filters[0].field.value()).toBe('firstName');
  });

  it('should use IN operator for array firstName', () => {
    const result = UserCriteriaBuilder.create({ filter: { firstName: ['Juan', 'Maria'] as any } });
    expect(result.filters.filters[0].operator.value).toBe(Operator.IN);
  });

  it('should add lastName filter', () => {
    const result = UserCriteriaBuilder.create({ filter: { lastName: 'Perez' } });
    expect(result.filters.filters[0].field.value()).toBe('lastName');
  });

  it('should use IN operator for array lastName', () => {
    const result = UserCriteriaBuilder.create({ filter: { lastName: ['Perez', 'Lopez'] as any } });
    expect(result.filters.filters[0].operator.value).toBe(Operator.IN);
  });

  it('should add email filter', () => {
    const result = UserCriteriaBuilder.create({ filter: { email: 'test@test.com' } });
    expect(result.filters.filters[0].field.value()).toBe('email');
  });

  it('should use IN operator for array email', () => {
    const result = UserCriteriaBuilder.create({ filter: { email: ['a@a.com', 'b@b.com'] as any } });
    expect(result.filters.filters[0].operator.value).toBe(Operator.IN);
  });

  it('should add rut filter', () => {
    const result = UserCriteriaBuilder.create({ filter: { rut: '12345678-9' } });
    expect(result.filters.filters[0].field.value()).toBe('rut');
  });

  it('should add authProvider filter', () => {
    const result = UserCriteriaBuilder.create({ filter: { authProvider: 'keycloak' } });
    expect(result.filters.filters[0].field.value()).toBe('authProvider');
  });

  it('should add enable2fa filter', () => {
    const result = UserCriteriaBuilder.create({ filter: { enable2fa: true } });
    expect(result.filters.filters[0].field.value()).toBe('enable2fa');
  });

  it('should combine multiple filters', () => {
    const result = UserCriteriaBuilder.create({ filter: { email: 'test@test.com', rut: '123', authProvider: 'local' } });
    expect(result.filters.filters).toHaveLength(3);
  });

  it('should use default orderBy "firstName" when not provided', () => {
    const result = UserCriteriaBuilder.create({ filter: {} });
    expect(result.order.orderBy.value()).toBe('firstName');
  });

  it('should apply limit and offset', () => {
    const result = UserCriteriaBuilder.create({ filter: {}, limit: 25, offset: 10 });
    expect(result.limit).toBe(25);
    expect(result.offset).toBe(10);
  });
});
