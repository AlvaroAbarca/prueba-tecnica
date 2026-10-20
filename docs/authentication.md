# Sistema de Autenticación - Login local

## Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Componentes Principales](#componentes-principales)
4. [Uso Básico](#uso-básico)
5. [Ejemplos](#ejemplos)
6. [Configuración](#configuración)

---

## Descripción General

`AuthModule` autentica usuarios locales con email y contraseña (bcrypt), emite JWT de acceso y de refresco, y los guarda en cookies HTTP-only. La autorización por roles vive en `RolesGuard` y se documenta en [rolesCanSystem.md](rolesCanSystem.md).

### Características Principales

- **Login local**: email y contraseña contra el usuario persistido.
- **JWT**: access token y refresh token con secretos distintos.
- **Cookies HTTP-only**: `access_token` y `refresh_token`.
- **Bearer**: `FlexibleAuthGuard` acepta `Authorization: Bearer` o las cookies.
- **Renovación**: si el access token expiró y hay refresh token válido, `CookieAuthGuard` emite un par nuevo.
- **Políticas de cuenta**: intentos fallidos, contraseña antigua e inactividad.

---

## Arquitectura

```
src/modules/auth/
├── application/
│   ├── services/
│   │   ├── login.service.ts
│   │   ├── loginValidation.service.ts
│   │   └── userProfileAndRoles.service.ts
│   └── useCases/
│       ├── internalLogin.useCase.ts
│       ├── refreshToken.useCase.ts
│       └── logout.useCase.ts
├── domain/
│   ├── exceptions/authExceptions.ts
│   ├── interfaces/
│   └── valueObjects/token.ts
└── infrastructure/
    ├── controllers/login.controller.ts
    ├── dto/login.dto.ts
    ├── guards/
    │   ├── flexibleAuth.guard.ts
    │   ├── cookieAuth.guard.ts
    │   └── roles.guard.ts
    ├── middleware/cookie.middleware.ts
    └── services/jwtToken.service.ts
```

`AppModule` registra `FlexibleAuthGuard` y `RolesGuard` como guards globales. `CookieMiddleware` se aplica a todas las rutas y añade `setAuthCookies` y `clearAuthCookies` al response.

### Flujo de login

1. `POST /auth/login` es público (`@Public()`).
2. `LoginService` delega en `InternalLoginUseCase`.
3. Se busca el usuario por email. Si no existe o no tiene contraseña local, responde credenciales inválidas.
4. `LoginValidationService` aplica las políticas de cuenta.
5. `bcrypt.compare` valida la contraseña. Un fallo incrementa `failedLoginAttempts`. Un acierto los pone en cero.
6. `JwtTokenService.generateTokens` firma access y refresh con `provider: 'internal'`.
7. El access token se guarda en `sessionToken` y las cookies se escriben en la respuesta.

### Flujo de una request autenticada

1. Si el handler tiene `@Public()`, `FlexibleAuthGuard` deja pasar.
2. Si llega `Authorization: Bearer`, verifica ese token.
3. Si no hay bearer, o el bearer falla y existen cookies, delega en `CookieAuthGuard`.
4. `CookieAuthGuard` verifica `access_token`. Si expiró y hay `refresh_token`, ejecuta `RefreshTokenUseCase`, reescribe las cookies y sigue.
5. Si el endpoint declara `@RolesCan`, `RolesGuard` carga los roles del email con `UserProfileAndRolesService`.

---

## Componentes Principales

| Pieza | Rol |
| --- | --- |
| `LoginController` | `POST auth/login` y `POST auth/logout` |
| `InternalLoginUseCase` | Credenciales, políticas y emisión de tokens |
| `LoginValidationService` | Cuenta habilitada, bloqueo, antigüedad de contraseña e inactividad |
| `JwtTokenService` | Firma y verificación de access y refresh |
| `CookieAuthGuard` | Cookies y renovación silenciosa |
| `FlexibleAuthGuard` | Bearer o cookies |
| `InternalLogoutUseCase` | Limpia `sessionToken` |

### Políticas de `LoginValidationService`

Constantes en `loginValidation.service.ts`:

| Regla | Valor | Efecto |
| --- | --- | --- |
| Intentos fallidos | 5 | Rechaza el login con cuenta bloqueada |
| Contraseña sin cambio | 90 días | Rechaza el login |
| Inactividad | 60 días | Deshabilita la cuenta y rechaza el login |

El mensaje de credenciales inválidas es `User and Password not found`, salvo el bloqueo por intentos (`User locked due to failed login attempts`).

### Cookies

`cookie.middleware.ts` escribe `access_token` y `refresh_token` con `httpOnly`, `sameSite: 'lax'` y `secure` cuando `NODE_ENV` empieza por `prod`. El `maxAge` sale de `expiresIn` (access) y `REFRESH_TOKEN_EXPIRES` (refresh), en segundos.

---

## Uso Básico

Login. El cuerpo usa `emailuser` y `password`. `provider` y `token` son opcionales y el flujo local no los usa.

```http
POST /auth/login
Content-Type: application/json

{
  "emailuser": "usuario@correos.cl",
  "password": "MiPassword123!"
}
```

La respuesta exitosa no devuelve los JWT en el body. Los deja en cookies:

```http
Set-Cookie: access_token=...; HttpOnly; Path=/; SameSite=Lax
Set-Cookie: refresh_token=...; HttpOnly; Path=/; SameSite=Lax
```

Logout exige una sesión válida. Lee el email desde `request.user.account.email`, borra `sessionToken` y limpia las cookies.

```http
POST /auth/logout
Cookie: access_token=...
```

Un endpoint protegido solo por autenticación no necesita decorador extra. Uno restringido por rol usa `@RolesCan`:

```typescript
@Get()
@RolesCan(['ADMIN'])
findAll() { ... }

@Public()
@Post('auth/login')
login() { ... }
```

---

## Ejemplos

Bearer en lugar de cookies. `FlexibleAuthGuard` verifica el access token y no renueva cookies.

```http
GET /api/users
Authorization: Bearer <accessToken>
```

Renovación. No hay endpoint público de refresh. Cuando `CookieAuthGuard` recibe un access token vencido y un refresh token vigente, `RefreshTokenUseCase` verifica el refresh, vuelve a cargar el usuario, firma un par nuevo y actualiza `sessionToken`.

---

## Configuración

Variables en `.env` (ver `.env.example`):

| Variable | Uso | Default en código |
| --- | --- | --- |
| `JWT_SECRET` | Firma del access token | `default-secret` |
| `JWT_REFRESH_SECRET` | Firma del refresh token | `default-refresh-secret` |
| `JWT_ISSUER` | Claim `iss` | `sistemaEmisor` |
| `JWT_AUDIENCE` | Claim `aud` | `sistema` |
| `ACCESS_TOKEN_EXPIRES` | Segundos del access token | `900` |
| `REFRESH_TOKEN_EXPIRES` | Segundos del refresh token | `1800` |

En producción hay que definir ambos secretos. Los defaults solo sirven para desarrollo local.
