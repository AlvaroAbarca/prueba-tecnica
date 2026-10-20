import { CipherService } from '@modules/shared/domain/interface/cipherService.interface';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CipherServiceManagement implements CipherService {
  private static readonly saltRounds: string = '10';

  async generateBcrypt(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(Number.parseInt(CipherServiceManagement.saltRounds));
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }
}
