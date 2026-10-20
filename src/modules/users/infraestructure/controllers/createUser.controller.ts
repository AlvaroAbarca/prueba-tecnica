import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { EmitResponse } from '@modules/shared/infrastructure/dto/respuesta';
import { UserCreateDTO } from '../dto/userCreate.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application/useCases/createUser.useCase';
import { userResponse } from '../dto/userResponse.dto';
import { SwaggerCreateDecorators } from './swagger/create.swagger';
import { RolesCan } from '@modules/shared/infrastructure/decorators/rolesCan.decorator';

@ApiTags('Users')
@Controller(['api', ''])
export class CreateUserController {
  constructor(private readonly userCreateUseCase: CreateUserUseCase) {}

  @RolesCan(['BACKOFFICE_USER_CREATE'])
  @SwaggerCreateDecorators()
  @Post('users')
  async start(@Body() user: UserCreateDTO): Promise<any> {
    try {
      const userSaved = await this.userCreateUseCase.start({ user, profiles: user?.profiles });
      return EmitResponse.ok('ok', { ...userResponse(userSaved), profiles: user.profiles }, HttpStatus.CREATED);
    } catch (error) {
      return EmitResponse.error('Error creating user', [{ message: JSON.stringify(error.message) }], HttpStatus.BAD_REQUEST);
    }
  }
}
