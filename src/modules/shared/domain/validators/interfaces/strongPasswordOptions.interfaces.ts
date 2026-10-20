export interface IStrongPasswordOptions {
  allowNumbers?: boolean;
  allowSymbols?: boolean;
  allowedSymbols?: string[];
  minLength?: number;
  maxLength?: number;
  minUppercase?: number;
  minLowercase?: number;
  minNumbers?: number;
  minSymbols?: number;
  maxConsecutiveNumbers?: number;
  maxConsecutiveChars?: number;
  excludeChars?: string[];
  includeChars?: string[];
  base32?: boolean;
}
