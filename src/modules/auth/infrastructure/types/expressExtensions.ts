// Extender el tipo de Response globalmente usando module augmentation
declare module 'express' {
  interface Response {
    setAuthCookies(accessToken: string, refreshToken: string, expiresIn: number): void;
    clearAuthCookies(): void;
  }
}

export type ExpressExtensionsTypesModule = true;
