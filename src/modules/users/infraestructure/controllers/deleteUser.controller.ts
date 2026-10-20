import { Body, Controller, Delete, HttpCode, Req } from '@nestjs/common';
import { Respuesta } from '@modules/shared/infrastructure/dto/respuesta';
import { DeleteUserUseCase } from '@modules/users/application/useCases/deleteUser.useCase';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerDeleteDecorators } from './swagger/delete.swagger';
import { RolesCan } from '@modules/shared/infrastructure/decorators/rolesCan.decorator';
import { Request } from 'express';
import { DeleteUsersBodyDto } from '../dto/deleteUsersBody.dto';

@ApiTags('Users')
@RolesCan(['BACKOFFICE_USER_DELETE'])
@Controller(['api', ''])
export class DeleteUserController {
  constructor(private readonly useCase: DeleteUserUseCase) {}

  @SwaggerDeleteDecorators()
  @Delete('users')
  @HttpCode(200)
  async start(@Body() body: DeleteUsersBodyDto, @Req() req: Request): Promise<any> {
    const user = req?.user?.account?.email;

    if (!user) {
      throw new Error('User not found in request');
    }
    await this.useCase.start({ ids: body.ids, user });
    return new Respuesta('ok', {}, [], 200);
  }
}
