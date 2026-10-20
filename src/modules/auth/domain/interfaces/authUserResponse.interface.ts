export interface AuthUserProfile {
  name: string;
  description: string;
  roles: string[];
}

export interface IAuthUserResponse {
  rut: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  avatar: string;
  timeZoneCode: string;
  languageCode: string;
  authProvider: string;
  logout: boolean;
  phone?: string;
  iata?: string;
}
