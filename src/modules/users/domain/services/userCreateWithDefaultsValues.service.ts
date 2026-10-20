import { nowUTC } from '@modules/shared/infrastructure/utils/date.helper';
import { UserValues } from '@modules/users/domain/interfaces/userValues.interface';
import { User } from '@modules/users/domain/models/user';

export const createUserWithDefaultValues = (user: Partial<UserValues>): User =>
  User.create({
    id: 0,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    rut: user.rut || '',
    enabled: user.enabled || true,
    emailVerified: true,
    password: user.password || '123456',
    timeZoneCode: user.timeZoneCode || 'America/Santiago',
    languageCode: user.languageCode || 'es',
    authProvider: user.authProvider || 'internal',
    phone: user.phone || '',
    logout: false,
    order: user.order || 0,
    visible: user.visible || true,
    comment: user.comment || '',
    lastLoginDate: undefined,
    lastLoginIp: '',
    lastPasswordUpdate: undefined,
    lastFailLogDate: undefined,
    resetPasswordToken: '',
    resetPasswordDate: undefined,
    failedLoginAttempts: 0,
    token: '',
    tokenExpiration: undefined,
    img: user.img || '',
    enable2fa: user.enable2fa || false,
    secret2fa: user.secret2fa || null,
    createdAt: user.createdAt || nowUTC().toDate(),
    updatedAt: user.updatedAt || nowUTC().toDate(),
    sessionToken: user.sessionToken || null,
    iata: user.iata || 'N/A',
  });
