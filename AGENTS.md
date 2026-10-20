# AGENTS.md

This file provides guidance when working with code in this repository.

## Quick Start

**Node version:** 22.16.0 (use NVM: `nvm use 22`)

**Install dependencies:**
```bash
npm install
```

**Development:**
```bash
npm run dev              # Start with watch mode on http://localhost:3000
npm run start:debug      # Debug mode with inspector
```

**Database setup:**
```bash
docker compose -f docker-compose-db.yml up -d    # PostgreSQL on localhost:5432
npm run migration:run    # Apply database migrations
```

---

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with watch mode |
| `npm run build` | Build TypeScript to dist/ |
| `npm run start` | Run built application |
| `npm run start:prod` | Production mode |
| `npm run test` | Run all tests with coverage |
| `npm run test:watch` | Watch mode for tests |
| `npm run test:debug` | Debug tests in Node inspector |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format with Prettier |
| `npm run migration:run` | Apply pending migrations |
| `npm run migration:create <name>` | Create new migration |
| `npm run migration:revert` | Revert last migration |

### Running Tests

```bash
# All tests with coverage
npm run test

# Watch mode during development
npm run test:watch

# Single test file
npm run test -- --testPathPattern='shipmentFindAll'

# Test a module
npm run test -- --testPathPattern='modules/users'

# With debugging
npm run test:debug
```

---

## Architecture: Hexagonal (Clean Architecture)

All modules follow strict hexagonal structure:

```
src/modules/<module>/
├── application/
│   ├── useCases/          # One file per use case, named: <action>.useCase.ts
│   └── services/          # Service classes grouping business logic
├── domain/
│   ├── models/            # Domain entities (NOT TypeORM entities)
│   ├── interfaces/        # Repository ports, service contracts
│   ├── valueObjects/      # Immutable value objects with validation
│   ├── dto/               # Domain DTOs (no decorators)
│   ├── constants/         # Domain-specific constants
│   ├── exceptions/        # Domain exception classes
│   └── validators/        # Business logic validators
└── infrastructure/
    ├── controllers/       # REST controllers (NestJS)
    ├── persistences/      # Repository implementations
    ├── dto/               # API DTOs (with class-validator decorators)
    ├── http/              # HTTP client adapters for external APIs
    ├── cache/             # Cache adapter implementations
    ├── keycloak/          # Keycloak integration (guards, strategies)
    └── queryBuilders/     # TypeORM query builders
```

**Key:** Domain models wrap value objects and business logic. TypeORM entities live in `src/modules/shared/infrastructure/entities/`. Repositories convert between domain and infrastructure using mapper DTOs.

---

## Core Patterns & Conventions

### Dependency Injection

Use abstract classes as injection tokens, never strings:

```typescript
// ✓ Correct
providers: [{ provide: UserRepository, useClass: UserRepositoryDB }];
constructor(private readonly userRepository: UserRepository) {}

// ✗ Wrong
providers: [{ provide: 'UserRepository', useClass: UserRepositoryDB }];
```

### Standard Response Format

Always use `EmitResponse` for all controller responses:

```typescript
import { EmitResponse } from '@modules/shared/infrastructure/http/response';

return EmitResponse.ok('User created', { id, email }, HttpStatus.CREATED);
return EmitResponse.error('Invalid email', [{ field: 'email', message: 'Invalid format' }]);
```

### Exception Handling

Domain exceptions live in `@modules/shared/domain/exceptions/classes`. Use the correct type:

- **`BusinessException`** – Business rule violations (e.g., insufficient balance, duplicate entry)
- **`ValidationException`** – Input validation errors (invalid format, missing field)
- **`InternalSystemException`** – Infrastructure/system errors (database, external API failures)

```typescript
throw new BusinessException('Email already exists');
throw new ValidationException('Invalid email format', { field: 'email' });
throw new InternalSystemException('Database connection failed');
```

### Transactions

Use `TransactionManager.runInTransaction()`. Repositories auto-detect transactional context via AsyncLocalStorage:

```typescript
await this.transactionManager.runInTransaction(async () => {
  await this.userRepository.create(user1);
  await this.profileRepository.create(profile1);
  // Both succeed or both rollback
});
```

### Authorization

- Use `@RolesCan(['ROLE_NAME'])` decorator on controller methods
- Global guards (`FlexibleAuthGuard`, `RolesGuard`) are applied automatically
- Use `@Public()` decorator for unauthenticated endpoints
- Keycloak SSO and local auth both supported

```typescript
@Post()
@RolesCan(['ADMIN', 'MANAGER'])
create(@Body() dto: CreateUserDto) { ... }

@Get('public')
@Public()
getPublic() { ... }
```

---

## Testing Conventions

Tests mirror source structure in `test/` directory. Use Jest.

### Unit Test Pattern

```typescript
const mockUserRepository = {
  find: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    useCase = new CreateUserUseCase(mockUserRepository);
  });

  it('should create a user', async () => {
    mockUserRepository.create.mockResolvedValue({ id: '1', email: 'test@example.com' });
    const result = await useCase.execute(dto);
    expect(result).toBeDefined();
    expect(mockUserRepository.create).toHaveBeenCalled();
  });
});
```

### Integration Test Pattern

Integration tests load the full NestJS module and hit real repositories/databases:

```typescript
const module = await Test.createTestingModule({
  imports: [UsersModule],
}).compile();

const app = module.createNestApplication();
await app.init();
```

---

## Commit & Branch Conventions

**Commits:** Conventional Commits
- `feat:` – New feature
- `fix:` – Bug fix
- `refactor:` – Code restructuring (no behavior change)
- `test:` – Test additions/updates
- `docs:` – Documentation only
- `chore:` – Build, CI, dependencies

Example: `feat: add user profile update endpoint`

**Branches:** Use `feature/TICKET-123` or `fix/TICKET-123`

---

## File & Class Naming

| Target | Convention | Example |
|--------|-----------|---------|
| Files | `camelCase` | `editUser.useCase.ts`, `user.repository.ts` |
| Classes | `PascalCase` | `CreateUserUseCase`, `UserRepository` |
| Methods | `camelCase` | `execute()`, `findById()` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRY_ATTEMPTS = 3` |
| Use cases | One per file | `<action>.useCase.ts` |
| Controllers | One per action | `<action>.controller.ts` |

---

## Key Modules

- **auth** – Authentication (local + Keycloak SSO), JWT, 2FA with OTP
- **users** – User & profile management with RBAC
- **shipments** – Core logistics: dispatch, reception, guides, tracking
- **integration** – External system integrations
- **print** – PDF/document generation with Puppeteer
- **pdfGenerator** – Specialized PDF rendering
- **messages** – Email/notifications with Resend
- **job** – Scheduled job execution (cron tasks)
- **backoffice** – Admin dashboard functionality
- **shared** – Common infrastructure: ORM, logging, filters, guards, caching, exceptions

---

## Database & TypeORM

- **ORM:** TypeORM with PostgreSQL
- **Migrations:** TypeScript files in `migrations/` folder
- **Entities:** Shared TypeORM entities in `src/modules/shared/infrastructure/entities/`
- **Query builders:** In `infrastructure/queryBuilders/` per module

Commands:
```bash
npm run migration:show     # List pending migrations
npm run migration:run      # Apply migrations
npm run migration:revert   # Revert last migration
```

---

## Logging & Monitoring

- **Logger:** Winston with structured logging to Loki
- **Config:** `src/modules/shared/config/winston.config.ts`
- **Usage:** `@nestjs/common` Logger injectable

```typescript
constructor(private readonly logger: Logger) {}
this.logger.debug('Debug message', { context: 'ClassName' });
```

---

## Code Quality Tools

- **Linting:** ESLint with TypeScript support, plus oxlint
- **Formatting:** Prettier with default config
- **Coverage:** Jest with coverage reporter (HTML + LCOV + text)

```bash
npm run lint:fix        # Auto-fix all lint errors
npm run format          # Format all files with Prettier
npm run formatLint      # Format + lint in sequence
```

---

## External Integrations

- **Keycloak** – SSO and advanced RBAC
- **Resend** – Email delivery service
- **Puppeteer** – PDF generation from HTML
- **Socket.IO** – Real-time WebSocket communication
- **Redis** – Optional caching layer (via cache-manager)
- **AMQP** – Message broker for async jobs

---

## Debugging

**VS Code:**
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug NestJS",
  "program": "${workspaceFolder}/node_modules/@nestjs/cli/bin/nest.js",
  "args": ["start", "--debug", "--watch"],
  "env": { "NODE_ENV": "development" }
}
```

**CLI:** `npm run start:debug` then attach to port 9229

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `lsof -i :3000` then kill process, or change `PORT` in `.env` |
| Database connection fails | Verify PostgreSQL is running (`docker ps`), check `.env` credentials |
| Migration issues | Check `migration:show` status, ensure database is accessible |
| Test failures with "Cannot find module" | Run `npm install`, verify `moduleNameMapper` in `jest.config.js` |

