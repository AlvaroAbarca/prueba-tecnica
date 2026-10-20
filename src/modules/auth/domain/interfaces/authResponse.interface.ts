import { IAuthUserResponse } from './authUserResponse.interface';
import { TokenResponse } from './tokenResponse.interface';

export interface AuthResponse extends TokenResponse {
  user: IAuthUserResponse;
}
