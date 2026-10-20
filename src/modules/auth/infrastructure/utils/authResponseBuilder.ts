import { IAuthUserResponse } from '@modules/auth/domain/interfaces/authUserResponse.interface';
import { User } from '@modules/users/domain/models/user';

export class AuthResponseBuilder {
  static build(user: User): IAuthUserResponse {
    return {
      rut: user.getValues().rut,
      firstName: user.getValues().firstName,
      lastName: user.getValues().lastName,
      email: user.getValues().email,
      emailVerified: user.getValues().emailVerified,
      avatar: this.getAvatarUrl(user.getValues().img),
      timeZoneCode: user.getValues().timeZoneCode,
      languageCode: user.getValues().languageCode,
      authProvider: user.getValues().authProvider,
      logout: user.getValues().logout,
      phone: user.getValues().phone || '',
      iata: user.getValues().iata ?? 'N/A',
    };
  }

  private static getAvatarUrl(img: string | undefined): string {
    if (img && img.trim() !== '') {
      return img;
    }
    return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiXpQY5V3CQQR17ZxGnkwQZtYKISVCajgnRg&s';
  }
}
