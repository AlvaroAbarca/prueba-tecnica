declare module 'express' {
  interface Response {
    setAuthCookies(accessToken: string, refreshToken: string, expiresIn: number): void;
    clearAuthCookies(): void;
  }
}

export type ExpressExtensionsMiddlewareModule = true;
