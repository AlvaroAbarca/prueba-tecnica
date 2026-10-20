import { User } from '@modules/users/domain/models/user';

const buildUser = (overrides: Record<string, any> = {}) =>
  new User({
    firstName: { value: 'Test' },
    lastName: { value: 'User' },
    enable2fa: { value: false },
    secret2fa: { value: null },
    tokenExpiration: { value: new Date(Date.now() + 60_000) },
    ...overrides,
  } as any);

describe('User model', () => {
  it('returns the full name', () => {
    const user = buildUser();

    expect(user.getFullName()).toBe('Test User');
  });

  it('checks token expiration', () => {
    const expiredUser = buildUser({ tokenExpiration: { value: new Date(Date.now() - 60_000) } });
    const validUser = buildUser({ tokenExpiration: { value: new Date(Date.now() + 60_000) } });

    expect(expiredUser.isTokenExpired()).toBe(true);
    expect(validUser.isTokenExpired()).toBe(false);
  });
});
