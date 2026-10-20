import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { EmitResponse } from '@modules/shared/infrastructure/dto/respuesta';
import { FindUserUseCase } from '@modules/users/application/useCases/findUser.useCase';
import { userResponse } from '../dto/userResponse.dto';
import { FindAllUsersUseCase } from '../../application/useCases/findAllUsers.useCase';
import { FindAllUsersQueryDto } from '../dto/findAllUsersQuery.dto';
import { ApiTags } from '@nestjs/swagger';
import { RolesCan } from '@modules/shared/infrastructure/decorators/rolesCan.decorator';
import { SwaggerFindByIdDecorators, SwaggerFindAllDecorators } from './swagger/find.swagger';

@ApiTags('Users')
@RolesCan(['BACKOFFICE_USER_READ'])
@Controller(['api', ''])
export class FindUserController {
  constructor(
    private readonly findUseCase: FindUserUseCase,
    private readonly findAllUseCase: FindAllUsersUseCase,
  ) {}

  @SwaggerFindAllDecorators()
  @Get('users')
  async findAll(@Query() query: FindAllUsersQueryDto): Promise<any> {
    const { page = 1, limit = 10, orderBy, orderType, ...filterParams } = query;
    const offset = query.offset ?? (page - 1) * limit;
    const result = await this.findAllUseCase.start({
      limit,
      offset,
      orderBy,
      orderType,
      filter: filterParams,
    });
    const transformedResult = {
      data: result.data.map(userResponse),
      meta: result.meta,
    };
    return EmitResponse.ok('ok', transformedResult);
  }

  @SwaggerFindByIdDecorators()
  @Get('users/:id')
  async find(@Param('id', ParseIntPipe) id: number): Promise<any> {
    const user = await this.findUseCase.start({ id });
    return EmitResponse.ok('ok', userResponse(user));
  }
}
