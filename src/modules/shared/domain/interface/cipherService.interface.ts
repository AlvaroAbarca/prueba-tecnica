export abstract class CipherService {
  abstract generateBcrypt(password: string): Promise<string>;
}
