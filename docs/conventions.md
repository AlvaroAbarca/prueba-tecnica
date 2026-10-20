# Convenciones de desarrollo

## Idioma del código

Todo el código fuente debe escribirse en **inglés**: nombres de variables, funciones, clases, interfaces, constantes, parámetros, propiedades y comentarios técnicos.

```typescript
// Correcto
const userRepository = new UserRepository();
const accessToken = generateToken(userId);
const isEmailVerified = user.verifiedAt !== null;

// Incorrecto
const repositorioUsuario = new UserRepository();
const tokenDeAcceso = generarToken(idUsuario);
```

La documentación orientada al equipo (docs, README, commits) puede escribirse en el idioma del equipo.

---

## Nomenclatura

### Variables, funciones y propiedades — `camelCase`

```typescript
const firstName = 'John';
let totalAmount = 0;

function getUserById(userId: number): Promise<User> { ... }
function sendPasswordResetEmail(email: string): Promise<void> { ... }
```

### Clases e interfaces — `PascalCase`

```typescript
class UserRepository { ... }
interface CreateUserDto { ... }
interface AuthTokenPayload { ... }
```

### Constantes globales — `UPPER_SNAKE_CASE`

```typescript
const MAX_LOGIN_ATTEMPTS = 5;
const DEFAULT_PAGE_SIZE = 20;
const JWT_EXPIRATION_TIME = '1h';
```

### Archivos — `camelCase`, excepto clases que van en `PascalCase`

```
userRepository.ts       ← archivo con clase → PascalCase: UserRepository.ts
createUserDto.ts        ← DTO → PascalCase: CreateUserDto.ts
jwtStrategy.ts          ← estrategia → PascalCase: JwtStrategy.ts
date.helper.ts          ← helper/util → camelCase
auth.guard.ts           ← guard → camelCase o PascalCase según convención NestJS
```

---

## Ramas Git

El flujo de trabajo usa tres ramas principales protegidas:

| Rama   | Propósito                                              |
| ------ | ------------------------------------------------------ |
| `DEV`  | Integración continua. Todas las features se fusionan aquí primero. |
| `QA`   | Entorno de pruebas. Se despliega para validación de QA. |
| `main` | Producción. Solo recibe merges desde `QA` aprobados.   |

### Ramas de trabajo

Las ramas de feature/fix se crean desde `dev` siguiendo el formato:

```
<tipo>/<descripcion-en-kebab-case>

feat/user-authentication
fix/password-reset-token-expiry
chore/update-typeorm-dependencies
refactor/auth-module-structure
```

El flujo es siempre: `feature` → `DEV` → `QA` → `main`.

---

## Arquitectura del sistema

### Monorepo modular con múltiples contenedores

El proyecto es un **monorepo modular**: un único repositorio que puede desplegarse como uno o varios contenedores independientes corriendo en paralelo. Cada contenedor expone un subconjunto de módulos según el dominio que atiende.

```
┌─────────────────────────────────────────────────┐
│                  API Gateway                    │
│         (enruta requests por prefijo/dominio)   │
└──────┬──────────────┬──────────────┬────────────┘
       │              │              │
       ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Container A  │ │ Container B  │ │ Container C  │
│  /auth/*     │ │  /orders/*   │ │  /reports/*  │
│  /users/*    │ │  /products/* │ │  /exports/*  │
└──────────────┘ └──────────────┘ └──────────────┘
```

Cada contenedor es una instancia de la misma base de código, pero con las variables de entorno `ENABLED_MODULES` configuradas para activar solo los módulos que le corresponden. Esto permite:

- Escalar horizontalmente los dominios con mayor carga de forma independiente.
- Desplegar un único contenedor en entornos pequeños sin cambiar el código.
- Aislar fallos: un contenedor caído no afecta a los demás.

### API Gateway

El API Gateway es el único punto de entrada externo. Su responsabilidad es:

1. **Enrutar** cada request al contenedor correcto según el prefijo de la ruta o el dominio.
2. **Centralizar** autenticación, rate limiting y logging de entrada (opcional, según configuración).
3. **Abstraer** la topología interna — los clientes nunca conocen cuántos contenedores existen ni en qué host corren.

La configuración de rutas del gateway debe mantenerse actualizada cada vez que se agrega un nuevo módulo que se vaya a desplegar en un contenedor separado.

---

## Arquitectura hexagonal

El proyecto aplica **arquitectura hexagonal** (ports & adapters), organizada por módulos bajo `src/modules/`. Cada módulo sigue esta estructura:

```
src/modules/<nombre>/
├── application/          # Casos de uso (orquestación)
│   └── useCases/
├── domain/               # Entidades, interfaces (ports) y lógica de negocio pura
│   ├── entities/
│   ├── repositories/     # Interfaces de repositorio (port)
│   └── services/
└── infrastructure/       # Implementaciones concretas (adapters)
    ├── controllers/
    ├── repositories/     # Implementación TypeORM del port
    └── schemas/          # Entidades ORM
```

**Regla de dependencias:** el dominio no conoce la infraestructura. Los casos de uso dependen de interfaces (ports), no de implementaciones concretas.

---

## Patrones de diseño y Clean Code

### Principios SOLID aplicados

- **Single Responsibility** — cada clase/función tiene una única razón para cambiar.
- **Open/Closed** — extender comportamiento mediante interfaces, no modificando clases existentes.
- **Dependency Inversion** — los módulos de alto nivel dependen de abstracciones, no de detalles.

### Patrones en uso

| Patrón       | Dónde se aplica                                              |
| ------------ | ------------------------------------------------------------ |
| Repository   | Abstracción del acceso a datos (`domain/repositories/`)      |
| Use Case     | Un caso de uso por clase en `application/useCases/`          |
| DTO          | Objetos de transferencia con validación (`class-validator`)  |
| Strategy     | Autenticación (JWT, local) en `infrastructure/`              |
| Guard        | Autorización por roles y permisos                            |
| Decorator    | Metadatos de roles, permisos y documentación Swagger         |

### Buenas prácticas

- **Funciones pequeñas** — una función hace una sola cosa. Si necesita comentario para explicar el qué, debe dividirse.
- **Nombres descriptivos** — el nombre revela la intención: `getUserByEmail` es mejor que `getUser`.
- **Sin magia** — evitar números o strings literales sueltos; extraerlos como constantes con nombre.
- **Inmutabilidad** — preferir `const` sobre `let`; evitar mutar objetos recibidos como parámetro.
- **Manejo de errores explícito** — usar excepciones tipadas del dominio; no retornar `null` para indicar error.

```typescript
// Correcto — lanza excepción tipada
if (!user) throw new UserNotFoundException(userId);

// Incorrecto — retorna null y obliga al caller a adivinar
if (!user) return null;
```
