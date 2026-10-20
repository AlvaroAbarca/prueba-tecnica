# Arquetipo Backend

<p align="center">
  <img src="docs/assets/postgresql.svg" alt="PostgreSQL" height="40"/>
  &nbsp;
  <img src="docs/assets/nodejs.svg" alt="Node.js" height="40"/>
  &nbsp;
  <img src="docs/assets/nestjs.svg" alt="NestJS" height="40"/>
</p>

<p align="center">
  <b>PostgreSQL</b> &nbsp;|&nbsp; <b>Node.js 24</b> &nbsp;|&nbsp; <b>NestJS</b>
</p>

API base en NestJS con arquitectura hexagonal. Incluye CRUD de usuarios, login local con JWT en cookies HTTP-only y autorización por roles.

La documentación de cada pieza está en [docs/](docs/).

## Qué incluye

- **Login local:** email y contraseña con bcrypt. Emite access token y refresh token en cookies `access_token` y `refresh_token`.
- **Sesión:** `FlexibleAuthGuard` acepta `Authorization: Bearer` o las cookies. Si el access token expiró y el refresh sigue válido, se renueva el par.
- **Roles:** `@RolesCan` y `RolesGuard` leen los roles del perfil persistido.
- **Usuarios:** alta, listado paginado, consulta por id, edición y baja lógica.
- **Estado:** `GET /api/status` comprueba el servicio y la conexión a PostgreSQL.
- **Arranque:** las migraciones pendientes se aplican al iniciar el proceso.

## Módulos

| Módulo | Responsabilidad |
|--------|-----------------|
| `auth` | Login, logout, JWT, guards y middleware de cookies |
| `users` | Casos de uso y persistencia de usuarios, perfiles y roles |
| `status` | Health del proceso y de la base |
| `shared` | ORM, entidades TypeORM, filtros, logging, excepciones y utilidades |

## Endpoints

Las rutas de auth y usuarios responden tanto en la raíz como bajo `/api`. El estado solo existe en `/api`.

| Método | Ruta | Acceso |
|--------|------|--------|
| `POST` | `/auth/login` | Público |
| `POST` | `/auth/logout` | Autenticado |
| `POST` | `/users` | `BACKOFFICE_USER_CREATE` |
| `GET` | `/users` | `BACKOFFICE_USER_READ` |
| `GET` | `/users/:id` | `BACKOFFICE_USER_READ` |
| `PUT` | `/users` | `BACKOFFICE_USER_UPDATE` |
| `DELETE` | `/users` | `BACKOFFICE_USER_DELETE` |
| `GET` | `/api/status` | Público |

Swagger queda en [http://localhost:8003/swagger](http://localhost:8003/swagger) cuando `NODE_ENV` no es `production`. El JSON para Postman está en `/swagger/json`.

## Stack

- **NestJS 11** sobre **Node.js 24** (`.nvmrc`)
- **TypeORM** y **PostgreSQL 17**
- **class-validator** en los DTO de la API
- **Winston** para logs
- **Jest** para tests unitarios
- **Swagger** para la documentación de la API
- **ESLint**, **oxlint** y **Prettier**

## Estructura

```plaintext
src/
├── main.ts
├── app.module.ts
└── modules/
    ├── auth/
    ├── users/
    ├── status/
    └── shared/
        ├── domain/
        └── infrastructure/
            ├── entities/          # Entidades TypeORM
            ├── orm/
            ├── filters/
            └── providers/log/
```

Cada módulo de negocio separa tres capas:

```plaintext
src/modules/<modulo>/
├── application/
│   ├── useCases/                  # Un archivo por acción: <accion>.useCase.ts
│   └── services/
├── domain/
│   ├── models/                    # Modelos de dominio, no entidades TypeORM
│   ├── interfaces/
│   ├── valueObjects/
│   └── dto/
└── infrastructure/
    ├── controllers/
    ├── dto/                       # DTO de la API, con class-validator
    └── persistences/
```

El módulo `users` usa la carpeta `infraestructure` (sin la segunda `r`). El resto usa `infrastructure`.

## Desarrollo local

Node tiene que ser la **v24** de [`.nvmrc`](.nvmrc). Con [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install
nvm use
npm install
```

PostgreSQL local con Docker:

```bash
docker compose -f docker-compose-db.yml up -d
```

Credenciales del compose:

| | |
|--|--|
| Host | `localhost` |
| Puerto | `5432` |
| Usuario | `postgres` |
| Contraseña | `postgres` |
| Base | `postgres` |

Copia el entorno. El proceso arranca con los valores de `.env.example`; en un entorno real hay que definir secretos JWT propios (si faltan, el servicio usa `default-secret` y `default-refresh-secret`):

```bash
cp .env.example .env
```

Variables de arranque y de autenticación:

| Variable | Uso |
|----------|-----|
| `PORT` | Puerto HTTP. En `.env.example` es `8003` |
| `BD_HOST`, `BD_PORT`, `BD_USER`, `BD_PASS`, `BD_SCHEMA` | Conexión TypeORM |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Firma del access y del refresh token |
| `JWT_AUDIENCE`, `JWT_ISSUER` | Claims del JWT |
| `ACCESS_TOKEN_EXPIRES`, `REFRESH_TOKEN_EXPIRES` | Vida de cada token, en segundos |

```bash
npm run dev
```

El servidor queda en [http://localhost:8003](http://localhost:8003). Al arrancar aplica las migraciones pendientes. También se pueden correr a mano:

```bash
npm run migration:run
npm run migration:show
```

Para bajar la base y borrar el volumen:

```bash
docker compose -f docker-compose-db.yml down -v
```

### Usuario inicial

La migración `createUserAdmin` inserta un administrador:

- Email: `pedro.postal@correos.cl`
- Contraseña: la tiene el equipo; en la base queda solo el hash

### Scripts

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Nest en watch |
| `npm run build` | Compila a `dist/` |
| `npm run start` | Arranca sin watch |
| `npm run start:prod` | `node dist/src/main.js` |
| `npm run test` | Jest con cobertura |
| `npm run test:watch` | Jest en watch |
| `npm run test:e2e` | Jest con `test/jest-e2e.json` |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint con `--fix` |
| `npm run format` | Prettier |
| `npm run migration:create <nombre>` | Crea un archivo en `migrations/` |
| `npm run migration:run` | Aplica migraciones pendientes |
| `npm run migration:revert` | Revierte la última |
| `npm run migration:show` | Lista el estado |

Un solo archivo de test:

```bash
npm run test -- --testPathPattern='createUser'
```

## Docker de la aplicación

La imagen usa Node `24-alpine`, corre como usuario `nestjs` y escucha el `PORT` (por defecto `8003`).

```bash
docker build -t app-back .
docker run -d --name app --env-file .env -p 8003:8003 app-back
```

La base del compose tiene que estar accesible desde el contenedor. Con `BD_HOST=localhost` dentro del contenedor no llega al Postgres del host.

## Documentación

| Archivo | Tema |
|---------|------|
| [docs/authentication.md](docs/authentication.md) | Login, JWT y cookies |
| [docs/rolesCanSystem.md](docs/rolesCanSystem.md) | `@RolesCan` y `RolesGuard` |
| [docs/exceptions.md](docs/exceptions.md) | Excepciones de dominio |
| [docs/migrations.md](docs/migrations.md) | Migraciones TypeORM |
| [docs/validations.md](docs/validations.md) | Validadores y value objects |
| [docs/modelsCreation.md](docs/modelsCreation.md) | Modelos de dominio |
| [docs/conventions.md](docs/conventions.md) | Convenciones de código |
