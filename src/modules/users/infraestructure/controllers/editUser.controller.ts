import { Body, Controller, HttpCode, Put } from '@nestjs/common';
import { Respuesta } from '@modules/shared/infrastructure/dto/respuesta';
import { EditUserUseCase } from '@modules/users/application/useCases/editUser.useCase';
import { UserEditDTO } from '../dto/userEdit.dto';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerEditDecorators } from './swagger/edit.swagger';
import { RolesCan } from '@modules/shared/infrastructure/decorators/rolesCan.decorator';

@ApiTags('Users')
@RolesCan(['BACKOFFICE_USER_UPDATE'])
@Controller(['api', ''])
export class EditUserController {
  constructor(private readonly userEdit: EditUserUseCase) {}

  @SwaggerEditDecorators()
  @Put('users')
  @HttpCode(200)
  async start(@Body() body: UserEditDTO): Promise<any> {
    const { profiles, ...user } = body;
    await this.userEdit.start(user, profiles);
    return new Respuesta('ok', {}, [], 200);
  }
}
