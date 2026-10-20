import { ValidateVO } from '@modules/shared/domain/validators/decorators';
import { UserId } from './userId';
import { UserName } from './userName';
import { UserEmail } from './userEmail';
import { UserLastLoginDate } from './userLastLoginDate';
import { UserLastLoginIp } from './userLastLoginIp';
import { UserEmailVerify } from './userEmailVerify';
import { UserPassword } from './userPassword';
import { UserVisible } from './userVisible';
import { UserIsActive } from './userIsActive';
import { UserOrder } from './userOrder';
import { UserAuthProvider } from './userAuthProvider';
import { UserIsActiveDetail } from './userIsActiveDetail';
import { UserLanguageCode } from './userLanguageCode';
import { UserTimeZoneCode } from './userTimeZoneCode';
import { UserLogout } from './userLogout';
import { UserLastPasswordUpdate } from './userLastPasswordUpdate';
import { UserLastFailLogDate } from './userLastFailLogDate';
import { UserResetPasswordToken } from './userResetPasswordToken';
import { UserResetPasswordDate } from './userResetPasswordDate';
import { UserFailedLoginAttempts } from './userFailedLoginAttempts';
import { UserPhone } from './userPhone';
import { UserToken } from './userToken';
import { UserTokenExpiration } from './userTokenExpiration';
import { UserImg } from './userImg';
import { UserSecrets2fa } from './userSecres2fa';
import { UserEnable2fa } from './userEnable2fa';
import { UserRut } from './userRut';
import { UserDate } from './userDate';
import { UserIata } from './userIata';

export const UserVOBuilder = ValidateVO.createVODefinition({
  id: UserId,
  firstName: UserName,
  lastName: UserName,
  rut: UserRut,
  email: UserEmail,
  emailVerified: UserEmailVerify,
  password: UserPassword,
  order: UserOrder,
  visible: UserVisible,
  enabled: UserIsActive,
  comment: UserIsActiveDetail,
  lastLoginDate: UserLastLoginDate,
  lastLoginIp: UserLastLoginIp,
  lastPasswordUpdate: UserLastPasswordUpdate,
  lastFailLogDate: UserLastFailLogDate,
  timeZoneCode: UserTimeZoneCode,
  languageCode: UserLanguageCode,
  resetPasswordToken: UserResetPasswordToken,
  resetPasswordDate: UserResetPasswordDate,
  failedLoginAttempts: UserFailedLoginAttempts,
  logout: UserLogout,
  authProvider: UserAuthProvider,
  phone: UserPhone,
  token: UserToken,
  tokenExpiration: UserTokenExpiration,
  img: UserImg,
  enable2fa: UserEnable2fa,
  secret2fa: UserSecrets2fa,
  createdAt: UserDate,
  updatedAt: UserDate,
  sessionToken: UserToken,
  iata: UserIata,
});
