import { UserValues } from '@modules/users/domain/interfaces/userValues.interface';

export const userResponse = (user: UserValues) => {
  const userDto = { ...user };
  delete userDto.password;
  delete userDto.token;
  delete userDto.tokenExpiration;
  delete userDto.secret2fa;
  delete userDto.resetPasswordDate;
  delete userDto.resetPasswordToken;
  delete userDto.lastFailLogDate;
  delete userDto.logout;

  return userDto;
};
