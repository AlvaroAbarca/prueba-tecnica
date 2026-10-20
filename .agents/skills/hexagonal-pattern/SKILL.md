---
name: hexagonal-pattern
description: Guide for implementing features following hexagonal architecture. Use when creating use cases, domain models, value objects, repositories, or controllers.
---

# Hexagonal Architecture Pattern

This project follows **Hexagonal Architecture (Ports & Adapters)** with strict layer separation and SOLID principles. Each file has a single responsibility.

## Layer Communication Flow

```
Infrastructure → Application → Domain
     ↓               ↓            ↓
Controllers      Use Cases     Models
Repositories     Services      Value Objects
External APIs                  Interfaces (Ports)
```

**Rule**: Dependencies point inward. Domain knows nothing about infrastructure.

---

## Domain Layer (`domain/`)

The core business logic, completely isolated from external dependencies.

### Interfaces (Ports)

Abstract classes that define contracts for infrastructure to implement:

```typescript
// domain/interfaces/userRepository.interface.ts
export abstract class UserRepository {
  abstract create(user: UserValues): Promise<User>;
  abstract find(filter: any): Promise<User | null>;
  abstract update(email: string, user: Partial<UserValues>): Promise<User>;
}
```

### Value Objects

Immutable objects with self-validation using decorators from `@modules/shared/domain/validators/decorators`:

```typescript
// domain/valueObjects/userEmail.ts
import { IsRequired, IsString, MinLength, MaxLength, ValidateVO, IsEmail } from '@modules/shared/domain/validators/decorators';

export class UserEmail {
  @IsRequired()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @IsEmail()
  readonly value: string;

  constructor(value: string) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name);
  }

  static create(value: string): UserEmail {
    return new UserEmail(value);
  }

  equals(other: UserEmail): boolean {
    if (!(other instanceof UserEmail)) return false;
    return this.value === other.value;
  }
}
```

### Models

Domain entities composed of value objects with business methods:

```typescript
// domain/models/user.ts
export class User extends AccessorEntity<UserVO> {
  static create(params: UserValues): User {
    const data = UserVOBuilder.create(params);
    return new User(data);
  }

  getFullName(): string {
    return `${this.firstName.value} ${this.lastName.value}`;
  }

  getValues(): UserValues {
    // Returns plain object from value objects
  }
}
```

### VO Builder Pattern

Use `ValidateVO.createVODefinition()` to map fields to value objects:

```typescript
// domain/valueObjects/userVOBuilder.ts
export const UserVOBuilder = ValidateVO.createVODefinition({
  id: UserId,
  firstName: UserName,
  email: UserEmail,
  // ... all fields mapped to their VO classes
});
```

---

## Application Layer (`application/`)

### Use Cases

Single-purpose classes with mandatory logging pattern. Can use `@Injectable()` from NestJS.

```typescript
// application/useCases/editUser.useCase.ts
import { Injectable } from '@nestjs/common';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';

@Injectable()
export class EditUserUseCase {
  constructor(
    private readonly logger: LogProvider,
    private readonly userRepository: UserRepository,
  ) {}

  async start(params: EditUserParams): Promise<UserValues> {
    try {
      // REQUIRED: Initial log with params
      this.logger.debug(`INI | editUser.useCase - params:${JSON.stringify(params)}`, this.constructor.name);

      // Business logic here
      const user = await this.userRepository.find({ id: params.id });
      if (!user) throw new NotFoundException('User not found');

      const updated = await this.userRepository.update(params.email, params.user);

      // REQUIRED: End log
      this.logger.debug('END | editUser.useCase', this.constructor.name);

      return updated.getValues();
    } catch (error) {
      // REQUIRED: Error log with stringified error
      this.logger.error(`ERROR | editUser.useCase ${JSON.stringify(error.message)}`, this.constructor.name);
      throw error;
    }
  }
}
```

**Logging Rules (mandatory):**

1. `INI | <filename> - params:<JSON.stringify(params)>` at start
2. `END | <filename>` on success
3. `ERROR | <filename> <JSON.stringify(error)>` on failure

---

## Infrastructure Layer (`infrastructure/`)

External implementations that depend on domain interfaces.

### Repositories

Implement abstract classes from domain:

```typescript
// infrastructure/persistences/user.repository.ts
@Injectable()
export class UserRepositoryDB implements UserRepository {
  constructor(@InjectDataSource('postgres') private readonly dataSource: DataSource) {}

  async find(filter: Partial<UserValues>): Promise<User | null> {
    const entity = await this.manager.findOne(UserEntity, { where: filter });
    if (!entity) return null;
    return createUserFromEntity(entity); // Convert entity to domain model
  }
}
```

### Controllers

REST endpoints using `EmitResponse` for standardized responses:

```typescript
// infrastructure/controllers/editUser.controller.ts
@ApiTags('Users')
@Controller(['api', ''])
export class EditUserController {
  constructor(private readonly editUserUseCase: EditUserUseCase) {}

  @Put('users')
  @RolesCan(['ADMIN', 'USER_MANAGER'])
  async start(@Body() body: UserEditDTO, @Req() request: Request): Promise<any> {
    const result = await this.editUserUseCase.start({ ... });
    return EmitResponse.ok('ok', { result }, HttpStatus.OK);
  }
}
```

### Entity Mappers

Convert between TypeORM entities and domain models:

```typescript
// infrastructure/persistences/dto/createUserFromEntity.dto.ts
export function createUserFromEntity(entity: UserEntity): User {
  return User.create({
    id: entity.id,
    email: entity.email,
    // ... map all fields
  });
}
```

---

## Module Registration

Wire dependencies using abstract classes as tokens:

```typescript
// users.module.ts
@Module({
  providers: [{ provide: UserRepository, useClass: UserRepositoryDB }, EditUserUseCase],
})
export class UsersModule {}
```

---

## File Naming Convention

| Layer        | Pattern                       | Example                       |
| ------------ | ----------------------------- | ----------------------------- |
| Use Case     | `<action>.useCase.ts`         | `editUser.useCase.ts`         |
| Controller   | `<action>.controller.ts`      | `editUser.controller.ts`      |
| Repository   | `<entity>.repository.ts`      | `user.repository.ts`          |
| Interface    | `<entity><Type>.interface.ts` | `userRepository.interface.ts` |
| Value Object | `<entity><Field>.ts`          | `userEmail.ts`                |
| Model        | `<entity>.ts`                 | `user.ts`                     |
