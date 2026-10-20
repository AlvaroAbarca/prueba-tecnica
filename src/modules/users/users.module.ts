import { UserEntity } from '@modules/shared/infrastructure/entities/user.entity';
import { SharedModule } from '@modules/shared/shared.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserController } from './infraestructure/controllers/createUser.controller';
import { DeleteUserController } from './infraestructure/controllers/deleteUser.controller';
import { EditUserController } from './infraestructure/controllers/editUser.controller';
import { FindUserController } from './infraestructure/controllers/findUser.controller';
import { UserRepositoryDB } from './infraestructure/persistences/user.repository';
import { UserRepository } from './domain/interfaces/userRepository.interface';
import { CreateUserUseCase } from './application/useCases/createUser.useCase';
import { DeleteUserUseCase } from './application/useCases/deleteUser.useCase';
import { EditUserUseCase } from './application/useCases/editUser.useCase';
import { FindAllUsersUseCase } from './application/useCases/findAllUsers.useCase';
import { FindUserUseCase } from './application/useCases/findUser.useCase';
import { UserProfileAndRolesRepository } from './domain/interfaces/userProfileAndRoles.interface';
import { UserProfileAndRolesRepositoryDB } from './infraestructure/persistences/userProfilesAndRoles.repository';
import { UserProfileRepository } from './domain/interfaces/userProfileRepository.interface';
import { UserProfileRepositoryDB } from './infraestructure/persistences/userProfile.repository';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([UserEntity], 'postgres')],
  controllers: [CreateUserController, FindUserController, EditUserController, DeleteUserController],
  providers: [
    {
      provide: UserRepository,
      useClass: UserRepositoryDB,
    },
    {
      provide: UserProfileAndRolesRepository,
      useClass: UserProfileAndRolesRepositoryDB,
    },
    {
      provide: UserProfileRepository,
      useClass: UserProfileRepositoryDB,
    },
    CreateUserUseCase,
    FindUserUseCase,
    FindAllUsersUseCase,
    EditUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [UserRepository, UserProfileAndRolesRepository],
})
export class UsersModule {}
